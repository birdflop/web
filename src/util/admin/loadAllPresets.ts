import { server$ } from "@qwik.dev/router";
import { getDB, presets, users } from "../db";
import { isNotNull, eq } from "drizzle-orm";

export const loadAllPresets = server$(async function () {
  try {
    const db = getDB();
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    // Fetch all published presets with vectors
    const allPresets = await db
      .select({
        presets,
        user: users,
      })
      .from(presets)
      .where(isNotNull(presets.colorVector))
      .leftJoin(users, eq(users.id, presets.userId))
      .groupBy(presets.id, users.id);

    const formattedPresets = allPresets.map((p) => ({
      id: p.presets.id,
      name: p.presets.name,
      preset: p.presets.preset,
      author: p.presets.author,
      userId: p.presets.userId,
      user: p.user,
      description: p.presets.description,
      createdAt: new Date(p.presets.createdAt).toISOString(),
      pending: p.presets.pending,
      saves: p.presets.saves,
      colorVector: p.presets.colorVector,
    }));

    return {
      success: true,
      presets: formattedPresets,
      count: formattedPresets.length,
    };
  } catch (error) {
    console.error("Error loading presets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
