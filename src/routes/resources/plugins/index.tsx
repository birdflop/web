import {
  component$,
  createContextId,
  isBrowser,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  Blocks,
  Check,
  Copy,
  Download,
  Ellipsis,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  X,
} from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SelectMenu, SelectMenuRaw } from '@luminescent/ui-qwik';
import PluginCard from '~/components/plugins/PluginCard';
import AddPluginDialog from '~/components/plugins/AddPluginDialog';
import AddMiscDialog from '~/components/plugins/AddMiscDialog';
import { deepTrack } from '~/util/track';
import { softwareOptions } from '../flags';
import { SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import {
  getPlugin,
  PluginSource,
  PluginType,
} from '~/util/plugins/ServerPlugin';
import { downloadSpigotPlugin } from '~/util/plugins/SpigotPlugin';
import { Tabs } from '~/components/Elements/Tabs';

const debug = true;

type ResolvedPluginType = {
  type: PluginSource;
  plugin?: PluginType;
  plugins?: PluginType[];
};

type ServerType = {
  software: string;
  plugins: { [id: string]: PluginType };
};

type PluginsStoreType = {
  servers: {
    [serverName: string]: ServerType;
  };
  openServer?: string;
  filter?: 'outdated' | PluginSource;
};

const serverDefaults: ServerType = {
  software: 'paper',
  plugins: {},
};

const pluginsDefaults: PluginsStoreType = {
  servers: {
    'My Server': {
      software: 'paper',
      plugins: {},
    },
  },
  openServer: 'My Server',
};

type PluginSourceComponent = {
  noDescription?: boolean;
};

const Modrinth = component$(({ noDescription }: PluginSourceComponent) => (
  <span class="text-left">
    <span class="flex items-center gap-2">
      <SiModrinth class="fill-current" size={20} />
      Modrinth
      <br />
    </span>
    {!noDescription && (
      <span class="text-lum-text-secondary mt-2 flex text-xs text-wrap whitespace-pre-line">
        {`Newer plugin platform that's gaining popularity.
      Many plugins are primarily releasing on Modrinth now,
      so check here first when adding a plugin.`}
      </span>
    )}
  </span>
));

const SpigotMC = component$(({ noDescription }: PluginSourceComponent) => (
  <span class="text-left">
    <span class="flex items-center gap-2">
      <SiSpigotmc class="fill-current" size={20} />
      SpigotMC
      <br />
    </span>
    {!noDescription && (
      <span class="text-lum-text-secondary mt-2 flex text-xs text-wrap whitespace-pre-line">
        {`Most popular plugin platform.
      Many plugins are moving to Modrinth,
      use this if the plugin isn't on Modrinth yet.`}
      </span>
    )}
  </span>
));

/*
const GitHub = component$(({ noDescription }: PluginSourceComponent) => <span class="text-left">
  <span class="flex items-center gap-2">
    <SiGithub class="fill-current" size={20} />
    GitHub<br/>
  </span>
  {!noDescription
    && <span class="text-xs flex text-lum-text-secondary text-wrap whitespace-pre-line mt-2">
      {`For plugins that release on GitHub without using a plugin platform.
      Search by plugin name or paste the GitHub link of the plugin.`}
    </span>
  }
</span>);
*/

const Misc = component$(({ noDescription }: PluginSourceComponent) => (
  <span class="text-left">
    <span class="flex items-center gap-2">
      <Ellipsis size={20} />
      Misc
      <br />
    </span>
    {!noDescription && (
      <span class="text-lum-text-secondary mt-2 flex text-xs text-wrap whitespace-pre-line">
        {`For plugins that aren't on the above platforms,
      you can manually check for updates in one place.`}
      </span>
    )}
  </span>
));

const pluginSources = [
  { component: Modrinth, value: 'modrinth' },
  { component: SpigotMC, value: 'spigot' },
  // { component: CurseForge, value: 'curseforge' },
  // { component: Modrinth, value: 'modrinth' },
  // { component: Hangar, value: 'hangar' },
  // { component: GitHub, value: 'github' },
  { component: Misc, value: 'misc' },
];

export const resolvedPluginContext =
  createContextId<ResolvedPluginType>('resolve-plugin');
export const pluginsStoreContext =
  createContextId<PluginsStoreType>('plugins-store');
export default component$(() => {
  const t = inlineTranslate();

  const notifications = useContext(NotificationContext);
  const modalRef = useSignal<HTMLDialogElement>();

  const isLoading = useSignal([] as string[]);

  // spigot only allows 10 downloads per minute
  const spigotRateLimit = useStore({
    downloadCount: 0,
    resetTime: 0,
  });

  const resolvedPlugin = useStore<ResolvedPluginType>(
    {
      type: 'modrinth',
    },
    { deep: true },
  );
  useContextProvider(resolvedPluginContext, resolvedPlugin);

  const pluginsStore = useStore<PluginsStoreType>(pluginsDefaults, {
    deep: true,
  });
  useContextProvider(pluginsStoreContext, pluginsStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!isBrowser) return; // dont load plugins on the server
    const pluginsData = localStorage.getItem('plugins');
    if (pluginsData) {
      try {
        const savedPluginsStore = JSON.parse(pluginsData);
        pluginsStore.servers = savedPluginsStore.servers || {};
        pluginsStore.openServer = savedPluginsStore.openServer;
        pluginsStore.filter = savedPluginsStore.filter;
      } catch (e) {
        const notification = new Notification()
          .setTitle('Error loading plugins')
          .setDescription(
            `There was an error loading your saved plugins: ${e}.`,
          )
          .setBgColor('lum-grad-bg-red/50');
        notifications.push(notification);
      }
    }
  });

  useTask$(async ({ track }) => {
    deepTrack(track, pluginsStore);

    if (!isBrowser) return;
    if (
      pluginsStore.openServer &&
      pluginsStore.servers[pluginsStore.openServer]
    ) {
      // check if any plugins are not fetched, and fetch them if so
      const plugins = pluginsStore.servers[pluginsStore.openServer].plugins;
      for (const pluginId in plugins) {
        const plugin = plugins[pluginId];
        if (!plugin.versions)
          Object.assign(plugin, await getPlugin(plugin).fetch());
      }
    } else {
      pluginsStore.openServer =
        Object.keys(pluginsStore.servers)[0] || undefined;
    }

    try {
      const exportedPluginsStore: PluginsStoreType = JSON.parse(
        JSON.stringify(pluginsStore),
      );
      Object.keys(exportedPluginsStore.servers).forEach((server) => {
        const serverPlugins = exportedPluginsStore.servers[server].plugins;
        const mappedPlugins: { [id: string]: PluginType } = {};
        Object.keys(serverPlugins).forEach((id) => {
          const plugin = serverPlugins[id];
          mappedPlugins[id] = {
            id: plugin.id,
            type: plugin.type,
            currentVersion: plugin.currentVersion,
          };
        });
        exportedPluginsStore.servers[server].plugins = mappedPlugins;
      });
      localStorage.setItem('plugins', JSON.stringify(exportedPluginsStore));
    } catch (e) {
      const notification = new Notification()
        .setTitle('Error saving plugins')
        .setDescription(`There was an error saving your plugins: ${e}.`)
        .setBgColor('lum-grad-bg-red/50');
      notifications.push(notification);
    }
  });

  const outdatedPlugins = useComputed$(() => {
    if (
      !pluginsStore.openServer ||
      !pluginsStore.servers[pluginsStore.openServer].plugins
    )
      return;
    return Object.values(
      pluginsStore.servers[pluginsStore.openServer].plugins,
    ).filter((plugin) => {
      const updateAvailable =
        plugin.latestVersion?.releaseDate !== undefined &&
        plugin.currentVersion?.releaseDate !== undefined &&
        new Date(plugin.latestVersion.releaseDate).getTime() >
        new Date(plugin.currentVersion.releaseDate).getTime();
      return updateAvailable && plugin.file?.url;
    }).length;
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Blocks size={32} />
        {t('nav.resources.plugins.title@@Plugin Updates')}
        <span class="lum-grad-bg-blue/50 rounded-lum-1 px-2 py-1 text-xs">
          {t('nav.experimental@@experimental')}
        </span>
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.',
        )}
        Warning: this tool is in an alpha state and may have bugs that cause it
        to not detect updates correctly, or in rare cases mark up to date
        plugins as out of date. Always double check for updates manually before
        updating your plugins, and report any bugs you find to help improve the
        tool.
      </p>

      <Tabs values={Object.keys(pluginsStore.servers).map((k) => ({ name: k, value: k }))} value={pluginsStore.openServer ? { name: pluginsStore.openServer, value: pluginsStore.openServer } : undefined}
        onDelete$={(serverName) => {
          delete pluginsStore.servers[serverName.value];
          if (pluginsStore.openServer === serverName.value) {
            pluginsStore.openServer = Object.keys(pluginsStore.servers)[0] || undefined;
          }
        }}
        onClick$={(serverName) => {
          pluginsStore.openServer = serverName.value;
        }}
        onPlus$={() => {
          const serverName = prompt('Enter server name');
          if (serverName) {
            if (pluginsStore.servers[serverName]) {
              alert('A server with that name already exists.');
              return;
            }
            pluginsStore.servers[serverName] = { ...serverDefaults };
            pluginsStore.openServer = serverName;
          }
        }}>
      </Tabs>
      {Object.keys(pluginsStore.servers).length < 1 && (
        <p class="text-lum-text-secondary mx-2 text-sm">
          {t(
            'nav.resources.plugins.noServers@@No servers added yet. Get started by adding a server and some plugins!',
          )}
        </p>
      )}

      {pluginsStore.openServer &&
        pluginsStore.servers[pluginsStore.openServer].plugins && (
        <>
          <div class="lum-card lum-grad-bg-lum-card-bg mt-4 gap-1 p-1">
            <div class="flex items-center gap-1">
              <button
                class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                onClick$={() => {
                  modalRef.value?.showModal();
                }}
              >
                <Plus size={16} />
                  Add plugin
              </button>

              <button
                class="lum-btn lum-bg-transparent rounded-lum-1 p-2"
                onClick$={() => {
                  const newName = prompt(
                    'Enter new server name',
                    `${pluginsStore.openServer}`,
                  );
                  if (
                    newName &&
                      newName !== pluginsStore.openServer &&
                      pluginsStore.openServer
                  ) {
                    if (pluginsStore.servers[newName]) {
                      alert('A server with that name already exists.');
                      return;
                    }
                    pluginsStore.servers[newName] = JSON.parse(
                      JSON.stringify(
                        pluginsStore.servers[pluginsStore.openServer],
                      ),
                    );
                    pluginsStore.openServer = newName;
                  }
                }}
                title="Duplicate server"
              >
                <Copy size={16} />
              </button>

              <SelectMenuRaw
                id="software"
                onChange$={(e, el) => {
                  pluginsStore.servers[pluginsStore.openServer!].software =
                      el.value;
                }}
                values={softwareOptions}
                value={pluginsStore.servers[pluginsStore.openServer].software}
                class={{
                  'lum-bg-transparent lum-btn-p-1 rounded-lum-1': true,
                }}
              />

              <button
                class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                onClick$={() => {
                  const plugins: { [id: string]: Partial<PluginType> } = {};
                  const serverPlugins =
                      pluginsStore.servers[pluginsStore.openServer!].plugins;
                  Object.keys(serverPlugins).forEach((id) => {
                    const plugin = serverPlugins[id];
                    plugins[id] = {
                      id: plugin.id,
                      type: plugin.type,
                      currentVersion: plugin.currentVersion,
                    };
                  });

                  const notification = new Notification()
                    .setTitle('Plugins copied to clipboard')
                    .setDescription(
                      `The plugins for server "${pluginsStore.openServer}" have been copied to your clipboard as JSON.`,
                    )
                    .setBgColor('lum-grad-bg-green/50');
                  navigator.clipboard
                    .writeText(JSON.stringify(plugins))
                    .catch((err) => {
                      notification
                        .setTitle('Failed to copy plugins to clipboard')
                        .setDescription(err)
                        .setBgColor('lum-grad-bg-red/50')
                        .setPersist(true);
                    });
                  notifications.push(notification);
                }}
                title="Export server plugins as JSON"
              >
                <Copy size={16} /> Export (Keep this safe)
              </button>

              <input
                class="lum-input lum-input-p-1 rounded-lum-1 lum-bg-transparent flex-1"
                id="import"
                name="import"
                placeholder={`${t('plugins.import@@Import')} - ${t('plugins.pasteHere@@Paste here')}`}
                onInput$={async (e, el) => {
                  try {
                    const importJSON = JSON.parse(el.value);
                    await Promise.all(
                      Object.values(importJSON).map(async (plugin: any) => {
                        if (!plugin.id || !plugin.type) {
                          throw new Error(
                            `Invalid plugin data: ${JSON.stringify(plugin)}`,
                          );
                        }
                        const fetchedPlugin = await getPlugin(plugin).fetch();
                        pluginsStore.servers[
                            pluginsStore.openServer!
                        ].plugins[fetchedPlugin.id] = fetchedPlugin;
                      }),
                    );
                    el.value = '';
                    const notification = new Notification()
                      .setTitle('Plugins imported successfully')
                      .setDescription(
                        'The plugins have been imported successfully.',
                      )
                      .setBgColor('lum-grad-bg-green/50');
                    notifications.push(notification);
                  } catch (err) {
                    console.error('Failed to parse imported plugins:', err);
                    const notification = new Notification()
                      .setTitle('Failed to parse imported plugins')
                      .setDescription(
                        `An error occurred while parsing imported plugins. ${err}`,
                      )
                      .setBgColor('lum-grad-bg-red/50');
                    notifications.push(notification);
                  }
                }}
              />
              <SelectMenuRaw
                id="filter"
                onChange$={(e, el) => {
                  if (el.value === 'all') pluginsStore.filter = undefined;
                  pluginsStore.filter = el.value as 'outdated' | PluginSource;
                }}
                values={[
                  { name: 'All', value: 'all' },
                  { name: 'Outdated', value: 'outdated' },
                  ...pluginSources.map((Source) => ({
                    name: <Source.component noDescription />,
                    value: Source.value,
                  })),
                ]}
                value={pluginsStore.filter}
                customDropdown
                class={{
                  'lum-bg-transparent lum-btn-p-1 rounded-lum-1': true,
                }}
              >
                <span class="flex items-center gap-2" q:slot="dropdown">
                  <Filter size={16} />
                    Filter
                </span>
              </SelectMenuRaw>
            </div>

            {Object.keys(
              pluginsStore.servers[pluginsStore.openServer].plugins,
            ).length > 0 && (
              <div class="mx-auto flex items-center gap-1">
                {debug && (
                  <button
                    class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                    onClick$={() => {
                      const plugins =
                            pluginsStore.servers[pluginsStore.openServer!]
                              .plugins;
                      Object.values(plugins).forEach((plugin) => {
                        plugin.currentVersion = {
                          id: 'outdated',
                          name: 'Outdated',
                          releaseDate: new Date(0),
                        };
                      });
                    }}
                  >
                    <X size={16} />
                        Mark all out of date
                  </button>
                )}
                <button
                  class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                  onClick$={() => {
                    const plugins =
                          pluginsStore.servers[pluginsStore.openServer!].plugins;
                    Object.values(plugins).forEach((plugin) => {
                      if (plugin.latestVersion)
                        plugin.currentVersion = plugin.latestVersion;
                      plugin.updateDate = new Date();
                    });
                  }}
                >
                  <Check size={16} />
                      Mark all updated
                </button>
                <button
                  class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                  onClick$={async () => {
                    const plugins =
                          pluginsStore.servers[pluginsStore.openServer!].plugins;
                    for (const pluginId in plugins) {
                      const plugin = plugins[pluginId];
                      Object.assign(
                        plugin,
                        await getPlugin(plugin).fetchVersions(),
                      );
                    }
                  }}
                >
                  <RefreshCw size={16} />
                      Check all for updates
                </button>

                {!!outdatedPlugins.value && (
                  <button
                    class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1 group"
                    onClick$={async () => {
                      isLoading.value = [...isLoading.value, 'downloadAll'];

                      const plugins =
                            pluginsStore.servers[pluginsStore.openServer!]
                              .plugins;
                      for (const pluginId in plugins) {
                        const plugin = plugins[pluginId];
                        const updateAvailable =
                              plugin.latestVersion?.releaseDate !== undefined &&
                              plugin.currentVersion?.releaseDate !== undefined &&
                              new Date(
                                plugin.latestVersion.releaseDate,
                              ).getTime() >
                              new Date(
                                plugin.currentVersion.releaseDate,
                              ).getTime();

                        if (!updateAvailable || !plugin.file?.url) continue;

                        if (plugin.type === 'spigot')
                          await downloadSpigotPlugin(plugin, spigotRateLimit);
                        else window.open(plugin.file.url, '_blank');

                        plugin.currentVersion = plugin.latestVersion;
                      }

                      isLoading.value = isLoading.value.filter(
                        (item) => item !== 'downloadAll',
                      );
                    }}
                    disabled={isLoading.value.includes('downloadAll')}
                  >
                    <Download size={16} />
                        Download all out of date ({outdatedPlugins.value})
                    {outdatedPlugins.value > 10 && (
                      <span class="lum-card pointer-events-none absolute bottom-full left-0 mb-2 w-full p-2 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                            Spigot limits downloads to 10 per minute, so some of
                            these may not open immediately.
                      </span>
                    )}
                    {isLoading.value.includes('downloadAll') && (
                      <Loader2 size={16} class="animate-spin" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          <div class="my-4 grid gap-2">
            {Object.values(
              pluginsStore.servers[pluginsStore.openServer].plugins,
            ).map((plugin) => {
              const updateAvailable =
                  plugin.latestVersion?.releaseDate !== undefined &&
                  plugin.currentVersion?.releaseDate !== undefined &&
                  new Date(plugin.latestVersion.releaseDate).getTime() >
                  new Date(plugin.currentVersion.releaseDate).getTime();

              if (pluginsStore.filter === 'outdated' && !updateAvailable)
                return null;
              if (
                pluginsStore.filter &&
                  pluginsStore.filter !== 'outdated' &&
                  plugin.type !== pluginsStore.filter
              )
                return null;

              return (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  updateAvailable={updateAvailable}
                  spigotRateLimit={spigotRateLimit}
                >
                  <button
                    class="lum-btn rounded-lum-2 lum-bg-transparent p-2 text-sm"
                    q:slot="extra-actions"
                    onClick$={async () => {
                      try {
                        pluginsStore.servers[
                            pluginsStore.openServer!
                        ].plugins[plugin.id] =
                            await getPlugin(plugin).fetch();
                      } catch (error) {
                        console.error(
                          'Error fetching plugin versions:',
                          error,
                        );
                        const notification = new Notification()
                          .setTitle('Error fetching plugin versions')
                          .setDescription(
                            `An error occurred while fetching plugin versions. ${error}`,
                          )
                          .setBgColor('lum-grad-bg-red/50');
                        notifications.push(notification);
                      }
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    class="lum-btn rounded-lum-2 lum-bg-transparent hover:lum-bg-red p-2"
                    q:slot="extra-actions"
                    onClick$={() => {
                      delete pluginsStore.servers[pluginsStore.openServer!]
                        .plugins[plugin.id];
                    }}
                  >
                    <Trash size={16} />
                  </button>
                </PluginCard>
              );
            })}
          </div>
        </>
      )}

      <dialog
        ref={modalRef}
        class={{
          'text-lum-text m-auto hidden overflow-visible open:flex': true,
          'lum-card lum-grad-bg-lum-card-bg/50 min-w-1/4 drop-shadow-2xl backdrop-blur-xl': true,
          'open:animate-in open:fade-in open:slide-in-from-top-8 open:duration-300': true,
          'animate-out fade-out slide-in-from-top-8 duration-300': true,
        }}
      >
        <div class="flex flex-col">
          <div class="border-lum-border/10 mb-4 flex flex-col border-b pb-4">
            <h3 class="flex items-center gap-2 text-2xl font-bold">
              <Blocks size={28} />
              Add a plugin
              <button
                class="lum-btn lum-bg-transparent rounded-lum-1 ml-auto p-2"
                onClick$={() => {
                  modalRef.value?.close();
                }}
              >
                <X size={20} />
              </button>
              {isLoading.value.includes('add-plugin') && (
                <Loader2 size={16} class="animate-spin" />
              )}
            </h3>
          </div>

          <SelectMenu
            id="add-plugin-type"
            onChange$={(e, el) => {
              resolvedPlugin.type = el.value as PluginSource;
              resolvedPlugin.plugin = undefined;
            }}
            values={pluginSources.map((Source) => ({
              name: <Source.component />,
              value: Source.value,
            }))}
          >
            Plugin source
          </SelectMenu>

          {resolvedPlugin.type !== 'misc' && (
            <AddPluginDialog type={resolvedPlugin.type} />
          )}
          {/*resolvedPlugin.type === 'github' && <AddGitHubDialog />*/}
          {resolvedPlugin.type === 'misc' && <AddMiscDialog />}

          {resolvedPlugin.plugin && (
            <>
              <hr />
              <PluginCard
                plugin={resolvedPlugin.plugin}
                spigotRateLimit={spigotRateLimit}
              />
            </>
          )}

          {(resolvedPlugin.type === 'misc' ||
            resolvedPlugin.plugin?.currentVersion) && (
            <div
              class={{
                'border-lum-border/10 mt-4 flex justify-end gap-1 border-t pt-4 transition-all duration-300': true,
                'animate-in fade-in slide-in-from-top-8 duration-300': true,
              }}
            >
              <button
                class="lum-btn lum-bg-green/50 hover:lum-bg-green disabled:cursor-not-allowed disabled:bg-gray-600"
                onClick$={() => {
                  if (!resolvedPlugin.plugin) return;

                  pluginsStore.servers[pluginsStore.openServer!].plugins[
                    resolvedPlugin.plugin.id
                  ] = resolvedPlugin.plugin;
                  resolvedPlugin.plugin = undefined;
                  modalRef.value?.close();
                }}
              >
                <Plus size={20} /> Add
              </button>
            </div>
          )}
        </div>
      </dialog>
    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updates - Birdflop',
  description:
    'Keep track of plugin updates without checking every plugin page for updates. ' +
    defaultDescription,
});
