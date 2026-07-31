import {
  applyFont,
  rgbDefaults,
  ColorGradient,
  sortColors,
  hexToRGB,
  getShadowColors,
} from '@birdflop/rgbirdflop';
import { component$, JSXOutput, useContext } from '@qwik.dev/core';
import { rgbStoreContext } from './RGBirdflop';
import { selectionContext } from './Input';
import {
  EmptyPreview,
  getEffectiveFormatting,
  getFormattingClasses,
  toCSS,
} from './preview';

export interface RgbPreviewProps {
  rgbStore?: typeof rgbDefaults;
  shadowLength?: number;
  showSelection?: boolean;
}

export default component$<RgbPreviewProps>(
  ({ rgbStore: rgbStoreFromProp, shadowLength = 4, showSelection }) => {
    const rgbStoreFromContext = useContext(rgbStoreContext, rgbDefaults);
    const rgbStore = rgbStoreFromProp || rgbStoreFromContext;
    const selection = useContext(selectionContext, null);

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

    const cursorIndex =
      selection &&
      selection.value &&
      selection.value.start === selection.value.end
        ? selection.value.start
        : -1;

    const rendered: JSXOutput[] = [];

    textArray.forEach((char, index) => {
      if (index === cursorIndex && showSelection) {
        rendered.push(<span key="custom-cursor" class="custom-cursor" />);
      }

      const bucketIndex = Math.min(
        Math.floor(index / colorLength),
        bucketCount - 1
      );
      const formatting = getEffectiveFormatting(rgbStore, index);
      const rgb = gradientColors[bucketIndex];
      const rgbCSS = toCSS(rgb);
      const rgbShadow = shadowColors[bucketIndex];
      const rgbShadowCSS = toCSS(rgbShadow);

      let segmentText = char;
      if (formatting.font) {
        segmentText = applyFont(segmentText, formatting.font);
      }

      const isSelected =
        selection &&
        selection.value &&
        selection.value.start !== selection.value.end &&
        index >= selection.value.start &&
        index < selection.value.end;

      const isNewline = segmentText === '\n' || segmentText === '\r';

      rendered.push(
        <span
          key={`char${index}`}
          style={{
            color: rgbCSS,
            ...(rgbShadow && {
              textShadow: `${shadowLength}px ${shadowLength}px 0 ${rgbShadowCSS}`,
            }),
          }}
          class={{
            'char-span': true,
            'inline!': isNewline,
            'bg-blue/40 text-white!': !!isSelected && showSelection,
            ...getFormattingClasses(formatting, rgbStore.colorFormat?.class),
          }}
          data-text={segmentText}
          data-index={index}
        >
          {isNewline ? (
            <>
              {'\u00A0'}
              <br />
            </>
          ) : segmentText === ' ' ? (
            '\u00A0'
          ) : (
            segmentText
          )}
        </span>
      );
    });

    if (cursorIndex === textArray.length && showSelection) {
      rendered.push(<span key="custom-cursor" class="custom-cursor" />);
    }

    if (
      textArray.length > 0 &&
      (textArray[textArray.length - 1] === '\n' ||
        textArray[textArray.length - 1] === '\r')
    ) {
      rendered.push(
        <span key="trailing-newline-space" class="inline!">
          {'\u00A0'}
        </span>
      );
    }

    return rendered;
  }
);
