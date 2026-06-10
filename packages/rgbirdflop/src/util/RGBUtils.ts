import { ColorStop, rgbDefaults } from './Defaults';
import { hexToRGB, rgbToHex } from './Colors';
import { ColorGradient } from './ColorUtils';
import { RGBColorStop } from './ColorUtils/BaseGradient';

function segmentText(text: string, colorlength?: number): string[] {
  let len = colorlength ?? 1;
  if (!len || len < 1) len = 1;
  const out: string[] = [];
  const arr = Array.from(text);
  for (let i = 0; i < arr.length; i += len) out.push(arr.slice(i, i + len).join(''));
  return out;
}

function buildFormatCodes(rgbOptions: typeof rgbDefaults): string {
  let codes = '';
  if (rgbOptions.colorFormat.color.includes('$f') && rgbOptions.colorFormat.char) {
    if (rgbOptions.baseFormatting.bold) codes += rgbOptions.colorFormat.char + 'l';
    if (rgbOptions.baseFormatting.italic) codes += rgbOptions.colorFormat.char + 'o';
    if (rgbOptions.baseFormatting.underline) codes += rgbOptions.colorFormat.char + 'n';
    if (rgbOptions.baseFormatting.strikethrough) codes += rgbOptions.colorFormat.char + 'm';
    if (rgbOptions.baseFormatting.obfuscate) codes += rgbOptions.colorFormat.char + 'k';
  }
  return codes;
}

function renderTemplateSegment(hexWithoutHash: string, text: string, rgbOptions: typeof rgbDefaults): string {
  let out = rgbOptions.colorFormat.color;
  for (let n = 1; n <= 6; n++) out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(rgbOptions));
  if (rgbOptions.lowercase) out = out.toLowerCase();
  out = out.replace('$c', text);
  return out;
}

function applyWrappers(output: string, rgbOptions: typeof rgbDefaults): string {
  let out = output;
  if (rgbOptions.colorFormat.bold && rgbOptions.baseFormatting.bold) out = rgbOptions.colorFormat.bold.replace('$t', out);
  if (rgbOptions.colorFormat.italic && rgbOptions.baseFormatting.italic) out = rgbOptions.colorFormat.italic.replace('$t', out);
  if (rgbOptions.colorFormat.underline && rgbOptions.baseFormatting.underline) out = rgbOptions.colorFormat.underline.replace('$t', out);
  if (rgbOptions.colorFormat.strikethrough && rgbOptions.baseFormatting.strikethrough) out = rgbOptions.colorFormat.strikethrough.replace('$t', out);
  if (rgbOptions.colorFormat.obfuscate && rgbOptions.baseFormatting.obfuscate) out = rgbOptions.colorFormat.obfuscate.replace('$t', out);
  if (rgbOptions.prefixSuffix) out = rgbOptions.prefixSuffix.replace(/\$t/g, out);
  return out;
}

function normalizeShadowRGB(rgb: number[]): number[] {
  const norm = rgb.map(c => Math.round((c / 255) * 100) / 100);
  if (norm[3] === undefined) norm.push(1);
  return norm;
}

export function getShadowColors(rgbOptions: typeof rgbDefaults) {
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

function buildShadowContent(shadowSegments: ShadowSegment[], start: number, end: number): string {
  let currentHex: string | undefined;
  let currentOpacity: number | undefined;
  let buffer = '';
  let out = '';

  const flush = () => {
    if (!buffer || !currentHex) return;
    out += `<shadow:${currentHex}:${currentOpacity ?? 1}>${buffer}</shadow>`;
    buffer = '';
  };

  for (const seg of shadowSegments) {
    if (seg.end <= start || seg.start >= end) continue;

    const sliceStart = Math.max(start, seg.start) - seg.start;
    const sliceEnd = Math.min(end, seg.end) - seg.start;
    const slice = seg.text.slice(sliceStart, sliceEnd);
    if (!slice) continue;

    if (currentHex && (currentHex !== seg.hex || currentOpacity !== seg.opacity)) flush();

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
  const shadowColors = rgbOptions.shadowColors ? sortColors(rgbOptions.shadowColors) : null;

  if (colors.length === 1) {
    if (rgbOptions.colorFormat.color === 'MiniMessage') {
      const single = renderMiniMessageGradient(colors, rgbOptions, shadowColors);
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

type JsonOutput = {
  text: string;
  extra: JsonExtra[];
};

function renderSingleColorOutput(singleHex: string, rgbOptions: typeof rgbDefaults): string {
  if (rgbOptions.colorFormat.color === 'MiniMessage') {
    return `<color:${singleHex}>${rgbOptions.text}</color>`;
  }

  if (rgbOptions.colorFormat.color === 'JSON') {
    const jsonOutput: JsonOutput = { text: '', extra: [] };

    let shadowGradient: ColorGradient | undefined;
    if (rgbOptions.shadowColors) {
      const shadowColors = rgbOptions.shadowColors.map(getRGBColorStop);
      shadowGradient = new ColorGradient(
        shadowColors,
        rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
        rgbOptions.gradientType,
      );
    }

    const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);
    for (const segment of segments) {
      if (rgbOptions.trimSpaces && segment.trim() === '') {
        jsonOutput.extra.push({ text: segment });
        continue;
      }

      const jsonExtra = buildJsonFormatting(segment, singleHex, rgbOptions, shadowGradient?.next());
      jsonOutput.extra.push(jsonExtra);
    }

    return JSON.stringify(jsonOutput);
  }

  if (rgbOptions.trimSpaces && rgbOptions.text.trim() === '') return rgbOptions.text;
  const hex = singleHex.replace(/^#/, '');
  return renderTemplateSegment(hex, rgbOptions.text, rgbOptions);
}

function renderMiniMessageGradient(
  colors: ColorStop[],
  rgbOptions: typeof rgbDefaults,
  shadowColors: ColorStop[] | null,
): string {
  const shadowSegments = (shadowColors && shadowColors.length > 0)
    ? buildShadowSegments(rgbOptions, shadowColors)
    : undefined;

  const buildShadowRange = (start: number, end: number) => {
    if (!shadowSegments || !shadowSegments.length) return rgbOptions.text.substring(start, end);
    return buildShadowContent(shadowSegments, start, end) || rgbOptions.text.substring(start, end);
  };

  const renderUnevenGradient = (text: string) => {
    // todo: make an iseven function to avoid math.random issues
    const even = !colors.find((color, i) => {
      return color.pos != Math.round((100 / (colors.length - 1)) * i * 1000) / 1000;
    });
    if (even) return null;

    const copy = [...colors];
    if (copy[0].pos !== 0) copy.unshift({ ...copy[0], pos: 0 });
    if (copy[copy.length - 1].pos !== 100) copy.push({ ...copy[copy.length - 1], pos: 100 });

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

  const hexes = colors.map(c => c.hex).join(':');
  const inner = buildShadowRange(0, rgbOptions.text.length);
  return `<gradient:${hexes}>${inner}</gradient>`;
}

function renderJsonGradient(colors: ColorStop[], rgbOptions: typeof rgbDefaults): string {
  const newColors = colors.map(getRGBColorStop);
  if (newColors.length < 1) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
    rgbOptions.gradientType,
  );
  let shadowGradient: ColorGradient | undefined;
  if (rgbOptions.shadowColors) {
    const shadowColors = rgbOptions.shadowColors.map(getRGBColorStop);
    shadowGradient = new ColorGradient(
      shadowColors,
      rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
      rgbOptions.gradientType,
    );
  }

  const jsonOutput: JsonOutput = { text: '', extra: [] };
  const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);

  for (const segment of segments) {
    const rgb = gradient.next();
    const rgbShadow = shadowGradient ? shadowGradient.next() : undefined;

    if (rgbOptions.trimSpaces && segment.trim() === '') {
      jsonOutput.extra.push({ text: segment });
      continue;
    }

    const colorHexWithHash = '#' + rgbToHex(rgb);
    const jsonExtra = buildJsonFormatting(segment, colorHexWithHash, rgbOptions, rgbShadow);
    jsonOutput.extra.push(jsonExtra);
  }

  return JSON.stringify(jsonOutput);
}

function renderTemplateGradient(colors: ColorStop[], rgbOptions: typeof rgbDefaults): string {
  const newColors = colors.map(getRGBColorStop);
  if (newColors.length === 0) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbOptions.text.length / (rgbOptions.colorLength ?? 1),
    rgbOptions.gradientType,
  );
  const segments = segmentText(rgbOptions.text, rgbOptions.colorLength);

  let out = '';
  for (const segment of segments) {
    if (rgbOptions.trimSpaces && segment.trim() === '') {
      out += segment;
      gradient.next();
      continue;
    }

    const hex = rgbToHex(gradient.next());
    out += renderTemplateSegment(hex, segment, rgbOptions);
  }
  return out;
}

function buildJsonFormatting(
  segment: string,
  colorHexWithHash: string,
  rgbOptions: typeof rgbDefaults,
  rgbShadow?: number[],
): JsonExtra {
  const charFormatting: JsonExtra = {
    text: segment,
    color: colorHexWithHash,
  };
  if (rgbOptions.baseFormatting.bold) charFormatting.bold = true;
  if (rgbOptions.baseFormatting.italic) charFormatting.italic = true;
  if (rgbOptions.baseFormatting.underline) charFormatting.underlined = true;
  if (rgbOptions.baseFormatting.strikethrough) charFormatting.strikethrough = true;
  if (rgbOptions.baseFormatting.obfuscate) charFormatting.obfuscated = true;
  if (rgbShadow) charFormatting.shadow_color = normalizeShadowRGB(rgbShadow);
  return charFormatting;
}