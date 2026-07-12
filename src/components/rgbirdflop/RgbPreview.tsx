import {
  applyFont,
  rgbDefaults,
  ColorGradient,
  sortColors,
  hexToRGB,
  getShadowColors,
  type Formatting,
} from '@birdflop/rgbirdflop';
import { component$, useContext } from '@qwik.dev/core';
import { rgbStoreContext } from './RGBirdflop';
import {
  EmptyPreview,
  getEffectiveFormatting,
  getFormattingClasses,
  getFormattingSignature,
  toCSS,
} from './preview';

export interface RgbPreviewProps {
  rgbStore?: typeof rgbDefaults;
  shadowLength?: number;
}

export default component$<RgbPreviewProps>(
  ({ rgbStore: rgbStoreFromProp, shadowLength = 4 }) => {
    const rgbStore = useContext(
      rgbStoreContext,
      rgbStoreFromProp || rgbDefaults
    );

    if (!rgbStore.text || rgbStore.text.trim() === '') return <EmptyPreview />;
    if (rgbStore.colors.length < 1) return rgbStore.text;

    const colorLength = Math.max(1, Math.floor(rgbStore.colorLength || 1));
    const textArray = Array.from(rgbStore.text);
    const bucketCount = Math.max(1, Math.ceil(textArray.length / colorLength));

    const colorsRGB = sortColors(rgbStore.colors).map((color) => ({
      rgb: hexToRGB(color.hex),
      pos: color.pos,
    }));
    const shadowColorsRGB = sortColors(getShadowColors(rgbStore)).map(
      (color) => ({
        rgb: hexToRGB(color.hex),
        pos: color.pos,
      })
    );

    const gradient = new ColorGradient(
      colorsRGB,
      bucketCount,
      rgbStore.gradientType
    );
    const shadowGradient = new ColorGradient(shadowColorsRGB, bucketCount);

    const gradientColors = Array.from({ length: bucketCount }, () =>
      gradient.next()
    );
    const shadowColors = Array.from({ length: bucketCount }, () =>
      shadowGradient.next()
    );

    const segments: Array<{
      text: string;
      bucketIndex: number;
      formatting: Formatting;
    }> = [];

    let currentSegment: (typeof segments)[number] | null = null;

    for (let index = 0; index < textArray.length; index++) {
      const bucketIndex = Math.min(
        Math.floor(index / colorLength),
        bucketCount - 1
      );
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
      const rgbCSS = toCSS(rgb);
      const rgbShadow = shadowColors[segment.bucketIndex];
      const rgbShadowCSS = toCSS(rgbShadow);

      let segmentText = segment.text;
      if (segment.formatting.font) {
        segmentText = applyFont(segmentText, segment.formatting.font);
      }

      return (
        <span
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
);
