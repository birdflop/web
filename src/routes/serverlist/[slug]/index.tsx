import { component$ } from '@qwik.dev/core';
import {
  routeLoader$,
  Link,
  type DocumentHead,
  type DocumentHeadValue,
} from '@qwik.dev/router';
import { and, eq, gte, sql } from 'drizzle-orm';
import Globe from 'lucide-icons-qwik/icons/Globe';
import ServerIcon from 'lucide-icons-qwik/icons/Server';
import Output from '~/components/Elements/Output';
import ArrowLeft from 'lucide-icons-qwik/icons/ArrowLeft';
import Clock from 'lucide-icons-qwik/icons/Clock';
import Calendar from 'lucide-icons-qwik/icons/Calendar';
import Trophy from 'lucide-icons-qwik/icons/Trophy';
import User from 'lucide-icons-qwik/icons/User';
import Info from 'lucide-icons-qwik/icons/Info';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Laptop from 'lucide-icons-qwik/icons/Laptop';
import Smartphone from 'lucide-icons-qwik/icons/Smartphone';
import Blocks from 'lucide-icons-qwik/icons/Blocks';
import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';
import { generateHead } from '~/root';
import { getDB, servers, serverVotes, users } from '~/util/db';
import { getServerStatus } from '~/util/serverlist/status';
import { renderBBCode, stripBBCode } from '~/util/serverlist/bbcode';
import {
  DEFAULT_JAVA_PORT,
  DEFAULT_BEDROCK_PORT,
} from '~/util/serverlist/constants';
import {
  birdflopCheckIsStale,
  refreshBirdflopHosted,
} from '~/util/serverlist/birdflop';
import { getPublicServersPulseStats } from '~/util/serverlist/serverspulse';
import ServersPulsePanel from '~/components/ServerList/ServersPulsePanel';
import MotdText from '~/components/Elements/MotdText';
import { toPublicOwner, toPublicServer } from '~/util/serverlist/queries';
import { useIsAdmin } from '~/routes/layout';
import ServerCard from '~/components/ServerList/ServerCard';
import VoteSection from '~/components/ServerList/VoteSection';
import ServerControls from '~/components/ServerList/ServerControls';
import { useSession } from '~/routes/plugin@auth';

export const useServer = routeLoader$(async (event) => {
  const db = getDB();
  const server = await db
    .select({ server: servers, owner: users })
    .from(servers)
    .where(eq(servers.slug, event.params.slug))
    .leftJoin(users, eq(users.id, servers.ownerId))
    .get();

  if (!server) throw event.error(404, 'Server not found');

  // Lazily re-verify the auto-detected Birdflop badge (at most once/day) so
  // it follows servers that migrate on or off Birdflop without a cron.
  let serverRow = server.server;
  if (birdflopCheckIsStale(serverRow)) {
    const hosted = await refreshBirdflopHosted(db, event.env, serverRow);
    serverRow = { ...serverRow, birdflopHosted: hosted };
  }

  const monthStart = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    1
  );
  const [monthlyRow, totalRow] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(serverVotes)
      .where(
        and(
          eq(serverVotes.serverId, server.server.id),
          gte(serverVotes.createdAt, new Date(monthStart))
        )
      )
      .get(),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(serverVotes)
      .where(eq(serverVotes.serverId, server.server.id))
      .get(),
  ]);

  const [status, serverspulse] = await Promise.all([
    getServerStatus(serverRow),
    // Verified ServersPulse link, lazily refreshed (at most once/min) with
    // the last good payload cached in D1 — null when not connected.
    getPublicServersPulseStats(db, serverRow.id),
  ]);

  // Strip Votifier secrets and the owner's account details before the row
  // enters the loader payload — it is visible to every visitor.
  return {
    server: toPublicServer(serverRow),
    owner: toPublicOwner(server.owner),
    status,
    serverspulse,
    monthlyVotes: Number(monthlyRow?.count ?? 0),
    totalVotes: Number(totalRow?.count ?? 0),
    sitekey: event.env.get('TURNSTILE_SITEKEY') ?? '',
  };
});

const ConnectRow = component$<{
  label: string;
  address: string;
  isBedrock?: boolean;
}>(({ label, address, isBedrock }) => (
  <div class="flex items-center gap-2 text-sm">
    <span class="text-lum-text-secondary flex w-20 shrink-0 items-center gap-1.5">
      {isBedrock ? <Smartphone size={14} /> : <Laptop size={14} />}
      {label}
    </span>
    <Output
      compact
      value={address}
      class="lum-bg-lum-input-bg/40 hover:lum-bg-lum-input-bg/60 rounded-lum-1 flex-1 cursor-pointer p-1.5 px-2 font-mono text-xs backdrop-brightness-150 backdrop-saturate-150"
    />
  </div>
));

export default component$(() => {
  const data = useServer().value;
  const s = data.server;
  const session = useSession();
  const isAdminSig = useIsAdmin();
  const canManage =
    isAdminSig.value ||
    (!!session.value?.user?.id && session.value.user.id === s.ownerId);
  const javaAddr = s.javaHost
    ? `${s.javaHost}${s.javaPort && s.javaPort !== DEFAULT_JAVA_PORT ? `:${s.javaPort}` : ''}`
    : null;
  const bedrockAddr = s.bedrockHost
    ? `${s.bedrockHost}${s.bedrockPort && s.bedrockPort !== DEFAULT_BEDROCK_PORT ? `:${s.bedrockPort}` : ''}`
    : null;

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <div class="mb-2 flex items-center justify-between">
        <Link
          href="/serverlist"
          class="text-lum-text-secondary hover:text-lum-accent inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} />
          Back to server list
        </Link>

        <ServerControls
          serverId={s.id}
          slug={s.slug}
          canManage={canManage}
          isAdmin={isAdminSig.value}
          verified={s.verified}
        />
      </div>

      <ServerCard
        server={{
          ...s,
          monthlyVotes: data.monthlyVotes,
          totalVotes: data.totalVotes,
          owner: data.owner,
        }}
        status={data.status}
      />

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-4 md:col-span-2">
          {data.status?.motd && (
            <div
              class="rounded-lum-2 border border-white/10 p-3 text-base sm:text-lg"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <MotdText text={data.status.motd.html || data.status.motd.raw} />
            </div>
          )}
          <div class="lum-card">
            <h2 class="flex items-center gap-2 text-lg font-bold">
              <Info size={20} />
              About
            </h2>
            <div
              class="[&_a]:text-lum-accent [&_img]:rounded-lum-1 [&_blockquote]:border-lum-border/40 [&_blockquote]:text-lum-text-secondary [&_code]:bg-lum-input-bg/40 text-sm leading-relaxed break-words [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:px-1 [&_img]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={renderBBCode(s.description)}
            />
          </div>

          <div class="lum-card gap-2">
            <h2 class="flex items-center gap-2 text-lg font-bold">
              <ServerIcon size={20} />
              Connect
            </h2>
            {javaAddr && <ConnectRow label="Java" address={javaAddr} />}
            {bedrockAddr && (
              <ConnectRow label="Bedrock" address={bedrockAddr} isBedrock />
            )}
            {data.status && (
              <p class="text-lum-text-secondary mt-1 flex items-center gap-1.5 text-xs">
                <Clock size={12} class="shrink-0" />
                Status cached for up to 2 minutes.
              </p>
            )}
          </div>

          {data.serverspulse && <ServersPulsePanel stats={data.serverspulse} />}

          <div class="flex flex-wrap gap-2">
            {s.website && (
              <a
                href={s.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                class="lum-btn lum-bg-lum-input-bg/40"
              >
                <Globe size={18} />
                Website
              </a>
            )}
            {s.discord && (
              <a
                href={s.discord}
                target="_blank"
                rel="noopener noreferrer nofollow"
                class="lum-btn lum-bg-lum-input-bg/40"
              >
                <SiDiscord class="fill-current" size={18} />
                Discord
              </a>
            )}
            <Link
              href={`/resources/rgb?s=${s.slug}`}
              class="lum-btn lum-bg-lum-input-bg/40"
            >
              <Palette size={18} />
              RGB Gradient
            </Link>
          </div>

          {s.plugins && Object.keys(s.plugins).length > 0 && (
            <div class="lum-card mt-4 p-4">
              <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
                <Blocks size={20} /> Plugins ({Object.keys(s.plugins).length})
              </h2>
              <div class="flex flex-wrap gap-2">
                {Object.values(s.plugins).map((plugin) => (
                  <div
                    key={String(plugin.id)}
                    class="lum-card lum-bg-lum-input-bg/30 rounded-lum-1 flex items-center gap-2 px-3 py-1.5 text-xs"
                  >
                    {plugin.iconUrl && (
                      <img
                        src={plugin.iconUrl}
                        alt={plugin.name || String(plugin.id)}
                        class="h-4 w-4 rounded object-cover"
                        width={16}
                        height={16}
                      />
                    )}
                    <span class="font-semibold">
                      {plugin.name || plugin.id}
                    </span>
                    {plugin.currentVersion?.name && (
                      <span class="text-lum-text-secondary">
                        {plugin.currentVersion.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-4">
          <VoteSection
            serverId={s.id}
            sitekey={data.sitekey}
            monthlyVotes={data.monthlyVotes}
          />
          <div class="lum-card gap-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-lum-text-secondary flex items-center gap-1.5">
                <Calendar size={16} />
                Votes this month
              </span>
              <span class="font-bold">
                {data.monthlyVotes.toLocaleString()}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-lum-text-secondary flex items-center gap-1.5">
                <Trophy size={16} />
                All-time votes
              </span>
              <span class="font-bold">{data.totalVotes.toLocaleString()}</span>
            </div>
            {data.owner?.name && (
              <div class="flex items-center justify-between">
                <span class="text-lum-text-secondary flex items-center gap-1.5">
                  <User size={16} />
                  Owner
                </span>
                <span class="ml-2 truncate font-bold">{data.owner.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useServer);
  return generateHead({
    title: `${data.server.name} - Birdflop Server List`,
    description:
      data.server.shortDescription ||
      stripBBCode(data.server.description).slice(0, 150),
    image: data.server.bannerUrl || undefined,
  }) as DocumentHeadValue;
};
