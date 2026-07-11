import { server$ } from '@builder.io/qwik-city';
import { getDB, presets } from '../db';
import { presetToVector } from '../rgb/presets/vectorize';
import { eq } from 'drizzle-orm';

/**
 * Backfills colorVector (in OKLAB space) for all existing presets in the database
 * Run this after adding the colorVector column or changing the vectorization algorithm
 * to ensure all presets have up-to-date perceptually uniform vectors.
 *
 * @returns Object with success count and any errors encountered
 */
export const backfillColorVectors = server$(async function () {
  const logs: string[] = [];
  try {
    const db = getDB();
    if (!db) {
      return { success: false, error: 'Database not available', logs };
    }

    const errors: Array<{ id: number; error: string }> = [];
    let updated = 0;

    // Fetch all presets
    const allPresets = await db.select().from(presets);

    const startMsg = `Found ${allPresets.length} presets to process`;
    console.log(startMsg);
    logs.push(startMsg);

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
        const logMsg = `Updated preset ${preset.id} (${preset.name})`;
        console.log(logMsg);
        logs.push(logMsg);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errLog = `Error processing preset ${preset.id}: ${errorMessage}`;
        console.error(errLog);
        logs.push(errLog);
        errors.push({ id: preset.id, error: errorMessage });
      }
    }

    const summaryMsg = `Backfill complete: ${updated} presets updated, ${errors.length} errors`;
    console.log(`\n${summaryMsg}`);
    logs.push(summaryMsg);

    return {
      success: true,
      updated,
      errors,
      logs,
    };
  } catch (error) {
    console.error('Fatal error during backfill:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs,
    };
  }
});

/**
 * Regenerates the colorVector for a single preset
 * Useful when updating a preset or fixing individual vectors
 *
 * @param presetId - ID of the preset to update
 * @returns True if successful, false otherwise
 */
export async function regeneratePresetVector(
  presetId: number,
): Promise<boolean> {
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
