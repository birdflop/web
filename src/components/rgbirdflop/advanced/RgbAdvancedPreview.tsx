import {
  ColorGradient,
  getRGBColorStop,
  hexToRGB,
  sortColors,
  getFormattingAtOffset,
  rgbDefaults,
  applyFont,
} from '@birdflop/rgbirdflop';
import type { SegmentType } from './rgbSegments';
import { chunkText, combinedText, rgbSegmentsContext } from './rgbSegments';
import { EmptyPreview, getFormattingClasses, toCSS } from '../preview';
import { component$, useContext, useSignal } from '@qwik.dev/core';
import { RgbPreviewProps } from '../RgbPreview';
import { rgbStoreContext } from '../RGBirdflop';

interface AdvancedRgbPreviewProps extends RgbPreviewProps {
  rgbSegments?: SegmentType[];
}
/**
 * Render the segmented preview as styled spans (analog of renderPreview in
 * RGBirdflop.tsx, but per-segment with per-character bold/italic). Each
 * obfuscated span carries data-text so the animation can restore the glyph.
 */
export default component$<AdvancedRgbPreviewProps>(
  ({ rgbStore: rgbStoreFromProp, rgbSegments: rgbSegmentsFromProp }) => {
    const rgbStore = useContext(
      rgbStoreContext,
      rgbStoreFromProp || rgbDefaults
    );
    const rgbSegments = useContext(
      rgbSegmentsContext,
      useSignal(rgbSegmentsFromProp || [])
    );

    if (!rgbStore.text || rgbStore.text.trim() === '') return <EmptyPreview />;
    if (rgbStore.colors.length < 1) return rgbStore.text;

    const text = combinedText(rgbSegments.value);
    if (!text) return <EmptyPreview />;

    let charOffset = 0;
    return rgbSegments.value.flatMap((seg, si) => {
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

      let rel = 0;
      const chunkSpans = chunkText(seg.text, seg.colorLength).map(
        (chunk, ci) => {
          let color = 'inherit';
          if (seg.colorMode === 'solid' && seg.colors.length > 0) {
            color = toCSS(hexToRGB(seg.colors[0].hex));
          } else if (gradient) {
            color = toCSS(gradient.next());
          }

          const fmt = getFormattingAtOffset(charOffset + rel, rgbStore);
          rel += chunk.length;

          let chunkTextVal = chunk;
          if (fmt.font) {
            chunkTextVal = applyFont(chunkTextVal, fmt.font);
          }

          return (
            <span
              q:slot="input"
              key={`s${si}-c${ci}`}
              data-text={chunkTextVal}
              style={{ color }}
              class={getFormattingClasses(fmt)}
            >
              {chunkTextVal}
            </span>
          );
        }
      );

      charOffset += seg.text.length;
      return chunkSpans;
    });
  }
);
