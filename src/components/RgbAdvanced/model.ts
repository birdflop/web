import { rgbDefaults, sortColors, rgbColorDefaultsWithColorMode, ColorMode } from '@birdflop/rgbirdflop';

export type SegmentType = typeof rgbColorDefaultsWithColorMode;

export interface FlatChar {
  ch: string;
  style: SegmentType;
}

export function cloneStyle(s: SegmentType): SegmentType {
  return {
    ...s,
    colors: [...s.colors],
  };
}

/** Split text into chunks of `colorLength` codepoints (surrogate-safe). */
export function chunkText(text: string, colorLength?: number): string[] {
  let len = colorLength ?? 1;
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
export function styleKey(s: SegmentType): string {
  let colorPart: string;
  if (s.colorMode === 'none' || s.colors.length === 0) {
    colorPart = 'none';
  } else if (s.colorMode === 'solid') {
    colorPart = `solid:${(s.colors[0]?.hex ?? '').toLowerCase()}`;
  } else {
    const cols = sortColors(s.colors).map(
      (c) => `${c.hex.toLowerCase()}@${Math.round(c.pos * 1000) / 1000}`,
    );
    colorPart = `grad:${s.gradientType}:${s.colorLength}:${cols.join(',')}`;
  }
  return colorPart;
}

/** Flatten segments to per-(UTF-16)-char entries. Style refs are shared per source segment. */
export function flatten(segments: SegmentType[]): FlatChar[] {
  const out: FlatChar[] = [];
  for (const seg of segments) {
    const style = cloneStyle(seg);
    for (let i = 0; i < seg.text.length; i++) {
      out.push({ ch: seg.text[i], style });
    }
  }
  return out;
}

/** Coalesce consecutive equal-key chars back into segments. Idempotent normalization. */
export function regroup(chars: FlatChar[]): SegmentType[] {
  if (chars.length === 0) return [];
  const segs: SegmentType[] = [];
  let curKey: string | null = null;
  let cur: SegmentType | null = null;
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

export function normalizeSegments(segments: SegmentType[]): SegmentType[] {
  return regroup(flatten(segments));
}

export function combinedText(segments: SegmentType[]): string {
  return segments.map((s) => s.text).join('');
}

/**
 * Reconcile a raw text edit (from the overlay textarea) onto the segment model.
 * Uses a common prefix/suffix diff on UTF-16 strings (matching textarea offsets).
 * Inserted chars inherit the style of the char before the edit (or after, or default).
 */
export function applyTextDiff(segments: SegmentType[], newText: string): SegmentType[] {
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
        : rgbColorDefaultsWithColorMode;

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
  segments: SegmentType[],
  start: number,
  end: number,
  mutate: (style: SegmentType) => void,
): SegmentType[] {
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

/** The char range [start, end) occupied by segment `index`. */
export function segmentRange(
  segments: SegmentType[],
  index: number,
): { start: number; end: number } {
  let start = 0;
  for (let i = 0; i < index && i < segments.length; i++) start += segments[i].text.length;
  const end = start + (segments[index]?.text.length ?? 0);
  return { start, end };
}

/** Index of the segment containing flat char `charIndex`. */
export function segmentIndexAtChar(segments: SegmentType[], charIndex: number): number {
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    acc += segments[i].text.length;
    if (charIndex < acc) return i;
  }
  return Math.max(0, segments.length - 1);
}

/** A clone of the style at flat char `charIndex` (or null). */
export function styleAtChar(segments: SegmentType[], charIndex: number): SegmentType | null {
  const chars = flatten(segments);
  const c = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];
  return c ? cloneStyle(c.style) : null;
}

/** Swap two segments (reorders the text), then normalize. */
export function swapSegments(segments: SegmentType[], i: number, j: number): SegmentType[] {
  if (i < 0 || j < 0 || i >= segments.length || j >= segments.length || i === j) return segments;
  const arr = segments.map((seg) => ({ ...cloneStyle(seg), text: seg.text }));
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return normalizeSegments(arr);
}

/** Remove a segment's characters entirely. */
export function deleteSegment(segments: SegmentType[], index: number): SegmentType[] {
  if (index < 0 || index >= segments.length) return segments;
  const { start, end } = segmentRange(segments, index);
  const chars = flatten(segments);
  chars.splice(start, end - start);
  return regroup(chars);
}

/** Merge a segment with its neighbor by adopting the neighbor's style (then coalesce). */
export function mergeWithNeighbor(
  segments: SegmentType[],
  index: number,
  direction: -1 | 1,
): SegmentType[] {
  const neighbor = index + direction;
  if (neighbor < 0 || neighbor >= segments.length) return segments;
  const styleSrc = cloneStyle(segments[neighbor]);
  const { start, end } = segmentRange(segments, index);
  return applyStyleToRange(segments, start, end, (st) => {
    Object.assign(st, cloneStyle(styleSrc));
  });
}

/** Seed a one-segment advanced store from the classic `rgb` cookie/state. */
export function seedFromClassic(rgb: Partial<typeof rgbDefaults>): (typeof rgbColorDefaultsWithColorMode)[] {
  const colorCount = rgb.colors?.length ?? 0;
  const colorMode: ColorMode = colorCount >= 2 ? 'gradient' : colorCount === 1 ? 'solid' : 'none';
  return [
    {
      ...rgbColorDefaultsWithColorMode,
      text: rgb.text || 'Birdflop',
      colorMode,
      colors:
        rgb.colors && rgb.colors.length
          ? rgb.colors.map((c) => ({ ...c }))
          : rgbColorDefaultsWithColorMode.colors,
      gradientType: rgb.gradientType ?? 'rgb',
      colorLength: rgb.colorLength ?? 1,
    },
  ];
}

export const advancedDefaults: SegmentType[] = seedFromClassic({});