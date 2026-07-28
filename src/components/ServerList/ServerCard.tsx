import { component$ } from '@qwik.dev/core';
import { Link, useNavigate } from '@qwik.dev/router';
import Star from 'lucide-icons-qwik/icons/Star';
import type { ServerWithVotes } from '~/util/db';
import type { ServerStatus } from '~/util/serverlist/status';
import { stripBBCode } from '~/util/serverlist/bbcode';
import StatusBadge from './StatusBadge';

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

  return (
    // Whole card is clickable via the title link's stretched ::after overlay.
    // Card has no padding so the mobile banner can be full-bleed; the info row
    // carries its own padding.
    <div
      class={{
        'lum-card lum-bg-lum-card-bg/40 relative flex-col items-stretch gap-0 overflow-hidden p-0 sm:min-h-28 sm:flex-row sm:gap-4 sm:p-4': true,
        'hover:lum-bg-lum-card-bg/70 transition-colors': true,
        'ring-1 ring-yellow-500/40': server.featured,
      }}
    >
      {/* Mobile: banner across the top */}
      {server.bannerUrl && (
        <img
          src={server.bannerUrl}
          alt={`${server.name} banner`}
          width={900}
          height={96}
          class="h-auto w-full sm:hidden"
        />
      )}

      {/* Info row (rank, icon, details) */}
      <div class="flex min-w-0 flex-1 flex-row items-stretch gap-4 p-4 sm:p-0">
        <div class="flex min-w-12 flex-col items-center justify-center text-center">
          <span class="text-lum-text-secondary text-xs">#{rank}</span>
          <div class="text-lum-accent flex flex-col items-center">
            <span class="text-lg leading-none font-extrabold">
              {server.monthlyVotes.toLocaleString()}
            </span>
            <span class="text-lum-text-secondary text-[10px] uppercase">
              votes
            </span>
          </div>
        </div>

        {status?.icon ? (
          <img
            src={status.icon}
            width={64}
            height={64}
            alt={`${server.name} icon`}
            class="rounded-lum-1 h-16 w-16 self-center"
          />
        ) : (
          <div class="rounded-lum-1 bg-lum-input-bg/40 text-lum-text-secondary flex h-16 w-16 items-center justify-center self-center text-2xl font-bold">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <Link
              href={`/serverlist/${server.slug}`}
              class="hover:text-lum-accent truncate text-lg font-bold after:absolute after:inset-0 after:content-['']"
            >
              {server.name}
            </Link>
            <span class="rounded-lum-1 bg-lum-input-bg/40 text-lum-text-secondary px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
              {editionLabel[server.edition] ?? server.edition}
            </span>
          </div>
          <StatusBadge status={status} />
          <p class="text-lum-text-secondary line-clamp-2 text-sm">{preview}</p>
          {server.tags.length > 0 && (
            <div class="relative z-10 mt-1 flex flex-wrap gap-1">
              {server.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick$={(e) => {
                    e.stopPropagation();
                    void nav(`/serverlist?tag=${encodeURIComponent(tag)}`);
                  }}
                  class="rounded-lum-1 bg-lum-accent/10 text-lum-accent hover:bg-lum-accent/20 cursor-pointer px-2 py-0.5 text-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: banner fills the empty space on the right.
          pointer-events-none lets clicks fall through to the card link overlay. */}
      {server.bannerUrl && (
        <div class="rounded-lum-1 pointer-events-none relative hidden max-w-[70%] min-w-24 flex-[2] self-stretch overflow-hidden sm:block">
          <img
            src={server.bannerUrl}
            alt={`${server.name} banner`}
            width={500}
            height={112}
            class="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}

      {server.featured && (
        <span class="bg-lum-card-bg/70 rounded-lum-1 absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-yellow-400">
          <Star size={12} class="fill-yellow-400" /> Sponsored
        </span>
      )}
    </div>
  );
});
