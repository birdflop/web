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
    label = 'Minecraft Server',
    playersOnline = 42,
    playersMax = 100,
    class: className = '',
  }) => {
    return (
      <div
        class={`flex items-start gap-2 border border-white/10 p-1 text-base sm:text-lg ${className}`}
        style={{ background: 'rgba(0,0,0,0.45)' }}
      >
        <img
          src={icon?.trim() || ImgIconBg}
          width={64}
          height={64}
          alt="Server icon"
          class="pixelated h-full w-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        <div class="flex-1">
          <div class="mb-1 flex items-center justify-between gap-2">
            <span
              class="font-mc truncate leading-none text-white"
              style={{ textShadow: '2px 2px 0 #3f3f3f' }}
            >
              {label}
            </span>
            <div class="font-mc flex shrink-0 items-center gap-1 text-sm leading-none sm:text-base">
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
                class="mx-1"
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
