import { component$, type QRL } from '@qwik.dev/core';

import colors from '~/util/banner/colors';
import patterns from '~/util/banner/patterns';

// Kept as its own component so each handler only closes over its own loop
// variables. When these loops were nested inside the banner's patterns.map,
// the Qwik optimizer hoisted the handlers into the outer loop, where
// `colorName` is undefined.
export default component$<{
  onColor$: QRL<(color: keyof typeof colors) => void>;
  onPattern$: QRL<(pattern: (typeof patterns)[number]) => void>;
}>(({ onColor$, onPattern$ }) => (
  <div class="lum-card w-92 p-4">
    <div class="flex flex-wrap gap-1">
      {Object.entries(colors).map(([colorName, color]) => (
        <button
          key={colorName}
          class="lum-btn lum-grad-bg p-1 hover:brightness-150"
          style={{
            '--bg-color': `#${color.toString(16).padStart(6, '0')}`,
          }}
          onClick$={() => onColor$(colorName as keyof typeof colors)}
        >
          <img
            width={28}
            height={28}
            class="h-7 w-7"
            src={`/banner/dyes/${colorName}_dye.png`}
            alt={colorName}
            style={{
              imageRendering: 'pixelated',
            }}
          />
        </button>
      ))}
    </div>
    <div class="flex flex-wrap gap-1">
      {patterns.map((pattern) => (
        <button
          key={pattern}
          class="lum-btn p-0 hover:brightness-150"
          onClick$={() => onPattern$(pattern)}
        >
          <img
            width={36}
            height={72}
            class="rounded-lum h-18 w-9"
            src={`/banner/patterns/previews/${pattern}.png`}
            alt={pattern}
            style={{
              imageRendering: 'pixelated',
            }}
          />
        </button>
      ))}
    </div>
  </div>
));
