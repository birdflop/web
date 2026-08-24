import { component$ } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';
import Star from 'lucide-icons-qwik/icons/Star';
import Users from 'lucide-icons-qwik/icons/Users';
import Hash from 'lucide-icons-qwik/icons/Hash';
import type { PublicServerWithVotes } from '~/util/serverlist/queries';
import type { ServerStatus } from '~/util/serverlist/status';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { loadPreset, type rgbPreset } from '~/util/rgb/presets';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';
import { stripBBCode } from '~/util/serverlist/bbcode';
import { formatVersionRange } from '~/util/serverlist/validation';
import Output from '../Elements/Output';
import { getFormattingClasses } from '../rgbirdflop/preview';
import { Birdflop } from '@luminescent/icons-qwik';

interface ServerCardProps {
  server: PublicServerWithVotes;
  status: ServerStatus | null;
  rank?: number;
}

const editionLabel: Record<string, string> = {
  java: 'Java',
  bedrock: 'Bedrock',
  both: 'Java & Bedrock',
};

export default component$<ServerCardProps>(({ server, status, rank }) => {
  const preview = server.shortDescription || stripBBCode(server.description);
  const versionText = formatVersionRange(
    server.minVersion,
    server.maxVersion,
    status?.version
  );

  let titlePreset: rgbPreset | null = null;
  if (server.rgbPreset) {
    if (typeof server.rgbPreset === 'object') {
      titlePreset = server.rgbPreset;
    } else if (
      typeof server.rgbPreset === 'string' &&
      (server.rgbPreset as string).trim()
    ) {
      try {
        titlePreset = loadPreset(server.rgbPreset);
      } catch {
        titlePreset = null;
      }
    }
  }

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
      style={{
        '--lum-border-radius': '1rem',
      }}
      class={{
        'lum-card lum-grad-bg-lum-card-bg/90 relative flex-row items-center gap-2 overflow-clip p-2': true,
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
          class="absolute inset-0 -z-1 h-full w-full scale-110 object-cover blur-lg saturate-200"
          style={{ imageRendering: 'pixelated' }}
        />
      )}

      {/* Server Icon */}
      <div class="flex aspect-square h-full max-h-16 flex-col items-center justify-center gap-1 text-center sm:max-h-20">
        {status?.icon ? (
          <img
            src={status.icon}
            width={64}
            height={64}
            alt={`${server.name} icon`}
            class="rounded-lum-2 aspect-square h-full w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div class="text-lum-text-secondary flex h-16 w-16 items-center justify-center text-2xl font-bold">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Details column (title, description, IP, version, player count on left, banner on right) */}
      <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div class="flex min-w-0 flex-1 flex-col">
          {/* Header row: title, badges, tags */}
          <div class="flex min-w-0 items-center gap-2">
            {/* Rank & Votes */}
            {rank !== undefined && (
              <p class="tracking-tigher text-lum-text-secondary flex items-center font-mono text-xs">
                <Hash size={10} />
                {rank}
              </p>
            )}
            <Link
              href={`/serverlist/${server.slug}`}
              class="hover:text-lum-accent min-w-0 flex-1 truncate text-lg font-bold after:absolute after:inset-0 after:content-['']"
            >
              {titlePreset &&
              titlePreset.colors &&
              titlePreset.colors.length > 0 ? (
                <span
                  class={{
                    ...getFormattingClasses(
                      titlePreset.baseFormatting,
                      titlePreset.colorFormat?.class
                    ),
                  }}
                >
                  <RgbPreview
                    rgbStore={{
                      ...rgbDefaults,
                      ...titlePreset,
                      text: server.name,
                    }}
                    shadowLength={2}
                  />
                </span>
              ) : (
                server.name
              )}
            </Link>

            {server.tags && server.tags.length > 0 && (
              <div
                class={[
                  'tracking-tigher font-mc relative z-10 flex shrink-0 gap-1 text-xs',
                  '*:lum-bg-lum-card-bg/10 *:rounded-lum-2 *:flex *:items-center *:gap-0.5 *:px-2 *:py-0.5 *:backdrop-brightness-150 *:backdrop-saturate-150',
                ]}
              >
                <p>{editionLabel[server.edition] ?? server.edition}</p>
                {server.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/serverlist?tag=${encodeURIComponent(tag)}`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div class="flex gap-2">
            <div class="flex flex-col justify-between">
              {/* Description under title */}
              {preview && (
                <p class="text-lum-text-secondary mb-1 line-clamp-2 text-sm">
                  {preview}
                </p>
              )}

              {/* IP address, Status Dot, Version, & Player Count row */}
              {(displayIp || versionText || status?.online) && (
                <div class="flex min-w-0 items-center gap-1 text-xs">
                  <span
                    class={{
                      'h-2 w-2 shrink-0 rounded-full': true,
                      'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]':
                        status?.online,
                      'bg-lum-text-secondary/40': !status?.online,
                    }}
                  />

                  {displayIp && (
                    <Output
                      compact
                      value={displayIp}
                      class="lum-bg-lum-card-bg/10 hover:lum-bg-lum-card-bg/30 rounded-lum-2 tracking-tigher relative z-10 cursor-pointer overflow-hidden px-2 py-0.5 font-mono text-xs text-ellipsis backdrop-brightness-150 backdrop-saturate-150"
                    />
                  )}

                  {(server.verified || server.birdflopHosted) && (
                    <span
                      class="text-lum-text-secondary lum-bg-lum-accent/20 rounded-lum-2 tracking-tigher gap-1= flex cursor-pointer items-center p-1 px-1.5 text-xs"
                      title="Hosted on Birdflop"
                    >
                      <Birdflop
                        size={12}
                        fillGradient={['#54daf4', '#545eb6']}
                      />
                    </span>
                  )}

                  {versionText && (
                    <span class="text-lum-text-secondary font-mc ml-auto text-xs tracking-tighter">
                      {versionText}
                    </span>
                  )}

                  {status?.online && (
                    <span class="text-lum-text-secondary font-mc flex items-center gap-1">
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
              <div class="bg-lum-input-bg/20 rounded-lum-2 pointer-events-none relative shrink-0 overflow-hidden">
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
        </div>
      </div>

      {server.featured && (
        <span class="bg-lum-card-bg/80 rounded-lum-2 absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
          <Star size={12} class="fill-yellow-400" />
          Sponsored
        </span>
      )}
    </div>
  );
});
