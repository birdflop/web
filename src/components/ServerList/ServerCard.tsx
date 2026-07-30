import { component$ } from '@qwik.dev/core';
import { Link, useNavigate } from '@qwik.dev/router';
import Star from 'lucide-icons-qwik/icons/Star';
import ChevronUp from 'lucide-icons-qwik/icons/ChevronUp';
import Tag from 'lucide-icons-qwik/icons/Tag';
import Users from 'lucide-icons-qwik/icons/Users';
import type { ServerWithVotes } from '~/util/db';
import type { ServerStatus } from '~/util/serverlist/status';
import { stripBBCode } from '~/util/serverlist/bbcode';
import { formatVersionRange } from '~/util/serverlist/validation';
import ServerTitle from './ServerTitle';

interface ServerCardProps {
  server: ServerWithVotes;
  status: ServerStatus | null;
  rank: number;
}

const editionLabel: Record<string, string> = {
  java: 'Java',
  bedrock: 'Bedrock',
  both: 'Java & Bedrock',
};

export default component$<ServerCardProps>(({ server, status, rank }) => {
  const nav = useNavigate();
  const preview = server.shortDescription || stripBBCode(server.description);
  const versionText = formatVersionRange(
    server.minVersion,
    server.maxVersion,
    status?.version
  );

  const primaryHost = server.javaHost || server.bedrockHost;
  const displayIp = primaryHost
    ? `${primaryHost}${
        server.javaHost && server.javaPort && server.javaPort !== 25565
          ? `:${server.javaPort}`
          : !server.javaHost &&
              server.bedrockHost &&
              server.bedrockPort &&
              server.bedrockPort !== 19132
            ? `:${server.bedrockPort}`
            : ''
      }`
    : null;

  return (
    // Whole card is clickable via the title link's stretched ::after overlay.
    <div
      class={{
        'lum-card lum-grad-bg-lum-card-bg/90 relative flex-row items-center gap-4 overflow-clip p-4': true,
        'hover:lum-bg-lum-card-bg/70 transition-colors': true,
        'ring-1 ring-yellow-500/40': server.featured,
      }}
    >
      {/* Blurred banner background (PluginCard style) */}
      {server.bannerUrl && (
        <img
          src={server.bannerUrl}
          alt={`${server.name} banner background`}
          width={468}
          height={60}
          class="absolute inset-0 -z-1 h-full w-full scale-250 object-cover blur-xl saturate-200"
          style={{ imageRendering: 'pixelated' }}
        />
      )}

      {/* Rank & Votes */}
      <div class="flex min-w-12 flex-col items-center justify-center text-center">
        <span class="text-lum-text-secondary text-xs">#{rank}</span>
        <div class="text-lum-accent flex flex-col items-center">
          <ChevronUp size={14} />
          <span class="text-lg leading-none font-extrabold">
            {server.monthlyVotes.toLocaleString()}
          </span>
          <span class="text-lum-text-secondary text-[10px] uppercase">
            votes
          </span>
        </div>
      </div>

      {/* Server Icon */}
      <div class="flex flex-col items-center justify-center gap-1 text-center">
        {status?.icon ? (
          <img
            src={status.icon}
            width={64}
            height={64}
            alt={`${server.name} icon`}
            class="rounded-lum-1 h-16 w-16"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div class="rounded-lum-1 bg-lum-input-bg/40 text-lum-text-secondary flex h-16 w-16 items-center justify-center text-2xl font-bold">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Details column (title, description, IP, version, player count on left, banner on right) */}
      <div class="flex min-w-0 flex-1 flex-row items-center justify-between gap-4">
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {/* Header row: title, badges, tags */}
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Link
              href={`/serverlist/${server.slug}`}
              class="hover:text-lum-accent text-lg font-bold after:absolute after:inset-0 after:content-['']"
            >
              <ServerTitle name={server.name} rgbPreset={server.rgbPreset} />
            </Link>

            <span class="rounded-lum-1 bg-lum-input-bg/40 text-lum-text-secondary px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
              {editionLabel[server.edition] ?? server.edition}
            </span>

            {server.tags.length > 0 &&
              server.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick$={(e) => {
                    e.stopPropagation();
                    void nav(`/serverlist?tag=${encodeURIComponent(tag)}`);
                  }}
                  class="rounded-lum-1 bg-lum-accent/10 text-lum-accent hover:bg-lum-accent/20 relative z-10 flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs"
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
          </div>

          {/* Description under title */}
          {preview && (
            <p class="text-lum-text-secondary line-clamp-2 text-sm">
              {preview}
            </p>
          )}

          {/* IP address, Status Dot, Version, & Player Count row */}
          {(displayIp || versionText || status?.online) && (
            <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
              <span
                class={{
                  'h-2 w-2 shrink-0 rounded-full': true,
                  'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]':
                    status?.online,
                  'bg-lum-text-secondary/40': !status?.online,
                }}
              />

              {displayIp && (
                <span class="text-lum-text-secondary font-mono select-all">
                  {displayIp}
                </span>
              )}

              {versionText && (
                <span class="rounded-lum-1 bg-lum-input-bg/40 text-lum-text-secondary px-1.5 py-0.5 text-[10px] tracking-wide">
                  {versionText}
                </span>
              )}

              {status?.online && (
                <span class="text-lum-text-secondary flex items-center gap-1">
                  <Users size={12} />
                  {status.players.online.toLocaleString()}
                  <span class="opacity-50">
                    / {status.players.max.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Banner on the right next to title and description */}
        {server.bannerUrl && (
          <div class="bg-lum-input-bg/20 rounded-lum-1 pointer-events-none relative shrink-0 overflow-hidden">
            <img
              src={server.bannerUrl}
              alt={`${server.name} banner`}
              width={468}
              height={60}
              class="h-auto max-h-16 w-auto max-w-[200px] object-contain sm:max-h-20 sm:max-w-[300px] md:max-w-[468px]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}
      </div>

      {server.featured && (
        <span class="bg-lum-card-bg/80 rounded-lum-1 absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
          <Star size={12} class="fill-yellow-400" /> Sponsored
        </span>
      )}
    </div>
  );
});
