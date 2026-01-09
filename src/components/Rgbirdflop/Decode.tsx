import { $, component$, useContext, useSignal } from '@builder.io/qwik';
import { NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { generateOutput } from '@birdflop/rgbirdflop';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { Notification, NotificationContext } from '~/util/Notification';
import { getSignificantPoints } from '~/util/rgb/Decode';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const threshold = useSignal(50);

  const decodeText = $(async (rgbtext: string, threshold: number) => {
    const pattern = /(?:(?:[&§]|\\u00a7)x((?:(?:[&§]|\\u00a7)[0-9A-Fa-f]){6})|&#([0-9A-Fa-f]{6}))((?:(?!\\u00a7)[^§&#])*)/;
    const spans = rgbtext.match(new RegExp(pattern, 'g'));
    if (!spans) return;
    let color = '#ffffff';
    const colors = spans.map((string: string, i: number) => {
      const result = string.match(pattern);
      if (!result) return { hex: color, pos: 0 };
      color = result[1]
        ? `#${result[1].replace(/(?:[&§]|\\u00a7)/g, '')}`
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
    const notification = new Notification()
      .setTitle(await t$('rgb.decode.decoded.title@@RGB Text Decoded!'))
      .setDescription(await t$('rgb.decode.decoded.description@@Successfully decoded the existing RGB text! If this is not what you expected, try changing the threshold value.'))
      .setBgColor('lum-bg-green/50');
    notifications.push(notification);
  });

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-300': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-100 opacity-100 pointer-events-auto': !hidden,
    }} id="decode">
      <label for="decode">
        {t('rgb.decode.title@@Decode')}
        <span class="text-lum-text-secondary"> - {t('rgb.decode.description@@Copy-paste an existing RGB text here to edit it')}</span>
      </label>
      <textarea id="decode" class={{
        'lum-input h-16 w-full font-mc whitespace-pre-wrap': true,
      }} placeholder={generateOutput(rgbStore)}
      onInput$={async (e, el) => {
        const threshold = document.getElementById('threshold') as HTMLInputElement;
        await decodeText(el.value, Number(threshold.value));
      }}
      />
      <NumberInput input value={threshold.value} id="threshold" class={{ 'w-full': true }}
        onInput$={async (e, el) => {
          threshold.value = Number(el.value);
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) await decodeText(decode.value, threshold.value);
        }}
        onIncrement$={async () => {
          threshold.value = threshold.value + 10;
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) await decodeText(decode.value, threshold.value);
        }}
        onDecrement$={async () => {
          threshold.value = threshold.value - 10;
          const decode = document.getElementById('decode') as HTMLInputElement;
          if (decode.value) await decodeText(decode.value, threshold.value);
        }}
      >
        {t('rgb.decode.threshold.title@@Threshold')}
        <span class="text-lum-text-secondary"> - {t('rgb.decode.threshold.description@@Try changing this around if you\'re getting too many colors')}</span>
      </NumberInput>
      <p class="text-sm">{t('rgb.decode.disclaimer@@This feature tries to predict the color points in the gradients and where they are, it is not 100% accurate and we recommend using the presets feature instead to save your gradients.')}</p>
    </div>
  );
});