import { $, component$, useSignal } from '@qwik.dev/core';
import { routeLoader$, useNavigate, Link } from '@qwik.dev/router';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import Search from 'lucide-icons-qwik/icons/Search';
import Server from 'lucide-icons-qwik/icons/Server';
import Plus from 'lucide-icons-qwik/icons/Plus';
import ChevronLeft from 'lucide-icons-qwik/icons/ChevronLeft';
import ChevronRight from 'lucide-icons-qwik/icons/ChevronRight';
import { generateHead } from '~/root';
import { getDB } from '~/util/db';
import { queryServers, type ServerListParams } from '~/util/serverlist/queries';
import {
  SERVER_TAGS,
  isServerSort,
  isServerTag,
  type ServerSort,
  type ServerTag,
} from '~/util/serverlist/constants';
import { useSession } from '~/routes/plugin@auth';
import ServerCard from '~/components/ServerList/ServerCard';

export const useServers = routeLoader$(async ({ url }) => {
  const sp = url.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const perPage = 20;
  const editionParam = sp.get('edition');
  const edition =
    editionParam === 'java'
      ? 'java'
      : editionParam === 'bedrock'
        ? 'bedrock'
        : 'all';
  const sortParam = sp.get('sort');
  const sort: ServerSort =
    sortParam && isServerSort(sortParam) ? sortParam : 'votes';
  const tagParam = sp.get('tag');
  const tag: ServerTag | null =
    tagParam && isServerTag(tagParam) ? tagParam : null;

  const params: ServerListParams = {
    page,
    perPage,
    search: sp.get('search') || '',
    edition,
    tag,
    sort,
    onlineOnly: sp.get('online') === 'true',
    version: sp.get('version') || '',
  };

  try {
    const db = getDB();
    const { rows, total, statuses, liveRefined } = await queryServers(
      db,
      params
    );
    return {
      rows,
      total,
      statuses,
      liveRefined,
      ...params,
      error: null as string | null,
    };
  } catch (err) {
    console.error('Error loading servers:', err);
    return {
      rows: [],
      total: 0,
      statuses: {},
      liveRefined: false,
      ...params,
      error: String(err),
    };
  }
});

export default component$(() => {
  const data = useServers().value;
  const session = useSession();
  const nav = useNavigate();
  const searchTimeout = useSignal<number>();

  const updateURL = $((updates: Record<string, string | number | boolean>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === false || (k === 'page' && v === 1))
        url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
    // Any filter change resets to page 1 unless page itself was set.
    if (!('page' in updates)) url.searchParams.delete('page');
    void nav(url.pathname + url.search);
  });

  const debouncedSearch = $((value: string) => {
    if (searchTimeout.value) clearTimeout(searchTimeout.value);
    searchTimeout.value = setTimeout(
      () => void updateURL({ search: value }),
      300
    ) as unknown as number;
  });

  const totalPages = Math.ceil(data.total / data.perPage);
  const baseRank = (data.page - 1) * data.perPage;

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <span class="flex flex-1 items-center gap-3">
          <Server size={32} />
          Minecraft Server List
        </span>
        {session.value?.user ? (
          <Link
            href="/serverlist/submit"
            class="lum-btn lum-bg-blue hover:lum-bg-blue/80 font-normal"
          >
            <Plus size={20} /> Add your server
          </Link>
        ) : (
          <Link href="/serverlist/submit" class="lum-btn font-normal">
            <Plus size={20} /> Add your server
          </Link>
        )}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        Discover Minecraft servers and vote for your favorites. Rankings reset
        monthly.
      </p>

      {/* Filters */}
      <div class="sm:lum-card flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1 sm:p-1">
        <div class="lum-card sm:lum-bg-transparent flex-1 flex-row items-center gap-1 p-1 sm:p-0">
          <Search size={20} class="mx-2" />
          <input
            class="lum-input rounded-lum-1 flex-1"
            placeholder="Search servers..."
            value={data.search}
            onInput$={(e, el) => void debouncedSearch(el.value)}
          />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-1">
          <SelectMenu
            class={{ 'rounded-lum-1 lum-bg-transparent': true }}
            value={data.sort}
            onChange$={(e, el) => void updateURL({ sort: el.value })}
            title="Sort by"
            values={[
              { name: 'Monthly votes', value: 'votes' },
              { name: 'Players online', value: 'players' },
              { name: 'Newest', value: 'newest' },
              { name: 'All-time votes', value: 'allTimeVotes' },
            ]}
          />
          <SelectMenu
            class={{ 'rounded-lum-1 lum-bg-transparent': true }}
            value={data.edition}
            onChange$={(e, el) =>
              void updateURL({ edition: el.value === 'all' ? '' : el.value })
            }
            title="Edition"
            values={[
              { name: 'All editions', value: 'all' },
              { name: 'Java', value: 'java' },
              { name: 'Bedrock', value: 'bedrock' },
            ]}
          />
          <SelectMenu
            class={{ 'rounded-lum-1 lum-bg-transparent': true }}
            value={data.tag ?? ''}
            onChange$={(e, el) => void updateURL({ tag: el.value })}
            title="Tag"
            values={[
              { name: 'All tags', value: '' },
              ...SERVER_TAGS.map((t) => ({ name: t, value: t })),
            ]}
          />
        </div>
      </div>

      <div class="my-2 flex flex-wrap items-center gap-4 px-1">
        <Toggle
          id="online-only"
          checked={data.onlineOnly}
          onChange$={(e, el) => void updateURL({ online: el.checked })}
        >
          <span class="text-sm">Online servers only</span>
        </Toggle>
        <label class="flex items-center gap-2 text-sm">
          <span class="text-lum-text-secondary">Version</span>
          <input
            class="lum-input rounded-lum-1 w-28 py-1"
            placeholder="e.g. 1.21"
            value={data.version}
            onChange$={(e, el) => void updateURL({ version: el.value })}
          />
        </label>
        {data.liveRefined && (
          <span class="text-lum-text-secondary text-xs">
            Live filters apply to the top listings.
          </span>
        )}
      </div>

      {data.error && (
        <p class="lum-card lum-bg-red/20 my-2">
          Failed to load servers: {data.error}
        </p>
      )}

      <div class="mt-2 flex flex-col gap-2">
        {data.rows.map((server, i) => (
          <ServerCard
            key={server.id}
            server={server}
            status={data.statuses[server.id] ?? null}
            rank={baseRank + i + 1}
          />
        ))}
        {data.rows.length === 0 && !data.error && (
          <p class="text-lum-text-secondary my-10 text-center">
            No servers found.
            <br />
            <Link href="/serverlist/submit" class="text-lum-accent">
              Be the first to add one!
            </Link>
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div class="my-4 flex items-center justify-center gap-2">
          <button
            class="lum-btn rounded-lum-1 p-1"
            disabled={data.page === 1}
            onClick$={() =>
              void updateURL({ page: Math.max(1, data.page - 1) })
            }
          >
            <ChevronLeft size={20} />
          </button>
          <span class="text-lum-text-secondary text-sm">
            Page {data.page} of {totalPages}
          </span>
          <button
            class="lum-btn rounded-lum-1 p-1"
            disabled={data.page >= totalPages}
            onClick$={() =>
              void updateURL({ page: Math.min(totalPages, data.page + 1) })
            }
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Server List - Birdflop',
  description:
    'Browse and vote for Minecraft servers. Find Java and Bedrock servers by gamemode, vote daily, and climb the monthly rankings.',
});
