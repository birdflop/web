// Listing query: ranking, filtering and paging entirely in SQL.
//
// Votes, edition, tags and text search come from the listing tables. Status
// fields (online, version, current players) come from the `serverStatus`
// table, which the every-minute cron keeps fresh (see refreshStoredStatuses in
// ./status) — a list request never pings a server.

import { and, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';
import {
  type AppDatabase,
  servers,
  serverStatus,
  serverVotes,
  users,
  type Server,
  type User,
} from '~/util/db';
import {
  STORED_STATUS_MAX_AGE_MS,
  storedRowToStatus,
  type ServerStatus,
} from './status';
import type { ServerSort, ServerTag } from './constants';

// Public projection of a listing. Loader payloads are visible to every
// visitor, so NuVotifier delivery secrets and the owner's account row (which
// carries their email/settings) must never leave the server.
// Plugins are dropped when the owner made them private; the hidden list is
// owner-only too, so `plugins` arrives here already filtered (or null).
export type PublicServer = Omit<
  Server,
  'votifierHost' | 'votifierPort' | 'votifierToken' | 'hiddenPlugins'
>;
export interface PublicOwner {
  name: string | null;
  image: string | null;
}
export interface PublicServerWithVotes extends PublicServer {
  monthlyVotes: number;
  totalVotes: number;
  owner: PublicOwner | null;
}

function publicPlugins(
  plugins: Server['plugins'],
  isPublic: boolean,
  hidden: string[] | null | undefined
): Server['plugins'] {
  if (!isPublic || !plugins) return null;
  const hiddenIds = new Set(hidden ?? []);
  return Object.fromEntries(
    Object.entries(plugins).filter(
      ([key, plugin]) =>
        !hiddenIds.has(key) && !hiddenIds.has(String(plugin.id))
    )
  );
}

export function toPublicServer(server: Server): PublicServer {
  const {
    votifierHost: _host,
    votifierPort: _port,
    votifierToken: _token,
    hiddenPlugins,
    plugins,
    ...pub
  } = server;
  return {
    ...pub,
    plugins: publicPlugins(plugins, pub.pluginsPublic, hiddenPlugins),
  };
}

export function toPublicOwner(owner: User | null): PublicOwner | null {
  return owner ? { name: owner.name, image: owner.image } : null;
}

export interface ServerListParams {
  page: number;
  perPage: number;
  search: string;
  edition: 'all' | 'java' | 'bedrock';
  tag: ServerTag | null;
  sort: ServerSort;
  onlineOnly: boolean;
  version: string;
  verifiedOnly?: boolean;
}

export interface ServerListResult {
  rows: PublicServerWithVotes[];
  total: number;
  /** The page actually returned (requested page clamped to the last page). */
  page: number;
  statuses: Record<number, ServerStatus | null>;
}

function startOfMonthMs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

/** Escape LIKE wildcards so user input matches literally (ESCAPE '\\'). */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function containsInsensitive(column: SQLiteColumn, value: string): SQL {
  return sql`${column} LIKE ${`%${escapeLike(value)}%`} ESCAPE '\\'`;
}

// Stored status counts as online only while it is fresh (mirrors
// storedRowToStatus), so a starved cron can't keep dead servers "online".
function onlineCondition(now: number): SQL {
  return sql`(${serverStatus.online} = 1 AND ${serverStatus.checkedAt} >= ${now - STORED_STATUS_MAX_AGE_MS})`;
}

function buildWhere(params: ServerListParams, now: number) {
  const conditions: (SQL | undefined)[] = [];
  if (params.search)
    conditions.push(containsInsensitive(servers.name, params.search));
  if (params.edition === 'java')
    conditions.push(inArray(servers.edition, ['java', 'both']));
  else if (params.edition === 'bedrock')
    conditions.push(inArray(servers.edition, ['bedrock', 'both']));
  if (params.tag) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value = ${params.tag})`
    );
  }
  if (params.version) {
    conditions.push(
      or(
        containsInsensitive(servers.minVersion, params.version),
        containsInsensitive(servers.maxVersion, params.version),
        containsInsensitive(serverStatus.version, params.version)
      )
    );
  }
  if (params.onlineOnly) conditions.push(onlineCondition(now));
  if (params.verifiedOnly) {
    // Admin-granted OR auto-detected (see src/util/serverlist/birdflop.ts).
    conditions.push(
      or(eq(servers.verified, true), eq(servers.birdflopHosted, true))
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

function orderClause(sort: ServerSort, now: number) {
  // Sponsored/featured always pinned on top.
  switch (sort) {
    case 'newest':
      return [desc(servers.featured), desc(servers.createdAt)];
    case 'allTimeVotes':
      return [desc(servers.featured), desc(sql`totalVotes`)];
    case 'players':
      return [
        desc(servers.featured),
        desc(
          sql`CASE WHEN ${onlineCondition(now)} THEN ${serverStatus.players} ELSE 0 END`
        ),
        desc(sql`monthlyVotes`),
      ];
    case 'votes':
    default:
      return [desc(servers.featured), desc(sql`monthlyVotes`)];
  }
}

async function selectRanked(
  db: AppDatabase,
  where: ReturnType<typeof buildWhere>,
  sort: ServerSort,
  now: number,
  limit: number,
  offset: number
): Promise<{
  rows: PublicServerWithVotes[];
  statuses: Record<number, ServerStatus | null>;
}> {
  const monthStart = startOfMonthMs();
  const result = await db
    .select({
      server: servers,
      owner: users,
      status: serverStatus,
      monthlyVotes:
        sql<number>`COALESCE(SUM(CASE WHEN ${serverVotes.createdAt} >= ${monthStart} THEN 1 ELSE 0 END), 0)`.as(
          'monthlyVotes'
        ),
      totalVotes: sql<number>`COUNT(${serverVotes.id})`.as('totalVotes'),
    })
    .from(servers)
    .leftJoin(users, eq(users.id, servers.ownerId))
    .leftJoin(serverStatus, eq(serverStatus.serverId, servers.id))
    .leftJoin(serverVotes, eq(serverVotes.serverId, servers.id))
    .where(where)
    .groupBy(servers.id)
    .orderBy(...orderClause(sort, now))
    .limit(limit)
    .offset(offset);

  const statuses: Record<number, ServerStatus | null> = {};
  const rows = result.map((r) => {
    statuses[r.server.id] = storedRowToStatus(r.status, now);
    return {
      ...toPublicServer(r.server),
      monthlyVotes: Number(r.monthlyVotes),
      totalVotes: Number(r.totalVotes),
      owner: toPublicOwner(r.owner),
    };
  });
  return { rows, statuses };
}

export async function queryServers(
  db: AppDatabase,
  params: ServerListParams
): Promise<ServerListResult> {
  const now = Date.now();
  const where = buildWhere(params, now);

  const totalRow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(servers)
    .leftJoin(serverStatus, eq(serverStatus.serverId, servers.id))
    .where(where)
    .get();
  const total = Number(totalRow?.count ?? 0);

  // A page past the end (stale link, perPage change) shows the last page.
  const lastPage = Math.max(1, Math.ceil(total / params.perPage));
  const page = Math.min(Math.max(1, params.page), lastPage);
  if (total === 0) return { rows: [], total, page, statuses: {} };

  const { rows, statuses } = await selectRanked(
    db,
    where,
    params.sort,
    now,
    params.perPage,
    (page - 1) * params.perPage
  );
  return { rows, total, page, statuses };
}
