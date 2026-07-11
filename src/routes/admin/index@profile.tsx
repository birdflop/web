import { component$, useSignal, $, useContextProvider } from '@qwik.dev/core';
import { RequestHandler } from '@qwik.dev/router';
import { vectorDistance } from '@birdflop/rgbirdflop';
import PresetPreview from '~/components/rgbirdflop/presets/PresetPreview';
import {
  privatePresetsContext,
  savedPresetsContext,
} from '~/routes/resources/rgb/presets';
import AppWindow from 'lucide-icons-qwik/icons/AppWindow';
import { checkAdmin } from '../layout';
import {
  loadAllPresets,
  backfillPresetSaves,
  runMigratePresets,
  backfillColorVectors,
} from '~/util/admin';

export const onGet: RequestHandler = function (props) {
  const admin = checkAdmin(props);
  if (!admin) throw new Response('Unauthorized', { status: 401 });
};

export default component$(() => {
  // Provide contexts for PresetPreview (empty since admin doesn't need these features)
  const privatePresets = useSignal([]);
  const savedPresets = useSignal([]);
  useContextProvider(privatePresetsContext, privatePresets);
  useContextProvider(savedPresetsContext, savedPresets);

  const isRunning = useSignal(false);

  const isCheckingSimilar = useSignal(false);
  const similarThreshold = useSignal(2.0);
  const similarResults = useSignal<any>(null);
  const loadedPresets = useSignal<any[]>([]);
  const isLoadingPresets = useSignal(false);
  const loadedAt = useSignal<Date | null>(null);

  const isMigrating = useSignal(false);

  interface LogEntry {
    time: string;
    action: string;
    message: string;
  }
  const consoleLogs = useSignal<LogEntry[]>([]);

  const addLog = $((action: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    consoleLogs.value = [{ time, action, message }, ...consoleLogs.value];
  });

  const handleMigratePresets = $(async () => {
    isMigrating.value = true;
    await addLog('Version Migration', 'Running migration...');

    try {
      const response = await runMigratePresets();

      if (response.success) {
        await addLog('Version Migration', response.logs.join('\n'));
      } else {
        let errorMsg = `Error: ${response.error}`;
        if (response.logs && response.logs.length > 0) {
          errorMsg = response.logs.join('\n') + `\n${errorMsg}`;
        }
        await addLog('Version Migration', errorMsg);
      }
    } catch (error) {
      await addLog(
        'Version Migration',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    isMigrating.value = false;
  });

  const handleBackfill = $(async () => {
    isRunning.value = true;
    await addLog('Vector Backfill', 'Running backfill...');

    try {
      const response = await backfillColorVectors();

      if (response.success) {
        await addLog('Vector Backfill', response.logs.join('\n'));
      } else {
        let errorMsg = `Error: ${response.error}`;
        if (response.logs && response.logs.length > 0) {
          errorMsg = response.logs.join('\n') + `\n${errorMsg}`;
        }
        await addLog('Vector Backfill', errorMsg);
      }
    } catch (error) {
      await addLog(
        'Vector Backfill',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    isRunning.value = false;
  });

  const handleSavesBackfill = $(async () => {
    isRunning.value = true;
    await addLog('Saves Backfill', 'Running saves backfill...');

    try {
      const response = await backfillPresetSaves();

      if (response.success) {
        await addLog('Saves Backfill', response.logs.join('\n'));
      } else {
        let errorMsg = `Error: ${response.error}`;
        if (response.logs && response.logs.length > 0) {
          errorMsg = response.logs.join('\n') + `\n${errorMsg}`;
        }
        await addLog('Saves Backfill', errorMsg);
      }
    } catch (error) {
      await addLog(
        'Saves Backfill',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    isRunning.value = false;
  });

  const handleLoadPresets = $(async () => {
    isLoadingPresets.value = true;
    similarResults.value = null;
    await addLog('Find Similar', 'Loading all published presets...');

    try {
      const response = await loadAllPresets();

      if (response.success && response.presets) {
        loadedPresets.value = response.presets;
        loadedAt.value = new Date();
        await addLog(
          'Find Similar',
          `Loaded ${response.presets.length} presets.`
        );
      } else {
        await addLog(
          'Find Similar',
          `Error loading presets: ${response.error}`
        );
      }
    } catch (error) {
      await addLog(
        'Find Similar',
        `Error loading presets: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
    await new Promise((resolve) => setTimeout(resolve, 100));

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
            const distance = vectorDistance(
              preset1.colorVector,
              preset2.colorVector
            );
            pairsChecked++;
            if (distance <= threshold) {
              console.log(
                `Found similar: ${preset1.name} and ${preset2.name} (distance: ${distance.toFixed(3)})`
              );
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
      console.log(
        `Checked ${pairsChecked} pairs, found ${pairsGrouped} similar pairs with threshold ${threshold}`
      );

      // Build groups where ALL presets are within threshold of each other (cliques)
      const groups: Set<number>[] = [];

      for (const pair of similarPairs) {
        const { id1, id2 } = pair;

        // Find groups that can accept both presets
        let merged = false;
        for (let g = 0; g < groups.length; g++) {
          const group = groups[g];

          // Check if both presets are compatible with all members of this group
          const id1Compatible = Array.from(group).every((existingId) => {
            const hasPair = similarPairs.some(
              (p) =>
                (p.id1 === id1 && p.id2 === existingId) ||
                (p.id2 === id1 && p.id1 === existingId)
            );
            return hasPair || existingId === id1;
          });

          const id2Compatible = Array.from(group).every((existingId) => {
            const hasPair = similarPairs.some(
              (p) =>
                (p.id1 === id2 && p.id2 === existingId) ||
                (p.id2 === id2 && p.id1 === existingId)
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
        .filter((group) => group.size > 1)
        .map((groupIds) => {
          const groupPresets = allPresets.filter((p: any) =>
            groupIds.has(p.id)
          );

          // Get distances for this group (only pairs within threshold)
          const distances: { from: number; to: number; distance: number }[] =
            [];
          similarPairs.forEach((pair) => {
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

      let msg = `Completed similarity check!\nFound ${similarGroups.length} groups of similar presets out of ${allPresets.length} total presets.\n`;
      msg += `Threshold: ${threshold} | Pairs checked: ${pairsChecked} | Pairs grouped: ${pairsGrouped}`;
      await addLog('Find Similar', msg);
    } catch (error) {
      await addLog(
        'Find Similar',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    isCheckingSimilar.value = false;
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <AppWindow size={32} />
        Admin Panel
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        Manage backend tasks and data for Birdflop.
      </p>
      <div class="grid gap-1 sm:grid-cols-2">
        <div class="lum-card">
          <h2 class="text-xl!">Vector Backfill</h2>
          <p>
            Generate color vectors for all existing presets that don't have
            them. This is needed after adding the colorVector column to enable
            similarity detection.
          </p>

          <div>
            <button
              onClick$={handleBackfill}
              disabled={isRunning.value}
              class="lum-btn lum-bg-blue hover:lum-bg-blue/50"
            >
              {isRunning.value ? 'Running...' : 'Run Backfill'}
            </button>
          </div>
        </div>

        <div class="lum-card">
          <h2 class="text-xl!">Preset Saves Backfill</h2>
          <p>
            Update all presets to have accurate save counts based on
            saved_presets table.
          </p>

          <div>
            <button
              onClick$={handleSavesBackfill}
              disabled={isRunning.value}
              class="lum-btn lum-bg-blue hover:lum-bg-blue/50"
            >
              {isRunning.value ? 'Running...' : 'Run Backfill'}
            </button>
          </div>
        </div>

        <div class="lum-card">
          <h2 class="text-xl!">Preset Version Migration</h2>
          <p>
            Migrate all published presets in the database to the current version
            using the version migrator rules.
          </p>

          <div>
            <button
              onClick$={handleMigratePresets}
              disabled={isMigrating.value}
              class="lum-btn lum-bg-blue hover:lum-bg-blue/50"
            >
              {isMigrating.value ? 'Migrating...' : 'Run Migration'}
            </button>
          </div>
        </div>

        <div class="lum-card">
          <h2 class="text-xl!">Find Similar Presets</h2>
          <p>
            Check all published presets and find groups of similar gradients.
            Presets are grouped together if they&apos;re within the threshold
            distance.
          </p>

          <div class="mb-4">
            <button
              onClick$={handleLoadPresets}
              disabled={isLoadingPresets.value}
              class="lum-btn lum-bg-blue hover:lum-bg-blue/50"
            >
              {isLoadingPresets.value
                ? 'Loading Presets...'
                : 'Load All Presets'}
            </button>
            {loadedPresets.value.length > 0 && (
              <div class="mt-3 rounded-lg bg-gray-900 p-3">
                <span class="font-semibold text-green-400">✓ Loaded:</span>{' '}
                <span class="font-bold text-white">
                  {loadedPresets.value.length}
                </span>{' '}
                presets
                {loadedAt.value && (
                  <span class="ml-3 text-sm text-gray-400">
                    (at {loadedAt.value.toLocaleTimeString()})
                  </span>
                )}
              </div>
            )}
          </div>

          <div class="flex flex-col">
            <label
              for="similarity-threshold"
              class="mb-2 block text-sm font-medium"
            >
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
              class="lum-input max-w-50"
            />
            <p class="mt-1 text-xs text-gray-500">
              Recommended: 1.0 (strict), 2.0 (moderate), 3.0 (lenient). Current:{' '}
              {similarThreshold.value}
            </p>
          </div>

          <button
            onClick$={handleFindSimilar}
            disabled={
              isCheckingSimilar.value || loadedPresets.value.length === 0
            }
            class="lum-btn lum-bg-purple hover:lum-bg-purple/50 max-w-50"
          >
            {isCheckingSimilar.value ? 'Checking...' : 'Find Similar'}
          </button>

          {similarResults.value && similarResults.value.groupCount > 0 && (
            <div class="mt-6">
              <div class="mb-4 rounded-lg bg-gray-900 p-4">
                <h3 class="mb-2 text-lg font-bold">Results Summary</h3>
                <p class="mb-2 text-gray-300">
                  Found{' '}
                  <span class="font-bold text-yellow-400">
                    {similarResults.value.groupCount}
                  </span>{' '}
                  groups of similar presets out of{' '}
                  <span class="font-bold text-blue-400">
                    {similarResults.value.totalPresets}
                  </span>{' '}
                  total presets.
                </p>
                <p class="text-sm text-gray-400">
                  Threshold used:{' '}
                  <span class="font-semibold text-blue-400">
                    {similarResults.value.threshold}
                  </span>{' '}
                  | Pairs checked:{' '}
                  <span class="text-gray-300">
                    {similarResults.value.pairsChecked}
                  </span>{' '}
                  | Pairs grouped:{' '}
                  <span class="font-semibold text-green-400">
                    {similarResults.value.pairsGrouped}
                  </span>
                </p>
              </div>

              {similarResults.value.groups.map(
                (group: any, groupIndex: number) => (
                  <div key={groupIndex} class="mb-4 rounded-lg bg-gray-900 p-4">
                    <h3 class="mb-3 text-lg font-bold text-yellow-400">
                      Group {groupIndex + 1} - {group.presets.length} Similar
                      Presets
                    </h3>

                    {/* Distance matrix */}
                    <div class="mb-4 rounded bg-gray-800 p-3">
                      <p class="mb-2 text-sm font-semibold text-gray-400">
                        Distances (OKLAB space):
                      </p>
                      <div class="flex flex-wrap gap-2 text-xs">
                        {group.distances.map((dist: any, i: number) => {
                          const fromPreset = group.presets.find(
                            (p: any) => p.id === dist.from
                          );
                          const toPreset = group.presets.find(
                            (p: any) => p.id === dist.to
                          );
                          // Ensure distance is treated as a float
                          const distValue = Number(dist.distance);
                          return (
                            <span key={i} class="rounded bg-gray-700 px-2 py-1">
                              <span class="text-gray-400">
                                {fromPreset?.name}
                              </span>
                              {' ↔ '}
                              <span class="text-gray-400">
                                {toPreset?.name}
                              </span>
                              {': '}
                              <span class="font-semibold text-yellow-300">
                                {distValue.toFixed(3)}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preset previews */}
                    <div class="grid gap-3 sm:grid-cols-2">
                      {group.presets.map((preset: any) => (
                        <div key={preset.id} class="relative">
                          <PresetPreview Preset={preset} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {similarResults.value.groupCount === 0 && (
                <div class="rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-center">
                  <p class="font-semibold text-green-400">
                    ✓ No similar presets found at this threshold!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Console Output Log */}
      <div class="lum-card mt-6 flex flex-col">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-xl! font-bold">Console Output</h2>
          {consoleLogs.value.length > 0 && (
            <button
              onClick$={() => {
                consoleLogs.value = [];
              }}
              class="lum-btn lum-bg-red/20 hover:lum-bg-red/30 px-3 py-1 text-xs"
            >
              Clear Logs
            </button>
          )}
        </div>
        <div class="border-lum-border/10 max-h-96 overflow-y-auto rounded-lg border bg-gray-950 p-4 font-mono text-sm">
          {consoleLogs.value.length === 0 ? (
            <span class="text-gray-500">
              No output yet. Run an action above to see results.
            </span>
          ) : (
            <div class="flex flex-col gap-4">
              {consoleLogs.value.map((log, index) => (
                <div
                  key={index}
                  class="border-lum-border/10 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div class="mb-1 flex items-center gap-2 text-xs text-gray-400">
                    <span class="font-bold text-gray-500">[{log.time}]</span>
                    <span class="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 uppercase">
                      {log.action}
                    </span>
                  </div>
                  <pre class="font-mono whitespace-pre-wrap text-white">
                    {log.message}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
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
