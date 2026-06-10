import {
  ColorGradient,
  getRGBColorStop,
  rgbToHex,
  sortColors,
} from '@birdflop/rgbirdflop';
import {
  AdvancedSegment,
  AdvancedStore,
  Fmt,
  StyleFlags,
  chunkText,
} from './model';

// ---------------------------------------------------------------------------
// Small helpers replicated from packages/rgbirdflop/src/util/RGBUtils.ts
// (those functions are module-private there and cannot be imported).
// ---------------------------------------------------------------------------

function buildFormatCodes(format: Fmt, style: StyleFlags): string {
  let codes = '';
  if (format.color.includes('$f') && format.char) {
    if (style.bold) codes += format.char + 'l';
    if (style.italic) codes += format.char + 'o';
    if (style.underline) codes += format.char + 'n';
    if (style.strikethrough) codes += format.char + 'm';
    if (style.obfuscate) codes += format.char + 'k';
  }
  return codes;
}

function renderTemplateSegment(
  hexWithoutHash: string,
  text: string,
  format: Fmt,
  style: StyleFlags,
  lowercase: boolean,
): string {
  let out = format.color;
  for (let n = 1; n <= 6; n++) out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(format, style));
  if (lowercase) out = out.toLowerCase();
  out = out.replace('$c', text);
  return out;
}

function applyFormatWrappers(output: string, format: Fmt, style: StyleFlags): string {
  let out = output;
  if (format.bold && style.bold) out = format.bold.replace('$t', out);
  if (format.italic && style.italic) out = format.italic.replace('$t', out);
  if (format.underline && style.underline) out = format.underline.replace('$t', out);
  if (format.strikethrough && style.strikethrough) out = format.strikethrough.replace('$t', out);
  if (format.obfuscate && style.obfuscate) out = format.obfuscate.replace('$t', out);
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
function segmentHexProvider(seg: AdvancedSegment): (() => string) | null {
  if (seg.colorMode === 'none' || seg.colors.length === 0) return null;
  if (seg.colorMode === 'solid') {
    // Uppercase to match gradient output (rgbToHex); the `lowercase` toggle then governs case uniformly.
    const hex = seg.colors[0].hex.replace(/^#/, '').toUpperCase();
    return () => hex;
  }
  let len = seg.colorlength;
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

function renderTemplate(store: AdvancedStore): string {
  let out = '';
  for (const seg of store.segments) {
    if (!seg.text) continue;
    const nextHex = segmentHexProvider(seg);
    let segOut: string;

    if (nextHex === null) {
      // Uncolored: formatting codes + raw text, no hex template.
      segOut = buildFormatCodes(store.format, seg) + seg.text;
    } else {
      segOut = '';
      for (const chunk of chunkText(seg.text, seg.colorlength)) {
        if (store.trimspaces && chunk.trim() === '') {
          segOut += chunk;
          nextHex();
          continue;
        }
        segOut += renderTemplateSegment(nextHex(), chunk, store.format, seg, store.lowercase);
      }
    }

    out += applyFormatWrappers(segOut, store.format, seg);
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
  style: StyleFlags,
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

function renderJson(store: AdvancedStore): string {
  const json: { text: string; extra: JsonExtra[] } = { text: '', extra: [] };
  for (const seg of store.segments) {
    if (!seg.text) continue;
    const nextHex = segmentHexProvider(seg);

    if (nextHex === null) {
      // Uncolored: one extra for the whole segment, no color.
      if (store.trimspaces && seg.text.trim() === '') json.extra.push({ text: seg.text });
      else json.extra.push(buildJsonExtra(seg.text, undefined, seg));
      continue;
    }

    for (const chunk of chunkText(seg.text, seg.colorlength)) {
      if (store.trimspaces && chunk.trim() === '') {
        json.extra.push({ text: chunk });
        nextHex();
        continue;
      }
      json.extra.push(buildJsonExtra(chunk, '#' + nextHex(), seg));
    }
  }
  return JSON.stringify(json);
}

function miniMessageGradientBody(seg: AdvancedSegment): string {
  const colors = sortColors(seg.colors);
  const text = seg.text;

  const even = !colors.find(
    (color, i) => color.pos != Math.round((100 / (colors.length - 1)) * i * 1000) / 1000,
  );
  if (even) {
    return `<gradient:${colors.map((c) => c.hex).join(':')}>${text}</gradient>`;
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
    body += `<gradient:${cur.hex}:${nxt.hex}>${text.substring(lower, upper)}</gradient>`;
  }
  return body;
}

function renderMiniMessage(store: AdvancedStore): string {
  let out = '';
  for (const seg of store.segments) {
    if (!seg.text) continue;
    const colored = seg.colorMode !== 'none' && seg.colors.length > 0;
    let body: string;
    if (!colored) {
      body = seg.text;
    } else if (seg.colorMode === 'solid' || seg.colors.length === 1) {
      body = `<color:${seg.colors[0].hex}>${seg.text}</color>`;
    } else {
      body = miniMessageGradientBody(seg);
    }
    out += applyFormatWrappers(body, store.format, seg);
  }
  return out;
}

/**
 * Build the Minecraft output string for the advanced (segmented) editor.
 * Equivalent to concatenating each segment's rendered output, with prefix/suffix
 * applied once at the end. Pure & deterministic.
 */
export function generateAdvancedOutput(store: AdvancedStore): string {
  const c = store.format.color;
  let combined: string;
  if (c === 'MiniMessage') combined = renderMiniMessage(store);
  else if (c === 'JSON') combined = renderJson(store);
  else combined = renderTemplate(store);
  return applyPrefixSuffix(combined, store.prefixsuffix);
}
