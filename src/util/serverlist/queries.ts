// Listing query: DB-level ranking/filtering + on-demand live status.
//
// Votes, edition, tags and text search are resolved in SQL. Live-only fields
// (online status, version string, and sorting by current player count) require
// pinging servers, so when one of those is requested we fetch statuses for a
// bounded candidate pool, refine in memory, then paginate. This keeps us from
// fanning out hundreds of status requests on every page view.

import { and, desc, eq, inArray, like, sql } from 'drizzle-orm';
import {
  type AppDatabase,
  servers,
  serverVotes,
  users,
  type ServerWithVotes,
} from '~/util/db';
import { getServerStatus, type ServerStatus } from './status';
import type { ServerSort, ServerTag } from './constants';

const CANDIDATE_CAP = 75;

export interface ServerListParams {
  page: number;
  perPage: number;
  search: string;
  edition: 'all' | 'java' | 'bedrock';
  tag: ServerTag | null;
  sort: ServerSort;
  onlineOnly: boolean;
  version: string;
}

export interface ServerListResult {
  rows: ServerWithVotes[];
  total: number;
  statuses: Record<number, ServerStatus | null>;
  // True when results were refined using live status over a capped pool, so
  // the total reflects that pool rather than the whole table.
  liveRefined: boolean;
}

function startOfMonthMs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

function buildWhere(params: ServerListParams) {
  const conditions = [];
  if (params.search) conditions.push(like(servers.name, `%${params.search}%`));
  if (params.edition === 'java') conditions.push(inArray(servers.edition, ['java', 'both']));
  else if (params.edition === 'bedrock') conditions.push(inArray(servers.edition, ['bedrock', 'both']));
  if (params.tag) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value = ${params.tag})`,
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

function orderClause(sort: ServerSort) {
  // Sponsored/featured always pinned on top.
  switch (sort) {
  case 'newest':
    return [desc(servers.featured), desc(servers.createdAt)];
  case 'allTimeVotes':
    return [desc(servers.featured), desc(sql`totalVotes`)];
  case 'players': // resolved live; fall back to monthly votes for the DB pull
  case 'votes':
  default:
    return [desc(servers.featured), desc(sql`monthlyVotes`)];
  }
}

async function selectRanked(
  db: AppDatabase,
  where: ReturnType<typeof buildWhere>,
  sort: ServerSort,
  limit: number,
  offset: number,
): Promise<ServerWithVotes[]> {
  const monthStart = startOfMonthMs();
  const rows = await db
    .select({
      server: servers,
      owner: users,
      monthlyVotes:
        sql<number>`COALESCE(SUM(CASE WHEN ${serverVotes.createdAt} >= ${monthStart} THEN 1 ELSE 0 END), 0)`.as(
          'monthlyVotes',
        ),
      totalVotes: sql<number>`COUNT(${serverVotes.id})`.as('totalVotes'),
    })
    .from(servers)
    .leftJoin(users, eq(users.id, servers.ownerId))
    .leftJoin(serverVotes, eq(serverVotes.serverId, servers.id))
    .where(where)
    .groupBy(servers.id)
    .orderBy(...orderClause(sort))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({
    ...r.server,
    monthlyVotes: Number(r.monthlyVotes),
    totalVotes: Number(r.totalVotes),
    owner: r.owner,
  }));
}

async function fetchStatuses(rows: ServerWithVotes[]): Promise<Record<number, ServerStatus | null>> {
  const entries = await Promise.all(
    rows.map(async (s) => [s.id, await getServerStatus(s)] as const),
  );
  return Object.fromEntries(entries);
}

export async function queryServers(
  db: AppDatabase,
  params: ServerListParams,
): Promise<ServerListResult> {
  const where = buildWhere(params);
  const needsLive = params.onlineOnly || params.version !== '' || params.sort === 'players';

  if (!needsLive) {
    const totalRow = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(servers)
      .where(where)
      .get();
    const total = Number(totalRow?.count ?? 0);

    const rows = await selectRanked(
      db,
      where,
      params.sort,
      params.perPage,
      (params.page - 1) * params.perPage,
    );
    return { rows, total, statuses: await fetchStatuses(rows), liveRefined: false };
  }

  // Live-refinement path: pull a bounded pool, ping it, then filter/sort/page.
  const pool = await selectRanked(db, where, params.sort, CANDIDATE_CAP, 0);
  const statuses = await fetchStatuses(pool);

  let filtered = pool;
  if (params.onlineOnly) filtered = filtered.filter((s) => statuses[s.id]?.online);
  if (params.version) {
    const v = params.version.toLowerCase();
    filtered = filtered.filter((s) => statuses[s.id]?.version?.toLowerCase().includes(v));
  }

  if (params.sort === 'players') {
    filtered = [...filtered].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (statuses[b.id]?.players.online ?? 0) - (statuses[a.id]?.players.online ?? 0);
    });
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.perPage;
  const rows = filtered.slice(start, start + params.perPage);
  const pageStatuses: Record<number, ServerStatus | null> = {};
  for (const s of rows) pageStatuses[s.id] = statuses[s.id];

  return { rows, total, statuses: pageStatuses, liveRefined: true };
}
