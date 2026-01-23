import type { rgbPreset } from '.';
import { getDB, presets, users, savedPresets, PublicPresetWithUser } from '../../db';
import { isNotNull, eq } from 'drizzle-orm';
import {
  hexToOklab,
  interpolateColor,
  vectorDistance,
} from '@birdflop/rgbirdflop';

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

export interface SimilarPreset extends PublicPresetWithUser {
  distance: number;
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
          likes: existing.presets.likes,
          dislikes: existing.presets.dislikes,
          saves: existing.presets.saves,
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
