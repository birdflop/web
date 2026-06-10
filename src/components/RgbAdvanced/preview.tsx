import { ColorGradient, getRGBColorStop, hexToRGB, sortColors } from '@birdflop/rgbirdflop';
import type { AdvancedStore } from './model';
import { chunkText, combinedText } from './model';

function toCSS(rgb: number[]): string {
  return `rgba(${rgb.slice(0, 3).join(',')}, ${rgb[3] !== undefined ? rgb[3] / 255 : 1})`;
}

/**
 * Render the segmented preview as styled spans (analog of renderPreview in
 * RGBirdflop.tsx, but per-segment with per-character bold/italic). Each
 * obfuscated span carries data-text so the animation can restore the glyph.
 */
export function renderAdvancedPreview(store: AdvancedStore) {
  const text = combinedText(store.segments);
  if (!text) return ' ';

  return store.segments.flatMap((seg, si) => {
    if (!seg.text) return [];

    let gradient: ColorGradient | null = null;
    if (seg.colorMode === 'gradient' && seg.colors.length > 0) {
      const len = !seg.colorlength || seg.colorlength < 1 ? 1 : seg.colorlength;
      gradient = new ColorGradient(
        sortColors(seg.colors).map(getRGBColorStop),
        Math.max(1, Math.ceil(Array.from(seg.text).length / len)),
        seg.gradientType,
      );
    }

    return chunkText(seg.text, seg.colorlength).map((chunk, ci) => {
      let color = 'inherit';
      if (seg.colorMode === 'solid' && seg.colors.length > 0) {
        color = toCSS(hexToRGB(seg.colors[0].hex));
      } else if (gradient) {
        color = toCSS(gradient.next());
      }

      return (
        <span
          key={`s${si}-c${ci}`}
          data-text={chunk}
          style={{
            color,
            // Faux-bold via text-shadow (how Minecraft itself draws bold). The real
            // `font-mc-bold` is ~20% wider, which would desync the editable textarea
            // overlay and offset the selection highlight; this keeps the advance width.
            ...(seg.bold ? { textShadow: '0.06em 0 0 currentColor' } : {}),
          }}
          class={{
            // Italic font is width-identical to regular, so it's safe to use directly.
            'font-mc-italic': seg.italic,
            underline: seg.underline,
            strikethrough: seg.strikethrough,
            'underline-strikethrough': seg.underline && seg.strikethrough,
            obfuscate: seg.obfuscate,
          }}
        >
          {chunk}
        </span>
      );
    });
  });
}
