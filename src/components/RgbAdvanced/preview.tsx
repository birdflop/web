import {
  ColorGradient,
  getRGBColorStop,
  hexToRGB,
  sortColors,
  getFormattingAtOffset,
  rgbDefaults,
  applyFont,
} from '@birdflop/rgbirdflop';
import type { SegmentType } from './model';
import { chunkText, combinedText } from './model';
import { getFormattingClasses } from '../Rgbirdflop/preview';

function toCSS(rgb: number[]): string {
  return `rgba(${rgb.slice(0, 3).join(',')}, ${rgb[3] !== undefined ? rgb[3] / 255 : 1})`;
}

/**
 * Render the segmented preview as styled spans (analog of renderPreview in
 * RGBirdflop.tsx, but per-segment with per-character bold/italic). Each
 * obfuscated span carries data-text so the animation can restore the glyph.
 */
export function renderAdvancedPreview(
  segments: SegmentType[],
  options: typeof rgbDefaults,
) {
  const text = combinedText(segments);
  if (!text) return ' ';

  let charOffset = 0;
  return segments.flatMap((seg, si) => {
    if (!seg.text) return [];

    let gradient: ColorGradient | null = null;
    if (seg.colorMode === 'gradient' && seg.colors.length > 0) {
      const len = !seg.colorLength || seg.colorLength < 1 ? 1 : seg.colorLength;
      gradient = new ColorGradient(
        sortColors(seg.colors).map(getRGBColorStop),
        Math.max(1, Math.ceil(Array.from(seg.text).length / len)),
        seg.gradientType,
      );
    }

    let rel = 0;
    const chunkSpans = chunkText(seg.text, seg.colorLength).map((chunk, ci) => {
      let color = 'inherit';
      if (seg.colorMode === 'solid' && seg.colors.length > 0) {
        color = toCSS(hexToRGB(seg.colors[0].hex));
      } else if (gradient) {
        color = toCSS(gradient.next());
      }

      const fmt = getFormattingAtOffset(charOffset + rel, options);
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
    });

    charOffset += seg.text.length;
    return chunkSpans;
  });
}
