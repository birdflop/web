import { server$ } from "@qwik.dev/router";
import { getDB, presets, savedPresets } from "../db";
import { isNotNull, eq, sql } from "drizzle-orm";

export const backfillPresetSaves = server$(async function () {
  const logs: string[] = [];
  try {
    const db = getDB();
    if (!db) {
      return { success: false, error: "Database not available", logs };
    }

    // Fetch all published presets with save counts
    const allPresets = await db
      .select({
        id: presets.id,
        name: presets.name,
        saveCount: sql<number>`COUNT(${savedPresets.presetId})`.as("saveCount"),
      })
      .from(presets)
      .where(isNotNull(presets.id))
      .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
      .groupBy(presets.id, savedPresets.presetId);

    let updatedCount = 0;
    for (const preset of allPresets) {
      const logMsg = `Updated preset ${preset.id} (${preset.name}) to have ${preset.saveCount} saves`;
      console.log(logMsg);
      logs.push(logMsg);
      await db
        .update(presets)
        .set({ saves: preset.saveCount })
        .where(eq(presets.id, preset.id));
      updatedCount++;
    }

    logs.push(`Saves backfill complete: ${updatedCount} presets updated.`);
    return { success: true, updated: updatedCount, logs };
  } catch (error) {
    console.error("Error during preset saves backfill:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      logs,
    };
  }
});
