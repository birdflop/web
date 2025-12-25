import { $, component$, useContext, useOnDocument, useSignal, useTask$ } from '@builder.io/qwik';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { sortColors } from '~/util/rgb/RGBUtils';
import { ColorPicker } from '@luminescent/ui-qwik';
import { Plus } from 'lucide-icons-qwik';
import { getRandomColor } from '~/util/rgb/Colors';

export default component$(({ id = 'text' }: { id?: string }) => {
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colors = useSignal(
    id == 'text' ? rgbStore.colors : rgbStore.shadowcolors,
  );

  useTask$(({ track }) => {
    track(() => colors.value);
    rgbStore[id == 'text' ? 'colors' : 'shadowcolors'] = colors.value;
  });

  useTask$(({ track }) => {
    track(() => rgbStore[id == 'text' ? 'colors' : 'shadowcolors']);
    colors.value = rgbStore[id == 'text' ? 'colors' : 'shadowcolors'];
  });

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
        'w-full h-2 mb-s5 rounded-full items-center relative': true,
        hidden: rgbStore.disperse,
      }}
      id={'colormap' + id}
      style={`background: ${
        colors.value.length > 1
          ? `linear-gradient(to right, ${sortColors(colors.value)
            .map((color) => `${color.hex} ${color.pos}%`)
            .join(', ')})`
          : colors.value[0]?.hex ?? 'transparent'
      };`}
      onMouseDown$={(e, el) => {
        if (e.target != el) return;
        const rect = el.getBoundingClientRect();
        const pos = ((e.clientX - rect.left) / rect.width) * 100;
        if (colors.value.find((c) => c.pos == pos)) return;
        const newColors = colors.value.slice(0);
        newColors.push({ hex: getRandomColor(), pos });
        colors.value = sortColors(newColors);
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
            if (colors.value.find((c) => c.pos == pos)) return;
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
          'absolute -mt-1.5 -ml-3 w-5 h-5 rounded-full lum-bg-lum-card-bg opacity-0 pointer-events-none':
            true,
        }}
      >
        <Plus size={18} />
      </div>
      {colors.value.map((color, i) => (
        <div
          key={`${i}/${colors.value.length}`}
          id={`colormap${id}-color-${i + 1}`}
          class={{
            'absolute -mt-1.5 -ml-3 w-5 h-5 hover:scale-125 rounded-full lum-bg drop-shadow-md transition-transform': true,
          }}
          style={{
            '--bg-color': color.hex,
            left: `${color.pos}%`,
          }}
          preventdefault:mousedown
          preventdefault:contextmenu
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
                if (colors.value.find((c) => c.pos == pos)) return;
                const newColors = colors.value.slice(0);
                newColors[i].pos = pos;
                colors.value = newColors;
              },
              { signal: abortController.signal },
            );
            document.addEventListener(
              'mouseup',
              () => {
                el.classList.remove('scale-150');
                el.style.filter = '';
                abortController.abort();
                colors.value = sortColors(colors.value);
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
          onContextMenu$={() => {
            const newColors = colors.value.slice(0);
            newColors.splice(i, 1);
            colors.value = sortColors(newColors);
            opened.value = -1;
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
          left: colors.value[opened.value]?.pos < 50 ? `${colors.value[opened.value]?.pos}%` : 'auto',
          right: colors.value[opened.value]?.pos >= 50 ? `${100 - colors.value[opened.value]?.pos}%` : 'auto',
        }}
      >
        <div class="lum-card p-2 gap-0">
          <p class="font-bold text-white!">
            {Math.round(colors.value[opened.value]?.pos)}%
          </p>
          <p>
            Right click to remove
          </p>
        </div>
        <ColorPicker
          id={`colormap${id}-color-picker`}
          value={colors.value[opened.value]?.hex}
          onInput$={(newColor) => {
            const newColors = colors.value.slice(0);
            newColors[opened.value].hex = newColor;
            colors.value = sortColors(newColors);
          }}
          horizontal
        />
      </div>
    </div>
  );
});
