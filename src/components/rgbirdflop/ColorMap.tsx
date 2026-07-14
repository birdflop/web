import { component$, useContext, useComputed$ } from '@qwik.dev/core';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import {
  sortColors,
  getRandomColor,
  ColorGradient,
  GradientType,
  getRGBColorStop,
  rgbToHex,
  getShadowColors,
  ColorStop,
  rgbColorDefaults,
} from '@birdflop/rgbirdflop';
import Plus from 'lucide-icons-qwik/icons/Plus';

/**
 * Generates a CSS gradient string using the specified gradient type
 * Samples the gradient at multiple points to approximate perceptually uniform gradients
 */
function generateGradientCSS(
  colors: ColorStop[],
  gradientType: string,
  samples = 20
): string {
  if (colors.length < 2) {
    return colors[0]?.hex ?? 'transparent';
  }

  // For RGB, use native CSS gradient (fastest)
  if (gradientType === 'rgb') {
    return `linear-gradient(to right, ${sortColors(colors)
      .map((color) => `${color.hex} ${color.pos}%`)
      .join(', ')})`;
  }

  // For OKLAB, OKLCh, LuvLCh - sample the gradient to approximate perceptually uniform interpolation
  const colorsRGB = sortColors(colors).map(getRGBColorStop);

  const gradient = new ColorGradient(
    colorsRGB,
    samples,
    gradientType as GradientType
  );
  const sampledColors: string[] = [];

  for (let i = 0; i < samples; i++) {
    const rgb = gradient.next();
    const hex = `#${rgbToHex(rgb)}`;
    const pos = (i / (samples - 1)) * 100;
    sampledColors.push(`${hex} ${pos.toFixed(1)}%`);
  }

  return `linear-gradient(to right, ${sampledColors.join(', ')})`;
}

export function getColors(rgbStore: typeof rgbColorDefaults, id: string) {
  return id === 'text' ? rgbStore.colors : getShadowColors(rgbStore);
}

export default component$(({ id = 'text' }: { id?: 'text' | 'shadow' }) => {
  const rgbStore = useContext(rgbStoreContext);
  const colorsKey = id == 'text' ? 'colors' : 'shadowColors';
  const colors = useComputed$(() => getColors(rgbStore, id));

  return (
    <div
      class={{
        'relative my-4 w-full items-center rounded-full transition-all': true,
        'h-0 opacity-0': rgbStore.disperse,
        'h-2': !rgbStore.disperse,
      }}
      id={'colormap' + id}
      style={`background: ${generateGradientCSS(
        colors.value,
        rgbStore.gradientType
      )};`}
      onMouseDown$={(e, el) => {
        if (e.target != el) return;
        const rect = el.getBoundingClientRect();
        const pos = ((e.clientX - rect.left) / rect.width) * 100;
        if (colors.value.find((c) => c.pos == pos)) return;
        const newColors = colors.value.slice(0);
        newColors.push({ hex: getRandomColor(), pos });
        rgbStore[colorsKey] = sortColors(newColors);
      }}
      onMouseEnter$={(e, el) => {
        const abortController = new AbortController();
        el.addEventListener(
          'mousemove',
          (e) => {
            const addbutton = document.getElementById(
              `colormap${id}-add-button`
            )!;
            if (e.target != el) {
              addbutton.classList.add('opacity-0');
              return;
            }
            const rect = el.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            if (colors.value.find((c) => c.pos == pos)) return;
            addbutton.classList.remove('opacity-0');
            addbutton.style.left = `${pos}%`;
          },
          { signal: abortController.signal }
        );
        el.addEventListener(
          'mouseleave',
          () => {
            const addbutton = document.getElementById(
              `colormap${id}-add-button`
            )!;
            addbutton.classList.add('opacity-0');
            abortController.abort();
          },
          { signal: abortController.signal }
        );
      }}
    >
      <div
        id={`colormap${id}-add-button`}
        class="lum-grad-bg-lum-card-bg pointer-events-none absolute -mt-1.5 -ml-3 h-5 w-5 rounded-full opacity-0"
      >
        <Plus size={18} />
      </div>
      {colors.value.map((color, i) => (
        <div
          key={`${i}/${colors.value.length}`}
          id={`colormap${id}-color-${i + 1}`}
          class="lum-bg absolute -mt-1.5 -ml-3 h-5 w-5 rounded-full drop-shadow-md transition-transform hover:scale-125"
          style={{
            '--bg-color': color.hex,
            left: `${color.pos}%`,
          }}
          preventdefault:mousedown
          onMouseDown$={(e, el) => {
            const abortController = new AbortController();
            const colormap = document.getElementById('colormap' + id)!;
            const rect = colormap.getBoundingClientRect();
            document.addEventListener(
              'mousemove',
              (e) => {
                el.classList.add('scale-150');
                let pos = ((e.clientX - rect.left) / rect.width) * 100;
                if (pos < 0) pos = 0;
                if (pos > 100) pos = 100;
                if (colors.value.find((c) => c.pos == pos)) return;
                const newColors = colors.value.slice(0);
                newColors[i].pos = Math.round(pos * 1000) / 1000;
                rgbStore[colorsKey] = newColors;
              },
              { signal: abortController.signal }
            );
            document.addEventListener(
              'mouseup',
              () => {
                el.classList.remove('scale-150');
                abortController.abort();
                rgbStore[colorsKey] = sortColors(colors.value);
              },
              { signal: abortController.signal }
            );
          }}
        />
      ))}
    </div>
  );
});
