import { component$, useSignal } from '@builder.io/qwik';
import { ColorPicker, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';
import { convertToRGB, disperseColors, getBrightness, getRandomColor, swapItems } from '../util/RGBUtils';
import { ChevronDown, ChevronUp, Dices, Ellipsis, Trash } from 'lucide-icons-qwik';
import { sortColors } from '../util/SharedUtils';

export default component$(({ store, hidden }: {
  store: typeof rgbDefaults;
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const opened = useSignal(-1);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="colors">
      {store.format.color != 'MiniMessage' &&
        <NumberInput input disabled min={1} max={store.text.length / store.colors.length} value={store.colorlength} id="colorlength" class={{ 'w-full !opacity-100': true }}
          onIncrement$={() => {
            store.colorlength++;
          }}
          onDecrement$={() => {
            store.colorlength--;
          }}
        >
          {t('color.colorLength@@Characters per color')}
        </NumberInput>
      }
      <NumberInput input min={2} max={store.text.length} value={store.colors.length} id="colorsinput" class={{ 'w-full': true }}
        onChange$={(e, el) => {
          let colorAmount = Number(el.value);
          if (colorAmount < 2) return;
          if (colorAmount > store.text.length) return colorAmount = store.text.length;
          const newColors = [];
          for (let i = 0; i < colorAmount; i++) {
            if (store.colors[i]) newColors.push(store.colors[i]);
            else newColors.push({ hex: getRandomColor(), pos: 100 });
          }
          store.colors = newColors;
        }}
        onIncrement$={() => {
          const newColors = [...store.colors, {
            hex: getRandomColor(),
          }];
          store.colors = newColors.map((color, i) => ({
            hex: color.hex,
            pos: (100 / (newColors.length - 1)) * i,
          }));
        }}
        onDecrement$={() => {
          const newColors = store.colors.slice(0);
          newColors.pop();
          store.colors = newColors.map((color, i) => ({
            hex: color.hex,
            pos: (100 / (newColors.length - 1)) * i,
          }));
        }}
      >
        {t('color.colorAmount@@Color Amount')}
      </NumberInput>
      <div class="flex gap-2">
        <button class={{
          'lum-btn lum-pad-equal-xs': true,
          'w-full': store.disperse,
        }} onClick$={() => {
          const newColors = store.colors.map(color => ({ hex: getRandomColor(), pos: color.pos }));
          store.colors = newColors;
        }}>
          <Dices size={24} /> {store.disperse && <span>Randomize</span>}
        </button>
        {!store.disperse &&
          <button class="lum-btn lum-pad-xs w-full" disabled={store.colors.find((color, i) => color.pos != (100 / (store.colors.length - 1)) * i) ? false : true} onClick$={() => {
            store.colors = disperseColors(store.colors);
          }}>
            <Ellipsis size={24} /> Disperse
          </button>
        }
      </div>
      <div class="flex flex-col gap-2">
        {store.colors.map((color, i) => <div key={`${i}/${store.colors.length}`} class="flex relative gap-2">
          <div class="flex flex-col rounded-md">
            <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => store.colors = swapItems(store.colors, i, i - 1)}>
              <ChevronUp size={24} />
            </button>
            <button class="lum-btn lum-pad-equal-xs border-t-transparent rounded-t-none" onClick$={() => store.colors = swapItems(store.colors, i, i + 1)}>
              <ChevronDown size={24} />
            </button>
          </div>
          <div class="flex flex-col justify-end gap-1">
            <label for={`colorlist-color-${i + 1}`}>{t('color.color@@Color')} {i + 1}</label>
            <input key={`colorlist-color-${i + 1}-${color.hex}`} id={`colorlist-color-${i + 1}`}
              class={{
                'text-gray-400 hover:text-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                'text-gray-700 hover:text-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
                'lum-input w-full lum-pad-xs hover:': true,
              }}
              style={`background: ${color.hex};`}
              value={color.hex}
              onInput$={(e, el) => {
                const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                picker.dataset.value = el.value;
                picker.dispatchEvent(new Event('input'));
              }}
              onMouseUp$={() => {
                const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                picker.dataset.value = color.hex;
                picker.dispatchEvent(new Event('input'));
                if (opened.value == i) return opened.value = -1;
                else opened.value = i;
                const abortController = new AbortController();
                document.addEventListener('click', (e) => {
                  if (e.target instanceof HTMLElement && !e.target.closest(`#colorlist-color-${i + 1}`) && !e.target.closest(`#colorlist-color-${i + 1}-popup`)) {
                    opened.value = -1;
                    abortController.abort();
                  }
                }, { signal: abortController.signal });
              }}
            />
          </div>
          <div class="flex flex-col justify-end">
            <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" disabled={store.colors.length <= 2} onClick$={() => {
              const newColors = store.colors.slice(0);
              newColors.splice(i, 1);
              store.colors = newColors;
            }}>
              <Trash size={20} />
            </button>
          </div>
          <div
            id={`colorlist-color-${i + 1}-popup`} stoppropagation:mousedown class={{
              'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
              'opacity-0 scale-95 pointer-events-none': opened.value != i,
            }}>
            <ColorPicker
              id={`colorlist-color-${i + 1}-picker`}
              value={color.hex}
              onInput$={newColor => {
                const newColors = store.colors.slice(0);
                newColors[i].hex = newColor;
                store.colors = sortColors(newColors);
              }}
              showInput={false}
            />
          </div>
        </div>,
        )}
      </div>
    </div>
  );
});