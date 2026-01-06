import { rgbDefaults } from './Defaults';
import { hexToRGB, rgbToHex } from './Colors';
import { ColorGradient, GradientType } from './ColorUtils';

function segmentText(text: string, colorlength?: number): string[] {
  let len = colorlength ?? 1;
  if (!len || len < 1) len = 1;
  const out: string[] = [];
  const arr = Array.from(text);
  for (let i = 0; i < arr.length; i += len) out.push(arr.slice(i, i + len).join(''));
  return out;
}

function buildFormatCodes(rgbStore: typeof rgbDefaults): string {
  let codes = '';
  if (rgbStore.format.color.includes('$f') && rgbStore.format.char) {
    if (rgbStore.bold) codes += rgbStore.format.char + 'l';
    if (rgbStore.italic) codes += rgbStore.format.char + 'o';
    if (rgbStore.underline) codes += rgbStore.format.char + 'n';
    if (rgbStore.strikethrough) codes += rgbStore.format.char + 'm';
    if (rgbStore.obfuscate) codes += rgbStore.format.char + 'k';
  }
  return codes;
}

function renderTemplateSegment(hexWithoutHash: string, text: string, rgbStore: typeof rgbDefaults): string {
  let out = rgbStore.format.color;
  for (let n = 1; n <= 6; n++) out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(rgbStore));
  if (rgbStore.lowercase) out = out.toLowerCase();
  out = out.replace('$c', text);
  return out;
}

function applyWrappers(output: string, rgbStore: typeof rgbDefaults): string {
  let out = output;
  if (rgbStore.format.bold && rgbStore.bold) out = rgbStore.format.bold.replace('$t', out);
  if (rgbStore.format.italic && rgbStore.italic) out = rgbStore.format.italic.replace('$t', out);
  if (rgbStore.format.underline && rgbStore.underline) out = rgbStore.format.underline.replace('$t', out);
  if (rgbStore.format.strikethrough && rgbStore.strikethrough) out = rgbStore.format.strikethrough.replace('$t', out);
  if (rgbStore.format.obfuscate && rgbStore.obfuscate) out = rgbStore.format.obfuscate.replace('$t', out);
  if (rgbStore.prefixsuffix) out = rgbStore.prefixsuffix.replace(/\$t/g, out);
  return out;
}

function normalizeShadowRGB(rgb: number[]): number[] {
  const norm = rgb.map(c => Math.round((c / 255) * 100) / 100);
  norm.push(1);
  return norm;
}

export function getShadowColors(rgbStore: typeof rgbDefaults): { hex: string; pos: number }[] {
  if (!rgbStore.shadowcolors) {
    return rgbStore.colors.map((color) => {
      const shadowRGB = hexToRGB(color.hex).map((c) => c * 0.25);
      return { hex: `#${rgbToHex(shadowRGB)}`, pos: color.pos };
    });
  }
  return rgbStore.shadowcolors.map((color) => ({ hex: color.hex, pos: color.pos }));
}

type ShadowSegment = {
  text: string;
  hex: string;
  start: number;
  end: number;
};

function buildShadowSegments(
  rgbStore: typeof rgbDefaults,
  shadowColors: { hex: string; pos: number }[],
): ShadowSegment[] {
  const segments = segmentText(rgbStore.text, rgbStore.colorlength);
  if (!segments.length) return [];

  const shadowGradient = new ColorGradient(
    shadowColors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos })),
    segments.length,
    rgbStore.gradientType as GradientType,
  );

  let cursor = 0;
  return segments.map((text) => {
    const start = cursor;
    const end = cursor + text.length;
    cursor = end;
    return {
      text,
      start,
      end,
      hex: `#${rgbToHex(shadowGradient.next())}`,
    };
  });
}

function buildShadowContent(shadowSegments: ShadowSegment[], start: number, end: number): string {
  let currentHex: string | undefined;
  let buffer = '';
  let out = '';

  const flush = () => {
    if (!buffer || !currentHex) return;
    out += `<shadow:${currentHex}:1>${buffer}</shadow>`;
    buffer = '';
  };

  for (const seg of shadowSegments) {
    if (seg.end <= start || seg.start >= end) continue;

    const sliceStart = Math.max(start, seg.start) - seg.start;
    const sliceEnd = Math.min(end, seg.end) - seg.start;
    const slice = seg.text.slice(sliceStart, sliceEnd);
    if (!slice) continue;

    if (currentHex && currentHex !== seg.hex) flush();

    currentHex = seg.hex;
    buffer += slice;
  }

  flush();
  return out;
}

export function disperseColors(colors: typeof rgbDefaults.colors) {
  if (colors.length <= 1) {
    return colors.slice(0).map((color) => ({ hex: color.hex, pos: 0 }));
  }
  const pos = 100 / (colors.length - 1);
  const newColors = colors.slice(0).map((color, i) => ({
    hex: color.hex,
    pos: Math.round(pos * i * 1000) / 1000,
  }));
  return newColors;
}

export function sortColors(colors: { hex: string, pos: number }[]) {
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

export function generateOutput(rgbStore: typeof rgbDefaults) {
  const colors = sortColors(rgbStore.colors);
  const shadowColors = rgbStore.shadowcolors ? sortColors(rgbStore.shadowcolors) : undefined;

  if (colors.length === 1) {
    if (rgbStore.format.color === 'MiniMessage') {
      const single = renderMiniMessageGradient(colors, rgbStore, shadowColors);
      return applyWrappers(single, rgbStore);
    }

    const single = renderSingleColorOutput(colors[0].hex, rgbStore);
    return applyWrappers(single, rgbStore);
  }

  let output = '';
  if (rgbStore.format.color === 'MiniMessage') {
    output = renderMiniMessageGradient(colors, rgbStore, shadowColors);
  } else if (rgbStore.format.color === 'JSON') {
    output = renderJsonGradient(colors, rgbStore);
  } else {
    output = renderTemplateGradient(colors, rgbStore);
  }

  return applyWrappers(output, rgbStore);
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

function renderSingleColorOutput(singleHex: string, rgbStore: typeof rgbDefaults): string {
  if (rgbStore.format.color === 'MiniMessage') {
    return `<color:${singleHex}>${rgbStore.text}</color>`;
  }

  if (rgbStore.format.color === 'JSON') {
    const jsonOutput: JsonOutput = { text: '', extra: [] };

    let shadowGradient: ColorGradient | undefined;
    if (rgbStore.shadowcolors) {
      const shadowColors = rgbStore.shadowcolors.map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
      shadowGradient = new ColorGradient(
        shadowColors,
        rgbStore.text.length / (rgbStore.colorlength ?? 1),
        rgbStore.gradientType as GradientType,
      );
    }

    const segments = segmentText(rgbStore.text, rgbStore.colorlength);
    for (const segment of segments) {
      if (rgbStore.trimspaces && segment.trim() === '') {
        jsonOutput.extra.push({ text: segment });
        continue;
      }

      const jsonExtra = buildJsonFormatting(segment, singleHex, rgbStore, shadowGradient?.next());
      jsonOutput.extra.push(jsonExtra);
    }

    return JSON.stringify(jsonOutput);
  }

  if (rgbStore.trimspaces && rgbStore.text.trim() === '') return rgbStore.text;
  const hex = singleHex.replace(/^#/, '');
  return renderTemplateSegment(hex, rgbStore.text, rgbStore);
}

function renderMiniMessageGradient(
  colors: { hex: string; pos: number }[],
  rgbStore: typeof rgbDefaults,
  shadowColors: { hex: string; pos: number }[] = [],
): string {
  const shadowSegments = (shadowColors.length > 0)
    ? buildShadowSegments(rgbStore, shadowColors)
    : undefined;

  const buildShadowRange = (start: number, end: number) => {
    if (!shadowSegments || !shadowSegments.length) return rgbStore.text.substring(start, end);
    return buildShadowContent(shadowSegments, start, end) || rgbStore.text.substring(start, end);
  };

  const renderUnevenGradient = (text: string) => {
    const uneven = colors.find((color, i) => color.pos != (100 / (colors.length - 1)) * i);
    if (!uneven) return null;

    const copy = [...colors];
    if (copy[0].pos !== 0) copy.unshift({ hex: copy[0].hex, pos: 0 });
    if (copy[copy.length - 1].pos !== 100) copy.push({ hex: copy[copy.length - 1].hex, pos: 100 });

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
    const inner = buildShadowRange(0, rgbStore.text.length);
    return `<color:${colors[0].hex}>${inner}</color>`;
  }

  const unevenOut = renderUnevenGradient(rgbStore.text);
  if (unevenOut !== null) return unevenOut;

  const hexes = colors.map(c => c.hex).join(':');
  const inner = buildShadowRange(0, rgbStore.text.length);
  return `<gradient:${hexes}>${inner}</gradient>`;
}

function renderJsonGradient(colors: { hex: string; pos: number }[], rgbStore: typeof rgbDefaults): string {
  const newColors = colors.map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
  if (newColors.length < 1) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbStore.text.length / (rgbStore.colorlength ?? 1),
    rgbStore.gradientType as GradientType,
  );
  let shadowGradient: ColorGradient | undefined;
  if (rgbStore.shadowcolors) {
    const shadowColors = rgbStore.shadowcolors.map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
    shadowGradient = new ColorGradient(
      shadowColors,
      rgbStore.text.length / (rgbStore.colorlength ?? 1),
      rgbStore.gradientType as GradientType,
    );
  }

  const jsonOutput: JsonOutput = { text: '', extra: [] };
  const segments = segmentText(rgbStore.text, rgbStore.colorlength);

  for (const segment of segments) {
    const rgb = gradient.next();
    const rgbShadow = shadowGradient ? shadowGradient.next() : undefined;

    if (rgbStore.trimspaces && segment.trim() === '') {
      jsonOutput.extra.push({ text: segment });
      continue;
    }

    const colorHexWithHash = '#' + rgbToHex(rgb);
    const jsonExtra = buildJsonFormatting(segment, colorHexWithHash, rgbStore, rgbShadow);
    jsonOutput.extra.push(jsonExtra);
  }

  return JSON.stringify(jsonOutput);
}

function renderTemplateGradient(colors: { hex: string; pos: number }[], rgbStore: typeof rgbDefaults): string {
  const newColors = colors.map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
  if (newColors.length === 0) return 'Error: Not enough colors.';

  const gradient = new ColorGradient(
    newColors,
    rgbStore.text.length / (rgbStore.colorlength ?? 1),
    rgbStore.gradientType as GradientType,
  );
  const segments = segmentText(rgbStore.text, rgbStore.colorlength);

  let out = '';
  for (const segment of segments) {
    if (rgbStore.trimspaces && segment.trim() === '') {
      out += segment;
      gradient.next();
      continue;
    }

    const hex = rgbToHex(gradient.next());
    out += renderTemplateSegment(hex, segment, rgbStore);
  }
  return out;
}

function buildJsonFormatting(
  segment: string,
  colorHexWithHash: string,
  rgbStore: typeof rgbDefaults,
  rgbShadow?: number[],
): JsonExtra {
  const charFormatting: JsonExtra = {
    text: segment,
    color: colorHexWithHash,
  };
  if (rgbStore.bold) charFormatting.bold = true;
  if (rgbStore.italic) charFormatting.italic = true;
  if (rgbStore.underline) charFormatting.underlined = true;
  if (rgbStore.strikethrough) charFormatting.strikethrough = true;
  if (rgbStore.obfuscate) charFormatting.obfuscated = true;
  if (rgbShadow) charFormatting.shadow_color = normalizeShadowRGB(rgbShadow);
  return charFormatting;
}