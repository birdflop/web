import {
  ColorGradient,
  getRGBColorStop,
  rgbToHex,
  sortColors,
  buildFormatCodes,
  getFormattingAtOffset,
  FORMAT_KEYS,
  rgbDefaults,
  type ColorFormat,
  type Formatting,
} from '@birdflop/rgbirdflop';
import {
  chunkText, SegmentType,
} from './model';

function renderTemplateSegment(
  hexWithoutHash: string,
  text: string,
  fmt: Formatting,
  options: typeof rgbDefaults,
): string {
  let out = options.colorFormat.color;
  for (let n = 1; n <= 6; n++) out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(fmt, options));
  if (options.lowercase) out = out.toLowerCase();
  out = out.replace('$c', text);

  // Apply wrappers to this segment if formatting has it
  out = applyFormatWrappers(out, options.colorFormat, fmt);

  return out;
}

function applyFormatWrappers(output: string, format: ColorFormat, style: Formatting): string {
  let out = output;
  if (format.bold && style.bold) out = format.bold.replace('$t', out);
  if (format.italic && style.italic) out = format.italic.replace('$t', out);
  if (format.underline && style.underline) out = format.underline.replace('$t', out);
  if (format.strikethrough && style.strikethrough) out = format.strikethrough.replace('$t', out);
  if (format.obfuscate && style.obfuscate) out = format.obfuscate.replace('$t', out);
  return out;
}

function applySelectiveFormatting(text: string, offset: number, options: typeof rgbDefaults): string {
  const chars = Array.from(text);
  let currentFmt: Formatting | undefined;
  let buffer = '';
  let out = '';

  const flush = () => {
    if (!buffer) return;
    if (!currentFmt) {
      out += buffer;
      buffer = '';
      return;
    }
    let formatted = buffer;
    if (options.colorFormat.color === 'MiniMessage') {
      if (currentFmt.bold) formatted = `<b>${formatted}</b>`;
      if (currentFmt.italic) formatted = `<i>${formatted}</i>`;
      if (currentFmt.underline) formatted = `<u>${formatted}</u>`;
      if (currentFmt.strikethrough) formatted = `<st>${formatted}</st>`;
      if (currentFmt.obfuscate) formatted = `<obf>${formatted}</obf>`;
    }
    out += formatted;
    buffer = '';
  };

  let charOffset = offset;
  for (const ch of chars) {
    const fmt = getFormattingAtOffset(charOffset, options);

    const fmtChanged = !currentFmt || FORMAT_KEYS.some((k) => currentFmt![k] !== fmt[k]);

    if (fmtChanged) {
      flush();
      currentFmt = fmt;
    }
    buffer += ch;
    charOffset += ch.length;
  }
  flush();
  return out;
}

function applyPrefixSuffix(output: string, prefixsuffix: string): string {
  if (prefixsuffix) return prefixsuffix.replace(/\$t/g, output);
  return output;
}

/**
 * Returns a stepping function yielding the next 6-char hex (no '#') for the
 * segment, or null when the segment is uncolored. A fresh ColorGradient is
 * created per segment so each gradient is independent.
 */
function segmentHexProvider(seg: SegmentType): (() => string) | null {
  if (seg.colorMode === 'none' || seg.colors.length === 0) return null;
  if (seg.colorMode === 'solid') {
    // Uppercase to match gradient output (rgbToHex); the `lowercase` toggle then governs case uniformly.
    const hex = seg.colors[0].hex.replace(/^#/, '').toUpperCase();
    return () => hex;
  }
  let len = seg.colorLength;
  if (!len || len < 1) len = 1;
  const numChunks = Math.max(1, Math.ceil(Array.from(seg.text).length / len));
  const gradient = new ColorGradient(
    sortColors(seg.colors).map(getRGBColorStop),
    numChunks,
    seg.gradientType,
  );
  return () => rgbToHex(gradient.next());
}

// ---------------------------------------------------------------------------
// Format-family renderers
// ---------------------------------------------------------------------------

function renderTemplate(segments: SegmentType[], options: typeof rgbDefaults): string {
  let out = '';
  let charOffset = 0;
  for (const seg of segments) {
    if (!seg.text) continue;
    const nextHex = segmentHexProvider(seg);
    let segOut: string;

    if (nextHex === null) {
      // Uncolored: formatting codes + raw text, no hex template.
      segOut = '';
      let rel = 0;
      for (const ch of Array.from(seg.text)) {
        const fmt = getFormattingAtOffset(charOffset + rel, options);
        segOut += buildFormatCodes(fmt, options) + ch;
        rel += ch.length;
      }
    } else {
      segOut = '';
      let rel = 0;
      for (const chunk of chunkText(seg.text, seg.colorLength)) {
        if (options.trimSpaces && chunk.trim() === '') {
          segOut += chunk;
          nextHex();
          rel += chunk.length;
          continue;
        }
        const fmt = getFormattingAtOffset(charOffset + rel, options);
        segOut += renderTemplateSegment(nextHex(), chunk, fmt, options);
        rel += chunk.length;
      }
    }

    out += segOut;
    charOffset += seg.text.length;
  }
  return out;
}

interface JsonExtra {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

function buildJsonExtra(
  text: string,
  colorHexWithHash: string | undefined,
  style: Formatting,
): JsonExtra {
  const e: JsonExtra = { text };
  if (colorHexWithHash) e.color = colorHexWithHash;
  if (style.bold) e.bold = true;
  if (style.italic) e.italic = true;
  if (style.underline) e.underlined = true;
  if (style.strikethrough) e.strikethrough = true;
  if (style.obfuscate) e.obfuscated = true;
  return e;
}

function renderJson(segments: SegmentType[], options: typeof rgbDefaults): string {
  const json: { text: string; extra: JsonExtra[] } = { text: '', extra: [] };
  let charOffset = 0;
  for (const seg of segments) {
    if (!seg.text) continue;
    const nextHex = segmentHexProvider(seg);

    if (nextHex === null) {
      // Uncolored: one extra per character, no color.
      let rel = 0;
      for (const ch of Array.from(seg.text)) {
        if (options.trimSpaces && ch.trim() === '') {
          json.extra.push({ text: ch });
        } else {
          const fmt = getFormattingAtOffset(charOffset + rel, options);
          json.extra.push(buildJsonExtra(ch, undefined, fmt));
        }
        rel += ch.length;
      }
      charOffset += seg.text.length;
      continue;
    }

    let rel = 0;
    for (const chunk of chunkText(seg.text, seg.colorLength)) {
      if (options.trimSpaces && chunk.trim() === '') {
        json.extra.push({ text: chunk });
        nextHex();
        rel += chunk.length;
        continue;
      }
      const fmt = getFormattingAtOffset(charOffset + rel, options);
      json.extra.push(buildJsonExtra(chunk, '#' + nextHex(), fmt));
      rel += chunk.length;
    }
    charOffset += seg.text.length;
  }
  return JSON.stringify(json);
}

function miniMessageGradientBody(seg: SegmentType, charOffset: number, options: typeof rgbDefaults): string {
  const colors = sortColors(seg.colors);
  const text = seg.text;

  const even = !colors.find(
    (color, i) => color.pos != Math.round((100 / (colors.length - 1)) * i * 1000) / 1000,
  );
  if (even) {
    const inner = applySelectiveFormatting(text, charOffset, options);
    return `<gradient:${colors.map((c) => c.hex).join(':')}>${inner}</gradient>`;
  }

  const copy = [...colors];
  if (copy[0].pos !== 0) copy.unshift({ ...copy[0], pos: 0 });
  if (copy[copy.length - 1].pos !== 100) copy.push({ ...copy[copy.length - 1], pos: 100 });

  let body = '';
  const n = text.length;
  for (let i = 0; i < copy.length - 1; i++) {
    let cur = copy[i];
    let nxt = copy[i + 1];
    if (cur.pos > nxt.pos) {
      const swap = cur;
      cur = nxt;
      nxt = swap;
    }
    const lower = Math.round((copy[i].pos / 100) * n);
    const upper = Math.round((copy[i + 1].pos / 100) * n);
    if (lower === upper) continue;

    const slice = text.substring(lower, upper);
    const inner = applySelectiveFormatting(slice, charOffset + lower, options);
    body += `<gradient:${cur.hex}:${nxt.hex}>${inner}</gradient>`;
  }
  return body;
}

function renderMiniMessage(segments: SegmentType[], options: typeof rgbDefaults): string {
  let out = '';
  let charOffset = 0;
  for (const seg of segments) {
    if (!seg.text) continue;
    const colored = seg.colorMode !== 'none' && seg.colors.length > 0;
    let body: string;
    if (!colored) {
      body = applySelectiveFormatting(seg.text, charOffset, options);
    } else if (seg.colorMode === 'solid' || seg.colors.length === 1) {
      const inner = applySelectiveFormatting(seg.text, charOffset, options);
      body = `<color:${seg.colors[0].hex}>${inner}</color>`;
    } else {
      body = miniMessageGradientBody(seg, charOffset, options);
    }
    out += body;
    charOffset += seg.text.length;
  }
  return out;
}

/**
 * Build the Minecraft output string for the advanced (segmented) editor.
 * Equivalent to concatenating each segment's rendered output, with prefix/suffix
 * applied once at the end. Pure & deterministic.
 */
export function generateAdvancedOutput(segments: SegmentType[], options: typeof rgbDefaults): string {
  const c = options.colorFormat.color;
  let combined: string;
  if (c === 'MiniMessage') combined = renderMiniMessage(segments, options);
  else if (c === 'JSON') combined = renderJson(segments, options);
  else combined = renderTemplate(segments, options);
  return applyPrefixSuffix(combined, options.prefixSuffix);
}
