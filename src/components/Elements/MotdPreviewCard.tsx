import { component$, Slot } from '@qwik.dev/core';

const ImgIconBg = '/branding/icon-bg-64x64.png';
const ImgMcPing5 = '/minecraft/ping_5.png';

export interface MotdPreviewCardProps {
  icon?: string;
  label?: string;
  playersOnline?: number;
  playersMax?: number;
  class?: string;
}

export const MotdPreviewCard = component$<MotdPreviewCardProps>(
  ({
    icon,
    label = 'A Minecraft Server',
    playersOnline = 42,
    playersMax = 100,
    class: className = '',
  }) => {
    return (
      <div
        class={`rounded-lum flex items-start gap-3 border border-white/10 p-2 text-base sm:text-lg ${className}`}
        style={{ background: 'rgba(0,0,0,0.45)' }}
      >
        {icon ? (
          <img
            src={icon}
            width={64}
            height={64}
            alt="Server icon"
            class="pixelated h-16 w-16 shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : icon === '' ? (
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center text-3xl text-gray-500"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            ?
          </div>
        ) : (
          <img
            src={ImgIconBg}
            width={64}
            height={64}
            alt="Server Icon"
            class="h-16 w-16 shrink-0 rounded-none!"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        <div class="min-w-0 flex-1 leading-tight">
          <div class="flex items-center justify-between gap-2">
            <span
              class="font-mc truncate text-white"
              style={{ textShadow: '2px 2px 0 #3f3f3f' }}
            >
              {label}
            </span>
            <div class="font-mc flex shrink-0 items-center gap-1 text-sm sm:text-base">
              <span
                style={{ color: '#AAAAAA', textShadow: '2px 2px 0 #2a2a2a' }}
              >
                {playersOnline}
                <span style={{ color: '#555555' }}>/</span>
                {playersMax}
              </span>
              <img
                src={ImgMcPing5}
                width={20}
                height={16}
                alt="ping"
                class="ml-1"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          <Slot />
        </div>
      </div>
    );
  }
);
