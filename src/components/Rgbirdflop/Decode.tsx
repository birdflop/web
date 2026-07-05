import { $, component$, useContext, useSignal } from '@builder.io/qwik';
import { NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { generateOutput } from '@birdflop/rgbirdflop';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflopBase';
import { Notification, NotificationContext } from '~/util/Notification';
import { getSignificantPoints } from '~/util/rgb/Decode';
import { decodeMiniMessage } from '~/util/rgb/MiniMessageDecode';

function decodeLegacy(rgbtext: string) {
  const legacyCodeRegex = /(?:(?:[&§]|\\u00a7)x(?:(?:[&§]|\\u00a7)[0-9A-Fa-f]){6}|&#[0-9A-Fa-f]{6}|(?:[&§]|\\u00a7)[l-orL-ORkK])/g;
  const matches = [...rgbtext.matchAll(legacyCodeRegex)];
  if (matches.length === 0) return null;

  const colors: Array<{ hex: string; pos: number }> = [];
  const charFormattings: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }> = [];
  let plainText = '';

  let currentColor = '#ffffff';
  const currentFmts = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false,
  };

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const codeStr = match[0];

    const lastChar = codeStr.charAt(codeStr.length - 1).toLowerCase();
    if (codeStr.length === 2 || codeStr.startsWith('\\u00a7')) {
      if (lastChar === 'r') {
        currentColor = '#ffffff';
        currentFmts.bold = false;
        currentFmts.italic = false;
        currentFmts.underline = false;
        currentFmts.strikethrough = false;
        currentFmts.obfuscate = false;
      } else if (lastChar === 'l') {
        currentFmts.bold = true;
      } else if (lastChar === 'o') {
        currentFmts.italic = true;
      } else if (lastChar === 'n') {
        currentFmts.underline = true;
      } else if (lastChar === 'm') {
        currentFmts.strikethrough = true;
      } else if (lastChar === 'k') {
        currentFmts.obfuscate = true;
      }
    } else {
      if (codeStr.startsWith('&#')) {
        currentColor = '#' + codeStr.slice(2);
      } else {
        const hexDigits = codeStr.replace(/(?:[&§]|\\u00a7|x)/g, '');
        currentColor = '#' + hexDigits;
      }
      currentFmts.bold = false;
      currentFmts.italic = false;
      currentFmts.underline = false;
      currentFmts.strikethrough = false;
      currentFmts.obfuscate = false;
    }

    const startIdx = match.index + codeStr.length;
    const endIdx = (i + 1 < matches.length) ? matches[i + 1].index : rgbtext.length;
    const textSegment = rgbtext.substring(startIdx, endIdx);

    for (let c = 0; c < textSegment.length; c++) {
      colors.push({
        hex: currentColor.toLowerCase(),
        pos: 0,
      });
      charFormattings.push({ ...currentFmts });
    }
    plainText += textSegment;
  }

  const totalLength = colors.length;
  for (let i = 0; i < totalLength; i++) {
    colors[i].pos = totalLength > 1 ? (100 / (totalLength - 1)) * i : 0;
  }

  return { plainText, colors, charFormattings };
}

function buildFormatSegments(charFormattings: Array<{
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  obfuscate?: boolean;
}>) {
  const segments: Array<{
    start: number;
    end: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    obfuscate?: boolean;
  }> = [];
  let currentFmt: typeof charFormattings[0] | null = null;
  let startIdx = -1;

  for (let i = 0; i < charFormattings.length; i++) {
    const fmt = charFormattings[i];
    const isSame = currentFmt &&
      !!currentFmt.bold === !!fmt.bold &&
      !!currentFmt.italic === !!fmt.italic &&
      !!currentFmt.underline === !!fmt.underline &&
      !!currentFmt.strikethrough === !!fmt.strikethrough &&
      !!currentFmt.obfuscate === !!fmt.obfuscate;

    if (!isSame) {
      if (currentFmt && (currentFmt.bold || currentFmt.italic || currentFmt.underline || currentFmt.strikethrough || currentFmt.obfuscate)) {
        segments.push({
          start: startIdx,
          end: i,
          ...(currentFmt.bold && { bold: true }),
          ...(currentFmt.italic && { italic: true }),
          ...(currentFmt.underline && { underline: true }),
          ...(currentFmt.strikethrough && { strikethrough: true }),
          ...(currentFmt.obfuscate && { obfuscate: true }),
        });
      }
      startIdx = i;
      currentFmt = fmt;
    }
  }

  if (currentFmt && (currentFmt.bold || currentFmt.italic || currentFmt.underline || currentFmt.strikethrough || currentFmt.obfuscate)) {
    segments.push({
      start: startIdx,
      end: charFormattings.length,
      ...(currentFmt.bold && { bold: true }),
      ...(currentFmt.italic && { italic: true }),
      ...(currentFmt.underline && { underline: true }),
      ...(currentFmt.strikethrough && { strikethrough: true }),
      ...(currentFmt.obfuscate && { obfuscate: true }),
    });
  }

  return segments;
}

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const textDecodedTitle = t('rgb.decode.decoded.title@@RGB Text Decoded!');
  const textDecodedDescription = t('rgb.decode.decoded.description@@Successfully decoded the existing RGB text! If this is not what you expected, try changing the threshold value.');

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
      const pos = colors.find(c => c.hex == color)?.pos ?? 0;
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