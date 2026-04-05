import { $, component$, useContext, useOnDocument, useSignal } from '@builder.io/qwik';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { sortColors, getRandomColor, ColorGradient, GradientType, getRGBColorStop, rgbToHex, getShadowColors, rgbDefaults, ColorStop } from '@birdflop/rgbirdflop';
import { ColorPicker, NumberInput } from '@luminescent/ui-qwik';
import { Plus, Trash } from 'lucide-icons-qwik';

/**
 * Generates a CSS gradient string using the specified gradient type
 * Samples the gradient at multiple points to approximate perceptually uniform gradients
 */
function generateGradientCSS(
  colors: ColorStop[],
  gradientType: string,
  samples = 20,
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

  const gradient = new ColorGradient(colorsRGB, samples, gradientType as GradientType);
  const sampledColors: string[] = [];

  for (let i = 0; i < samples; i++) {
    const rgb = gradient.next();
    const hex = `#${rgbToHex(rgb)}`;
    const pos = (i / (samples - 1)) * 100;
    sampledColors.push(`${hex} ${pos.toFixed(1)}%`);
  }

  return `linear-gradient(to right, ${sampledColors.join(', ')})`;
}

export function getColors(rgbStore: typeof rgbDefaults, id: string) {
  return id === 'text' ? rgbStore.colors : getShadowColors(rgbStore);
}

export default component$(({ id = 'text' }: { id?: 'text' | 'shadow' }) => {
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colorsKey = id == 'text' ? 'colors' : 'shadowcolors';
  const colors = getColors(rgbStore, id);

  useOnDocument('click', $((e) => {
    if (e.target instanceof HTMLElement
      && !e.target.closest(`#colormap${id}-color-popup`)
      && !e.target.closest(`#colormap${id}`)) {
      opened.value = -1;
    }
  }));

  return (
    <div
      class={{
        'w-full h-2 my-2 rounded-full items-center relative': true,
        hidden: rgbStore.disperse,
      }}
      id={'colormap' + id}
      style={`background: ${
        generateGradientCSS(colors, rgbStore.gradientType)
      };`}
      onMouseDown$={(e, el) => {
        if (e.target != el) return;
        const rect = el.getBoundingClientRect();
        const pos = ((e.clientX - rect.left) / rect.width) * 100;
        if (colors.find((c) => c.pos == pos)) return;
        const newColors = colors.slice(0);
        newColors.push({ hex: getRandomColor(), pos });
        rgbStore[colorsKey] = sortColors(newColors);
      }}
      onMouseEnter$={(e, el) => {
        const abortController = new AbortController();
        el.addEventListener(
          'mousemove',
          (e) => {
            const addbutton = document.getElementById(
              `colormap${id}-add-button`,
            )!;
            if (e.target != el) {
              addbutton.classList.add('opacity-0');
              return;
            }
            const rect = el.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            if (colors.find((c) => c.pos == pos)) return;
            addbutton.classList.remove('opacity-0');
            addbutton.style.left = `${pos}%`;
          },
          { signal: abortController.signal },
        );
        el.addEventListener(
          'mouseleave',
          () => {
            const addbutton = document.getElementById(
              `colormap${id}-add-button`,
            )!;
            addbutton.classList.add('opacity-0');
            abortController.abort();
          },
          { signal: abortController.signal },
        );
      }}
    >
      <div
        id={`colormap${id}-add-button`}
        class={{
          'absolute -mt-1.5 -ml-3 w-5 h-5 rounded-full lum-grad-bg-lum-card-bg opacity-0 pointer-events-none':
            true,
        }}
      >
        <Plus size={18} />
      </div>
      {colors.map((color, i) => (
        <div
          key={`${i}/${colors.length}`}
          id={`colormap${id}-color-${i + 1}`}
          class={{
            'absolute -mt-1.5 -ml-3 w-5 h-5 hover:scale-125 rounded-full lum-bg drop-shadow-md transition-transform': true,
          }}
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
                opened.value = -1;
                el.classList.add('scale-150');
                let pos = ((e.clientX - rect.left) / rect.width) * 100;
                if (pos < 0) pos = 0;
                if (pos > 100) pos = 100;
                if (colors.find((c) => c.pos == pos)) return;
                const newColors = colors.slice(0);
                newColors[i].pos = Math.round(pos * 1000) / 1000;
                rgbStore[colorsKey] = newColors;
              },
              { signal: abortController.signal },
            );
            document.addEventListener(
              'mouseup',
              () => {
                el.classList.remove('scale-150');
                abortController.abort();
                rgbStore[colorsKey] = sortColors(colors);
              },
              { signal: abortController.signal },
            );
          }}
          onMouseUp$={() => {
            // set opened value
            if (opened.value == i) return (opened.value = -1);
            else opened.value = i;

            const picker = document.getElementById(`colormap${id}-color-picker`);
            const popup = document.getElementById(`colormap${id}-color-popup`);
            if (!picker || !popup) return;

            // set the color picker's value and trigger input to update color picker
            picker.dataset.value = color.hex;
            picker.dispatchEvent(new Event('input'));

            // set the position of the popup
            if (color.pos < 50) {
              popup.style.left = `${color.pos}%`;
              popup.style.right = 'auto';
            } else {
              popup.style.left = 'auto';
              popup.style.right = `${100 - color.pos}%`;
            }
          }}
        />
      ))}
      <div
        id={`colormap${id}-color-popup`}
        stoppropagation:mousedown
        class={{
          'hidden': true,
          'sm:flex': opened.value > -1,
          'flex-col gap-2 motion-safe:transition-all absolute top-full z-1000 mt-2': true,
          'animate-in fade-in slide-in-from-top-2': true,
        }}
        style={{
          '--lum-border-radius': '1rem',
          left: colors[opened.value]?.pos < 50 ? `${colors[opened.value]?.pos}%` : 'auto',
          right: colors[opened.value]?.pos >= 50 ? `${100 - colors[opened.value]?.pos}%` : 'auto',
        }}
      >
        <div class="flex gap-1 lum-card p-2 flex-row items-end justify-evenly">
          <NumberInput input id={`colorlist${id}-color-pos`}
            min={0} max={100}
            value={Math.round(colors[opened.value]?.pos)}
            onChange$={(e, el) => {
              const newColors = colors.slice(0);
              let newPos = Number(el.value);
              if (newPos < 0) newPos = 0;
              if (newPos > 100) newPos = 100;
              newColors[opened.value].pos = Math.round(newPos * 1000) / 1000;
              rgbStore[colorsKey] = sortColors(newColors);
            }}
            onIncrement$={() => {
              const newColors = colors.slice(0);
              let newPos = newColors[opened.value].pos + 1;
              if (newPos > 100) newPos = 100;
              newColors[opened.value].pos = Math.round(newPos * 1000) / 1000;
              rgbStore[colorsKey] = sortColors(newColors);
            }}
            onDecrement$={() => {
              const newColors = colors.slice(0);
              let newPos = newColors[opened.value].pos - 1;
              if (newPos < 0) newPos = 0;
              newColors[opened.value].pos = Math.round(newPos * 1000) / 1000;
              rgbStore[colorsKey] = sortColors(newColors);
            }}
          >Position (%)
          </NumberInput>
          <button class="lum-btn p-2 lum-grad-bg-red hover:lum-bg-red" onClick$={() => {
            const newColors = colors.slice(0);
            newColors.splice(opened.value, 1);
            rgbStore[colorsKey] = newColors;
          }}>
            <Trash size={20} />
          </button>
        </div>
        <ColorPicker
          id={`colormap${id}-color-picker`}
          value={colors[opened.value]?.hex}
          onInput$={(newColor) => {
            const newColors = colors.slice(0);
            newColors[opened.value].hex = newColor;
            rgbStore[colorsKey] = sortColors(newColors);
          }}
          horizontal
        />
      </div>
    </div>
  );
});
