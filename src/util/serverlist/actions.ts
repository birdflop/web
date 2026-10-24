// Server$ mutations for the server list feature.

import { server$ } from '@qwik.dev/router';
import { and, desc, eq, gte, ne, or, sql } from 'drizzle-orm';
import {
  getDB,
  servers,
  serverVotes,
  serverReports,
  serverspulseLinks,
} from '~/util/db';
import { isAdmin } from '~/routes/layout';
import {
  validateServerInput,
  isValidHost,
  isValidMcUsername,
  parsePort,
  isServerSoftware,
  sanitizeServerPlugins,
  slugify,
  type ServerFormInput,
} from './validation';
import { verifyTurnstile } from './turnstile';
import { detectBirdflopHosted } from './birdflop';
import { sendVotifierV2, type VotifierFailure } from './votifier';
import {
  claimServersPulseLink,
  isValidServersPulseLinkCode,
  normalizeServersPulseLinkCode,
} from './serverspulse';
import {
  DEFAULT_VOTIFIER_PORT,
  LIMITS,
  REPORT_COOLDOWN_MS,
  RESERVED_SLUGS,
  SERVERSPULSE_ACTION_COOLDOWN_MS,
  SERVERSPULSE_CONSUMER_NAME,
  TEST_VOTE_COOLDOWN_MS,
  VOTE_COOLDOWN_MS,
} from './constants';
import { Session } from '@auth/qwik';

function getClientIp(headers: Headers): string | null {
  return (
    headers.get('CF-Connecting-IP') ||
    headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    null
  );
}

async function uniqueSlug(
  db: ReturnType<typeof getDB>,
  base: string,
  excludeId?: number
): Promise<string> {
  const root = base || 'server';
  let candidate = root;
  let suffix = 1;
  // Try the base, then base-2, base-3, ... until free. Slugs that shadow a
  // static /serverlist/ route are skipped straight to a suffixed variant.
  if (RESERVED_SLUGS.includes(candidate)) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }

  while (true) {
    const existing = await db
      .select({ id: servers.id })
      .from(servers)
      .where(eq(servers.slug, candidate))
      .get();
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

export const createServer = server$(async function (input: ServerFormInput) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return {
      success: false as const,
      errors: ['You must be logged in to add a server.'],
    };

  const validation = validateServerInput(input);
  if (!validation.valid || !validation.data)
    return { success: false as const, errors: validation.errors };

  const owned = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(servers)
    .where(eq(servers.ownerId, session.user.id))
    .get();
  if (Number(owned?.count ?? 0) >= LIMITS.maxServersPerOwner)
    return {
      success: false as const,
      errors: [
        `You can list at most ${LIMITS.maxServersPerOwner} servers per account.`,
      ],
    };

  const data = validation.data;
  const slug = await uniqueSlug(db, slugify(data.name));
  // Auto-tag listings whose address resolves to a Birdflop node (null =
  // detection unavailable, leave the column at its default).
  const birdflopHosted = await detectBirdflopHosted(db, this.env, data);

  try {
    // Timestamps are set explicitly: the column's CURRENT_TIMESTAMP default
    // stores a text datetime in SQLite, which breaks numeric comparisons
    // against Date bindings (text always sorts above numbers).
    const now = new Date();
    const inserted = await db
      .insert(servers)
      .values({
        ...data,
        slug,
        ownerId: session.user.id,
        createdAt: now,
        updatedAt: now,
        ...(birdflopHosted === null
          ? {}
          : { birdflopHosted, birdflopCheckedAt: now }),
      })
      .returning()
      .get();
    return { success: true as const, slug: inserted.slug, id: inserted.id };
  } catch (err) {
    console.error('Error creating server:', err);
    return {
      success: false as const,
      errors: ['Failed to create the listing. Please try again.'],
    };
  }
});

export const updateServer = server$(async function (
  id: number,
  input: ServerFormInput
) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, errors: ['You must be logged in.'] };

  const admin = await isAdmin();

  // Ownership check.
  const existing = await db
    .select()
    .from(servers)
    .where(eq(servers.id, id))
    .get();
  if (!existing)
    return { success: false as const, errors: ['Listing not found.'] };
  if (!admin && existing.ownerId !== session.user.id)
    return {
      success: false as const,
      errors: ['You do not own this listing.'],
    };

  const validation = validateServerInput(input);
  if (!validation.valid || !validation.data)
    return { success: false as const, errors: validation.errors };

  const data = validation.data;
  // Keep the slug stable if the name is unchanged; otherwise re-derive uniquely.
  const slug =
    data.name === existing.name
      ? existing.slug
      : await uniqueSlug(db, slugify(data.name), id);

  // Re-run Birdflop detection on every edit so the badge can't be kept by
  // pointing the listing elsewhere after being tagged (null = keep existing).
  const birdflopHosted = await detectBirdflopHosted(db, this.env, data);

  try {
    const updated = await db
      .update(servers)
      .set({
        ...data,
        slug,
        updatedAt: new Date(),
        ...(birdflopHosted === null
          ? {}
          : { birdflopHosted, birdflopCheckedAt: new Date() }),
      })
      .where(eq(servers.id, id))
      .returning()
      .get();
    return { success: true as const, slug: updated.slug, id: updated.id };
  } catch (err) {
    console.error('Error updating server:', err);
    return {
      success: false as const,
      errors: ['Failed to update the listing.'],
    };
  }
});

export const deleteServer = server$(async function (id: number) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'You must be logged in.' };

  const admin = await isAdmin();
  try {
    const deleted = await db
      .delete(servers)
      .where(
        and(
          eq(servers.id, id),
          admin ? undefined : eq(servers.ownerId, session.user.id)
        )
      )
      .returning({ id: servers.id });
    // Nothing matched: the listing doesn't exist or isn't the caller's.
    if (deleted.length === 0)
      return {
        success: false as const,
        error: 'Listing not found or you do not own it.',
      };
    return { success: true as const };
  } catch (err) {
    console.error('Error deleting server:', err);
    return { success: false as const, error: 'Failed to delete the listing.' };
  }
});

export interface VoteResult {
  success: boolean;
  error?: string;
  delivered?: boolean;
  deliveryError?: string;
  monthlyVotes?: number;
  /** Unix ms timestamp when the cooldown expires (only set on cooldown errors). */
  nextVoteAt?: number;
}

export const voteForServer = server$(async function (
  serverId: number,
  username: string,
  captchaToken: string
): Promise<VoteResult> {
  const db = getDB();
  if (!db) return { success: false, error: 'Database unavailable.' };

  // Types don't survive the server$ boundary, so check before using them.
  if (!Number.isInteger(serverId))
    return { success: false, error: 'Server not found.' };
  if (typeof username !== 'string')
    return { success: false, error: 'Enter a valid Minecraft username.' };
  const cleanUsername = username.trim();
  if (!isValidMcUsername(cleanUsername))
    return { success: false, error: 'Enter a valid Minecraft username.' };

  const ip = getClientIp(this.request.headers);

  // CAPTCHA.
  const captcha = await verifyTurnstile(
    typeof captchaToken === 'string' ? captchaToken : null,
    this.env.get('TURNSTILE_SECRET'),
    ip ?? undefined
  );
  if (!captcha.success)
    return { success: false, error: captcha.error ?? 'CAPTCHA failed.' };

  const target = await db
    .select()
    .from(servers)
    .where(eq(servers.id, serverId))
    .get();
  if (!target) return { success: false, error: 'Server not found.' };

  // Record the vote first, atomically guarded by the 24h cooldown (by
  // username OR ip for this server), and only then deliver the reward: a
  // check-then-insert would let parallel requests each pass the check and
  // each trigger a Votifier reward. Usernames compare case-insensitively
  // (Minecraft names are). createdAt is an explicit epoch-ms integer: the
  // CURRENT_TIMESTAMP column default stores a text datetime, which would
  // break these numeric comparisons (text always sorts above numbers).
  const now = Date.now();
  const cutoff = now - VOTE_COOLDOWN_MS;
  const lowerName = cleanUsername.toLowerCase();
  let voteId: number | undefined;
  try {
    const inserted = await db.get<{ id: number }>(sql`
      INSERT INTO "serverVotes" ("serverId", "username", "ip", "votifierDelivered", "createdAt")
      SELECT ${serverId}, ${cleanUsername}, ${ip}, 0, ${now}
      WHERE NOT EXISTS (
        SELECT 1 FROM "serverVotes"
        WHERE "serverId" = ${serverId}
          AND "createdAt" >= ${cutoff}
          AND (lower("username") = ${lowerName} OR "ip" = ${ip})
      )
      RETURNING "id"`);
    voteId = inserted?.id;
  } catch (err) {
    console.error('Error recording vote:', err);
    return { success: false, error: 'Failed to record your vote.' };
  }

  if (voteId === undefined) {
    const recent = await db
      .select({ createdAt: serverVotes.createdAt })
      .from(serverVotes)
      .where(
        and(
          eq(serverVotes.serverId, serverId),
          gte(serverVotes.createdAt, new Date(cutoff)),
          ip
            ? or(
                sql`lower(${serverVotes.username}) = ${lowerName}`,
                eq(serverVotes.ip, ip)
              )
            : sql`lower(${serverVotes.username}) = ${lowerName}`
        )
      )
      .orderBy(desc(serverVotes.createdAt))
      .get();
    return {
      success: false,
      error: 'You have already voted for this server in the last 24 hours.',
      nextVoteAt: recent
        ? new Date(recent.createdAt).getTime() + VOTE_COOLDOWN_MS
        : now + VOTE_COOLDOWN_MS,
    };
  }

  // Attempt Votifier delivery (best-effort; the vote counts either way).
  let delivered = false;
  let deliveryError: string | undefined;
  if (target.votifierHost && target.votifierToken) {
    const result = await sendVotifierV2(
      {
        host: target.votifierHost,
        port: target.votifierPort ?? DEFAULT_VOTIFIER_PORT,
        token: target.votifierToken,
      },
      {
        username: cleanUsername,
        serviceName: 'birdflop.com',
        address: ip ?? '0.0.0.0',
        timestamp: now,
      }
    );
    delivered = result.delivered;
    if (!delivered) {
      // Voters are anonymous, so the raw error (which can echo the target's
      // address or banner) stays in the logs.
      console.error(
        `Votifier delivery failed for server ${serverId}:`,
        result.error
      );
      deliveryError = 'The vote could not be delivered to the server.';
    } else {
      try {
        await db
          .update(serverVotes)
          .set({ votifierDelivered: true })
          .where(eq(serverVotes.id, voteId));
      } catch (err) {
        console.error('Error marking vote as delivered:', err);
      }
    }
  }

  const monthStart = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    1
  );
  const countRow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(serverVotes)
    .where(
      and(
        eq(serverVotes.serverId, serverId),
        gte(serverVotes.createdAt, new Date(monthStart))
      )
    )
    .get();

  return {
    success: true,
    delivered,
    deliveryError,
    monthlyVotes: Number(countRow?.count ?? 0),
  };
});

export const reportServer = server$(async function (
  serverId: number,
  reason: string,
  details: string
) {
  const db = getDB();
  if (!db) return { success: false as const, error: 'Database unavailable.' };

  // Types don't survive the server$ boundary, so check before using them.
  if (!Number.isInteger(serverId))
    return { success: false as const, error: 'Server not found.' };
  if (typeof reason !== 'string')
    return { success: false as const, error: 'A reason is required.' };
  const cleanReason = reason.trim();
  if (!cleanReason)
    return { success: false as const, error: 'A reason is required.' };
  if (cleanReason.length > 100)
    return { success: false as const, error: 'Reason is too long.' };

  const session = this.sharedMap.get('session') as Session | undefined;
  const ip = getClientIp(this.request.headers);

  // One report per server per user/IP per cooldown window, to bound spam.
  const identity = [];
  if (ip) identity.push(eq(serverReports.ip, ip));
  if (session?.user?.id)
    identity.push(eq(serverReports.reporterId, session.user.id));
  if (identity.length > 0) {
    const cutoff = new Date(Date.now() - REPORT_COOLDOWN_MS);
    const recent = await db
      .select({ id: serverReports.id })
      .from(serverReports)
      .where(
        and(
          eq(serverReports.serverId, serverId),
          gte(serverReports.createdAt, cutoff),
          or(...identity)
        )
      )
      .get();
    if (recent)
      return {
        success: false as const,
        error: 'You have already reported this server recently.',
      };
  }

  try {
    await db.insert(serverReports).values({
      serverId,
      reason: cleanReason,
      details:
        typeof details === 'string'
          ? details.trim().slice(0, 1000) || null
          : null,
      reporterId: session?.user?.id ?? null,
      ip,
      createdAt: new Date(),
    });
    return { success: true as const };
  } catch (err) {
    console.error('Error filing report:', err);
    return { success: false as const, error: 'Failed to submit the report.' };
  }
});

// Columns an owner may write through this generic action. Everything else on
// the row is either identity (id/ownerId/slug), admin-granted (verified,
// featured), or server-derived (birdflopHosted) — allowing those here would
// let any logged-in client grant itself a badge, since server$ endpoints are
// callable directly from the browser. Form-driven fields (name, hosts, tags,
// rgbPreset, ...) go through updateServer instead, which validates them.
type OwnerWritableServerData = Partial<
  Pick<typeof servers.$inferInsert, 'plugins' | 'software'>
>;

// Mirrors setUserData's shape (a bag of optional fields on a single call) so
// callers can update whichever server-list columns they have on hand without
// a dedicated action per field.
export const updateServerListData = server$(async function (
  serverId: number,
  data: OwnerWritableServerData
) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'Unauthorized' };

  const admin = await isAdmin.call(this);

  const existing = await db
    .select({ ownerId: servers.ownerId })
    .from(servers)
    .where(eq(servers.id, serverId))
    .get();

  if (!existing) return { success: false as const, error: 'Server not found' };
  if (!admin && existing.ownerId !== session.user.id)
    return { success: false as const, error: 'Unauthorized' };

  // Types don't survive the network boundary, so re-pick and validate at
  // runtime (stored plugins are rendered as links on the public page).
  const set: OwnerWritableServerData = {};
  if (data && typeof data === 'object' && 'plugins' in data) {
    const plugins = sanitizeServerPlugins(data.plugins);
    if ('error' in plugins)
      return { success: false as const, error: plugins.error };
    set.plugins = plugins.plugins;
  }
  if (data && typeof data === 'object' && 'software' in data) {
    if (!isServerSoftware(data.software))
      return { success: false as const, error: 'Invalid server software' };
    set.software = data.software;
  }
  if (Object.keys(set).length === 0)
    return { success: false as const, error: 'Nothing to update' };

  const updated = await db
    .update(servers)
    .set({ ...set, updatedAt: new Date() })
    .where(eq(servers.id, serverId))
    .returning()
    .get();

  return { success: true as const, slug: updated.slug, id: updated.id };
});

export const setServerVerified = server$(async function (
  serverId: number,
  verified: boolean
) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'Unauthorized' };

  const admin = await isAdmin.call(this);
  if (!admin) return { success: false as const, error: 'Unauthorized' };

  await db
    .update(servers)
    .set({ verified, updatedAt: new Date() })
    .where(eq(servers.id, serverId));

  return { success: true as const };
});

// Owner-facing messages per failure category; the raw Votifier error can
// carry text from the remote end, so it is only logged.
const TEST_VOTE_ERRORS: Record<VotifierFailure, string> = {
  connect:
    'Could not connect to the Votifier host and port. Check that NuVotifier is running and reachable.',
  timeout: 'The Votifier server did not respond in time.',
  protocol:
    'That host and port did not answer as a NuVotifier (v2) server. Check the port.',
  rejected:
    'The Votifier server rejected the test vote. Check that the token is correct.',
  internal: 'The test vote could not be sent. Please try again.',
};

// Per-isolate cooldown; best-effort (Workers isolates don't share memory),
// enough to keep a client from hammering arbitrary host:port pairs.
const lastTestVote = new Map<string, number>();

/**
 * Send a test Votifier v2 vote using the provided configuration or saved server details.
 */
export const testVote = server$(async function (data: {
  serverId?: number;
  votifierHost?: string;
  votifierPort?: number | string | null;
  votifierToken?: string;
  javaHost?: string;
}) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'You must be logged in.' };

  let ownerId: string | null | undefined;
  let dbJavaHost: string | null | undefined;

  if (data?.serverId) {
    const row = await db
      .select({
        ownerId: servers.ownerId,
        javaHost: servers.javaHost,
      })
      .from(servers)
      .where(eq(servers.id, data.serverId))
      .get();

    // A serverId that doesn't resolve must not fall through to an
    // unchecked test against an arbitrary host.
    if (!row) return { success: false as const, error: 'Server not found.' };
    ownerId = row.ownerId;
    dbJavaHost = row.javaHost;
  }

  const admin = await isAdmin.call(this);
  if (ownerId && !admin && ownerId !== session.user.id)
    return { success: false as const, error: 'Unauthorized.' };

  const host =
    typeof data?.votifierHost === 'string' ? data.votifierHost.trim() : '';
  const token =
    typeof data?.votifierToken === 'string' ? data.votifierToken.trim() : '';
  if (!host || !token)
    return {
      success: false as const,
      error:
        'No Votifier host or token provided. Fill in Votifier host and token first.',
    };
  // Same rules as the listing form, so this can't be pointed anywhere a
  // saved listing couldn't.
  if (!isValidHost(host))
    return {
      success: false as const,
      error: 'Votifier host is not a valid hostname or IP.',
    };
  const parsedPort = parsePort(data?.votifierPort ?? null);
  if (parsedPort === undefined)
    return {
      success: false as const,
      error: 'Votifier port must be a number between 1 and 65535.',
    };
  const port = parsedPort ?? DEFAULT_VOTIFIER_PORT;

  const now = Date.now();
  const last = lastTestVote.get(session.user.id) ?? 0;
  if (now - last < TEST_VOTE_COOLDOWN_MS)
    return {
      success: false as const,
      error: 'Please wait a few seconds between test votes.',
    };
  lastTestVote.set(session.user.id, now);

  const result = await sendVotifierV2(
    { host, port, token },
    {
      username: session.user.name ?? session.user.id,
      // Must match voteForServer: per-service token maps in NuVotifier key
      // off this string, so a test with a different serviceName would
      // validate against a different token than real votes.
      serviceName: 'birdflop.com',
      address:
        (typeof data?.javaHost === 'string' && data.javaHost.trim()) ||
        dbJavaHost ||
        host,
      timestamp: now,
    }
  );

  if (result.delivered) return { success: true as const };
  // The raw error can echo whatever the remote end sent back; keep it in
  // the logs and give the owner a generic, actionable message.
  console.error(`Test vote to ${host}:${port} failed:`, result.error);
  return {
    success: false as const,
    error: TEST_VOTE_ERRORS[result.reason ?? 'internal'],
  };
});

// Per-isolate cooldown for ServersPulse link/verify calls; best-effort like
// lastTestVote above, enough to keep one client from burning the shared
// per-IP rate limit on the ServersPulse API.
const lastServersPulseAction = new Map<string, number>();

function serversPulseOnCooldown(userId: string): boolean {
  const now = Date.now();
  const last = lastServersPulseAction.get(userId) ?? 0;
  if (now - last < SERVERSPULSE_ACTION_COOLDOWN_MS) return true;
  lastServersPulseAction.set(userId, now);
  return false;
}

/**
 * Link a listing to its ServersPulse Discover entry by redeeming a
 * single-use link code the owner generated in their ServersPulse dashboard
 * (Discovery → Connected sites). The claim response IS the ownership proof —
 * a typed-in slug is never accepted as a claim. The secret linkToken from
 * the response stays server-side; this action returns only display fields.
 */
export const linkServersPulse = server$(async function (
  serverId: number,
  codeInput: string
) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'You must be logged in.' };

  const row = await db
    .select({ ownerId: servers.ownerId })
    .from(servers)
    .where(eq(servers.id, serverId))
    .get();
  if (!row) return { success: false as const, error: 'Server not found.' };

  const admin = await isAdmin.call(this);
  if (!admin && row.ownerId !== session.user.id)
    return { success: false as const, error: 'Unauthorized.' };

  const code = normalizeServersPulseLinkCode(codeInput);
  if (!isValidServersPulseLinkCode(code))
    return {
      success: false as const,
      error:
        'That does not look like a ServersPulse link code (splink_…). Generate one in your ServersPulse dashboard under Discovery → Connected sites.',
    };

  if (serversPulseOnCooldown(session.user.id))
    return {
      success: false as const,
      error: 'Please wait a few seconds between ServersPulse requests.',
    };

  const result = await claimServersPulseLink(code, SERVERSPULSE_CONSUMER_NAME);
  if (!result.ok) return { success: false as const, error: result.error };
  const { claim } = result;

  // A ServersPulse listing can back at most one server here — the ref is
  // the identity, so relinking the same listing under a second server is
  // rejected even though the claim itself succeeded upstream.
  const claimed = await db
    .select({ serverId: serverspulseLinks.serverId })
    .from(serverspulseLinks)
    .where(
      and(
        eq(serverspulseLinks.listingRef, claim.listingRef),
        ne(serverspulseLinks.serverId, serverId)
      )
    )
    .get();
  if (claimed)
    return {
      success: false as const,
      error:
        'That ServersPulse listing is already linked to another server here. Unlink it there first, then generate a new code (this one has now been used).',
    };

  const now = new Date();
  try {
    // Relinking always replaces the previous link wholesale — a new claim is
    // never trusted on the old one's back.
    await db
      .insert(serverspulseLinks)
      .values({
        serverId,
        listingRef: claim.listingRef,
        linkToken: claim.linkToken,
        consumerName: claim.consumer || SERVERSPULSE_CONSUMER_NAME,
        slug: claim.listing?.slug ?? null,
        linkStatus: claim.status === 'active' ? 'active' : 'unpublished',
        linkedAt: now,
        // The claim response already carries the listing when active — seed
        // the cache so stats appear without waiting for the next poll.
        lastPayload: claim.listing ?? null,
        lastCheckedAt: claim.listing ? now : null,
        lastSuccessAt: claim.listing ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: serverspulseLinks.serverId,
        set: {
          listingRef: claim.listingRef,
          linkToken: claim.linkToken,
          consumerName: claim.consumer || SERVERSPULSE_CONSUMER_NAME,
          slug: claim.listing?.slug ?? null,
          linkStatus: claim.status === 'active' ? 'active' : 'unpublished',
          linkedAt: now,
          lastPayload: claim.listing ?? null,
          lastCheckedAt: claim.listing ? now : null,
          lastSuccessAt: claim.listing ? now : null,
          lastStateCheckAt: null,
          lastError: null,
          updatedAt: now,
        },
      });
  } catch (err) {
    console.error('Error storing ServersPulse link:', err);
    return { success: false as const, error: 'Failed to store the link.' };
  }

  return {
    success: true as const,
    status:
      claim.status === 'active'
        ? ('active' as const)
        : ('unpublished' as const),
    slug: claim.listing?.slug ?? null,
    name: claim.listing?.name ?? null,
  };
});

export const unlinkServersPulse = server$(async function (serverId: number) {
  const session = this.sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'You must be logged in.' };

  const row = await db
    .select({ ownerId: servers.ownerId })
    .from(servers)
    .where(eq(servers.id, serverId))
    .get();
  if (!row) return { success: false as const, error: 'Server not found.' };

  const admin = await isAdmin.call(this);
  if (!admin && row.ownerId !== session.user.id)
    return { success: false as const, error: 'Unauthorized.' };

  try {
    await db
      .delete(serverspulseLinks)
      .where(eq(serverspulseLinks.serverId, serverId));
    return { success: true as const };
  } catch (err) {
    console.error('Error removing ServersPulse link:', err);
    return { success: false as const, error: 'Failed to remove the link.' };
  }
});
