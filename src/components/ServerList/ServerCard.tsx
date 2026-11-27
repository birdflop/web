import { component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';
import Star from 'lucide-icons-qwik/icons/Star';
import Users from 'lucide-icons-qwik/icons/Users';
import Hash from 'lucide-icons-qwik/icons/Hash';
import type { PublicServerWithVotes } from '~/util/serverlist/queries';
import type { ServerStatus } from '~/util/serverlist/status';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';
import { stripBBCode } from '~/util/serverlist/bbcode';
import {
  formatVersionRange,
  sanitizeRgbPreset,
} from '~/util/serverlist/validation';
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

  // Rows stored before presets were validated may hold anything, so a
  // malformed preset falls back to the plain name instead of breaking the card.
  const titlePreset = server.rgbPreset
    ? sanitizeRgbPreset(server.rgbPreset)
    : null;

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

  const bannerFailed = useSignal(false);
  const bannerRef = useSignal<HTMLImageElement>();
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const img = bannerRef.value;
    if (img?.complete && img.naturalWidth === 0) bannerFailed.value = true;
  });
  const showBanner = !!server.bannerUrl && !bannerFailed.value;

  return (
    // Whole card is clickable via the title link's stretched ::after overlay.
    <div
      class={{
        'server-card': true,
        'ring-1 ring-yellow-500/40': server.featured,
      }}
    >
      {/* Blurred banner background (PluginCard style) */}
      {showBanner && (
        <img
          src={server.bannerUrl!}
          alt={`${server.name} banner background`}
          width={468}
          height={60}
          class="server-card-backdrop"
        />
      )}

      {/* Server Icon */}
      <div class="server-card-icon">
        {status?.icon ? (
          <img
            src={status.icon}
            width={64}
            height={64}
            alt={`${server.name} icon`}
            class="server-card-icon-image"
          />
        ) : (
          <div class="server-card-icon-fallback">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Details column (title, description, IP, version, player count on left, banner on right) */}
      <div class="server-card-details">
        <div class="server-card-main">
          {/* Header row: title, badges, tags */}
          <div class="server-card-header">
            <div class="server-card-title-group">
              {/* Rank & Votes */}
              {rank !== undefined && (
                <p class="server-card-rank">
                  <Hash size={10} />
                  {rank}
                </p>
              )}
              <Link
                href={`/serverlist/${server.slug}`}
                class="server-card-title"
              >
                {titlePreset ? (
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
            </div>

            {server.tags && server.tags.length > 0 && (
              <div class="server-card-tags font-mc">
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
          <div class="server-card-media">
            <div class="server-card-description-column">
              {/* Description under title */}
              {preview && <p class="server-card-description">{preview}</p>}
            </div>
            {/* Banner */}
            {showBanner && (
              <div class="server-card-banner">
                <img
                  ref={bannerRef}
                  src={server.bannerUrl!}
                  alt={`${server.name} banner`}
                  onError$={() => (bannerFailed.value = true)}
                  width={468}
                  height={60}
                  class="server-card-banner-image"
                />
              </div>
            )}
          </div>
          {/* IP address, Status Dot, Version, & Player Count row */}
          {(displayIp || versionText || status?.online) && (
            <div class="server-card-meta">
              <span
                class={{
                  'server-card-status-dot': true,
                  'bg-green-400 shadow-[0_0_0.5rem_rgba(74,222,128,0.6)]':
                    status?.online,
                  'bg-lum-text-secondary/40': !status?.online,
                }}
              />

              {displayIp && (
                <Output compact value={displayIp} class="server-card-ip" />
              )}

              {(server.verified || server.birdflopHosted) && (
                <span class="server-card-hosted" title="Hosted on Birdflop">
                  <Birdflop size={12} fillGradient={['#54daf4', '#545eb6']} />
                </span>
              )}

              {versionText && (
                <span class="server-card-version font-mc">{versionText}</span>
              )}

              {status?.online && (
                <span class="server-card-players font-mc">
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
      </div>

      {server.featured && (
        <span class="server-card-sponsored">
          <Star size={12} class="fill-yellow-400" />
          Sponsored
        </span>
      )}
    </div>
  );
});
