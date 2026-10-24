import {
  $,
  component$,
  useComputed$,
  useContext,
  useSignal,
  useStore,
} from '@qwik.dev/core';
import { Label, SelectMenu } from '@luminescent/ui-qwik';
import {
  getPlugin,
  searchAllPluginSources,
  type PluginType,
} from '~/util/plugins/ServerPlugin';
import type { ServerType } from '~/util/plugins/types';
import {
  findFilenameVersion,
  normalizePluginName,
  parsePluginFilenames,
} from '~/util/plugins/bulk';
import { getLoaders } from './AddPluginDialog';
import Accordion from '~/components/Elements/Accordion';
import { openItemsContext } from '~/routes/layout';
import ListPlus from 'lucide-icons-qwik/icons/ListPlus';
import X from 'lucide-icons-qwik/icons/X';

type Result = {
  filename: string;
  query: string;
  version?: string;
  candidates: PluginType[];
  plugin?: PluginType;
  status: string;
  warning?: string;
  noMatches?: boolean;
  alreadyAdded?: boolean;
  skipped?: boolean;
};

export default component$(
  ({ currentServer }: { currentServer?: ServerType }) => {
    const loaders = useComputed$(() =>
      currentServer ? getLoaders(currentServer.software) : []
    );
    const openItems = useContext(openItemsContext);
    const input = useSignal('');
    const busy = useSignal(false);
    const results = useStore<{ rows: Result[] }>({ rows: [] });

    const selectPlugin = $(async (index: number, candidate: PluginType) => {
      const row = results.rows[index];
      row.plugin = undefined;
      if (currentServer?.plugins[candidate.id]) {
        row.alreadyAdded = true;
        row.status = 'Already added';
        return;
      }
      row.status = 'Loading versions…';
      try {
        const plugin = (await getPlugin(candidate).fetchVersions()).toJSON();
        if (row.skipped) return;
        if (currentServer?.plugins[plugin.id]) {
          row.alreadyAdded = true;
          row.status = 'Already added';
          return;
        }
        plugin.currentVersion = findFilenameVersion(
          row.version,
          plugin.versions
        );
        row.plugin = plugin;
        row.status = plugin.currentVersion
          ? `Detected version ${plugin.currentVersion.name} from filename — ready to add`
          : 'Choose your installed version';
      } catch {
        row.status = 'Could not load versions. Try selecting the plugin again.';
      }
    });

    const ready = results.rows.filter(
      (row) => !row.skipped && row.plugin?.currentVersion
    );
    const noMatches = results.rows.filter((row) => row.noMatches);
    const alreadyAdded = results.rows.filter((row) => row.alreadyAdded);

    return (
      <div class="border-lum-border/10 mt-4 flex flex-col border-t pt-4">
        <Accordion sectionName="bulk-plugins">
          <ListPlus size={20} />
          Add multiple plugins from filenames
        </Accordion>
        <div
          class={{
            'flex max-w-xl flex-col gap-4 transition-all duration-300': true,
            'pointer-events-none max-h-0 overflow-hidden opacity-0':
              !openItems.value.includes('bulk-plugins'),
            'pointer-events-auto mt-4 max-h-[200rem] opacity-100':
              openItems.value.includes('bulk-plugins'),
          }}
        >
          <p class="text-lum-text-secondary text-sm">
            Searches Modrinth and SpigotMC for every filename, regardless of the
            selected source.
          </p>
          <Label
            for="bulk-plugin-files"
            label="Paste plugin filenames, one per line (commas also work)."
          >
            <textarea
              id="bulk-plugin-files"
              class="lum-input min-h-28"
              placeholder={
                'LuckPerms-Bukkit-5.4.153.jar\nEssentialsX-2.21.0.jar'
              }
              value={input.value}
              disabled={busy.value}
              onInput$={(_, el) => {
                input.value = el.value;
              }}
            />
          </Label>
          <button
            class="lum-btn"
            disabled={busy.value || !input.value.trim()}
            onClick$={async () => {
              busy.value = true;
              results.rows = parsePluginFilenames(input.value).map((entry) => ({
                ...entry,
                candidates: [],
                status: 'Waiting…',
              }));
              try {
                for (let index = 0; index < results.rows.length; index++) {
                  const row = results.rows[index];
                  if (row.skipped) continue;
                  row.status = 'Searching…';
                  try {
                    const search = await searchAllPluginSources(
                      row.query,
                      loaders.value
                    );
                    row.candidates = search.plugins;
                    row.noMatches =
                      !search.plugins.length && search.failedSources.length < 2;
                    row.warning = search.failedSources.length
                      ? `Could not search ${search.failedSources.join(', ')}. Resolve again to retry those sources.`
                      : undefined;
                    const exact = row.candidates.filter(
                      (plugin) =>
                        normalizePluginName(plugin.name ?? '') ===
                        normalizePluginName(row.query)
                    );
                    const existing = exact.find(
                      (plugin) => currentServer?.plugins[plugin.id]
                    );
                    if (existing) await selectPlugin(index, existing);
                    else if (exact.length === 1)
                      await selectPlugin(index, exact[0]);
                    else
                      row.status = row.candidates.length
                        ? 'Choose a matching plugin'
                        : row.noMatches
                          ? 'No matches. Try editing the filename or searching individually.'
                          : 'Search failed. Resolve again to retry.';
                  } catch {
                    row.status = 'Search failed. Resolve again to retry.';
                  }
                }
              } finally {
                busy.value = false;
              }
            }}
          >
            {busy.value ? 'Resolving…' : 'Resolve all filenames'}
          </button>
          <div class="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {results.rows
              .map((row, index) => ({ row, index }))
              .filter(
                ({ row }) => !row.noMatches && !row.alreadyAdded && !row.skipped
              )
              .map(({ row, index }) => (
                <div
                  key={row.filename}
                  class="lum-card lum-grad-bg-lum-card-bg/90 flex flex-col gap-2 p-4"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex flex-1 flex-col gap-1">
                      <span class="font-mono text-sm font-bold break-all">
                        {row.filename}
                      </span>
                      <span class="text-lum-text-secondary text-sm">
                        {row.status}
                      </span>
                    </div>
                    <button
                      class="lum-btn lum-bg-transparent rounded-lum-1 p-1"
                      aria-label={`Skip ${row.filename}`}
                      title="Skip this plugin"
                      onClick$={() => {
                        row.skipped = true;
                        row.plugin = undefined;
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {row.warning && (
                    <span class="text-lum-text-secondary text-sm">
                      {row.warning}
                    </span>
                  )}
                  {row.candidates.length > 0 && (
                    <Label for={`bulk-plugin-${index}`} label="Plugin match">
                      <SelectMenu
                        key={`${row.plugin?.type}:${row.plugin?.id}`}
                        id={`bulk-plugin-${index}`}
                        value={
                          row.plugin
                            ? `${row.plugin.type}:${row.plugin.id}`
                            : ''
                        }
                        values={[
                          { name: 'Choose a plugin', value: '' },
                          ...row.candidates.map((plugin) => ({
                            name: `${plugin.name ?? plugin.id} (${plugin.type === 'modrinth' ? 'Modrinth' : 'SpigotMC'})`,
                            value: `${plugin.type}:${plugin.id}`,
                          })),
                        ]}
                        disabled={busy.value}
                        onChange$={async (_, el) => {
                          const candidate = row.candidates.find(
                            (plugin) =>
                              `${plugin.type}:${plugin.id}` === el.value
                          );
                          if (!candidate) {
                            row.plugin = undefined;
                            return;
                          }
                          busy.value = true;
                          try {
                            await selectPlugin(index, candidate);
                          } finally {
                            busy.value = false;
                          }
                        }}
                      />
                    </Label>
                  )}
                  {row.plugin && (
                    <Label
                      for={`bulk-version-${index}`}
                      label={
                        row.plugin.currentVersion
                          ? 'Installed version (selected — change if needed)'
                          : 'Installed version'
                      }
                    >
                      <SelectMenu
                        id={`bulk-version-${index}`}
                        value={String(row.plugin.currentVersion?.id ?? '')}
                        disabled={busy.value}
                        values={[
                          { name: 'Choose your installed version', value: '' },
                          ...(row.plugin.versions ?? []).map((version) => ({
                            name: version.name,
                            value: String(version.id),
                          })),
                        ]}
                        onChange$={(_, el) => {
                          if (!row.plugin) return;
                          row.plugin.currentVersion = row.plugin.versions?.find(
                            (version) => String(version.id) === el.value
                          );
                          row.status = row.plugin.currentVersion
                            ? 'Ready to add'
                            : 'Choose your installed version';
                        }}
                      />
                    </Label>
                  )}
                </div>
              ))}
          </div>
          {alreadyAdded.length > 0 && (
            <section
              aria-labelledby="bulk-already-added"
              class="border-lum-border/10 flex flex-col gap-3 border-t pt-4"
            >
              <h4 id="bulk-already-added" class="font-bold">
                Already added ({alreadyAdded.length})
              </h4>
              <ul class="flex max-h-48 flex-col gap-3 overflow-y-auto">
                {alreadyAdded.map((row) => (
                  <li key={row.filename} class="font-mono text-sm break-all">
                    {row.filename}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {noMatches.length > 0 && (
            <section
              aria-labelledby="bulk-no-matches"
              class="border-lum-border/10 flex flex-col gap-3 border-t pt-4"
            >
              <h4 id="bulk-no-matches" class="font-bold">
                No matches found ({noMatches.length})
              </h4>
              <p class="text-lum-text-secondary text-sm">
                Try editing these filenames and resolving again, or search for
                each plugin individually.
              </p>
              <ul class="flex max-h-48 flex-col gap-3 overflow-y-auto">
                {noMatches.map((row) => (
                  <li key={row.filename} class="flex flex-col gap-1">
                    <span class="font-mono text-sm break-all">
                      {row.filename}
                    </span>
                    {row.warning && (
                      <span class="text-lum-text-secondary text-sm">
                        {row.warning}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.rows.length > 0 && (
            <button
              class="lum-btn lum-bg-green/50"
              disabled={busy.value || !currentServer || !ready.length}
              onClick$={() => {
                if (!currentServer) return;
                for (const row of results.rows) {
                  if (row.skipped || !row.plugin?.currentVersion) continue;
                  if (!currentServer.plugins[row.plugin.id])
                    currentServer.plugins[row.plugin.id] = row.plugin;
                  row.plugin = undefined;
                  row.candidates = [];
                  row.alreadyAdded = true;
                  row.status = 'Added';
                }
              }}
            >
              Add {ready.length} resolved plugins
            </button>
          )}
        </div>
      </div>
    );
  }
);
