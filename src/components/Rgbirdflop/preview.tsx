import {
  ALL_FORMATTING_KEYS,
  applyFont,
  rgbDefaults,
  ColorGradient,
  sortColors,
  hexToRGB,
  getShadowColors,
  type Formatting,
} from '@birdflop/rgbirdflop';

function getFormattingSignature(formatting: Formatting) {
  return ALL_FORMATTING_KEYS.map((key) => (formatting[key] ? '1' : '0')).join('') + ':' + (formatting.font || '');
}

export function getEffectiveFormatting(rgbStore: typeof rgbDefaults, index: number) {
  const formatting: Formatting = { ...rgbStore.baseFormatting };

  for (const segment of rgbStore.formatting) {
    if (segment.start <= index && index < segment.end) {
      for (const key of ALL_FORMATTING_KEYS) {
        if (segment[key] !== undefined) {
          (formatting as any)[key] = segment[key];
        }
      }
      if (segment.font !== undefined) {
        formatting.font = segment.font;
      }
    }
  }

  return formatting;
}

export function getFormattingClasses(formatting: Formatting) {
  return {
    'font-mc-bold': !!formatting.bold,
    'font-mc-italic': !!formatting.italic,
    'font-mc-bold-italic': !!formatting.bold && !!formatting.italic,
    underline: !!formatting.underline,
    strikethrough: !!formatting.strikethrough,
    'underline-strikethrough': !!formatting.underline && !!formatting.strikethrough,
    obfuscate: !!formatting.obfuscate,
  };
}

export function renderPreview(rgbStore: typeof rgbDefaults, shadowLength = 4) {
  if (!rgbStore.text) return '\u00A0';
  if (rgbStore.colors.length < 1) return rgbStore.text;

  const colorLength = Math.max(1, Math.floor(rgbStore.colorLength || 1));
  const textArray = Array.from(rgbStore.text);
  const bucketCount = Math.max(1, Math.ceil(textArray.length / colorLength));

  const colorsRGB = sortColors(rgbStore.colors).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));
  const shadowColorsRGB = sortColors(getShadowColors(rgbStore)).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));

  const gradient = new ColorGradient(
    colorsRGB,
    bucketCount,
    rgbStore.gradientType,
  );
  const shadowGradient = new ColorGradient(
    shadowColorsRGB,
    bucketCount,
  );

  const gradientColors = Array.from({ length: bucketCount }, () => gradient.next());
  const shadowColors = Array.from({ length: bucketCount }, () => shadowGradient.next());

  const segments: Array<{
    text: string;
    bucketIndex: number;
    formatting: Formatting;
  }> = [];

  let currentSegment: (typeof segments)[number] | null = null;

  for (let index = 0; index < textArray.length; index++) {
    const bucketIndex = Math.min(Math.floor(index / colorLength), bucketCount - 1);
    const formatting = getEffectiveFormatting(rgbStore, index);
    const signature = `${bucketIndex}:${getFormattingSignature(formatting)}`;
    const currentSignature = currentSegment
      ? `${currentSegment.bucketIndex}:${getFormattingSignature(currentSegment.formatting)}`
      : null;

    if (currentSegment && currentSignature === signature) {
      currentSegment.text += textArray[index];
      continue;
    }

    currentSegment = {
      text: textArray[index],
      bucketIndex,
      formatting,
    };
    segments.push(currentSegment);
  }

  return segments.map((segment, i) => {
    const rgb = gradientColors[segment.bucketIndex];
    const rgbCSS = `rgba(${rgb.slice(0, 3).join(',')}, ${rgb[3] !== undefined ? rgb[3] / 255 : 1})`;
    const rgbShadow = shadowColors[segment.bucketIndex];
    const rgbShadowCSS = `rgba(${rgbShadow?.slice(0, 3).join(',')}, ${rgbShadow && rgbShadow[3] !== undefined ? rgbShadow[3] / 255 : 1})`;

    let segmentText = segment.text;
    if (segment.formatting.font) {
      segmentText = applyFont(segmentText, segment.formatting.font);
    }

    return (
      <span
        q:slot="input"
        key={`char${i}`}
        style={{
          color: rgbCSS,
          ...(rgbShadow && {
            textShadow: `${shadowLength}px ${shadowLength}px 0 ${rgbShadowCSS}`,
          }),
        }}
        class={getFormattingClasses(segment.formatting)}
        data-text={segmentText}
      >
        {segmentText}
      </span>
    );
  });
}