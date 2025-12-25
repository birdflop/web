import { $, component$, Slot, useContext, useOnDocument, useSignal, useTask$ } from '@builder.io/qwik';
import { ColorPicker, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { disperseColors, swapItems, sortColors } from '~/util/rgb/RGBUtils';
import { ChevronDown, ChevronUp, Dices, Ellipsis, Trash } from 'lucide-icons-qwik';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { getBrightness, getRandomColor, hexToRGB } from '~/util/rgb/Colors';

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

  useOnDocument('click', $((e) => {
    if (e.target instanceof HTMLElement
      && !e.target.closest(`#colorlist${id}-color-popup`)
      && !e.target.closest(`#colorlistcolors${id}`)) {
      opened.value = -1;
    }
  }));

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id={'colorlist' + id}>
      <Slot />
      {rgbStore.format.color != 'MiniMessage' && id == 'text' &&
        <NumberInput input disabled id="colorlength"
          min={1} max={rgbStore.text.length / colors.value.length}
          value={rgbStore.colorlength}
          class={{ 'w-full opacity-100!': true }}
          onIncrement$={() => rgbStore.colorlength++}
          onDecrement$={() => rgbStore.colorlength--}
        >
          {t('rgb.colors.charsPer@@Characters per color')}
        </NumberInput>
      }
      <NumberInput input id={`colorlist${id}-amount`}
        min={1} max={rgbStore.text.length}
        value={colors.value.length}
        class={{ 'w-full': true }}
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
      <div class="flex gap-1">
        <button class={{
          'lum-btn p-2 rounded-r-sm': true,
          'w-full': rgbStore.disperse,
        }} onClick$={() => {
          const newColors = colors.value.map(color => ({ hex: getRandomColor(), pos: color.pos }));
          colors.value = newColors;
        }}>
          <Dices size={20} /> {rgbStore.disperse && <span>
            {t('rgb.colors.randomize@@Randomize')}
          </span>}
        </button>
        {!rgbStore.disperse &&
          <button class="lum-btn lum-btn-p-1 w-full rounded-l-sm" disabled={colors.value.find((color, i) => color.pos != (100 / (colors.value.length - 1)) * i) ? false : true} onClick$={() => {
            colors.value = disperseColors(colors.value);
          }}>
            <Ellipsis size={20} /> {t('rgb.colors.disperse.title@@Disperse')}
          </button>
        }
      </div>
      <div class="flex flex-col gap-2 relative" id={'colorlistcolors' + id}>
        {colors.value.map((color, i) => <div
          key={`${i}/${colors.value.length}`}
          id={`colorlist${id}-color-${i + 1}`}
          class="flex relative gap-1">
          <div class="flex flex-col gap-1">
            <button class="lum-btn p-1 rounded-b-sm"
              onClick$={() => colors.value = swapItems(colors.value, i, i - 1)}>
              <ChevronUp size={20} />
            </button>
            <button class="lum-btn p-1 rounded-t-sm"
              onClick$={() => colors.value = swapItems(colors.value, i, i + 1)}>
              <ChevronDown size={20} />
            </button>
          </div>
          <div class="flex flex-col justify-end ml-1">
            <label for={`colorlist${id}-color-${i + 1}-input`}>{t('rgb.colors.color@@Color')} {i + 1}</label>
            <input key={`colorlist${id}-color-${i + 1}-${color.hex}`} id={`colorlist${id}-color-${i + 1}-input`}
              class={{
                'text-gray-400 hover:text-gray-400': getBrightness(hexToRGB(color.hex)) < 126,
                'text-gray-700 hover:text-gray-700': getBrightness(hexToRGB(color.hex)) > 126,
                'lum-input w-full lum-btn-p-1 rounded-r-sm lum-bg': true,
              }}
              style={`--bg-color: ${color.hex};`}
              value={color.hex}
              onInput$={(e, el) => {
                const picker = document.getElementById(`colorlist${id}-color-${i + 1}-picker`)!;
                picker.dataset.value = el.value;
                picker.dispatchEvent(new Event('input'));
              }}
              onFocus$={() => {
                // set opened value
                if (opened.value == i) return (opened.value = -1);
                else opened.value = i;

                const picker = document.getElementById(`colorlist${id}-color-picker`)!;
                const popup = document.getElementById(`colorlist${id}-color-popup`);
                if (!picker || !popup) return;

                // set the position of the popup relative to the list of colors
                const colorContainer = document.getElementById(`colorlist${id}-color-${i + 1}`)!;
                popup.style.top = `${colorContainer.offsetTop + colorContainer.offsetHeight + 8}px`;

                // set the color picker's value and trigger input to update color picker
                picker.dataset.value = color.hex;
              }}
            />
          </div>
          <div class="flex flex-col justify-end">
            <button class="lum-btn p-1.5 lum-bg-red hover:lum-bg-red rounded-l-sm" onClick$={() => {
              const newColors = colors.value.slice(0);
              newColors.splice(i, 1);
              colors.value = newColors;
            }}>
              <Trash size={20} />
            </button>
          </div>
        </div>,
        )}
        <div
          id={`colorlist${id}-color-popup`}
          stoppropagation:mousedown
          class={{
            'flex': opened.value > -1,
            'hidden': opened.value < 0,
            'flex-col gap-2 motion-safe:transition-all absolute z-10': true,
            'animate-in fade-in slide-in-from-top-2': true,
          }}
          style={{
            '--lum-border-radius': '1rem',
          }}
        >
          <ColorPicker
            id={`colorlist${id}-color-picker`}
            value={colors.value[opened.value]?.hex}
            onInput$={(newColor) => {
              const newColors = colors.value.slice(0);
              newColors[opened.value].hex = newColor;
              colors.value = sortColors(newColors);
            }}
            showInput={false}
            horizontal
          />
          <div class="lum-card p-2 gap-0 items-center">
            <NumberInput input id={`colorlist${id}-color-pos`}
              min={0} max={100}
              value={Math.round(colors.value[opened.value]?.pos)}
              onChange$={(e, el) => {
                const newColors = colors.value.slice(0);
                let newPos = Number(el.value);
                if (newPos < 0) newPos = 0;
                if (newPos > 100) newPos = 100;
                newColors[opened.value].pos = newPos;
                colors.value = sortColors(newColors);
              }}
              onIncrement$={() => {
                const newColors = colors.value.slice(0);
                let newPos = newColors[opened.value].pos + 1;
                if (newPos > 100) newPos = 100;
                newColors[opened.value].pos = newPos;
                colors.value = sortColors(newColors);
              }}
              onDecrement$={() => {
                const newColors = colors.value.slice(0);
                let newPos = newColors[opened.value].pos - 1;
                if (newPos < 0) newPos = 0;
                newColors[opened.value].pos = newPos;
                colors.value = sortColors(newColors);
              }}
            >
              {t('rgb.colors.position@@Position (%)')}
            </NumberInput>
          </div>
        </div>
      </div>
    </div>
  );
});