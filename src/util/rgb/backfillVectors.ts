import { getDB, presets } from '../db';
import { presetToVector } from './vectorize';
import { eq } from 'drizzle-orm';

/**
 * Backfills colorVector (in OKLAB space) for all existing presets in the database
 * Run this after adding the colorVector column or changing the vectorization algorithm
 * to ensure all presets have up-to-date perceptually uniform vectors.
 *
 * @returns Object with success count and any errors encountered
 */
export async function backfillColorVectors(): Promise<{
  updated: number;
  errors: Array<{ id: number; error: string }>;
}> {
  const db = getDB();
  if (!db) {
    throw new Error('Database not available');
  }

  const errors: Array<{ id: number; error: string }> = [];
  let updated = 0;

  try {
    // Fetch all presets
    const allPresets = await db.select().from(presets);

    console.log(`Found ${allPresets.length} presets to process`);

    // Process each preset
    for (const preset of allPresets) {
      try {
        // Always regenerate to ensure vectors are in OKLAB space
        // (Old vectors may be in RGB space from previous implementation)
        // Generate vector from preset
        const vector = presetToVector(preset.preset);

        // Update the preset with the new vector
        await db
          .update(presets)
          .set({ colorVector: vector })
          .where(eq(presets.id, preset.id));

        updated++;
        console.log(`Updated preset ${preset.id} (${preset.name})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error processing preset ${preset.id}:`, errorMessage);
        errors.push({ id: preset.id, error: errorMessage });
      }
    }

    console.log(`\nBackfill complete: ${updated} presets updated, ${errors.length} errors`);

    return { updated, errors };
  } catch (error) {
    console.error('Fatal error during backfill:', error);
    throw error;
  }
}

/**
 * Regenerates the colorVector for a single preset
 * Useful when updating a preset or fixing individual vectors
 *
 * @param presetId - ID of the preset to update
 * @returns True if successful, false otherwise
 */
export async function regeneratePresetVector(presetId: number): Promise<boolean> {
  const db = getDB();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    // Fetch the preset
    const [preset] = await db
      .select()
      .from(presets)
      .where(eq(presets.id, presetId))
      .limit(1);

    if (!preset) {
      console.error(`Preset ${presetId} not found`);
      return false;
    }

    // Generate new vector
    const vector = presetToVector(preset.preset);

    // Update the preset
    await db
      .update(presets)
      .set({ colorVector: vector })
      .where(eq(presets.id, presetId));

    console.log(`Regenerated colorVector for preset ${presetId}`);
    return true;
  } catch (error) {
    console.error(`Error regenerating vector for preset ${presetId}:`, error);
    return false;
  }
}
