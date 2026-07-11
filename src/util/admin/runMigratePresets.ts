import { server$ } from "@qwik.dev/router";
import { getDB, presets } from "../db";
import { loadPreset } from "../rgb/presets";
import { eq } from "drizzle-orm";

export const runMigratePresets = server$(async function () {
  const logs: string[] = [];
  try {
    const db = getDB();
    if (!db) {
      return { success: false, error: "Database not available", logs };
    }

    const allPresets = await db.select().from(presets);
    let updatedCount = 0;
    const errors: { id: number; error: string }[] = [];

    for (const p of allPresets) {
      try {
        const originalString = JSON.stringify(p.preset);
        const migrated = loadPreset(originalString);
        const migratedString = JSON.stringify(migrated);

        if (originalString !== migratedString) {
          await db
            .update(presets)
            .set({ preset: migrated })
            .where(eq(presets.id, p.id));
          updatedCount++;
          const logMsg = `Migrated preset ${p.id} (${p.name}) to new version`;
          console.log(logMsg);
          logs.push(logMsg);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        errors.push({ id: p.id, error: errMsg });
        logs.push(`Error migrating preset ${p.id} (${p.name}): ${errMsg}`);
      }
    }

    logs.push(`Version migration complete: ${updatedCount} presets migrated.`);
    return {
      success: true,
      updated: updatedCount,
      errors,
      logs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      logs,
    };
  }
});
