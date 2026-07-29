// Server$ mutations for the server list feature.

import { server$ } from '@qwik.dev/router';
import { and, eq, gte, or, sql } from 'drizzle-orm';
import { getDB, servers, serverVotes, serverReports } from '~/util/db';
import { isAdmin } from '~/routes/layout';
import {
  validateServerInput,
  isValidMcUsername,
  slugify,
  type ServerFormInput,
} from './validation';
import { verifyTurnstile } from './turnstile';
import { sendVotifierV2 } from './votifier';
import { DEFAULT_VOTIFIER_PORT, VOTE_COOLDOWN_MS } from './constants';

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
  // Try the base, then base-2, base-3, ... until free.

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
  const session = this.sharedMap.get('session');
  const db = getDB();
  if (!session?.user?.id || !db)
    return {
      success: false as const,
      errors: ['You must be logged in to add a server.'],
    };

  const validation = validateServerInput(input);
  if (!validation.valid || !validation.data)
    return { success: false as const, errors: validation.errors };

  const data = validation.data;
  const slug = await uniqueSlug(db, slugify(data.name));

  try {
    const inserted = await db
      .insert(servers)
      .values({ ...data, slug, ownerId: session.user.id })
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
  const session = this.sharedMap.get('session');
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

  try {
    const updated = await db
      .update(servers)
      .set({ ...data, slug, updatedAt: new Date() })
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
  const session = this.sharedMap.get('session');
  const db = getDB();
  if (!session?.user?.id || !db)
    return { success: false as const, error: 'You must be logged in.' };

  const admin = await isAdmin();
  try {
    await db
      .delete(servers)
      .where(
        and(
          eq(servers.id, id),
          admin ? undefined : eq(servers.ownerId, session.user.id)
        )
      );
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
}

export const voteForServer = server$(async function (
  serverId: number,
  username: string,
  captchaToken: string
): Promise<VoteResult> {
  const db = getDB();
  if (!db) return { success: false, error: 'Database unavailable.' };

  const cleanUsername = username.trim();
  if (!isValidMcUsername(cleanUsername))
    return { success: false, error: 'Enter a valid Minecraft username.' };

  const ip = getClientIp(this.request.headers);

  // CAPTCHA.
  const captcha = await verifyTurnstile(
    captchaToken,
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

  // 24h cooldown by username OR ip for this server.
  const cutoff = new Date(Date.now() - VOTE_COOLDOWN_MS);
  const recent = await db
    .select({ id: serverVotes.id })
    .from(serverVotes)
    .where(
      and(
        eq(serverVotes.serverId, serverId),
        gte(serverVotes.createdAt, cutoff),
        ip
          ? or(eq(serverVotes.username, cleanUsername), eq(serverVotes.ip, ip))
          : eq(serverVotes.username, cleanUsername)
      )
    )
    .get();
  if (recent)
    return {
      success: false,
      error: 'You have already voted for this server in the last 24 hours.',
    };

  // Attempt Votifier delivery (best-effort).
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
        timestamp: Date.now(),
      }
    );
    delivered = result.delivered;
    deliveryError = result.error;
  }

  try {
    await db.insert(serverVotes).values({
      serverId,
      username: cleanUsername,
      ip,
      votifierDelivered: delivered,
    });
  } catch (err) {
    console.error('Error recording vote:', err);
    return { success: false, error: 'Failed to record your vote.' };
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

  const cleanReason = reason.trim();
  if (!cleanReason)
    return { success: false as const, error: 'A reason is required.' };
  if (cleanReason.length > 100)
    return { success: false as const, error: 'Reason is too long.' };

  const session = this.sharedMap.get('session');
  const ip = getClientIp(this.request.headers);

  try {
    await db.insert(serverReports).values({
      serverId,
      reason: cleanReason,
      details: details?.trim()?.slice(0, 1000) || null,
      reporterId: session?.user?.id ?? null,
      ip,
    });
    return { success: true as const };
  } catch (err) {
    console.error('Error filing report:', err);
    return { success: false as const, error: 'Failed to submit the report.' };
  }
});

export const getUserServers = server$(async function () {
  const session = this.sharedMap.get('session');
  const db = getDB();
  if (!session?.user?.id || !db) return [];

  const userServers = await db
    .select({
      id: servers.id,
      name: servers.name,
      slug: servers.slug,
    })
    .from(servers)
    .where(eq(servers.ownerId, session.user.id))
    .all();

  return userServers;
});

export const updateServerPlugins = server$(async function (
  serverId: number,
  pluginsData: {
    [id: string]: import('~/util/plugins/ServerPlugin').PluginType;
  }
) {
  const session = this.sharedMap.get('session');
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

  await db
    .update(servers)
    .set({ plugins: pluginsData, updatedAt: new Date() })
    .where(eq(servers.id, serverId));

  return { success: true as const };
});
