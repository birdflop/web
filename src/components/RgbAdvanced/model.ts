import { colorFormats, rgbDefaults, sortColors } from '@birdflop/rgbirdflop';
import type { ColorStop, GradientType } from '@birdflop/rgbirdflop';

/** The output format object shape (e.g. MiniMessage, &#$1$2..$c, §x..). */
export type Fmt = (typeof colorFormats)[number];

export type ColorMode = 'gradient' | 'solid' | 'none';

export type FormatFlag = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'obfuscate';

/** Per-character style. A run of characters sharing the same style becomes one segment. */
export interface CharStyle {
  colorMode: ColorMode;
  colors: ColorStop[];
  gradientType: GradientType;
  colorlength: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  obfuscate: boolean;
}

export type StyleFlags = Pick<CharStyle, FormatFlag>;

export type AdvancedSegment = CharStyle & { text: string };

export interface AdvancedStore {
  version: number;
  segments: AdvancedSegment[];
  format: Fmt;
  prefixsuffix: string;
  customFormat: boolean;
  trimspaces: boolean;
  lowercase: boolean;
}

export interface FlatChar {
  ch: string;
  style: CharStyle;
}

export const ADVANCED_VERSION = 1;

export function defaultStyle(): CharStyle {
  return {
    colorMode: 'gradient',
    colors: [
      { hex: '#54daf4', pos: 0 },
      { hex: '#545eb6', pos: 100 },
    ],
    gradientType: 'rgb',
    colorlength: 1,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false,
  };
}

export const advancedDefaults: AdvancedStore = {
  version: ADVANCED_VERSION,
  segments: [{ ...defaultStyle(), text: 'Birdflop' }],
  format: colorFormats[1],
  prefixsuffix: '',
  customFormat: false,
  trimspaces: true,
  lowercase: false,
};

export function cloneStyle(s: CharStyle): CharStyle {
  return {
    colorMode: s.colorMode,
    colors: s.colors.map((c) => ({ ...c })),
    gradientType: s.gradientType,
    colorlength: s.colorlength,
    bold: s.bold,
    italic: s.italic,
    underline: s.underline,
    strikethrough: s.strikethrough,
    obfuscate: s.obfuscate,
  };
}

function extractStyle(seg: AdvancedSegment): CharStyle {
  return cloneStyle(seg);
}

/** Split text into chunks of `colorlength` codepoints (surrogate-safe). */
export function chunkText(text: string, colorlength?: number): string[] {
  let len = colorlength ?? 1;
  if (!len || len < 1) len = 1;
  const out: string[] = [];
  const arr = Array.from(text);
  for (let i = 0; i < arr.length; i += len) out.push(arr.slice(i, i + len).join(''));
  return out;
}

/**
 * A stable key identifying "characters that render identically". Two adjacent
 * chars with equal keys are merged into one segment. Colors are normalized
 * (sorted, rounded, lowercased) so representation differences don't fragment
 * segments; uncolored ignores color data entirely; solid keys only the first stop.
 */
export function styleKey(s: CharStyle): string {
  let colorPart: string;
  if (s.colorMode === 'none' || s.colors.length === 0) {
    colorPart = 'none';
  } else if (s.colorMode === 'solid') {
    colorPart = `solid:${(s.colors[0]?.hex ?? '').toLowerCase()}`;
  } else {
    const cols = sortColors(s.colors).map(
      (c) => `${c.hex.toLowerCase()}@${Math.round(c.pos * 1000) / 1000}`,
    );
    colorPart = `grad:${s.gradientType}:${s.colorlength}:${cols.join(',')}`;
  }
  return `${colorPart}|${+s.bold}${+s.italic}${+s.underline}${+s.strikethrough}${+s.obfuscate}`;
}

/** Flatten segments to per-(UTF-16)-char entries. Style refs are shared per source segment. */
export function flatten(segments: AdvancedSegment[]): FlatChar[] {
  const out: FlatChar[] = [];
  for (const seg of segments) {
    const style = extractStyle(seg);
    for (let i = 0; i < seg.text.length; i++) {
      out.push({ ch: seg.text[i], style });
    }
  }
  return out;
}

/** Coalesce consecutive equal-key chars back into segments. Idempotent normalization. */
export function regroup(chars: FlatChar[]): AdvancedSegment[] {
  if (chars.length === 0) return [];
  const segs: AdvancedSegment[] = [];
  let curKey: string | null = null;
  let cur: AdvancedSegment | null = null;
  for (const { ch, style } of chars) {
    const k = styleKey(style);
    if (cur === null || k !== curKey) {
      cur = { ...cloneStyle(style), text: '' };
      segs.push(cur);
      curKey = k;
    }
    cur.text += ch;
  }
  return segs;
}

export function normalizeSegments(segments: AdvancedSegment[]): AdvancedSegment[] {
  return regroup(flatten(segments));
}

export function combinedText(segments: AdvancedSegment[]): string {
  return segments.map((s) => s.text).join('');
}

/**
 * Reconcile a raw text edit (from the overlay textarea) onto the segment model.
 * Uses a common prefix/suffix diff on UTF-16 strings (matching textarea offsets).
 * Inserted chars inherit the style of the char before the edit (or after, or default).
 */
export function applyTextDiff(segments: AdvancedSegment[], newText: string): AdvancedSegment[] {
  const oldChars = flatten(segments);
  const oldText = oldChars.map((c) => c.ch).join('');
  if (newText === oldText) return segments;

  const oldLen = oldText.length;
  const newLen = newText.length;

  let p = 0;
  const maxP = Math.min(oldLen, newLen);
  while (p < maxP && oldText[p] === newText[p]) p++;

  let s = 0;
  while (
    s < Math.min(oldLen, newLen) - p &&
    oldText[oldLen - 1 - s] === newText[newLen - 1 - s]
  ) {
    s++;
  }

  const removedCount = oldLen - p - s;
  const inserted = newText.slice(p, newLen - s);

  const inheritStyle =
    p > 0
      ? cloneStyle(oldChars[p - 1].style)
      : oldChars.length > p
        ? cloneStyle(oldChars[p].style)
        : defaultStyle();

  const insertedChars: FlatChar[] = [];
  for (let i = 0; i < inserted.length; i++) {
    insertedChars.push({ ch: inserted[i], style: inheritStyle });
  }

  const next = [
    ...oldChars.slice(0, p),
    ...insertedChars,
    ...oldChars.slice(p + removedCount),
  ];
  return regroup(next);
}

/** Apply a style mutation to every char in [start, end). Clones on write. */
export function applyStyleToRange(
  segments: AdvancedSegment[],
  start: number,
  end: number,
  mutate: (style: CharStyle) => void,
): AdvancedSegment[] {
  if (start >= end) return segments;
  const chars = flatten(segments);
  const lo = Math.max(0, start);
  const hi = Math.min(chars.length, end);
  if (lo >= hi) return segments;
  for (let i = lo; i < hi; i++) {
    const ns = cloneStyle(chars[i].style);
    mutate(ns);
    chars[i] = { ch: chars[i].ch, style: ns };
  }
  return regroup(chars);
}

/** Tri-state toggle of a format flag over a selection: ON if any char lacks it, else OFF. */
export function toggleFormat(
  segments: AdvancedSegment[],
  start: number,
  end: number,
  flag: FormatFlag,
): AdvancedSegment[] {
  if (start >= end) return segments;
  const chars = flatten(segments);
  const lo = Math.max(0, start);
  const hi = Math.min(chars.length, end);
  let anyOff = false;
  for (let i = lo; i < hi; i++) {
    if (!chars[i].style[flag]) {
      anyOff = true;
      break;
    }
  }
  return applyStyleToRange(segments, start, end, (st) => {
    st[flag] = anyOff;
  });
}

/** Which format flags are active across the ENTIRE selection (all chars have them). */
export function selectionFlags(
  segments: AdvancedSegment[],
  start: number,
  end: number,
): Record<FormatFlag, boolean> {
  const chars = flatten(segments);
  const lo = Math.max(0, start);
  const hi = Math.min(chars.length, end);
  const flags: FormatFlag[] = ['bold', 'italic', 'underline', 'strikethrough', 'obfuscate'];
  const res = {} as Record<FormatFlag, boolean>;
  for (const f of flags) {
    let all = hi > lo;
    for (let i = lo; i < hi; i++) {
      if (!chars[i].style[f]) {
        all = false;
        break;
      }
    }
    res[f] = all;
  }
  return res;
}

/** The char range [start, end) occupied by segment `index`. */
export function segmentRange(
  segments: AdvancedSegment[],
  index: number,
): { start: number; end: number } {
  let start = 0;
  for (let i = 0; i < index && i < segments.length; i++) start += segments[i].text.length;
  const end = start + (segments[index]?.text.length ?? 0);
  return { start, end };
}

/** Index of the segment containing flat char `charIndex`. */
export function segmentIndexAtChar(segments: AdvancedSegment[], charIndex: number): number {
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    acc += segments[i].text.length;
    if (charIndex < acc) return i;
  }
  return Math.max(0, segments.length - 1);
}

/** A clone of the style at flat char `charIndex` (or null). */
export function styleAtChar(segments: AdvancedSegment[], charIndex: number): CharStyle | null {
  const chars = flatten(segments);
  const c = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];
  return c ? cloneStyle(c.style) : null;
}

/** Swap two segments (reorders the text), then normalize. */
export function swapSegments(segments: AdvancedSegment[], i: number, j: number): AdvancedSegment[] {
  if (i < 0 || j < 0 || i >= segments.length || j >= segments.length || i === j) return segments;
  const arr = segments.map((seg) => ({ ...cloneStyle(seg), text: seg.text }));
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return normalizeSegments(arr);
}

/** Remove a segment's characters entirely. */
export function deleteSegment(segments: AdvancedSegment[], index: number): AdvancedSegment[] {
  if (index < 0 || index >= segments.length) return segments;
  const { start, end } = segmentRange(segments, index);
  const chars = flatten(segments);
  chars.splice(start, end - start);
  return regroup(chars);
}

/** Merge a segment with its neighbor by adopting the neighbor's style (then coalesce). */
export function mergeWithNeighbor(
  segments: AdvancedSegment[],
  index: number,
  direction: -1 | 1,
): AdvancedSegment[] {
  const neighbor = index + direction;
  if (neighbor < 0 || neighbor >= segments.length) return segments;
  const styleSrc = cloneStyle(segments[neighbor]);
  const { start, end } = segmentRange(segments, index);
  return applyStyleToRange(segments, start, end, (st) => {
    Object.assign(st, cloneStyle(styleSrc));
  });
}

/** Seed a one-segment advanced store from the classic `rgb` cookie/state. */
export function seedFromClassic(rgb: Partial<typeof rgbDefaults>): AdvancedStore {
  const merged = { ...rgbDefaults, ...rgb };
  const colorCount = merged.colors?.length ?? 0;
  const colorMode: ColorMode = colorCount >= 2 ? 'gradient' : colorCount === 1 ? 'solid' : 'none';
  return {
    version: ADVANCED_VERSION,
    segments: [
      {
        text: merged.text || 'Birdflop',
        colorMode,
        colors:
          merged.colors && merged.colors.length
            ? merged.colors.map((c) => ({ ...c }))
            : defaultStyle().colors,
        gradientType: merged.gradientType ?? 'rgb',
        colorlength: merged.colorlength ?? 1,
        bold: !!merged.bold,
        italic: !!merged.italic,
        underline: !!merged.underline,
        strikethrough: !!merged.strikethrough,
        obfuscate: !!merged.obfuscate,
      },
    ],
    format: merged.format ?? formats[1],
    prefixsuffix: merged.prefixsuffix ?? '',
    customFormat: !!merged.customFormat,
    trimspaces: merged.trimspaces ?? true,
    lowercase: !!merged.lowercase,
  };
}
