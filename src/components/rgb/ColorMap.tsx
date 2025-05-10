import { component$, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { hexToRGB, getBrightness, getRandomColor } from '~/util/RGBUtils';
import { sortColors } from '~/util/SharedUtils';
import { ColorPicker } from '@luminescent/ui-qwik';
import { Plus, Trash } from 'lucide-icons-qwik';

export default component$(({ id = 'text' }: {
  id?: string;
}) => {
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colors = useSignal(id == 'text' ? rgbStore.colors : rgbStore.shadowcolors);

  useTask$(({ track }) => {
    track(() => colors.value);
    rgbStore[id == 'text' ? 'colors' : 'shadowcolors'] = colors.value;
  });

  useTask$(({ track }) => {
    track(() => rgbStore[id == 'text' ? 'colors' : 'shadowcolors']);
    colors.value = rgbStore[id == 'text' ? 'colors' : 'shadowcolors'];
  });

  return (
    <div class={{
      'w-full h-2 mb-s5 rounded-full items-center relative': true,
      'hidden': rgbStore.disperse,
    }} id={'colormap' + id}
    style={`background: linear-gradient(to right, ${sortColors(colors.value).map(color => `${color.hex} ${color.pos}%`).join(', ')});`}
    onMouseDown$={(e, el) => {
      if (e.target != el) return;
      const rect = el.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      if (colors.value.find(c => c.pos == pos)) return;
      const newColors = colors.value.slice(0);
      newColors.push({ hex: getRandomColor(), pos });
      colors.value = sortColors(newColors);
    }}
    onMouseEnter$={(e, el) => {
      const abortController = new AbortController();
      el.addEventListener('mousemove', e => {
        const addbutton = document.getElementById(`colormap${id}-add-button`)!;
        if (e.target != el) {
          addbutton.classList.add('opacity-0');
          return;
        }
        const rect = el.getBoundingClientRect();
        const pos = ((e.clientX - rect.left) / rect.width) * 100;
        if (colors.value.find(c => c.pos == pos)) return;
        addbutton.classList.remove('opacity-0');
        addbutton.style.left = `${pos}%`;
      }, { signal: abortController.signal });
      el.addEventListener('mouseleave', () => {
        const addbutton = document.getElementById(`colormap${id}-add-button`)!;
        addbutton.classList.add('opacity-0');
        abortController.abort();
      }, { signal: abortController.signal });
    }}
    >
      <div id={`colormap${id}-add-button`} class={{
        'absolute -mt-1.5 -ml-3 w-5 h-5 rounded-full border border-gray-700 bg-gray-800 opacity-0 pointer-events-none': true,
      }}>
        <Plus size={18} />
      </div>
      {colors.value.map((color, i) => <div class="absolute -mt-1 -ml-3" key={`${i}/${colors.value.length}`}
        onMouseDown$={(e, el) => {
          const abortController = new AbortController();
          const colormap = document.getElementById('colormap' + id)!;
          const rect = colormap.getBoundingClientRect();
          document.addEventListener('mousemove', e => {
            opened.value = -1;
            el.classList.add('-mt-2', 'scale-125', 'z-[1000]');
            el.style.filter = 'drop-shadow(0 0 10px rgb(31 41 55))';
            let pos = ((e.clientX - rect.left) / rect.width) * 100;
            if (pos < 0) pos = 0;
            if (pos > 100) pos = 100;
            if (colors.value.find(c => c.pos == pos)) return;
            const newColors = colors.value.slice(0);
            newColors[i].pos = pos;
            colors.value = newColors;
          }, { signal: abortController.signal });
          document.addEventListener('mouseup', () => {
            el.classList.remove('-mt-2', 'scale-125', 'z-[1000]');
            el.style.filter = '';
            abortController.abort();
            colors.value = sortColors(colors.value);
          }, { signal: abortController.signal });
        }} style={{
          left: `${color.pos}%`,
        }}
        preventdefault:mousedown
      >
        <div key={`colormap${id}-color-${i + 1}`} id={`colormap${id}-color-${i + 1}`}
          class={{
            'transition-transform w-5 h-5 -mt-0.5 hover:scale-125 rounded-full shadow-md border': true,
            'border-gray-400': getBrightness(hexToRGB(color.hex)) < 126,
            'border-gray-700': getBrightness(hexToRGB(color.hex)) > 126,
          }}
          style={`background: ${color.hex};`}
          onMouseUp$={() => {
            const picker = document.getElementById(`colormap${id}-color-${i + 1}-picker`)!;
            picker.dataset.value = color.hex;
            picker.dispatchEvent(new Event('input'));
            if (opened.value == i) return opened.value = -1;
            else opened.value = i;
            const abortController = new AbortController();
            document.addEventListener('click', (e) => {
              if (e.target instanceof HTMLElement && !e.target.closest(`#colormap${id}-color-${i + 1}`) && !e.target.closest(`#colormap${id}-color-${i + 1}-popup`)) {
                opened.value = -1;
                abortController.abort();
              }
            }, { signal: abortController.signal });
          }}
        />
        <div id={`colormap${id}-color-${i + 1}-popup`} stoppropagation:mousedown class="hidden sm:flex">
          <div class={{
            'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2': true,
            'opacity-0 scale-95 pointer-events-none': opened.value != i,
            'left-0 items-start': color.pos < 50,
            'right-0 items-end': color.pos >= 50,
          }}>
            {colors.value.length > 2 &&
              <button class="lum-btn p-2 lum-bg-red-700 hover:lum-bg-red-600" onClick$={() => {
                const newColors = colors.value.slice(0);
                newColors.splice(i, 1);
                colors.value = sortColors(newColors);
              }}>
                <Trash size={20} />
              </button>
            }
            <ColorPicker
              id={`colormap${id}-color-${i + 1}-picker`}
              value={color.hex}
              onInput$={newColor => {
                const newColors = colors.value.slice(0);
                newColors[i].hex = newColor;
                colors.value = sortColors(newColors);
              }}
              horizontal
            />
          </div>
        </div>
      </div>,
      )}
    </div>
  );
});