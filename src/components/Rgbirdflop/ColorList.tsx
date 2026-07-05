import { $, component$, Slot, useContext, useOnDocument, useSignal } from '@builder.io/qwik';
import { ColorPicker, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { disperseColors, swapItems, sortColors, getBrightness, getRandomColor, hexToRGB, rgbToHex, invertRgbColor } from '@birdflop/rgbirdflop';
import { ArrowRightLeft, ChevronDown, ChevronUp, Combine, Copy, Dices, Eclipse, MoveHorizontal, Shuffle, Trash } from 'lucide-icons-qwik';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { getColors } from './ColorMap';

export default component$(({ hidden, id = 'text' }: {
  hidden?: boolean;
  id?: string;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colorsKey = id == 'text' ? 'colors' : 'shadowColors';
  const colors = getColors(rgbStore, id);

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
      {rgbStore.colorFormat.color != 'MiniMessage' && id == 'text' &&
        <NumberInput input disabled id="colorLength"
          min={1} max={rgbStore.text.length / colors.length}
          value={rgbStore.colorLength}
          class={{ 'w-full opacity-100!': true }}
          onIncrement$={() => rgbStore.colorLength++}
          onDecrement$={() => rgbStore.colorLength--}
        >
          {t('rgb.colors.charsPer@@Characters per color')}
        </NumberInput>
      }
      <NumberInput input id={`colorlist${id}-amount`}
        min={1} max={rgbStore.text.length}
        value={rgbStore[colorsKey]?.length}
        class={{ 'w-full': true }}
        onChange$={(e, el) => {
          let colorAmount = Number(el.value);
          if (colorAmount > rgbStore.text.length) colorAmount = rgbStore.text.length;
          const newColors = [];
          for (let i = 0; i < colorAmount; i++) {
            if (colors[i]) newColors.push(colors[i]);
            else newColors.push({ hex: getRandomColor() });
          }
          rgbStore[colorsKey] = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
        }}
        onIncrement$={() => {
          const newColors = [...colors, {
            hex: getRandomColor(),
          }];
          rgbStore[colorsKey] = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
        }}
        onDecrement$={() => {
          const newColors = colors.slice(0);
          newColors.pop();
          rgbStore[colorsKey] = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
        }}
      >
        {t('rgb.colors.amount@@Color Amount')}
      </NumberInput>
      <div class="flex gap-1 *:w-full">
        <button class={{
          'lum-btn p-1 rounded-r-sm justify-center': true,
        }} onClick$={() => {
          const newColors = colors.map(color => ({ hex: getRandomColor(), pos: color.pos }));
          rgbStore[colorsKey] = newColors;
        }} title={t('rgb.colors.randomize@@Randomize')}>
          <Dices size={20} />
        </button>
        {id == 'shadow' &&
          <button class={{
            'lum-btn p-1 rounded-l-sm justify-center': true,
            'rounded-sm': !rgbStore.disperse,
          }} onClick$={() => {
            rgbStore[colorsKey] = rgbStore.colors;
          }} title={t('rgb.colors.copyFromText@@Copy from text colors')}>
            <Combine size={20} />
          </button>
        }
        <button class={{
          'lum-btn p-1 rounded-l-sm justify-center': true,
          'rounded-sm': !rgbStore.disperse,
        }} disabled={colors.length >= rgbStore.text.length} onClick$={() => {
          const newColors = [
            ...colors,
            ...colors,
          ];
          rgbStore[colorsKey] = newColors;
        }} title={t('rgb.colors.duplicate@@Duplicate')}>
          <Copy size={20} />
        </button>
        <button class={{
          'lum-btn p-1 rounded-sm justify-center': true,
        }} onClick$={() => {
          const newColors = colors.reverse().map(color => ({ hex: color.hex, pos: 100 - color.pos }));
          rgbStore[colorsKey] = newColors;
        }} title={t('rgb.colors.reverse@@Reverse')}>
          <ArrowRightLeft size={20} />
        </button>
        <button class={{
          'lum-btn p-1 rounded-sm justify-center': true,
        }} disabled={colors.length < 3} onClick$={() => {
          const shuffledColors = colors.slice(0).sort(() => Math.random() - 0.5);
          const newColors = shuffledColors.map((color, i) => ({ hex: color.hex, pos: colors[i].pos }));
          rgbStore[colorsKey] = newColors;
        }} title={t('rgb.colors.shuffle@@Shuffle')}>
          <Shuffle size={20} />
        </button>
        <button class={{
          'lum-btn p-1 rounded-l-sm justify-center': true,
          'rounded-sm': !rgbStore.disperse,
        }} onClick$={() => {
          const newColors = colors.map(color => {
            const invertedHex = rgbToHex(invertRgbColor(hexToRGB(color.hex)));
            return { ...color, hex: `#${invertedHex}` };
          });
          rgbStore[colorsKey] = newColors;
        }} title={t('rgb.colors.invert@@Invert')}>
          <Eclipse size={20} />
        </button>
        {!rgbStore.disperse &&
          <button class="lum-btn p-1 rounded-l-sm justify-center" disabled={
            !colors.find((color, i) => {
              return color.pos != Math.round((100 / (colors.length - 1)) * i * 1000) / 1000;
            })}
          onClick$={() => {
            rgbStore[colorsKey] = disperseColors(colors);
          }} title={t('rgb.colors.disperse.title@@Disperse')}>
            <MoveHorizontal size={20} />
          </button>
        }
      </div>
      <div class="flex flex-col gap-2 relative" id={`colorlistcolors${id}`}>
        {colors.map((color, i) => <div
          key={`${i}/${colors.length}`}
          id={`colorlist${id}-color-${i + 1}`}
          class="flex relative gap-1">
          <div class="flex flex-col gap-1">
            <button class="lum-btn p-1 rounded-b-sm"
              onClick$={() => rgbStore[colorsKey] = swapItems(colors, i, i - 1)}>
              <ChevronUp size={20} />
            </button>
            <button class="lum-btn p-1 rounded-t-sm"
              onClick$={() => rgbStore[colorsKey] = swapItems(colors, i, i + 1)}>
              <ChevronDown size={20} />
            </button>
          </div>
          <div class="flex flex-col justify-end">
            <label for={`colorlist${id}-color-${i + 1}-input`}>{t('rgb.colors.color@@Color')} {i + 1}</label>
            <input key={`colorlist${id}-color-${i + 1}`} id={`colorlist${id}-color-${i + 1}-input`}
              class={{
                'text-gray-400 hover:text-gray-400': getBrightness(hexToRGB(color.hex)) < 126,
                'text-gray-700 hover:text-gray-700': getBrightness(hexToRGB(color.hex)) > 126,
                'lum-input w-full lum-btn-p-1 rounded-r-sm lum-grad-bg': true,
              }}
              style={`--bg-color: ${color.hex};`}
              value={color.hex}
              onInput$={(e, el) => {
                // set the color picker's value and trigger input to update color picker
                const picker = document.getElementById(`colorlist${id}-color-picker`)!;
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
                picker.dispatchEvent(new Event('input'));
              }}
            />
          </div>
          <div class="flex flex-col justify-end">
            <button class="lum-btn p-1.5 lum-grad-bg-red hover:lum-bg-red rounded-l-sm" onClick$={() => {
              const newColors = colors.slice(0);
              newColors.splice(i, 1);
              rgbStore[colorsKey] = newColors;
            }}>
              <Trash size={20} />
            </button>
          </div>
        </div>,
        )}
        <div
          id={`colorlist${id}-color-popup`}
          stoppropagation:mousedown
          stoppropagation:click
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
            value={colors[opened.value]?.hex}
            onInput$={(newColor) => {
              const newColors = colors.slice(0);
              newColors[opened.value].hex = newColor;
              rgbStore[colorsKey] = sortColors(newColors);
            }}
            showInput={false}
            horizontal
            opacity={id == 'shadow'}
          />
          <div class="flex gap-1 lum-card p-2 flex-col justify-evenly">
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
            >{t('rgb.colors.position@@Position')} (%)
            </NumberInput>
          </div>
        </div>
      </div>
    </div>
  );
});