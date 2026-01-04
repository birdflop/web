import type { rgbPreset } from '.';
import { getDB, presets, users, savedPresets, type User } from '../../db';
import { isNotNull, eq, sql } from 'drizzle-orm';
import { hexToRGB } from '@birdflop/rgbirdflop';

interface OKLAB {
  L: number;
  a: number;
  b: number;
}

interface LinearRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts sRGB (0-1 range) to linear RGB
 * Applies inverse gamma correction
 */
function srgbToLinear(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear RGB (0-1 range) to sRGB
 * Applies gamma correction
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function linearToSrgb(channel: number): number {
  if (channel <= 0.0031308) {
    return channel * 12.92;
  }
  return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

/**
 * Converts linear RGB to OKLAB color space
 * Implementation from: https://bottosson.github.io/posts/oklab/
 * @param c - Linear RGB color (values in 0-1 range)
 * @returns OKLAB color
 */
function linearSrgbToOklab(c: LinearRGB): OKLAB {
  const l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  const m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  const s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

/**
 * Converts OKLAB to linear RGB color space
 * @param c - OKLAB color
 * @returns Linear RGB color (values in 0-1 range)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function oklabToLinearSrgb(c: OKLAB): LinearRGB {
  const l_ = c.L + 0.3963377774 * c.a + 0.2158037573 * c.b;
  const m_ = c.L - 0.1055613458 * c.a - 0.0638541728 * c.b;
  const s_ = c.L - 0.0894841775 * c.a - 1.2914855480 * c.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

/**
 * Converts hex color to OKLAB color space
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns OKLAB color
 */
function hexToOklab(hex: string): OKLAB {
  const [r, g, b] = hexToRGB(hex);

  // Convert from 0-255 to 0-1 range
  const srgb = {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };

  // Convert to linear RGB
  const linear = {
    r: srgbToLinear(srgb.r),
    g: srgbToLinear(srgb.g),
    b: srgbToLinear(srgb.b),
  };

  // Convert to OKLAB
  return linearSrgbToOklab(linear);
}

/**
 * Linearly interpolates between two OKLAB colors
 * @param color1 - First OKLAB color
 * @param color2 - Second OKLAB color
 * @param factor - Interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated OKLAB color
 */
export function interpolateColor(
  color1: OKLAB,
  color2: OKLAB,
  factor: number,
): OKLAB {
  return {
    L: color1.L + (color2.L - color1.L) * factor,
    a: color1.a + (color2.a - color1.a) * factor,
    b: color1.b + (color2.b - color1.b) * factor,
  };
}

/**
 * Converts a gradient preset to a 75-dimensional vector in OKLAB color space
 * Samples the gradient at 25 equally-spaced positions (0%, 4%, 8%, ..., 96%, 100%)
 * and returns a flat array of OKLAB values: [L0, a0, b0, L1, a1, b1, ..., L24, a24, b24]
 *
 * OKLAB is perceptually uniform, meaning equal distances in this space correspond to
 * equal perceived color differences. This makes Euclidean distance meaningful for
 * comparing gradient similarity.
 *
 * @param preset - RGB gradient preset with color stops
 * @returns Array of 75 numbers representing the gradient in OKLAB space
 */
export function presetToVector(preset: rgbPreset): number[] {
  const colors = preset.colors;

  // Handle edge cases
  if (!colors || colors.length === 0) {
    // Return vector of zeros for empty gradient
    return new Array(75).fill(0);
  }

  // Sort colors by position
  const sortedColors = [...colors].sort((a, b) => a.pos - b.pos);

  // Handle single color gradient
  if (sortedColors.length === 1) {
    const oklab = hexToOklab(sortedColors[0].hex);
    const singleColorVector: number[] = [];
    for (let i = 0; i < 25; i++) {
      singleColorVector.push(oklab.L, oklab.a, oklab.b);
    }
    return singleColorVector;
  }

  const vector: number[] = [];
  const numSamples = 25;

  // Sample at positions: 0, 4, 8, 12, ..., 96, 100
  for (let i = 0; i < numSamples; i++) {
    const position = (100 / (numSamples - 1)) * i; // 0, 4.166..., 8.333..., etc.

    // Find the two surrounding color stops
    let leftStop = sortedColors[0];
    let rightStop = sortedColors[sortedColors.length - 1];

    // Find the left stop (last color at or before position)
    for (let j = 0; j < sortedColors.length; j++) {
      if (sortedColors[j].pos <= position) {
        leftStop = sortedColors[j];
      } else {
        break;
      }
    }

    // Find the right stop (first color at or after position)
    for (let j = sortedColors.length - 1; j >= 0; j--) {
      if (sortedColors[j].pos >= position) {
        rightStop = sortedColors[j];
      } else {
        break;
      }
    }

    // If we're exactly at a color stop, use that color
    if (leftStop.pos === position) {
      const oklab = hexToOklab(leftStop.hex);
      vector.push(oklab.L, oklab.a, oklab.b);
    } else if (rightStop.pos === position) {
      const oklab = hexToOklab(rightStop.hex);
      vector.push(oklab.L, oklab.a, oklab.b);
    } else {
      // Interpolate between left and right stops in OKLAB space
      // This provides perceptually uniform gradients
      const leftOklab = hexToOklab(leftStop.hex);
      const rightOklab = hexToOklab(rightStop.hex);

      // Calculate interpolation factor
      const range = rightStop.pos - leftStop.pos;
      const factor = range > 0 ? (position - leftStop.pos) / range : 0;

      const interpolated = interpolateColor(leftOklab, rightOklab, factor);
      vector.push(interpolated.L, interpolated.a, interpolated.b);
    }
  }

  return vector;
}

/**
 * Calculates the Euclidean distance between two 75-dimensional vectors in OKLAB space
 * Because OKLAB is perceptually uniform, Euclidean distance directly corresponds to
 * perceived color difference, making this metric meaningful for gradient comparison.
 *
 * @param vec1 - First vector (75 numbers: L, a, b repeated 25 times)
 * @param vec2 - Second vector (75 numbers: L, a, b repeated 25 times)
 * @returns Euclidean distance between the vectors
 */
export function vectorDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error(`Vector length mismatch: ${vec1.length} vs ${vec2.length}`);
  }

  let sumSquares = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}

export interface SimilarPreset {
  id: number;
  name: string;
  distance: number;
  preset: rgbPreset;
  author: string;
  userId: string | null;
  user: User | null;
  description: string | null;
  createdAt: Date;
  pending: boolean;
  upvotes: number;
  downvotes: number;
  saveCount: number;
  colorVector?: number[] | null;
}

/**
 * Checks if a new preset is too similar to any existing presets in the database
 * @param newPreset - The preset to check for similarity
 * @param threshold - Maximum allowed distance in OKLAB space (default: 2.0). Lower = more strict.
 *                    Typical ranges: <1 = very similar, 1-3 = similar, >5 = quite different
 * @returns Object with isSimilar flag and array of similar presets if found
 */
export async function checkPresetSimilarity(
  newPreset: rgbPreset,
  threshold: number = 2.0,
): Promise<{ isSimilar: boolean; similarPresets: SimilarPreset[]; closestDistance?: number }> {
  try {
    const db = getDB();
    if (!db) {
      console.warn('Database not available for similarity check');
      return { isSimilar: false, similarPresets: [] };
    }

    // Generate vector for the new preset
    const newVector = presetToVector(newPreset);

    // Fetch all presets that have colorVectors with full data
    const existingPresets = await db
      .select({
        presets,
        user: users,
        saveCount: sql<number>`COUNT(${savedPresets.userId})`.as('saveCount'),
      })
      .from(presets)
      .where(isNotNull(presets.colorVector))
      .leftJoin(users, eq(users.id, presets.userId))
      .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
      .groupBy(presets.id, users.id);

    // Check distance against each existing preset and collect similar ones
    const similarPresets: SimilarPreset[] = [];
    let closestDistance: number | undefined;

    for (const existing of existingPresets) {
      if (!existing.presets.colorVector || !Array.isArray(existing.presets.colorVector)) {
        continue;
      }

      const distance = vectorDistance(newVector, existing.presets.colorVector);

      if (distance <= threshold) {
        similarPresets.push({
          id: existing.presets.id,
          name: existing.presets.name,
          distance: distance,
          preset: existing.presets.preset,
          author: existing.presets.author,
          userId: existing.presets.userId,
          user: existing.user,
          description: existing.presets.description,
          createdAt: new Date(existing.presets.createdAt),
          pending: existing.presets.pending,
          upvotes: existing.presets.upvotes,
          downvotes: existing.presets.downvotes,
          saveCount: existing.saveCount,
          colorVector: existing.presets.colorVector,
        });

        if (closestDistance === undefined || distance < closestDistance) {
          closestDistance = distance;
        }
      }
    }

    // Sort by distance (closest first)
    similarPresets.sort((a, b) => a.distance - b.distance);

    return {
      isSimilar: similarPresets.length > 0,
      similarPresets,
      closestDistance: closestDistance,
    };
  } catch (error) {
    console.error('Error checking preset similarity:', error);
    // Don't block submission if similarity check fails
    return { isSimilar: false, similarPresets: [] };
  }
}
