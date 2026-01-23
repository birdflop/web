import { component$, useSignal, $, useContextProvider } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { useSession } from '~/routes/plugin@auth';
import { backfillColorVectors } from '~/util/rgb/presets/backfillVectors';
import { getDB, presets, users, savedPresets } from '~/util/db';
import { isNotNull, eq } from 'drizzle-orm';
import { vectorDistance } from '@birdflop/rgbirdflop';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';

export const useAdminCheck = routeLoader$(async function({ redirect, env, sharedMap }) {
  const session = sharedMap.get('session');
  const admins = env.get('ADMINS')?.split(',').map(id => id.trim()) || [];

  if (!session?.user?.id || !admins.includes(session.user.id)) {
    throw redirect(302, '/');
  }

  await Promise.resolve(); // Satisfy async requirement

  return { isAdmin: true };
});

export const runBackfillVectors = server$(async function() {
  const session = this.sharedMap.get('session');
  const admins = this.env.get('ADMINS')?.split(',').map(id => id.trim()) || [];

  if (!session?.user?.id || !admins.includes(session.user.id)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await backfillColorVectors();
    return {
      success: true,
      updated: result.updated,
      errors: result.errors,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

export const loadAllPresets = server$(async function() {
  const session = this.sharedMap.get('session');
  const admins = this.env.get('ADMINS')?.split(',').map(id => id.trim()) || [];

  if (!session?.user?.id || !admins.includes(session.user.id)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const db = getDB();
    if (!db) {
      return { success: false, error: 'Database not available' };
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
      .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
      .groupBy(presets.id, users.id);

    const formattedPresets = allPresets.map(p => ({
      id: p.presets.id,
      name: p.presets.name,
      preset: p.presets.preset,
      author: p.presets.author,
      userId: p.presets.userId,
      user: p.user,
      description: p.presets.description,
      createdAt: new Date(p.presets.createdAt).toISOString(),
      pending: p.presets.pending,
      likes: p.presets.likes,
      dislikes: p.presets.dislikes,
      saves: p.presets.saves,
      colorVector: p.presets.colorVector,
    }));

    return {
      success: true,
      presets: formattedPresets,
      count: formattedPresets.length,
    };
  } catch (error) {
    console.error('Error loading presets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

export default component$(() => {
  const session = useSession();
  useAdminCheck();

  // Provide contexts for PresetPreview (empty since admin doesn't need these features)
  const privatePresets = useSignal([]);
  const savedPresets = useSignal([]);
  useContextProvider(privatePresetsContext, privatePresets);
  useContextProvider(savedPresetsContext, savedPresets);

  const isRunning = useSignal(false);
  const result = useSignal<string>('');

  const isCheckingSimilar = useSignal(false);
  const similarThreshold = useSignal(2.0);
  const similarResults = useSignal<any>(null);
  const loadedPresets = useSignal<any[]>([]);
  const isLoadingPresets = useSignal(false);
  const loadedAt = useSignal<Date | null>(null);

  const handleBackfill = $(async () => {
    isRunning.value = true;
    result.value = 'Running backfill...';

    try {
      const response = await runBackfillVectors();

      if (response.success) {
        result.value = `Success! Updated ${response.updated} presets.`;
        if (response.errors && response.errors.length > 0) {
          result.value += `\n\nErrors (${response.errors.length}):\n`;
          response.errors.forEach(err => {
            result.value += `  - Preset ${err.id}: ${err.error}\n`;
          });
        }
      } else {
        result.value = `Error: ${response.error}`;
      }
    } catch (error) {
      result.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    isRunning.value = false;
  });

  const handleLoadPresets = $(async () => {
    isLoadingPresets.value = true;
    similarResults.value = null;

    try {
      const response = await loadAllPresets();

      if (response.success && response.presets) {
        loadedPresets.value = response.presets;
        loadedAt.value = new Date();
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    isLoadingPresets.value = false;
  });

  const handleFindSimilar = $(async () => {
    if (loadedPresets.value.length === 0) {
      alert('Please load presets first');
      return;
    }

    // Reset to a clear state object to force UI update
    similarResults.value = {
      success: true,
      totalPresets: 0,
      groupCount: 0,
      groups: [],
      threshold: 0,
      pairsChecked: 0,
      pairsGrouped: 0,
    };

    isCheckingSimilar.value = true;

    // Small delay to ensure UI clears
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const threshold = similarThreshold.value;
      console.log('Using threshold:', threshold);
      const allPresets = loadedPresets.value;

      // Find all pairs within threshold
      let pairsChecked = 0;
      let pairsGrouped = 0;
      const similarPairs: { id1: number; id2: number; distance: number }[] = [];

      for (let i = 0; i < allPresets.length; i++) {
        for (let j = i + 1; j < allPresets.length; j++) {
          const preset1 = allPresets[i];
          const preset2 = allPresets[j];

          if (preset1.colorVector && preset2.colorVector) {
            const distance = vectorDistance(preset1.colorVector, preset2.colorVector);
            pairsChecked++;
            if (distance <= threshold) {
              console.log(`Found similar: ${preset1.name} and ${preset2.name} (distance: ${distance.toFixed(3)})`);
              similarPairs.push({
                id1: preset1.id,
                id2: preset2.id,
                distance: distance,
              });
              pairsGrouped++;
            }
          }
        }
      }
      console.log(`Checked ${pairsChecked} pairs, found ${pairsGrouped} similar pairs with threshold ${threshold}`);

      // Build groups where ALL presets are within threshold of each other (cliques)
      const groups: Set<number>[] = [];

      for (const pair of similarPairs) {
        const { id1, id2 } = pair;

        // Find groups that can accept both presets
        let merged = false;
        for (let g = 0; g < groups.length; g++) {
          const group = groups[g];

          // Check if both presets are compatible with all members of this group
          const id1Compatible = Array.from(group).every(existingId => {
            const hasPair = similarPairs.some(p =>
              (p.id1 === id1 && p.id2 === existingId) ||
              (p.id2 === id1 && p.id1 === existingId),
            );
            return hasPair || existingId === id1;
          });

          const id2Compatible = Array.from(group).every(existingId => {
            const hasPair = similarPairs.some(p =>
              (p.id1 === id2 && p.id2 === existingId) ||
              (p.id2 === id2 && p.id1 === existingId),
            );
            return hasPair || existingId === id2;
          });

          if (id1Compatible && id2Compatible) {
            group.add(id1);
            group.add(id2);
            merged = true;
            break;
          }
        }

        // If no compatible group found, create new group
        if (!merged) {
          groups.push(new Set([id1, id2]));
        }
      }

      // Format groups for display
      const similarGroups = groups
        .filter(group => group.size > 1)
        .map(groupIds => {
          const groupPresets = allPresets.filter((p: any) => groupIds.has(p.id));

          // Get distances for this group (only pairs within threshold)
          const distances: { from: number; to: number; distance: number }[] = [];
          similarPairs.forEach(pair => {
            if (groupIds.has(pair.id1) && groupIds.has(pair.id2)) {
              distances.push({
                from: pair.id1,
                to: pair.id2,
                distance: pair.distance,
              });
            }
          });

          return {
            presets: groupPresets.map((p: any) => ({
              ...p,
              createdAt: new Date(p.createdAt),
            })),
            distances,
          };
        })
        .sort((a, b) => b.presets.length - a.presets.length); // Sort by group size

      similarResults.value = {
        success: true,
        totalPresets: allPresets.length,
        groupCount: similarGroups.length,
        groups: similarGroups,
        threshold: threshold,
        pairsChecked: pairsChecked,
        pairsGrouped: pairsGrouped,
      };
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    isCheckingSimilar.value = false;
  });

  return (
    <div class="mx-auto max-w-4xl px-4 py-12">
      <h1 class="text-4xl font-bold mb-2">Admin Panel</h1>
      <p class="text-gray-400 mb-8">Welcome, {session.value?.user?.name}</p>

      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Vector Backfill</h2>
        <p class="text-gray-400 mb-4">
          Generate color vectors for all existing presets that don&apos;t have them.
          This is needed after adding the colorVector column to enable similarity detection.
        </p>

        <button
          onClick$={handleBackfill}
          disabled={isRunning.value}
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {isRunning.value ? 'Running...' : 'Run Backfill'}
        </button>

        {result.value && (
          <div class="mt-4 p-4 bg-gray-900 rounded-lg">
            <pre class="whitespace-pre-wrap text-sm">{result.value}</pre>
          </div>
        )}
      </div>

      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Find Similar Presets</h2>
        <p class="text-gray-400 mb-4">
          Check all published presets and find groups of similar gradients.
          Presets are grouped together if they&apos;re within the threshold distance.
        </p>

        <div class="mb-4">
          <button
            onClick$={handleLoadPresets}
            disabled={isLoadingPresets.value}
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {isLoadingPresets.value ? 'Loading Presets...' : 'Load All Presets'}
          </button>
          {loadedPresets.value.length > 0 && (
            <div class="mt-3 p-3 bg-gray-900 rounded-lg">
              <span class="text-green-400 font-semibold">✓ Loaded:</span>{' '}
              <span class="text-white font-bold">{loadedPresets.value.length}</span> presets
              {loadedAt.value && (
                <span class="text-gray-400 ml-3 text-sm">
                  (at {loadedAt.value.toLocaleTimeString()})
                </span>
              )}
            </div>
          )}
        </div>

        <div class="flex gap-4 items-end mb-4">
          <div class="flex-1">
            <label for="similarity-threshold" class="block text-sm font-medium mb-2">
              Similarity Threshold (lower = stricter)
            </label>
            <input
              id="similarity-threshold"
              type="number"
              value={similarThreshold.value}
              onInput$={(e) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                similarThreshold.value = isNaN(val) || val < 0.1 ? 0.1 : val;
              }}
              min="0.1"
              max="10"
              step="0.01"
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
            <p class="text-xs text-gray-500 mt-1">
              Recommended: 1.0 (strict), 2.0 (moderate), 3.0 (lenient). Current: {similarThreshold.value}
            </p>
          </div>

          <button
            onClick$={handleFindSimilar}
            disabled={isCheckingSimilar.value || loadedPresets.value.length === 0}
            class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {isCheckingSimilar.value ? 'Checking...' : 'Find Similar'}
          </button>
        </div>

        {similarResults.value && similarResults.value.groupCount > 0 && (
          <div class="mt-6">
            <div class="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 class="font-bold text-lg mb-2">Results Summary</h3>
              <p class="text-gray-300 mb-2">
                Found <span class="text-yellow-400 font-bold">{similarResults.value.groupCount}</span> groups
                of similar presets out of <span class="text-blue-400 font-bold">{similarResults.value.totalPresets}</span> total presets.
              </p>
              <p class="text-gray-400 text-sm">
                Threshold used: <span class="text-blue-400 font-semibold">{similarResults.value.threshold}</span> |
                Pairs checked: <span class="text-gray-300">{similarResults.value.pairsChecked}</span> |
                Pairs grouped: <span class="text-green-400 font-semibold">{similarResults.value.pairsGrouped}</span>
              </p>
            </div>

            {similarResults.value.groups.map((group: any, groupIndex: number) => (
              <div key={groupIndex} class="bg-gray-900 rounded-lg p-4 mb-4">
                <h3 class="font-bold text-lg mb-3 text-yellow-400">
                  Group {groupIndex + 1} - {group.presets.length} Similar Presets
                </h3>

                {/* Distance matrix */}
                <div class="mb-4 p-3 bg-gray-800 rounded">
                  <p class="text-sm font-semibold mb-2 text-gray-400">Distances (OKLAB space):</p>
                  <div class="flex flex-wrap gap-2 text-xs">
                    {group.distances.map((dist: any, i: number) => {
                      const fromPreset = group.presets.find((p: any) => p.id === dist.from);
                      const toPreset = group.presets.find((p: any) => p.id === dist.to);
                      // Ensure distance is treated as a float
                      const distValue = Number(dist.distance);
                      return (
                        <span key={i} class="bg-gray-700 px-2 py-1 rounded">
                          <span class="text-gray-400">{fromPreset?.name}</span>
                          {' ↔ '}
                          <span class="text-gray-400">{toPreset?.name}</span>
                          {': '}
                          <span class="text-yellow-300 font-semibold">{distValue.toFixed(3)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Preset previews */}
                <div class="grid sm:grid-cols-2 gap-3">
                  {group.presets.map((preset: any) => (
                    <div key={preset.id} class="relative">
                      <PresetPreview Preset={preset} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {similarResults.value.groupCount === 0 && (
              <div class="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                <p class="text-green-400 font-semibold">
                  ✓ No similar presets found at this threshold!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export const head = {
  title: 'Admin Panel - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Admin panel for Birdflop',
    },
  ],
};
