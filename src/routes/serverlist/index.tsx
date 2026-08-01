import { $, component$, useSignal } from '@qwik.dev/core';
import { routeLoader$, useNavigate, Link } from '@qwik.dev/router';
import { Dropdown, Label, SelectMenu, Toggle } from '@luminescent/ui-qwik';
import Search from 'lucide-icons-qwik/icons/Search';
import Gamepad2 from 'lucide-icons-qwik/icons/Gamepad2';
import Plus from 'lucide-icons-qwik/icons/Plus';
import Tag from 'lucide-icons-qwik/icons/Tag';
import Activity from 'lucide-icons-qwik/icons/Activity';
import Frown from 'lucide-icons-qwik/icons/Frown';
import AlertCircle from 'lucide-icons-qwik/icons/AlertCircle';
import Settings from 'lucide-icons-qwik/icons/Settings';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import { generateHead } from '~/root';
import { getDB } from '~/util/db';
import { queryServers, type ServerListParams } from '~/util/serverlist/queries';
import {
  LIMITS,
  SERVER_TAGS,
  isServerSort,
  isServerTag,
  type ServerSort,
  type ServerTag,
} from '~/util/serverlist/constants';
import { useSession } from '~/routes/plugin@auth';
import ServerCard from '~/components/ServerList/ServerCard';
import Pagination from '~/components/Elements/Pagination';

export const useServers = routeLoader$(async ({ url }) => {
  const sp = url.searchParams;
  const pageParam = parseInt(sp.get('page') || '1', 10);
  const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
  const perPageParam = parseInt(sp.get('perPage') || '20', 10);
  const perPage = Number.isFinite(perPageParam)
    ? Math.max(1, Math.min(100, perPageParam))
    : 20;
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
    verifiedOnly: sp.get('verified') === 'true',
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
      if (
        v === '' ||
        v === false ||
        (k === 'page' && v === 1) ||
        (k === 'perPage' && v === 20)
      )
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
          <Gamepad2 size={32} />
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
      <div class="flex flex-col gap-2"></div>

      {/* Filters */}
      <div class="sm:lum-card mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1 sm:p-1">
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
            class="rounded-lum-1 lum-bg-transparent"
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
            class="rounded-lum-1 lum-bg-transparent"
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
            class="rounded-lum-1 lum-bg-transparent"
            value={data.tag ?? ''}
            onChange$={(e, el) => void updateURL({ tag: el.value })}
            title="Tag"
            values={[
              { name: 'All tags', value: '' },
              ...SERVER_TAGS.map((t) => ({ name: t, value: t })),
            ]}
          />
          <Dropdown
            align="right"
            id="settings"
            class="rounded-lum-1 lum-bg-transparent p-3"
            panelProps={{
              class: 'lum-grad-bg-lum-card-bg p-3 gap-3 min-w-56',
            }}
          >
            <Settings q:slot="dropdown" size={16} />

            <Toggle
              id="online-only"
              checked={data.onlineOnly}
              onChange$={(e, el) => void updateURL({ online: el.checked })}
            >
              <span class="flex items-center gap-1.5 text-sm">
                <Activity size={14} class="text-green-400" /> Online servers
                only
              </span>
            </Toggle>

            <Toggle
              id="verified-only"
              checked={data.verifiedOnly}
              onChange$={(e, el) => void updateURL({ verified: el.checked })}
            >
              <span class="flex items-center gap-1.5 text-sm">
                <CheckCircle size={14} class="text-sky-400" /> Birdflop Verified
                only
              </span>
            </Toggle>

            <Label
              for="version-filter"
              label="Version"
              class="flex-col items-start gap-1"
            >
              <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
                <Tag size={14} /> Filter by version
              </span>
              <input
                id="version-filter"
                class="lum-input rounded-lum-1 w-full py-1 text-sm"
                placeholder="e.g. 1.21"
                maxLength={LIMITS.version}
                value={data.version}
                onChange$={(e, el) => void updateURL({ version: el.value })}
              />
            </Label>

            {data.liveRefined && (
              <p class="text-lum-text-secondary text-xs">
                Live filters apply to the top listings.
              </p>
            )}
          </Dropdown>
        </div>
      </div>

      {data.error && (
        <p class="lum-card lum-bg-red/20 my-2 flex items-center gap-2">
          <AlertCircle size={20} class="text-red-400" />
          Failed to load servers: {data.error}
        </p>
      )}

      {totalPages > 1 && (
        <Pagination
          page={data.page}
          perPage={data.perPage}
          totalPages={totalPages}
          updateURL={updateURL}
          totalCount={data.total}
          rowsLength={data.rows.length}
          itemLabel="servers"
        />
      )}

      <div class="mt-2 grid grid-cols-1 gap-2">
        {data.rows.map((server, i) => (
          <ServerCard
            key={server.id}
            server={server}
            status={data.statuses[server.id] ?? null}
            rank={baseRank + i + 1}
          />
        ))}
        {data.rows.length === 0 && !data.error && (
          <div class="lum-card col-span-full my-10 flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Frown size={40} class="text-lum-text-secondary opacity-60" />
            <p class="text-lum-text-secondary text-base font-semibold">
              No servers found matching your criteria.
            </p>
            <Link
              href="/serverlist/submit"
              class="lum-btn lum-bg-blue hover:lum-bg-blue/80 mt-2 font-normal"
            >
              <Plus size={18} /> Be the first to add one!
            </Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={data.page}
          perPage={data.perPage}
          totalPages={totalPages}
          updateURL={updateURL}
          totalCount={data.total}
          rowsLength={data.rows.length}
          itemLabel="servers"
        />
      )}
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Server List - Birdflop',
  description:
    'Browse and vote for Minecraft servers. Find Java and Bedrock servers by gamemode, vote daily, and climb the monthly rankings.',
});
