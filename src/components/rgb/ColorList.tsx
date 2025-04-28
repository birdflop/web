import { component$, Slot, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import { ColorPicker, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { convertToRGB, disperseColors, getBrightness, getRandomColor, swapItems } from '~/util/RGBUtils';
import { ChevronDown, ChevronUp, Dices, Ellipsis, Trash } from 'lucide-icons-qwik';
import { sortColors } from '~/util/SharedUtils';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ hidden, id = 'text' }: {
  hidden?: boolean;
  id?: string;
}) => {
  const t = inlineTranslate();
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
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id={'colorlist' + id}>
      <Slot />
      {rgbStore.format.color != 'MiniMessage' && id == 'text' &&
        <NumberInput input disabled min={1} max={rgbStore.text.length / colors.value.length} value={rgbStore.colorlength} id="colorlength" class={{ 'w-full !opacity-100': true }}
          onIncrement$={() => {
            rgbStore.colorlength++;
          }}
          onDecrement$={() => {
            rgbStore.colorlength--;
          }}
        >
          {t('rgb.colors.charsPer@@Characters per color')}
        </NumberInput>
      }
      <NumberInput input min={2} max={rgbStore.text.length} value={colors.value.length} id={`colorlist${id}-amount`} class={{ 'w-full': true }}
        onChange$={(e, el) => {
          let colorAmount = Number(el.value);
          if (colorAmount < 2) return;
          if (colorAmount > rgbStore.text.length) return colorAmount = rgbStore.text.length;
          const newColors = [];
          for (let i = 0; i < colorAmount; i++) {
            if (colors.value[i]) newColors.push(colors.value[i]);
            else newColors.push({ hex: getRandomColor(), pos: 100 });
          }
          colors.value = newColors;
        }}
        onIncrement$={() => {
          const newColors = [...colors.value, {
            hex: getRandomColor(),
          }];
          colors.value = newColors.map((color, i) => ({
            hex: color.hex,
            pos: (100 / (newColors.length - 1)) * i,
          }));
        }}
        onDecrement$={() => {
          const newColors = colors.value.slice(0);
          newColors.pop();
          colors.value = newColors.map((color, i) => ({
            hex: color.hex,
            pos: (100 / (newColors.length - 1)) * i,
          }));
        }}
      >
        {t('rgb.colors.amount@@Color Amount')}
      </NumberInput>
      <div class="flex gap-2">
        <button class={{
          'lum-btn lum-pad-equal-xs': true,
          'w-full': rgbStore.disperse,
        }} onClick$={() => {
          const newColors = colors.value.map(color => ({ hex: getRandomColor(), pos: color.pos }));
          colors.value = newColors;
        }}>
          <Dices size={20} /> {rgbStore.disperse && <span>Randomize</span>}
        </button>
        {!rgbStore.disperse &&
          <button class="lum-btn lum-pad-xs w-full" disabled={colors.value.find((color, i) => color.pos != (100 / (colors.value.length - 1)) * i) ? false : true} onClick$={() => {
            colors.value = disperseColors(colors.value);
          }}>
            <Ellipsis size={20} /> {t('rgb.colors.disperse@@Disperse')}
          </button>
        }
      </div>
      <div class="flex flex-col gap-2">
        {colors.value.map((color, i) => <div key={`${i}/${colors.value.length}`} class="flex relative gap-2">
          <div class="flex flex-col rounded-md">
            <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => colors.value = swapItems(colors.value, i, i - 1)}>
              <ChevronUp size={20} />
            </button>
            <button class="lum-btn lum-pad-equal-xs border-t-transparent rounded-t-none" onClick$={() => colors.value = swapItems(colors.value, i, i + 1)}>
              <ChevronDown size={20} />
            </button>
          </div>
          <div class="flex flex-col justify-end gap-1">
            <label for={`colorlist${id}-color-${i + 1}`}>{t('rgb.colors.color@@Color')} {i + 1}</label>
            <input key={`colorlist${id}-color-${i + 1}-${color.hex}`} id={`colorlist${id}-color-${i + 1}`}
              class={{
                'text-gray-400 hover:text-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                'text-gray-700 hover:text-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
                'lum-input w-full lum-pad-xs hover:': true,
              }}
              style={`background: ${color.hex};`}
              value={color.hex}
              onInput$={(e, el) => {
                const picker = document.getElementById(`colorlist${id}-color-${i + 1}-picker`)!;
                picker.dataset.value = el.value;
                picker.dispatchEvent(new Event('input'));
              }}
              onMouseUp$={() => {
                const picker = document.getElementById(`colorlist${id}-color-${i + 1}-picker`)!;
                picker.dataset.value = color.hex;
                picker.dispatchEvent(new Event('input'));
                if (opened.value == i) return opened.value = -1;
                else opened.value = i;
                const abortController = new AbortController();
                document.addEventListener('click', (e) => {
                  if (e.target instanceof HTMLElement && !e.target.closest(`#colorlist${id}-color-${i + 1}`) && !e.target.closest(`#colorlist${id}-color-${i + 1}-popup`)) {
                    opened.value = -1;
                    abortController.abort();
                  }
                }, { signal: abortController.signal });
              }}
            />
          </div>
          <div class="flex flex-col justify-end">
            <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" disabled={colors.value.length <= 2} onClick$={() => {
              const newColors = colors.value.slice(0);
              newColors.splice(i, 1);
              colors.value = newColors;
            }}>
              <Trash size={20} />
            </button>
          </div>
          <div id={`colorlist${id}-color-${i + 1}-popup`} stoppropagation:mousedown class={{
            'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
            'opacity-0 scale-95 pointer-events-none': opened.value != i,
          }}>
            <ColorPicker
              id={`colorlist${id}-color-${i + 1}-picker`}
              value={color.hex}
              onInput$={newColor => {
                const newColors = colors.value.slice(0);
                newColors[i].hex = newColor;
                colors.value = sortColors(newColors);
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