// ServersPulse (serverspulse.com) Discover integration.
//
// ServersPulse is a Minecraft server monitoring service. Owners who opt their
// server into the public "Discover" directory expose a limited telemetry
// slice (players, uptime, TPS-derived health, activity history) over an
// anonymous HTTP API. A linked listing shows that data on its detail page.
//
// Everything the API returns is self-reported by a plugin on the owner's own
// machine and trivially forgeable, so it is DISPLAY ONLY — it must never feed
// ranking, sorting, or vote weighting (queries.ts intentionally ignores it).
//
// Linking: the owner generates a single-use link code (`splink_…`) in their
// ServersPulse dashboard (Discovery → Connected sites) and pastes it into our
// edit page. Our backend redeems it via POST /discover/links/claim — the
// claim response IS the ownership proof. It returns `listingRef` (the join
// key, issued once and never reassigned) and `linkToken` (a per-link secret
// for the /links/self state endpoint; server-side only, never sent to a
// browser). Slugs are stored for display only: they are released on
// unpublish and can silently start resolving to a different server.
//
// Freshness: a Cloudflare cron (see `scheduled` in entry.cloudflare-pages)
// runs pollServersPulseLinks every minute. It batch-fetches all linked refs
// in chunks of 48 and caches the payloads in D1; page loaders only ever read
// the database. The API is anonymous and rate limited per IP (60 reads/min),
// so it is only ever called server-side, and a ServersPulse outage degrades
// to slightly stale data — this integration must never take a page down.
//
// Link state: refs that are revoked, unpublished, or unknown are simply
// absent from batch responses (indistinguishable by design). When a ref goes
// missing — and occasionally while it stays missing, never every cycle — the
// poller resolves why via GET /discover/links/self with the link's token.

import { eq, ne } from 'drizzle-orm';
import {
  serverspulseLinks,
  type AppDatabase,
  type ServersPulseLink,
} from '~/util/db';

const API_BASE = 'https://api.serverspulse.com';

// Background polls must be cheap to fail; the interactive claim call gets a
// little more patience since the owner is watching and the code is one-shot.
const FETCH_TIMEOUT_MS = 3000;
const CLAIM_TIMEOUT_MS = 8000;
// The batch discover endpoint accepts at most 48 refs per request (more is a
// 422 that costs the whole chunk).
export const BATCH_REF_LIMIT = 48;
// A link whose ref has stopped resolving keeps serving its last payload with
// a staleness note for a while, then the panel disappears entirely rather
// than showing week-old numbers as if they were live.
const HIDE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
// How often the poller may re-resolve a still-missing ref via /links/self.
// The endpoint is per-link and not cacheable — spec says not every cycle.
const STATE_RECHECK_MS = 6 * 60 * 60 * 1000;
// Cap /links/self calls per poll run so a mass outage (every ref missing at
// once) can't blow the shared 60 req/min budget.
const MAX_STATE_CHECKS_PER_RUN = 5;

// ---------- API types (shape per the ServersPulse Discover API) ----------

export type ServersPulseLinkStatus = 'active' | 'unpublished' | 'revoked';

export type ServersPulseStatus =
  | 'offline'
  | 'critical'
  | 'degraded'
  | 'healthy';

export interface ServersPulseActivity {
  playersOverTime?: {
    from: string;
    stepMinutes: number;
    avg: (number | null)[];
    peak: (number | null)[];
  } | null;
  hourlyAverageUtc?: (number | null)[] | null;
  peakHourUtc?: number | null;
  profileDays?: number | null;
  coverageDays?: number | null;
}

export interface ServersPulseListing {
  slug: string;
  // Present on ref-filtered batch responses; echoes the ref that matched.
  ref?: string;
  name: string;
  description?: string | null;
  // Absent entirely when the owner opted out of publishing it (key-absent
  // means opted out; key-present-and-null means exposed but unknown). Never
  // shown on our side either way — listings carry their own connect address.
  address?: string | null;
  edition?: string | null;
  serverType?: string | null;
  modpackName?: string | null;
  gameModes?: string[];
  region?: string | null;
  tags?: string[];
  websiteUrl?: string | null;
  discordUrl?: string | null;
  requiresDiscord?: boolean;
  communityLabel?: string | null;
  // Means only that this monitored server has sent telemetry under its
  // owner's ServersPulse account — NOT a safety/quality/trust signal.
  ownerVerified?: boolean;
  observed?: {
    status?: string | null;
    onlinePlayers?: number | null;
    maxPlayers?: number | null;
    lastCheckedAt?: string | null;
    platform?: string | null;
    mcVersion?: string | null;
    uptime7dPct?: number | null;
  } | null;
  activity?: ServersPulseActivity | null;
}

export interface ServersPulseClaimResponse {
  linkToken: string;
  listingRef: string;
  consumer: string;
  status: 'active' | 'unpublished';
  listing: ServersPulseListing | null;
}

export interface ServersPulseOptions {
  statuses?: string[];
  editions?: string[];
  serverTypes?: string[];
  gameModes?: string[];
  regions?: string[];
  communityLabels?: string[];
  sorts?: string[];
}

// Public projection served to visitors. Rebuilt field by field (never spread)
// so fields we must not surface — the ServersPulse `address` above all — can
// never leak into loader payloads.
export interface PublicServersPulseStats {
  slug: string | null;
  ownerVerified: boolean;
  // A known health status, or a raw value newer than this deploy (the panel
  // renders unknown values neutrally instead of mislabeling them).
  status: ServersPulseStatus | (string & {});
  onlinePlayers: number | null;
  maxPlayers: number | null;
  /** RFC3339 timestamp of the last telemetry report, from ServersPulse. */
  lastCheckedAt: string | null;
  platform: string | null;
  mcVersion: string | null;
  uptime7dPct: number | null;
  activity: {
    playersOverTime: {
      from: string;
      stepMinutes: number;
      avg: (number | null)[];
      peak: (number | null)[];
    } | null;
    hourlyAverageUtc: (number | null)[] | null;
    peakHourUtc: number | null;
    coverageDays: number | null;
  } | null;
  /** ms epoch of our last successful fetch, for the "as of" staleness note. */
  fetchedAt: number;
}

// ---------- Code + ref helpers ----------

// Single-use link codes from the owner's ServersPulse dashboard.
const LINK_CODE_RE = /^splink_[0-9a-f]{24}$/;
// Refs are 32 hex chars, issued once per link. Malformed refs are silently
// dropped by the batch filter, so they must never be sent in the first place.
const LISTING_REF_RE = /^[0-9a-f]{32}$/;

export function normalizeServersPulseLinkCode(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidServersPulseLinkCode(code: string): boolean {
  return LINK_CODE_RE.test(code);
}

export function isValidServersPulseListingRef(ref: string): boolean {
  return LISTING_REF_RE.test(ref);
}

export function chunkRefs<T>(items: T[], size = BATCH_REF_LIMIT): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Requested-vs-returned diff for a batch response. Revoked, unpublished, and
 * unknown refs are all simply absent from `items` (indistinguishable there by
 * design) — the caller resolves *why* via the link-state endpoint.
 */
export function diffMissingRefs(
  requested: string[],
  items: Pick<ServersPulseListing, 'ref'>[]
): string[] {
  const returned = new Set(items.map((i) => i.ref).filter(Boolean));
  return requested.filter((ref) => !returned.has(ref));
}

// ---------- Claiming (the ownership proof) ----------

export type ClaimServersPulseResult =
  | { ok: true; claim: ServersPulseClaimResponse }
  | { ok: false; error: string };

/**
 * Redeem a single-use link code. Backend only — the response carries the
 * secret `linkToken`. Each failure mode gets its own message; a generic
 * "linking failed" would leave the owner guessing.
 */
export async function claimServersPulseLink(
  code: string,
  consumer: string
): Promise<ClaimServersPulseResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/discover/links/claim`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ code, consumer }),
      signal: AbortSignal.timeout(CLAIM_TIMEOUT_MS),
    });
  } catch (err) {
    console.error('ServersPulse claim request failed:', err);
    return {
      ok: false,
      error:
        'Could not reach ServersPulse right now. Please try again shortly.',
    };
  }

  if (res.status === 201) {
    let claim: ServersPulseClaimResponse;
    try {
      claim = await res.json();
    } catch {
      return {
        ok: false,
        error:
          'ServersPulse returned an unexpected response. Please try again.',
      };
    }
    if (
      typeof claim?.linkToken !== 'string' ||
      !claim.linkToken ||
      typeof claim?.listingRef !== 'string' ||
      !isValidServersPulseListingRef(claim.listingRef)
    ) {
      console.error('ServersPulse claim response missing token/ref');
      return {
        ok: false,
        error:
          'ServersPulse returned an unexpected response. Please try again.',
      };
    }
    return { ok: true, claim };
  }

  switch (res.status) {
    case 404:
      return {
        ok: false,
        error:
          'That link code was not found. Check for typos — and note that generating a new code replaces any older one.',
      };
    case 400:
      return {
        ok: false,
        error:
          'That link code has expired. Codes are valid for 15 minutes — generate a fresh one and paste it right away.',
      };
    case 409:
      return {
        ok: false,
        error:
          'That link code has already been used. Codes are single-use — generate a fresh one on ServersPulse.',
      };
    case 422:
      return {
        ok: false,
        error:
          'ServersPulse rejected the request. Make sure you pasted the complete code; if it keeps failing, this is a bug on our side.',
      };
    default:
      return {
        ok: false,
        error:
          'Could not reach ServersPulse right now. Please try again shortly.',
      };
  }
}

// ---------- Link state (GET /discover/links/self) ----------

export type ServersPulseLinkStateResult =
  | { ok: true; status: ServersPulseLinkStatus }
  | { ok: false; error: string };

/**
 * Resolve why a ref is missing from batch responses. Per-link and not
 * cacheable — call it when a ref first goes missing and occasionally while
 * it stays missing, never on every poll cycle. A 401 (unknown token) is
 * treated as revoked per the API contract.
 */
export async function fetchServersPulseLinkState(
  linkToken: string
): Promise<ServersPulseLinkStateResult> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/discover/links/self`, {
      headers: { accept: 'application/json', 'X-Link-Token': linkToken },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.status === 401) return { ok: true, status: 'revoked' };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const body: { status?: string } = await res.json();
    if (
      body.status === 'active' ||
      body.status === 'unpublished' ||
      body.status === 'revoked'
    )
      return { ok: true, status: body.status };
    return { ok: false, error: 'unexpected status' };
  } catch (err) {
    console.error('ServersPulse link-state fetch failed:', err);
    return { ok: false, error: 'unreachable' };
  }
}

// ---------- Discover options (enum values, cached per max-age) ----------

// Baseline for when the options endpoint is unavailable; the cached response
// extends this so new upstream values don't need a deploy.
const BASELINE_STATUSES: readonly string[] = [
  'offline',
  'critical',
  'degraded',
  'healthy',
];

let optionsCache: { value: ServersPulseOptions; expiresAt: number } | null =
  null;

/**
 * Fetch and cache /discover/options (the server sends max-age=3600). Enum
 * values are validated against this instead of hardcoded lists. Per-isolate
 * cache; the poller refreshes it at most once per TTL.
 */
export async function getServersPulseOptions(): Promise<ServersPulseOptions | null> {
  if (optionsCache && Date.now() < optionsCache.expiresAt)
    return optionsCache.value;
  try {
    const res = await fetch(`${API_BASE}/api/v1/discover/options`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return optionsCache?.value ?? null;
    const value: ServersPulseOptions = await res.json();
    const maxAge = Number(
      res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] ?? 3600
    );
    optionsCache = { value, expiresAt: Date.now() + maxAge * 1000 };
    return value;
  } catch (err) {
    console.error('ServersPulse options fetch failed:', err);
    return optionsCache?.value ?? null;
  }
}

/**
 * Whether a reported status value is one the API declares (baseline set plus
 * whatever the cached options add). Unknown values are dropped at poll time
 * so forged garbage never reaches the page.
 */
export function isKnownServersPulseStatus(
  value: string,
  options: ServersPulseOptions | null
): boolean {
  return (
    BASELINE_STATUSES.includes(value) ||
    (options?.statuses ?? []).includes(value)
  );
}

// ---------- Batch fetching ----------

export type FetchBatchResult =
  | { ok: true; items: ServersPulseListing[] }
  | { ok: false; error: string };

/**
 * Fetch up to 48 listings by ref. Never throws. Refs absent from `items`
 * are not an error — diff them with diffMissingRefs and resolve why via
 * fetchServersPulseLinkState.
 */
export async function fetchServersPulseListingsByRef(
  refs: string[],
  opts?: { activity?: boolean }
): Promise<FetchBatchResult> {
  if (refs.length === 0) return { ok: true, items: [] };
  if (refs.length > BATCH_REF_LIMIT)
    return { ok: false, error: `more than ${BATCH_REF_LIMIT} refs` };
  const url = `${API_BASE}/api/v1/discover?ref=${refs.join(',')}${
    opts?.activity ? '&include=activity' : ''
  }`;
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const body: { items?: ServersPulseListing[] } = await res.json();
    return { ok: true, items: Array.isArray(body.items) ? body.items : [] };
  } catch (err) {
    console.error('ServersPulse batch fetch failed:', err);
    return { ok: false, error: 'unreachable' };
  }
}

// ---------- Background poller (Cloudflare cron, every minute) ----------

function stateCheckIsDue(
  link: Pick<ServersPulseLink, 'lastError' | 'lastStateCheckAt'>,
  now: number
): boolean {
  // First cycle where the ref went missing (last cycle was clean), or a
  // periodic re-check while it stays missing.
  if (link.lastError === null) return true;
  if (!link.lastStateCheckAt) return true;
  return now - link.lastStateCheckAt.getTime() > STATE_RECHECK_MS;
}

/**
 * The 60-second background job: batch-refresh every non-revoked link's
 * cached payload. Page loaders never call the API — they read what this
 * wrote. Never throws; a failed chunk just records lastError and keeps the
 * previous payload.
 */
export async function pollServersPulseLinks(db: AppDatabase): Promise<void> {
  const links = await db
    .select()
    .from(serverspulseLinks)
    .where(ne(serverspulseLinks.linkStatus, 'revoked'))
    .all();
  if (links.length === 0) return;

  // Refresh the options cache opportunistically (no-op within its TTL) and
  // use it to validate reported enum values below.
  const options = await getServersPulseOptions();

  // Drop malformed refs locally — the API would silently ignore them and
  // they would show up as "missing" every cycle, burning state checks.
  const valid = links.filter((l) =>
    isValidServersPulseListingRef(l.listingRef)
  );
  let stateChecksLeft = MAX_STATE_CHECKS_PER_RUN;

  for (const chunk of chunkRefs(valid)) {
    const result = await fetchServersPulseListingsByRef(
      chunk.map((l) => l.listingRef),
      // Activity is rendered on every linked listing's detail page, so it is
      // always requested here.
      { activity: true }
    );
    const now = new Date();

    if (!result.ok) {
      // Transport/API failure: can't tell anything about individual refs.
      // Record the attempt; last good payloads keep serving.
      for (const link of chunk) {
        await db
          .update(serverspulseLinks)
          .set({ lastCheckedAt: now, lastError: result.error, updatedAt: now })
          .where(eq(serverspulseLinks.serverId, link.serverId));
      }
      continue;
    }

    const byRef = new Map(result.items.map((item) => [item.ref, item]));
    for (const link of chunk) {
      const item = byRef.get(link.listingRef);
      if (item) {
        // Unknown status values (not baseline, not declared by /options) are
        // dropped before caching so forged garbage never reaches a page.
        const status = item.observed?.status;
        if (
          typeof status === 'string' &&
          !isKnownServersPulseStatus(status, options)
        )
          item.observed = { ...item.observed, status: null };
        await db
          .update(serverspulseLinks)
          .set({
            lastPayload: item,
            slug: item.slug ?? link.slug,
            linkStatus: 'active',
            lastCheckedAt: now,
            lastSuccessAt: now,
            lastError: null,
            updatedAt: now,
          })
          .where(eq(serverspulseLinks.serverId, link.serverId));
        continue;
      }

      // Ref missing from the response: revoked, unpublished, or unknown —
      // indistinguishable here by design. Resolve via /links/self, but only
      // when it first goes missing and occasionally after, never every cycle.
      const changes: Partial<ServersPulseLink> = {};
      if (
        link.linkToken &&
        stateChecksLeft > 0 &&
        stateCheckIsDue(link, now.getTime())
      ) {
        stateChecksLeft -= 1;
        changes.lastStateCheckAt = now;
        const state = await fetchServersPulseLinkState(link.linkToken);
        if (state.ok) {
          if (state.status === 'revoked') {
            // Owner withdrew consent: stop polling, drop their data, and
            // leave a tombstone so the edit page can show a reconnect
            // prompt. The public panel disappears immediately.
            changes.linkStatus = 'revoked';
            changes.linkToken = null;
            changes.lastPayload = null;
            changes.lastSuccessAt = null;
          } else {
            // 'unpublished' keeps the link and keeps polling — it resumes
            // automatically if the owner republishes. 'active' with a
            // missing ref is a transient upstream hiccup; keep serving the
            // last payload with its staleness note.
            changes.linkStatus = state.status;
          }
        }
      }
      await db
        .update(serverspulseLinks)
        .set({
          ...changes,
          lastCheckedAt: now,
          lastError: 'missing from discover response',
          updatedAt: now,
        })
        .where(eq(serverspulseLinks.serverId, link.serverId));
    }
  }
}

// ---------- Public projection (pure DB read, no fetching) ----------

/**
 * Public projection of a link's cached payload, or null when there is nothing
 * honest to show: not active (unpublished/revoked), never polled, never
 * reported any telemetry (e.g. a Bedrock listing — there is no Bedrock
 * agent), or stale beyond the hide window. "Not connected" is a normal
 * state — render nothing, not an error.
 */
export function toPublicServersPulseStats(
  link: ServersPulseLink
): PublicServersPulseStats | null {
  if (link.linkStatus !== 'active') return null;
  if (!link.lastPayload || !link.lastSuccessAt) return null;
  if (Date.now() - link.lastSuccessAt.getTime() > HIDE_AFTER_MS) return null;

  const p = link.lastPayload;
  // Never reported: a linked listing with no telemetry is normal, not
  // broken — show nothing rather than a permanently empty panel.
  if (!p.observed) return null;

  const activity = p.activity ?? null;
  return {
    slug: p.slug ?? link.slug,
    ownerVerified: p.ownerVerified === true,
    status: p.observed.status ?? 'offline',
    onlinePlayers: p.observed.onlinePlayers ?? null,
    maxPlayers: p.observed.maxPlayers ?? null,
    lastCheckedAt: p.observed.lastCheckedAt ?? null,
    platform: p.observed.platform ?? null,
    mcVersion: p.observed.mcVersion ?? null,
    // null = not enough coverage to compute honestly; never 0 or 100.
    uptime7dPct: p.observed.uptime7dPct ?? null,
    activity: activity
      ? {
          playersOverTime: activity.playersOverTime ?? null,
          hourlyAverageUtc: activity.hourlyAverageUtc ?? null,
          peakHourUtc: activity.peakHourUtc ?? null,
          coverageDays: activity.coverageDays ?? null,
        }
      : null,
    fetchedAt: link.lastSuccessAt.getTime(),
  };
}

/**
 * Detail-page loader helper: read the cached link row and project it.
 * Database only — page render never fetches from or blocks on ServersPulse.
 */
export async function getPublicServersPulseStats(
  db: AppDatabase,
  serverId: number
): Promise<PublicServersPulseStats | null> {
  const link = await db
    .select()
    .from(serverspulseLinks)
    .where(eq(serverspulseLinks.serverId, serverId))
    .get();
  if (!link) return null;
  return toPublicServersPulseStats(link);
}
