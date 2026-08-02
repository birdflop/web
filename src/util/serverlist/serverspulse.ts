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
// ServersPulse has no ownership/consent flow yet, so linking uses reverse
// verification: we generate a token, the owner adds it to their Discover
// listing's description or website URL, and we poll the public listing until
// it appears (see linkServersPulse/verifyServersPulseLink in actions.ts).
//
// The API is anonymous and rate limited per IP (60 reads/min) and upstream
// responses are cached for 30s, so it is only ever called server-side, and
// refreshes are lazy (on detail views, at most once per minute per slug) with
// the last good payload cached in D1 — no cron, same pattern as birdflop.ts.

import { eq } from 'drizzle-orm';
import {
  serverspulseLinks,
  type AppDatabase,
  type ServersPulseLink,
} from '~/util/db';

const API_BASE = 'https://api.serverspulse.com';

const FETCH_TIMEOUT_MS = 3000;
// Upstream caches listing responses for 30s (the agent reports every 30s);
// polling faster returns identical bytes. One refresh per minute per slug.
const REFRESH_TTL_MS = 60 * 1000;
// A verified link whose slug has stopped resolving (deleted, unpublished, or
// transferred) keeps serving its last payload with a staleness note for a
// while, then the panel disappears entirely rather than showing week-old
// numbers as if they were live.
const HIDE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export const VERIFICATION_TOKEN_PREFIX = 'birdflop-verify-';

// ---------- API types (shape per the ServersPulse Discover API) ----------

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
  name: string;
  description?: string | null;
  // Absent entirely when the owner opted out of publishing it. Never shown on
  // our side either way — listings already carry their own connect address.
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
    status?: ServersPulseStatus | null;
    onlinePlayers?: number | null;
    maxPlayers?: number | null;
    lastCheckedAt?: string | null;
    platform?: string | null;
    mcVersion?: string | null;
    uptime7dPct?: number | null;
  } | null;
  activity?: ServersPulseActivity | null;
}

// Public projection served to visitors. Rebuilt field by field (never spread)
// so fields we must not surface — the ServersPulse `address` above all — can
// never leak into loader payloads.
export interface PublicServersPulseStats {
  slug: string;
  ownerVerified: boolean;
  status: ServersPulseStatus;
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

// ---------- Slug + token helpers ----------

// Discover slugs are lowercase alphanumerics and hyphens; anything else is
// silently dropped by the batch API, so reject it up front.
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function isValidServersPulseSlug(slug: string): boolean {
  return slug.length >= 2 && SLUG_RE.test(slug);
}

/**
 * Normalize owner input into a candidate slug. Accepts a bare slug or a
 * pasted ServersPulse URL (the last path segment is taken).
 */
export function normalizeServersPulseSlug(input: string): string {
  let value = input.trim().toLowerCase();
  if (value.includes('/')) {
    const segments = value.split('/').filter(Boolean);
    value = segments[segments.length - 1] ?? '';
  }
  return value.split('?')[0].split('#')[0];
}

export function generateVerificationToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${VERIFICATION_TOKEN_PREFIX}${hex}`;
}

/**
 * Reverse-verification check: the owner proves control of the ServersPulse
 * listing by placing our token in its description or website URL.
 */
export function tokenAppearsInListing(
  listing: Pick<ServersPulseListing, 'description' | 'websiteUrl'>,
  token: string
): boolean {
  if (!token) return false;
  return (
    (listing.description ?? '').includes(token) ||
    (listing.websiteUrl ?? '').includes(token)
  );
}

// ---------- Fetching ----------

export type FetchListingResult =
  | { ok: true; listing: ServersPulseListing }
  | { ok: false; notFound: boolean; error: string };

/**
 * Fetch a single Discover listing. Never throws. A 404 means the slug is
 * unknown, unpublished, or has no public slug — a normal state, not an error.
 */
export async function fetchServersPulseListing(
  slug: string,
  opts?: { activity?: boolean }
): Promise<FetchListingResult> {
  const url = `${API_BASE}/api/v1/discover/${encodeURIComponent(slug)}${
    opts?.activity ? '?include=activity' : ''
  }`;
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.status === 404)
      return { ok: false, notFound: true, error: 'not found' };
    if (!res.ok)
      return { ok: false, notFound: false, error: `HTTP ${res.status}` };
    const listing: ServersPulseListing = await res.json();
    return { ok: true, listing };
  } catch (err) {
    console.error(`ServersPulse fetch failed for ${slug}:`, err);
    return { ok: false, notFound: false, error: 'unreachable' };
  }
}

// ---------- Lazy refresh (D1-cached, stale-on-failure) ----------

export function serversPulseRefreshIsStale(
  link: Pick<ServersPulseLink, 'lastCheckedAt'>
): boolean {
  return (
    !link.lastCheckedAt ||
    Date.now() - link.lastCheckedAt.getTime() > REFRESH_TTL_MS
  );
}

/**
 * Refresh a verified link's cached payload. Never throws; on failure the
 * previous payload is kept (a ServersPulse outage degrades to slightly stale
 * data, never a blank page or a blocked loader).
 */
export async function refreshServersPulseStats(
  db: AppDatabase,
  link: ServersPulseLink
): Promise<ServersPulseLink> {
  const now = new Date();
  const result = await fetchServersPulseListing(link.slug, { activity: true });

  const updated: ServersPulseLink = result.ok
    ? {
        ...link,
        lastPayload: result.listing,
        lastCheckedAt: now,
        lastSuccessAt: now,
        lastError: null,
      }
    : { ...link, lastCheckedAt: now, lastError: result.error };

  try {
    await db
      .update(serverspulseLinks)
      .set({
        lastPayload: updated.lastPayload,
        lastCheckedAt: updated.lastCheckedAt,
        lastSuccessAt: updated.lastSuccessAt,
        lastError: updated.lastError,
        updatedAt: now,
      })
      .where(eq(serverspulseLinks.serverId, link.serverId));
  } catch (err) {
    console.error('Failed to persist ServersPulse refresh:', err);
  }
  return updated;
}

/**
 * Public projection of a link's cached payload, or null when there is nothing
 * honest to show (never verified, never fetched, or stale beyond the hide
 * window). "Not connected" is a normal state — render nothing, not an error.
 */
export function toPublicServersPulseStats(
  link: ServersPulseLink
): PublicServersPulseStats | null {
  if (!link.verifiedAt || !link.lastPayload || !link.lastSuccessAt) return null;
  if (Date.now() - link.lastSuccessAt.getTime() > HIDE_AFTER_MS) return null;

  const p = link.lastPayload;
  const activity = p.activity ?? null;
  return {
    slug: p.slug ?? link.slug,
    ownerVerified: p.ownerVerified === true,
    status: p.observed?.status ?? 'offline',
    onlinePlayers: p.observed?.onlinePlayers ?? null,
    maxPlayers: p.observed?.maxPlayers ?? null,
    lastCheckedAt: p.observed?.lastCheckedAt ?? null,
    platform: p.observed?.platform ?? null,
    mcVersion: p.observed?.mcVersion ?? null,
    // null = not enough coverage to compute honestly; never 0 or 100.
    uptime7dPct: p.observed?.uptime7dPct ?? null,
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
 * One-call helper for the detail-page loader: load the link, lazily refresh
 * if stale, and return the public projection (or null when not connected).
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
  if (!link?.verifiedAt) return null;

  const fresh = serversPulseRefreshIsStale(link)
    ? await refreshServersPulseStats(db, link)
    : link;
  return toPublicServersPulseStats(fresh);
}
