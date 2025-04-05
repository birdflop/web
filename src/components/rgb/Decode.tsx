import type { Signal } from '@builder.io/qwik';
import { $, component$, useContext } from '@builder.io/qwik';
import { NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { generateOutput, getSignificantPoints } from '../util/RGBUtils';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ threshold, hidden }: {
  threshold: Signal<number>,
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  const decodeText = $((rgbtext: string, threshold: number) => {
    const pattern = /(?:[&§]x((?:[&§][0-9A-Fa-f]){6})|&#([0-9A-Fa-f]{6}))([^§&#]*)/;
    const spans = rgbtext.match(new RegExp(pattern, 'g'));
    if (!spans) return;
    let color = '#ffffff';
    const colors = spans.map((string: string, i: number) => {
      const result = string.match(pattern);
      if (!result) return { hex: color, pos: 0 };
      color = result[1]
        ? `#${result[1].replace(/&/g, '')}`
        : result[2]
          ? `#${result[2]}`
          : result[0];
      return { hex: color, pos: (100 / (spans.length - 1)) * i };
    });
    const text = spans.map((string: string) => {
      const result = string.match(pattern);
      if (!result) return '';
      return result[result.length - 1];
    }).join('');
    rgbStore.text = text ?? '';
    const colorHexes = colors.map((color) => color.hex);
    const significantPoints = getSignificantPoints(colorHexes, threshold);
    const newColors = significantPoints.map((color) => {
      const pos = colors.find(c => c.hex == color)?.pos ?? 0;
      return { hex: color, pos };
    });
    rgbStore.colors = newColors;
  });

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-300': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[400px] opacity-100 pointer-events-auto': !hidden,
    }} id="decode">
      <p class="text-gray-500">{t('color.decodeDisclaimer@@This feature tries to predict the color points in the gradients and where they are, it is not 100% accurate and we recommend using the presets feature instead to save your gradients.')}</p>
      <label for="decode">
        <span>{t('color.decode@@Decode')}</span>
        <span class="text-gray-500"> - {t('color.decodeSubtitle@@Copy-paste an existing RGB text here to edit it')}</span>
      </label>
      <textarea id="decode" class={{
        'lum-input h-16 w-full font-mc whitespace-pre-wrap': true,
      }} placeholder={generateOutput(rgbStore.text, rgbStore.colors, rgbStore.format, rgbStore.prefixsuffix, rgbStore.trimspaces, rgbStore.colorlength, rgbStore.bold, rgbStore.italic, rgbStore.underline, rgbStore.strikethrough)}
      onInput$={(e, el) => {
        const threshold = document.getElementById('threshold') as HTMLInputElement;
        decodeText(el.value, Number(threshold.value));
      }}
      />
      <NumberInput input value={threshold.value} id="threshold" class={{ 'w-full': true }}
        onInput$={(e, el) => {
          threshold.value = Number(el.value);
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) decodeText(decode.value, threshold.value);
        }}
        onIncrement$={() => {
          threshold.value = threshold.value + 10;
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) decodeText(decode.value, threshold.value);
        }}
        onDecrement$={() => {
          threshold.value = threshold.value - 10;
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) decodeText(decode.value, threshold.value);
        }}
      >
        {t('color.threshold@@Threshold')}
        <span class="text-gray-500"> - {t('color.thresholdSubtitle@@Try changing this around if you\'re getting too many colors')}</span>
      </NumberInput>
    </div>
  );
});