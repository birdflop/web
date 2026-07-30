import {
  ColorGradient,
  getRGBColorStop,
  hexToRGB,
  sortColors,
  getFormattingAtOffset,
  rgbDefaults,
  applyFont,
} from '@birdflop/rgbirdflop';
import type { JSXOutput, Signal } from '@qwik.dev/core';
import { component$, useContext, useSignal } from '@qwik.dev/core';
import { selectionContext } from '../Input';
import { EmptyPreview, getFormattingClasses, toCSS } from '../preview';
import { rgbStoreContext } from '../RGBirdflop';
import { rgbSegmentsContext, type SegmentType } from './rgbSegments';

interface AdvancedRgbPreviewProps {
  rgbStore?: typeof rgbDefaults;
  rgbSegments?: Signal<SegmentType[]>;
  shadowLength?: number;
  showSelection?: boolean;
}

/**
 * Render the segmented preview as styled spans, mapping each character to its own
 * span for custom selection highlighting and precise custom cursor placement.
 */
export default component$<AdvancedRgbPreviewProps>(
  ({
    rgbStore: rgbStoreFromProp,
    rgbSegments: rgbSegmentsFromProp,
    showSelection,
  }) => {
    const rgbStoreFromContext = useContext(rgbStoreContext, rgbDefaults);
    const rgbStore = rgbStoreFromProp || rgbStoreFromContext;
    const rgbSegmentsFromContext = useContext(
      rgbSegmentsContext,
      useSignal([])
    );
    const rgbSegments = rgbSegmentsFromProp || rgbSegmentsFromContext;
    const selection = useContext(selectionContext, null);

    if (!rgbStore.text || rgbStore.text.trim() === '') return <EmptyPreview />;
    if (rgbStore.colors.length < 1) return rgbStore.text;

    const cursorIndex =
      selection &&
      selection.value &&
      selection.value.start === selection.value.end
        ? selection.value.start
        : -1;

    let charOffset = 0;
    const spans = rgbSegments.value.flatMap((seg, si) => {
      if (!seg.text) return [];

      let gradient: ColorGradient | null = null;
      if (seg.colorMode === 'gradient' && seg.colors.length > 0) {
        const len =
          !seg.colorLength || seg.colorLength < 1 ? 1 : seg.colorLength;
        gradient = new ColorGradient(
          sortColors(seg.colors).map(getRGBColorStop),
          Math.max(1, Math.ceil(Array.from(seg.text).length / len)),
          seg.gradientType
        );
      }

      const textArray = Array.from(seg.text);
      let gradientColors: number[][] = [];
      if (gradient) {
        const bucketCount = Math.max(
          1,
          Math.ceil(textArray.length / (seg.colorLength || 1))
        );
        gradientColors = Array.from({ length: bucketCount }, () =>
          gradient.next()
        );
      }

      const segmentSpans: JSXOutput[] = [];
      textArray.forEach((char, index) => {
        const globalIndex = charOffset + index;
        if (globalIndex === cursorIndex && showSelection) {
          segmentSpans.push(<span key="custom-cursor" class="custom-cursor" />);
        }

        let color = 'inherit';
        if (seg.colorMode === 'solid' && seg.colors.length > 0) {
          color = toCSS(hexToRGB(seg.colors[0].hex));
        } else if (gradient && gradientColors.length > 0) {
          const bucketIndex = Math.min(
            Math.floor(index / (seg.colorLength || 1)),
            gradientColors.length - 1
          );
          color = toCSS(gradientColors[bucketIndex]);
        }

        const fmt = getFormattingAtOffset(globalIndex, rgbStore);
        let charText = char;
        if (fmt.font) {
          charText = applyFont(charText, fmt.font);
        }

        const isSelected =
          selection &&
          selection.value &&
          selection.value.start !== selection.value.end &&
          globalIndex >= selection.value.start &&
          globalIndex < selection.value.end;

        const isNewline = charText === '\n' || charText === '\r';

        segmentSpans.push(
          <span
            key={`s${si}-char${index}`}
            data-text={charText}
            data-index={globalIndex}
            style={{ color }}
            class={{
              'char-span': true,
              'inline!': isNewline,
              'bg-blue/40 text-white!': !!isSelected,
              ...getFormattingClasses(fmt, rgbStore.colorFormat?.class),
            }}
          >
            {isNewline ? (
              <>
                {'\u00A0'}
                <br />
              </>
            ) : charText === ' ' ? (
              '\u00A0'
            ) : (
              charText
            )}
          </span>
        );
      });

      charOffset += seg.text.length;
      return segmentSpans;
    });

    if (cursorIndex === charOffset && showSelection) {
      spans.push(<span key="custom-cursor" class="custom-cursor" />);
    }

    const fullText = rgbSegments.value.map((s) => s.text).join('');
    if (
      fullText.length > 0 &&
      (fullText[fullText.length - 1] === '\n' ||
        fullText[fullText.length - 1] === '\r')
    ) {
      spans.push(
        <span key="trailing-newline-space" class="inline!">
          {'\u00A0'}
        </span>
      );
    }

    return spans;
  }
);
