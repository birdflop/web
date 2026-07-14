import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import { Label, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { generateOutput } from '@birdflop/rgbirdflop';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  buildFormatSegments,
  decodeLegacy,
  getSignificantPoints,
} from '~/util/rgb/Decode';
import { decodeMiniMessage } from '~/util/rgb/MiniMessageDecode';
import Settings from 'lucide-icons-qwik/icons/Settings';
import Sparkle from 'lucide-icons-qwik/icons/Sparkle';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const textDecodedTitle = t('rgb.decode.decoded.title@@RGB Text Decoded!');
  const textDecodedDescription = t(
    'rgb.decode.decoded.description@@Successfully decoded the existing RGB text! If this is not what you expected, try changing the threshold value.'
  );

  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const threshold = useSignal(50);

  const decodeText = $((rgbtext: string, threshold: number) => {
    const miniMessageResult = decodeMiniMessage(rgbtext);
    let text: string;
    let colors: Array<{ hex: string; pos: number }> = [];
    let charFormattings: Array<{
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      obfuscate?: boolean;
    }>;

    if (miniMessageResult) {
      text = miniMessageResult.plainText;
      colors = miniMessageResult.charColors;
      charFormattings = miniMessageResult.charFormattings;
    } else {
      const legacyResult = decodeLegacy(rgbtext);
      if (!legacyResult) return;
      text = legacyResult.plainText;
      colors = legacyResult.colors;
      charFormattings = legacyResult.charFormattings;
    }

    if (colors.length === 0) return;
    rgbStore.text = text ?? '';
    const colorHexes = colors.map((color) => color.hex);
    const significantPoints = getSignificantPoints(colorHexes, threshold);
    const newColors = significantPoints.map((color) => {
      const pos = colors.find((c) => c.hex == color)?.pos ?? 0;
      return { hex: color, pos };
    });
    rgbStore.colors = newColors;

    // Reset base formatting and set decoded formatting segments
    rgbStore.baseFormatting = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      obfuscate: false,
    };
    rgbStore.formatting = buildFormatSegments(charFormattings);

    const notification = new Notification()
      .setTitle(textDecodedTitle)
      .setDescription(textDecodedDescription)
      .setBgColor('lum-grad-bg-green/50');
    notifications.push(notification.toJSON());
  });

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-300': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-100 opacity-100': !hidden,
      }}
      id="decode"
    >
      <p class="text-lum-text-secondary text-xs">
        {t(
          'rgb.decode.disclaimer@@This feature tries to predict the color points in the gradients and where they are, it is not 100% accurate and we recommend using the presets feature instead to save your gradients.'
        )}
      </p>
      <Label for="decode" label={t('rgb.decode.title@@Decode')}>
        <Sparkle size={16} q:slot="before-label" />
        <textarea
          id="decode"
          class="lum-input font-mc h-16 w-full whitespace-pre-wrap"
          placeholder={generateOutput(rgbStore)}
          onInput$={async (e, el) => {
            const threshold = document.getElementById(
              'threshold'
            ) as HTMLInputElement;
            await decodeText(el.value, Number(threshold.value));
          }}
        />
        <span class="text-lum-text-secondary text-sm">
          {t(
            'rgb.decode.description@@Copy-paste an existing RGB text here to edit it'
          )}
        </span>
      </Label>
      <Label for="threshold" label={t('rgb.decode.threshold.title@@Threshold')}>
        <Settings size={16} q:slot="before-label" />
        <NumberInput
          input
          value={threshold.value}
          id="threshold"
          class="w-full"
          onInput$={async (e, el) => {
            threshold.value = Number(el.value);
            const decode = document.getElementById(
              'decode'
            ) as HTMLInputElement;
            if (decode.value) await decodeText(decode.value, threshold.value);
          }}
          onIncrement$={async () => {
            threshold.value = threshold.value + 10;
            const decode = document.getElementById(
              'decode'
            ) as HTMLInputElement;
            if (decode.value) await decodeText(decode.value, threshold.value);
          }}
          onDecrement$={async () => {
            threshold.value = threshold.value - 10;
            const decode = document.getElementById(
              'decode'
            ) as HTMLInputElement;
            if (decode.value) await decodeText(decode.value, threshold.value);
          }}
        />
        <span class="text-lum-text-secondary text-sm">
          {t(
            "rgb.decode.threshold.description@@Try changing this around if you're getting too many colors"
          )}
        </span>
      </Label>
    </div>
  );
});
