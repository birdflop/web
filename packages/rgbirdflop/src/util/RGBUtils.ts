import {
  ColorStop,
  rgbDefaults,
  Formatting,
  rgbColorDefaults,
} from './Defaults';
import { hexToRGB, rgbToHex } from './Colors';
import { ColorGradient } from './ColorUtils';
import { RGBColorStop } from './ColorUtils/BaseGradient';
import { FONT_MAPPINGS } from './Fonts';

export function segmentText(text: string, colorLength?: number): string[] {
  let len = colorLength ?? 1;
  if (!len || len < 1) len = 1;
  const out: string[] = [];
  const arr = Array.from(text);
  for (let i = 0; i < arr.length; i += len)
    out.push(arr.slice(i, i + len).join(''));
  return out;
}

export function isFormattingEqual(
  a: Formatting | null,
  b: Formatting | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    !!a.strikethrough === !!b.strikethrough &&
    !!a.obfuscate === !!b.obfuscate &&
    a.font === b.font
  );
}

export type FormatKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'obfuscate';
export const FORMAT_KEYS: FormatKey[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'obfuscate',
];

export function applyFont(text: string, fontName: string | undefined): string {
  if (!fontName) return text;
  const map = FONT_MAPPINGS[fontName];
  if (!map) return text;

  return Array.from(text)
    .map((char) => map[char] ?? char)
    .join('');
}

export function buildFormatCodes(
  formatting: Formatting,
  rgbOptions: typeof rgbDefaults,
): string {
  let codes = '';
  if (
    rgbOptions.colorFormat.color.includes('$f') &&
    rgbOptions.colorFormat.char
  ) {
    if (formatting.bold) codes += rgbOptions.colorFormat.char + 'l';
    if (formatting.italic) codes += rgbOptions.colorFormat.char + 'o';
    if (formatting.underline) codes += rgbOptions.colorFormat.char + 'n';
    if (formatting.strikethrough) codes += rgbOptions.colorFormat.char + 'm';
    if (formatting.obfuscate) codes += rgbOptions.colorFormat.char + 'k';
  }
  return codes;
}

export function applyMiniMessageFormatting(
  text: string,
  formatting: Formatting,
  rgbOptions: typeof rgbDefaults,
): string {
  if (rgbOptions.colorFormat.color !== 'MiniMessage') return text;

  let output = text;
  if (formatting.font) {
    output = applyFont(output, formatting.font);
  }
  if (formatting.obfuscate && rgbOptions.colorFormat.obfuscate)
    output = rgbOptions.colorFormat.obfuscate.replace('$t', output);
  if (formatting.strikethrough && rgbOptions.colorFormat.strikethrough)
    output = rgbOptions.colorFormat.strikethrough.replace('$t', output);
  if (formatting.underline && rgbOptions.colorFormat.underline)
    output = rgbOptions.colorFormat.underline.replace('$t', output);
  if (formatting.italic && rgbOptions.colorFormat.italic)
    output = rgbOptions.colorFormat.italic.replace('$t', output);
  if (formatting.bold && rgbOptions.colorFormat.bold)
    output = rgbOptions.colorFormat.bold.replace('$t', output);
  return output;
}

export function renderTemplateSegment(
  hexWithoutHash: string,
  text: string,
  formatting: Formatting,
  rgbOptions: typeof rgbDefaults,
  skipColor: boolean = false,
): string {
  let out = rgbOptions.colorFormat.color;
  if (skipColor) {
    if (out.includes('$f$c')) {
      out = '$f$c';
    } else if (out.includes('$c')) {
      out = '$c';
    }
  }
  for (let n = 1; n <= 6; n++)
    out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(formatting, rgbOptions));
  if (rgbOptions.lowercase) out = out.toLowerCase();

  let segText = text;
  if (formatting.font) {
    segText = applyFont(segText, formatting.font);
  }
  out = out.replace('$c', segText);

  // Apply wrappers to this segment if formatting has it, ONLY when selective formatting is active
  if (rgbOptions.formatting && rgbOptions.formatting.length > 0) {
    if (rgbOptions.colorFormat.bold && formatting.bold)
      out = rgbOptions.colorFormat.bold.replace('$t', out);
    if (rgbOptions.colorFormat.italic && formatting.italic)
      out = rgbOptions.colorFormat.italic.replace('$t', out);
    if (rgbOptions.colorFormat.underline && formatting.underline)
      out = rgbOptions.colorFormat.underline.replace('$t', out);
    if (rgbOptions.colorFormat.strikethrough && formatting.strikethrough)
      out = rgbOptions.colorFormat.strikethrough.replace('$t', out);
    if (rgbOptions.colorFormat.obfuscate && formatting.obfuscate)
      out = rgbOptions.colorFormat.obfuscate.replace('$t', out);
  }

  return out;
}

export function applyWrappers(
  output: string,
  rgbOptions: typeof rgbDefaults,
): string {
  let out = output;
  if (!rgbOptions.formatting || rgbOptions.formatting.length === 0) {
    if (rgbOptions.colorFormat.bold && rgbOptions.baseFormatting.bold)
      out = rgbOptions.colorFormat.bold.replace('$t', out);
    if (rgbOptions.colorFormat.italic && rgbOptions.baseFormatting.italic)
      out = rgbOptions.colorFormat.italic.replace('$t', out);
    if (rgbOptions.colorFormat.underline && rgbOptions.baseFormatting.underline)
      out = rgbOptions.colorFormat.underline.replace('$t', out);
    if (
      rgbOptions.colorFormat.strikethrough &&
      rgbOptions.baseFormatting.strikethrough
    )
      out = rgbOptions.colorFormat.strikethrough.replace('$t', out);
    if (rgbOptions.colorFormat.obfuscate && rgbOptions.baseFormatting.obfuscate)
      out = rgbOptions.colorFormat.obfuscate.replace('$t', out);
  }
  if (rgbOptions.prefixSuffix)
    out = rgbOptions.prefixSuffix.replace(/\$t/g, out);
  return out;
}

function normalizeShadowRGB(rgb: number[]): number[] {
  const norm = rgb.map((c) => Math.round((c / 255) * 100) / 100);
  if (norm[3] === undefined) norm.push(1);
  return norm;
}

export function getShadowColors(rgbOptions: typeof rgbColorDefaults) {
  if (!rgbOptions.shadowColors) {
    return rgbOptions.colors.map((color) => {
      const shadowRGB = hexToRGB(color.hex).map((c) => c * 0.25);
      return {
        ...color,
        hex: `#${rgbToHex(shadowRGB)}`,
      };
    });
  }
  return rgbOptions.shadowColors;
}

export function getRGBColorStop(color: ColorStop): RGBColorStop {
  return {
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  };
}

type ShadowSegment = {
  text: string;
  hex: string;
  opacity: number;
  start: number;
  end: number;
};

function buildShadowSegments(
  rgbOptions: typeof rgbDefaults,
  shadowColors: ColorStop[],
): ShadowSegment[] {
  const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);
  if (!segments.length || !shadowColors) return [];

  const shadowGradient = new ColorGradient(
    shadowColors.map(getRGBColorStop),
    segments.length,
    rgbOptions.gradientType,
  );

  let cursor = 0;
  return segments.map((text) => {
    const shadow = shadowGradient.next();
    const start = cursor;
    const end = cursor + text.length;
    cursor = end;
    return {
      text,
      start,
      end,
      hex: `#${rgbToHex(shadow.slice(0, 3))}`,
      opacity: shadow[3] !== undefined ? shadow[3] / 255 : 1,
    };
  });
}

function applySelectiveFormattingToText(
  text: string,
  offset: number,
  rgbOptions: typeof rgbDefaults,
): string {
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
    if (currentFmt.font) {
      formatted = applyFont(formatted, currentFmt.font);
    }
    if (rgbOptions.colorFormat.color === 'MiniMessage') {
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
    const covering = rgbOptions.formatting?.find(
      (s) => s.start <= charOffset && s.end > charOffset,
    );
    const fmt = covering
      ? { ...rgbOptions.baseFormatting, ...covering }
      : { ...rgbOptions.baseFormatting };

    const fmtChanged =
      !currentFmt ||
      FORMAT_KEYS.some((k) => currentFmt![k] !== fmt[k]) ||
      currentFmt.font !== fmt.font;

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

function buildShadowContent(
  shadowSegments: ShadowSegment[],
  start: number,
  end: number,
  rgbOptions: typeof rgbDefaults,
): string {
  let currentHex: string | undefined;
  let currentOpacity: number | undefined;
  let buffer = '';
  let out = '';
  let bufferStartOffset = 0;

  const flush = () => {
    if (!buffer || !currentHex) return;
    const formatted = applySelectiveFormattingToText(
      buffer,
      bufferStartOffset,
      rgbOptions,
    );
    out += `<shadow:${currentHex}:${currentOpacity ?? 1}>${formatted}</shadow>`;
    buffer = '';
  };

  for (const seg of shadowSegments) {
    if (seg.end <= start || seg.start >= end) continue;

    const sliceStart = Math.max(start, seg.start) - seg.start;
    const sliceEnd = Math.min(end, seg.end) - seg.start;
    const slice = seg.text.slice(sliceStart, sliceEnd);
    if (!slice) continue;

    const sliceGlobalStart = Math.max(start, seg.start);

    if (
      currentHex &&
      (currentHex !== seg.hex || currentOpacity !== seg.opacity)
    ) {
      flush();
    }

    if (!buffer) {
      bufferStartOffset = sliceGlobalStart;
    }
    currentHex = seg.hex;
    currentOpacity = Math.round(seg.opacity * 1000) / 1000;
    buffer += slice;
  }

  flush();
  return out;
}

export function disperseColors(colors: ColorStop[]) {
  if (colors.length <= 1) {
    return colors.slice(0).map((color) => ({ ...color, pos: 0 }));
  }
  const newColors = colors.slice(0).map((color, i) => ({
    ...color,
    pos: Math.round((100 / (colors.length - 1)) * i * 1000) / 1000,
  }));
  return newColors;
}

export function sortColors(colors: ColorStop[]) {
  return [...colors].sort((a, b) => a.pos - b.pos);
}

export function swapItems(array: any[], indexA: number, indexB: number) {
  const arrLength = array.length;
  if (arrLength === 0) return [...array];

  const wrap = (i: number) => ((i % arrLength) + arrLength) % arrLength;
  const a = wrap(indexA);
  const b = wrap(indexB);

  const arr = [...array];

  const hasA = a in arr;
  const hasB = b in arr;
  if (!hasA || !hasB) return arr;

  const itemA = arr[a];
  const itemB = arr[b];
  if (itemA && itemB && 'pos' in itemA && 'pos' in itemB) {
    const currentPos = itemA.pos;
    itemA.pos = itemB.pos;
    itemB.pos = currentPos;
  }

  [arr[a], arr[b]] = [arr[b], arr[a]];

  return arr;
}

export function generateOutput(rgbOptions: typeof rgbDefaults) {
  const colors = sortColors(rgbOptions.colors);
  const shadowColors = rgbOptions.shadowColors
    ? sortColors(rgbOptions.shadowColors)
    : null;

  if (colors.length === 1) {
    if (rgbOptions.colorFormat.color === 'MiniMessage') {
      const single = renderMiniMessageGradient(
        colors,
        rgbOptions,
        shadowColors,
      );
      return applyWrappers(single, rgbOptions);
    }

    const single = renderSingleColorOutput(colors[0].hex, rgbOptions);
    return applyWrappers(single, rgbOptions);
  }

  let output;
  if (rgbOptions.colorFormat.color === 'MiniMessage') {
    output = renderMiniMessageGradient(colors, rgbOptions, shadowColors);
  } else if (rgbOptions.colorFormat.color === 'JSON') {
    output = renderJsonGradient(colors, rgbOptions);
  } else {
    output = renderTemplateGradient(colors, rgbOptions);
  }

  return applyWrappers(output, rgbOptions);
}

type JsonExtra = {
  text: string;
  color?: string;
  shadow_color?: number[];
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
};

function renderSingleColorOutput(
  singleHex: string,
  rgbOptions: typeof rgbDefaults,
): string {
  if (rgbOptions.colorFormat.color === 'MiniMessage') {
    const shadowColors = rgbOptions.shadowColors
      ? sortColors(rgbOptions.shadowColors)
      : null;
    return renderMiniMessageGradient(
      [{ hex: singleHex, pos: 0 }],
      rgbOptions,
      shadowColors,
    );
  }

  if (rgbOptions.colorFormat.color === 'JSON') {
    const shadowGradient = buildShadowGradient(rgbOptions);
    const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);
    const extra = buildJsonExtraList(
      segments,
      () => singleHex,
      () => shadowGradient?.next(),
      rgbOptions,
    );
    return JSON.stringify({ text: '', extra });
  }

  if (rgbOptions.formatting && rgbOptions.formatting.length > 0) {
    return renderTemplateGradient([{ hex: singleHex, pos: 0 }], rgbOptions);
  }

  if (rgbOptions.trimSpaces && rgbOptions.text.trim() === '')
    return rgbOptions.text;
  const hex = singleHex.replace(/^#/, '');
  return renderTemplateSegment(
    hex,
    rgbOptions.text,
    rgbOptions.baseFormatting,
    rgbOptions,
  );
}

function renderMiniMessageGradient(
  colors: ColorStop[],
  rgbOptions: typeof rgbDefaults,
  shadowColors: ColorStop[] | null,
): string {
  const shadowSegments =
    shadowColors && shadowColors.length > 0
      ? buildShadowSegments(rgbOptions, shadowColors)
      : undefined;

  const buildShadowRange = (start: number, end: number) => {
    if (!shadowSegments || !shadowSegments.length) {
      return applySelectiveFormattingToText(
        rgbOptions.text.substring(start, end),
        start,
        rgbOptions,
      );
    }
    return (
      buildShadowContent(shadowSegments, start, end, rgbOptions) ||
      applySelectiveFormattingToText(
        rgbOptions.text.substring(start, end),
        start,
        rgbOptions,
      )
    );
  };

  const renderUnevenGradient = (text: string) => {
    // todo: make an iseven function to avoid math.random issues
    const even = !colors.find((color, i) => {
      return (
        color.pos != Math.round((100 / (colors.length - 1)) * i * 1000) / 1000
      );
    });
    if (even) return null;

    const copy = [...colors];
    if (copy[0].pos !== 0) copy.unshift({ ...copy[0], pos: 0 });
    if (copy[copy.length - 1].pos !== 100)
      copy.push({ ...copy[copy.length - 1], pos: 100 });

    let out = '';
    for (let i = 0; i < copy.length - 1; i++) {
      let currentColor = copy[i];
      let nextColor = copy[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const swap = currentColor;
        currentColor = nextColor;
        nextColor = swap;
      }

      const numSteps = text.length;
      const lowerRange = Math.round((copy[i].pos / 100) * numSteps);
      const upperRange = Math.round((copy[i + 1].pos / 100) * numSteps);
      if (lowerRange === upperRange) continue;

      const innerText = buildShadowRange(lowerRange, upperRange);
      out += `<gradient:${currentColor.hex}:${nextColor.hex}>${innerText}</gradient>`;
    }
    return out;
  };

  if (colors.length === 1) {
    const inner = buildShadowRange(0, rgbOptions.text.length);
    return `<color:${colors[0].hex}>${inner}</color>`;
  }

  const unevenOut = renderUnevenGradient(rgbOptions.text);
  if (unevenOut !== null) return unevenOut;

  const hexes = colors.map((c) => c.hex).join(':');
  const inner = buildShadowRange(0, rgbOptions.text.length);
  return `<gradient:${hexes}>${inner}</gradient>`;
}

export function getFormattingAtOffset(
  charIndex: number,
  rgbOptions: typeof rgbDefaults,
): Formatting {
  const covering = rgbOptions.formatting?.find(
    (s) => s.start <= charIndex && s.end > charIndex,
  );
  return covering
    ? { ...rgbOptions.baseFormatting, ...covering }
    : { ...rgbOptions.baseFormatting };
}

function buildShadowGradient(
  rgbOptions: typeof rgbDefaults,
): ColorGradient | undefined {
  if (!rgbOptions.shadowColors) return undefined;
  const shadowColors = rgbOptions.shadowColors.map(getRGBColorStop);
  return new ColorGradient(
    shadowColors,
    rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
    rgbOptions.gradientType,
  );
}

function buildJsonExtraList(
  segments: string[],
  colorProvider: () => string,
  shadowProvider: () => number[] | undefined,
  rgbOptions: typeof rgbDefaults,
): JsonExtra[] {
  const extra: JsonExtra[] = [];
  let charIndex = 0;
  for (const segment of segments) {
    const color = colorProvider();
    const shadow = shadowProvider();

    if (rgbOptions.trimSpaces && segment.trim() === '') {
      extra.push({ text: segment });
      charIndex += segment.length;
      continue;
    }

    const fmt = getFormattingAtOffset(charIndex, rgbOptions);
    const jsonExtra = buildJsonFormatting(
      segment,
      color,
      fmt,
      rgbOptions,
      shadow,
    );
    extra.push(jsonExtra);
    charIndex += segment.length;
  }
  return extra;
}

function renderJsonGradient(
  colors: ColorStop[],
  rgbOptions: typeof rgbDefaults,
): string {
  const newColors = colors.map(getRGBColorStop);
  if (newColors.length < 1) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
    rgbOptions.gradientType,
  );
  const shadowGradient = buildShadowGradient(rgbOptions);

  const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);
  const extra = buildJsonExtraList(
    segments,
    () => '#' + rgbToHex(gradient.next()),
    () => (shadowGradient ? shadowGradient.next() : undefined),
    rgbOptions,
  );

  return JSON.stringify({ text: '', extra });
}

function renderTemplateGradient(
  colors: ColorStop[],
  rgbOptions: typeof rgbDefaults,
): string {
  const newColors = colors.map(getRGBColorStop);
  if (newColors.length === 0) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
    rgbOptions.gradientType,
  );
  const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);
  let charIndex = 0;

  let out = '';
  let previousHex: string | null = null;
  let previousFmt: Formatting | null = null;

  for (const segment of segments) {
    if (rgbOptions.trimSpaces && segment.trim() === '') {
      out += segment;
      gradient.next();
      charIndex += segment.length;
      continue;
    }

    const hex = rgbToHex(gradient.next());
    const fmt = getFormattingAtOffset(charIndex, rgbOptions);
    const skipColor = previousHex !== null && hex === previousHex && isFormattingEqual(fmt, previousFmt);
    out += renderTemplateSegment(hex, segment, fmt, rgbOptions, skipColor);
    previousHex = hex;
    previousFmt = fmt;
    charIndex += segment.length;
  }
  return out;
}

function buildJsonFormatting(
  segment: string,
  colorHexWithHash: string,
  formatting: Formatting,
  rgbOptions: typeof rgbDefaults,
  rgbShadow?: number[],
): JsonExtra {
  let textVal = segment;
  if (formatting.font) {
    textVal = applyFont(textVal, formatting.font);
  }
  const charFormatting: JsonExtra = {
    text: textVal,
    color: colorHexWithHash,
  };
  if (formatting.bold) charFormatting.bold = true;
  if (formatting.italic) charFormatting.italic = true;
  if (formatting.underline) charFormatting.underlined = true;
  if (formatting.strikethrough) charFormatting.strikethrough = true;
  if (formatting.obfuscate) charFormatting.obfuscated = true;
  if (rgbShadow) charFormatting.shadow_color = normalizeShadowRGB(rgbShadow);
  return charFormatting;
}
