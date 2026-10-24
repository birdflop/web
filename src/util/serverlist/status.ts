// Minecraft server status for the server list and the status checker.
//
// Two paths:
// - Stored (list pages, filters, sorting): the every-minute cron calls
//   refreshStoredStatuses, which pings the stalest listings in small batches
//   and upserts the results into the `serverStatus` D1 table. Loaders read
//   that table via getStoredStatus / storedRowToStatus — they never fan out
//   pings per request.
// - Live (status checker, one listing's detail page): fetchStatus pings a
//   single address, cached per isolate in a size-capped LRU.
//
// Java uses a direct socket ping (@birdflop/mc-status). Bedrock is RakNet over
// UDP, which Cloudflare Workers cannot open, so Bedrock goes through the
// public mcstatus.io API instead and is mapped to the same shape.

import { asc, eq, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import {
  motdRunsToClean,
  parseMotd,
  parseMotdLine,
  pingJava,
  type ServerMotd,
  type ServerStatus,
} from '@birdflop/mc-status';
import {
  serverStatus,
  servers,
  type AppDatabase,
  type Server,
  type StoredServerStatus,
} from '~/util/db';

export type { ServerMotd, ServerStatus };

type Edition = 'java' | 'bedrock';
export type StatusTarget = Pick<
  Server,
  'edition' | 'javaHost' | 'javaPort' | 'bedrockHost' | 'bedrockPort'
>;

const PING_TIMEOUT_MS = 4000;
const STATUS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
// The status checker caches by user-supplied host, so the cache must be
// bounded or arbitrary ?host= values grow it forever.
export const STATUS_CACHE_MAX_ENTRIES = 256;

const BEDROCK_API = 'https://api.mcstatus.io/v2/status/bedrock/';

const DEFAULT_PORT: Record<Edition, number> = { java: 25565, bedrock: 19132 };

// ---------- Live ping ----------

function offlineStatus(
  edition: Edition,
  host: string,
  port: number | null
): ServerStatus {
  return {
    online: false,
    players: { online: 0, max: 0 },
    version: null,
    motd: null,
    icon: null,
    edition,
    host,
    port,
  };
}

function toServerMotd(raw: string | null | undefined): ServerMotd | null {
  if (!raw) return null;
  const parsed = parseMotd(raw);
  return { raw: parsed.raw, clean: parsed.clean, html: null };
}

interface McStatusBedrockResponse {
  online?: boolean;
  version?: { name?: string | null } | null;
  players?: { online?: number | null; max?: number | null } | null;
  motd?: { raw?: string | null } | null;
}

/**
 * Bedrock status via api.mcstatus.io (Workers have no UDP). Mapped to the
 * same ServerStatus shape as a direct ping.
 */
export async function fetchBedrockStatus(
  host: string,
  port: number | null,
  timeout = PING_TIMEOUT_MS
): Promise<ServerStatus> {
  const address = `${encodeURIComponent(host)}${port ? `:${port}` : ''}`;
  try {
    const res = await fetch(BEDROCK_API + address, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return offlineStatus('bedrock', host, port);
    const body: McStatusBedrockResponse = await res.json();
    if (!body.online) return offlineStatus('bedrock', host, port);
    return {
      online: true,
      players: {
        online: Number(body.players?.online ?? 0) || 0,
        max: Number(body.players?.max ?? 0) || 0,
      },
      version: body.version?.name || null,
      motd: toServerMotd(body.motd?.raw),
      icon: null,
      edition: 'bedrock',
      host,
      port,
    };
  } catch {
    return offlineStatus('bedrock', host, port);
  }
}

/** Uncached single-address ping. Never throws. */
export async function pingStatus(
  edition: Edition,
  host: string,
  port: number | null = null
): Promise<ServerStatus> {
  if (edition === 'bedrock') return fetchBedrockStatus(host, port);
  try {
    const result = await pingJava(host, port ?? DEFAULT_PORT.java, {
      timeout: PING_TIMEOUT_MS,
    });
    if (!result.online) return offlineStatus(edition, host, port);
    return {
      online: true,
      players: { online: result.players.online, max: result.players.max },
      version: result.version.name || null,
      motd: result.motd
        ? { raw: result.motd.raw, clean: result.motd.clean, html: null }
        : null,
      icon: result.favicon,
      edition,
      host,
      port,
    };
  } catch {
    return offlineStatus(edition, host, port);
  }
}

// ---------- Per-isolate LRU cache (live path only) ----------

interface CachedStatus {
  timestamp: number;
  status: ServerStatus;
}

const statusCache = new Map<string, CachedStatus>();

function getCacheKey(edition: Edition, host: string, port: number | null) {
  return `${edition}:${host.toLowerCase()}:${port ?? DEFAULT_PORT[edition]}`;
}

function cacheGet(key: string, now: number): ServerStatus | null {
  const hit = statusCache.get(key);
  if (!hit) return null;
  statusCache.delete(key);
  if (now - hit.timestamp >= STATUS_CACHE_TTL_MS) return null;
  statusCache.set(key, hit); // move to most-recently-used
  return hit.status;
}

function cacheSet(key: string, status: ServerStatus, now: number): void {
  statusCache.delete(key);
  statusCache.set(key, { timestamp: now, status });
  // Map iteration order is insertion order: the first key is the LRU entry.
  while (statusCache.size > STATUS_CACHE_MAX_ENTRIES) {
    const oldest = statusCache.keys().next().value;
    if (oldest === undefined) break;
    statusCache.delete(oldest);
  }
}

export function clearStatusCache(): void {
  statusCache.clear();
}

export function statusCacheSize(): number {
  return statusCache.size;
}

/** Live ping with a 2-minute, size-capped per-isolate cache. Never throws. */
export async function fetchStatus(
  edition: Edition,
  host: string,
  port: number | null = null
): Promise<ServerStatus> {
  const key = getCacheKey(edition, host, port);
  const cached = cacheGet(key, Date.now());
  if (cached) return cached;
  const status = await pingStatus(edition, host, port);
  cacheSet(key, status, Date.now());
  return status;
}

async function resolveStatus(
  server: StatusTarget,
  fetcher: (
    edition: Edition,
    host: string,
    port: number | null
  ) => Promise<ServerStatus>
): Promise<ServerStatus | null> {
  const wantsJava = server.edition === 'java' || server.edition === 'both';
  const wantsBedrock =
    server.edition === 'bedrock' || server.edition === 'both';

  if (wantsJava && server.javaHost) {
    const status = await fetcher(
      'java',
      server.javaHost,
      server.javaPort ?? null
    );
    if (status.online || !wantsBedrock || !server.bedrockHost) return status;
  }

  if (wantsBedrock && server.bedrockHost) {
    return fetcher('bedrock', server.bedrockHost, server.bedrockPort ?? null);
  }

  return null;
}

/**
 * Live (cached) status for one stored server. For "both" listings Java is
 * pinged first with Bedrock as the fallback. Use getStoredStatus for lists.
 */
export function getServerStatus(
  server: StatusTarget
): Promise<ServerStatus | null> {
  return resolveStatus(server, fetchStatus);
}

// ---------- Stored status (D1, refreshed by cron) ----------

// A stored "online" older than this is no longer trusted for lists (cron
// starved or broken) and reads as offline.
export const STORED_STATUS_MAX_AGE_MS = 60 * 60 * 1000;
// The detail page only prefers a stored result over its own live ping when
// the stored one is recent.
const DETAIL_FALLBACK_MAX_AGE_MS = 10 * 60 * 1000;
// D1 caps bound parameters per statement at 100.
const IN_CHUNK = 90;

/** Map a `serverStatus` row (or a missing row) to the public status shape. */
export function storedRowToStatus(
  row: StoredServerStatus | null | undefined,
  now = Date.now(),
  maxAgeMs = STORED_STATUS_MAX_AGE_MS
): ServerStatus | null {
  if (!row) return null;
  const fresh = now - row.checkedAt.getTime() <= maxAgeMs;
  if (!row.online || !fresh) {
    return offlineStatus(row.edition, row.host, row.port ?? null);
  }
  return {
    online: true,
    players: { online: row.players, max: row.maxPlayers },
    version: row.version,
    motd: row.motd
      ? {
          raw: row.motd,
          clean: motdRunsToClean(
            row.motd.split('\n').map((l) => parseMotdLine(l))
          ),
          html: null,
        }
      : null,
    icon: row.icon,
    edition: row.edition,
    host: row.host,
    port: row.port ?? null,
  };
}

/**
 * Last polled status for the given listings, keyed by server id (null when a
 * listing has not been polled yet). Pure D1 read — never pings.
 */
export async function getStoredStatus(
  db: AppDatabase,
  serverIds: number[]
): Promise<Record<number, ServerStatus | null>> {
  const ids = [...new Set(serverIds)];
  const out: Record<number, ServerStatus | null> = {};
  for (const id of ids) out[id] = null;
  const now = Date.now();
  for (let i = 0; i < ids.length; i += IN_CHUNK) {
    const rows = await db
      .select()
      .from(serverStatus)
      .where(inArray(serverStatus.serverId, ids.slice(i, i + IN_CHUNK)))
      .all();
    for (const row of rows) out[row.serverId] = storedRowToStatus(row, now);
  }
  return out;
}

/**
 * Detail page: one live ping, falling back to the recently stored result when
 * the live ping fails (e.g. a timeout under load).
 */
export async function getLiveOrStoredStatus(
  db: AppDatabase,
  server: StatusTarget & Pick<Server, 'id'>
): Promise<ServerStatus | null> {
  const [live, storedRow] = await Promise.all([
    getServerStatus(server),
    db
      .select()
      .from(serverStatus)
      .where(eq(serverStatus.serverId, server.id))
      .get(),
  ]);
  if (live?.online) return live;
  const stored = storedRowToStatus(
    storedRow,
    Date.now(),
    DETAIL_FALLBACK_MAX_AGE_MS
  );
  if (stored?.online) return stored;
  return live ?? stored;
}

/** Run `fn` over `items` with at most `limit` in flight. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return results;
}

export interface RefreshStatusOptions {
  /** Listings pinged per run (the stalest first). */
  batchSize?: number;
  /** Simultaneous pings (Workers allow ~6 open connections). */
  concurrency?: number;
  /** Rows checked more recently than this are skipped. */
  minAgeMs?: number;
}

/**
 * Cron job: ping the stalest listings (never-checked first) and upsert the
 * results. With the defaults a run is at most batchSize / concurrency rounds
 * of one PING_TIMEOUT_MS each (~20s worst case). Returns the number of
 * listings refreshed.
 */
export async function refreshStoredStatuses(
  db: AppDatabase,
  {
    batchSize = 30,
    concurrency = 6,
    minAgeMs = 2 * 60 * 1000,
  }: RefreshStatusOptions = {}
): Promise<number> {
  const cutoff = new Date(Date.now() - minAgeMs);
  const due = await db
    .select({
      id: servers.id,
      edition: servers.edition,
      javaHost: servers.javaHost,
      javaPort: servers.javaPort,
      bedrockHost: servers.bedrockHost,
      bedrockPort: servers.bedrockPort,
    })
    .from(servers)
    .leftJoin(serverStatus, eq(serverStatus.serverId, servers.id))
    .where(
      or(isNull(serverStatus.checkedAt), lt(serverStatus.checkedAt, cutoff))
    )
    .orderBy(
      sql`${serverStatus.checkedAt} IS NOT NULL`,
      asc(serverStatus.checkedAt)
    )
    .limit(batchSize)
    .all();
  if (due.length === 0) return 0;

  const results = await mapWithConcurrency(due, concurrency, (s) =>
    resolveStatus(s, pingStatus)
  );
  const checkedAt = new Date();

  const upserts = due.map((s, i) => {
    // A listing with no usable address is recorded as offline so it does
    // not stay "never checked" and get picked first on every run.
    const status =
      results[i] ??
      offlineStatus(
        s.edition === 'bedrock' ? 'bedrock' : 'java',
        s.javaHost ?? s.bedrockHost ?? '',
        null
      );
    const values = {
      online: status.online,
      players: status.players.online,
      maxPlayers: status.players.max,
      version: status.version,
      motd: status.motd?.raw ?? null,
      icon: status.icon,
      edition: status.edition,
      host: status.host,
      port: status.port,
      checkedAt,
    };
    return db
      .insert(serverStatus)
      .values({ serverId: s.id, ...values })
      .onConflictDoUpdate({ target: serverStatus.serverId, set: values });
  });
  const [first, ...rest] = upserts;
  try {
    await db.batch([first, ...rest]);
  } catch (err) {
    // A batch is one transaction: a listing deleted mid-run (FK violation)
    // would roll back everyone's update. Retry row by row.
    console.error('serverStatus batch upsert failed, retrying per row:', err);
    await Promise.allSettled(upserts.map((q) => q.run()));
  }
  return due.length;
}
