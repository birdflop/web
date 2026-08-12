import {
  component$,
  createContextId,
  Fragment,
  isBrowser,
  useComputed$,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import Blocks from 'lucide-icons-qwik/icons/Blocks';
import Check from 'lucide-icons-qwik/icons/Check';
import Copy from 'lucide-icons-qwik/icons/Copy';
import Download from 'lucide-icons-qwik/icons/Download';
import Ellipsis from 'lucide-icons-qwik/icons/Ellipsis';
import Filter from 'lucide-icons-qwik/icons/Filter';
import Loader2 from 'lucide-icons-qwik/icons/Loader2';
import Plus from 'lucide-icons-qwik/icons/Plus';
import RefreshCw from 'lucide-icons-qwik/icons/RefreshCw';
import Trash from 'lucide-icons-qwik/icons/Trash';
import X from 'lucide-icons-qwik/icons/X';
import { defaultDescription, generateHead } from '~/root';
import { Label, SelectMenu, Tabs } from '@luminescent/ui-qwik';
import PluginCard from '~/components/plugins/PluginCard';
import AddPluginDialog from '~/components/plugins/AddPluginDialog';
import AddMiscDialog from '~/components/plugins/AddMiscDialog';
import { deepTrack } from '~/util/track';
import { softwareOptions } from '~/util/flags';
import SiModrinth from 'simple-icons-qwik/icons/SiModrinth';
import SiSpigotmc from 'simple-icons-qwik/icons/SiSpigotmc';
import {
  getPlugin,
  PluginSource,
  PluginType,
} from '~/util/plugins/ServerPlugin';
import { downloadSpigotPlugin } from '~/util/plugins/SpigotPlugin';
import Globe from 'lucide-icons-qwik/icons/Globe';
import { useSession } from '~/routes/plugin@auth';
import { setUserData } from '~/util/dataUtils';
import { updateServerListData } from '~/util/serverlist/actions';
import type {
  PluginsStoreType,
  ServersType,
  ServerType,
} from '~/util/plugins/types';
import { routeLoader$ } from '@qwik.dev/router';
import { getDB, servers } from '~/util/db';
import { Session } from '@auth/qwik';
import { eq } from 'drizzle-orm';
import { getServerStatus } from '~/util/serverlist/status';

const debug = true;

type ResolvedPluginType = {
  type: PluginSource;
  plugin?: PluginType;
  plugins?: PluginType[];
};

const serverDefaults: ServerType = {
  software: 'paper',
  plugins: {},
};

function pickDefaultOpenServer(
  servers: PluginsStoreType['servers'],
  preferred?: string
): string | undefined {
  if (preferred && servers[preferred]) return preferred;
  return Object.keys(servers)[0];
}

function mapPluginsForExport(plugins: { [id: string]: PluginType }): {
  [id: string]: PluginType;
} {
  const mapped: { [id: string]: PluginType } = {};
  Object.keys(plugins).forEach((id) => {
    const plugin = plugins[id];
    mapped[id] = {
      id: plugin.id,
      type: plugin.type,
      currentVersion: plugin.currentVersion,
    };
  });
  return mapped;
}

const pluginSourcesDescriptions = {
  modrinth: `Newer plugin platform that's gaining popularity. Many plugins are primarily releasing on Modrinth now, so check here first when adding a plugin.`,
  spigot: `Most popular plugin platform. Many plugins are moving to Modrinth, use this if the plugin isn't on Modrinth yet.`,
  // curseforge: 'SiCurseforge',
  // hangar: 'SiHangar',
  // github: `For plugins that release on GitHub without using a plugin platform. Search by plugin name or paste the GitHub link of the plugin.`,
  misc: `For plugins that aren't on the above platforms, you can manually check for updates in one place.`,
};

const pluginSources = [
  { name: 'Modrinth', value: 'modrinth' },
  { name: 'SpigotMC', value: 'spigot' },
  //{ name: 'CurseForge', value: 'curseforge' },
  //{ name: 'Hangar', value: 'hangar' },
  //{ name: 'GitHub', value: 'github' },
  { name: 'Misc', value: 'misc' },
];

const pluginSourcesIcons = {
  modrinth: SiModrinth,
  spigot: SiSpigotmc,
  // curseforge: SiCurseforge,
  // hangar: SiHangar,
  // github: SiGithub,
  misc: Ellipsis,
};

export const useUserServers = routeLoader$(async ({ sharedMap }) => {
  const session = sharedMap.get('session') as Session | undefined;
  if (!session?.user?.id) return { serverListServers: {}, errors: [] };
  const db = getDB();

  const userServers = await db
    .select({
      id: servers.id,
      name: servers.name,
      slug: servers.slug,
      plugins: servers.plugins,
      edition: servers.edition,
      javaHost: servers.javaHost,
      javaPort: servers.javaPort,
      bedrockHost: servers.bedrockHost,
      bedrockPort: servers.bedrockPort,
    })
    .from(servers)
    .where(eq(servers.ownerId, session.user.id))
    .all();

  const serversWithIcons = await Promise.all(
    userServers.map(async (server) => {
      const srv = { ...server };
      const { edition, javaHost, javaPort, bedrockHost, bedrockPort } = srv;

      let icon: string | null = null;
      try {
        const status = await getServerStatus({
          edition,
          javaHost,
          javaPort,
          bedrockHost,
          bedrockPort,
        });
        icon = status?.icon ?? null;
      } catch {
        icon = null;
      }

      return { ...srv, icon };
    })
  );

  return {
    serverListServers: serversWithIcons.reduce((acc: ServersType, server) => {
      acc[server.name] = {
        software: 'paper',
        plugins: server.plugins ?? {},
        id: server.id,
        slug: server.slug,
        icon: server.icon ?? undefined,
      };
      return acc;
    }, {}),
  };
});

export const resolvedPluginContext =
  createContextId<ResolvedPluginType>('resolve-plugin');
export default component$(() => {
  const t = inlineTranslate();
  const session = useSession();

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
    { deep: true }
  );
  useContextProvider(resolvedPluginContext, resolvedPlugin);

  const userServersValue = useUserServers().value;
  const { serverListServers: userServers } = userServersValue;

  const dbPlugins = session.value?.user?.plugins;

  const pluginsStore = useStore<PluginsStoreType>(
    {
      servers: {
        ...dbPlugins?.servers,
        ...userServers,
      },
      openServer: dbPlugins?.openServer,
    },
    { deep: true }
  );

  const CurrentServer = pluginsStore.openServer
    ? pluginsStore.servers[pluginsStore.openServer]
    : undefined;
  const CurrentSoftware = softwareOptions[CurrentServer?.software || 'paper'];

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!isBrowser) return; // do not load from localstorage if logged in

    const pluginsData = localStorage.getItem('plugins');
    if (!pluginsData) return;

    const savedPluginsStore = JSON.parse(pluginsData) as PluginsStoreType;
    // have current pluginsStore take precedence over savedPluginsStore, so that any new servers added since last save are not lost
    pluginsStore.servers = {
      ...savedPluginsStore.servers,
      ...pluginsStore.servers,
    };
    pluginsStore.openServer = pickDefaultOpenServer(
      pluginsStore.servers,
      savedPluginsStore.openServer
    );
    pluginsStore.filter = savedPluginsStore.filter;

    // The mutations above retrigger the persistence task below, which writes the
    // merged store to the right place per server. Saving savedPluginsStore here
    // too would race that write and clobber servers only present in the DB.
    if (session.value?.user?.id) localStorage.removeItem('plugins');
  });

  useTask$(async ({ track }) => {
    deepTrack(track, pluginsStore);

    if (pluginsStore.openServer && CurrentServer) {
      // check if any plugins are not fetched, and fetch them if so
      const plugins = CurrentServer.plugins;
      for (const pluginId in plugins) {
        const plugin = plugins[pluginId];
        if (!plugin.versions)
          Object.assign(plugin, await getPlugin(plugin).fetch());
      }
    } else {
      pluginsStore.openServer = pickDefaultOpenServer(pluginsStore.servers);
    }

    // Persist only from the browser: on SSR this task fires on every page load,
    // which would re-save the store before the user has changed anything.
    if (!isBrowser) return;

    try {
      const exportedServers: PluginsStoreType['servers'] = {};
      Object.keys(pluginsStore.servers).forEach((name) => {
        exportedServers[name] = {
          ...pluginsStore.servers[name],
          plugins: mapPluginsForExport(pluginsStore.servers[name].plugins),
        };
      });

      const exportedPluginsStore: PluginsStoreType = {
        servers: exportedServers,
        openServer: pluginsStore.openServer,
        filter: pluginsStore.filter,
      };
      // servers linked to a serverlist id persist to their listing's own
      // row instead of the user's plugins blob, so they don't get duplicated
      const serversWithoutId: PluginsStoreType['servers'] = {};
      const serversWithId: PluginsStoreType['servers'] = {};
      Object.keys(exportedServers).forEach((name) => {
        if (exportedServers[name].id) {
          serversWithId[name] = exportedServers[name];
        } else {
          serversWithoutId[name] = exportedServers[name];
        }
      });

      if (session.value?.user?.id) {
        // persist to the database for logged in users for the servers that don't have an id
        await setUserData({
          plugins: {
            ...exportedPluginsStore,
            servers: serversWithoutId,
          },
        });

        // persist id-linked servers to their own serverlist row
        await Promise.all(
          Object.values(serversWithId).map((server) =>
            updateServerListData(server.id!, { plugins: server.plugins })
          )
        );
        return;
      }

      // persist to localStorage for non-logged in users
      // sometimes when a user is logged out, data can be saved in memory and then saved here, so make sure to save servers without id
      localStorage.setItem(
        'plugins',
        JSON.stringify({
          ...exportedPluginsStore,
          servers: serversWithoutId,
        })
      );
    } catch (e) {
      const notification = new Notification()
        .setTitle('Error saving plugins')
        .setDescription(
          `There was an error saving your plugins: ${e instanceof Error ? e.message : String(e)}.`
        )
        .setBgColor('lum-grad-bg-red/50');
      notifications.push(notification.toJSON());
    }
  });

  const outdatedPlugins = useComputed$(() => {
    if (!pluginsStore.openServer || !CurrentServer?.plugins) return;
    return Object.values(CurrentServer.plugins).filter((plugin) => {
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
          'nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.'
        )}
        Warning: this tool is in an alpha state and may have bugs that cause it
        to not detect updates correctly, or in rare cases mark up to date
        plugins as out of date. Always double check for updates manually before
        updating your plugins, and report any bugs you find to help improve the
        tool.
      </p>

      <Tabs
        values={Object.entries(pluginsStore.servers).map(([k, v]) => ({
          name: k,
          value: k,
          permanent: !!v.id,
        }))}
        value={
          pluginsStore.openServer
            ? { name: pluginsStore.openServer, value: pluginsStore.openServer }
            : undefined
        }
        onDelete$={(serverName) => {
          delete pluginsStore.servers[serverName.value];
          if (pluginsStore.openServer === serverName.value) {
            pluginsStore.openServer = pickDefaultOpenServer(
              pluginsStore.servers
            );
          }
        }}
        onClick$={(serverName) => {
          pluginsStore.openServer = serverName.value;
        }}
        onPlus$={() => {
          const serverName = prompt('Enter server name')?.trim();
          if (serverName && serverName.toLowerCase() !== 'undefined') {
            if (pluginsStore.servers[serverName]) {
              alert('A server with that name already exists.');
              return;
            }
            pluginsStore.servers[serverName] = { ...serverDefaults };
            pluginsStore.openServer = serverName;
          }
        }}
      >
        {Object.entries(pluginsStore.servers).map(([k, V], i) =>
          V.icon ? (
            <img
              q:slot={`before-${k}`}
              key={i}
              width={16}
              height={16}
              src={V.icon}
              alt={`${k} icon`}
              class="rounded-lum-1 shrink-0"
            />
          ) : (
            <Globe q:slot={`before-${k}`} key={i} size={14} class="shrink-0" />
          )
        )}
      </Tabs>
      {Object.keys(pluginsStore.servers).length < 1 && (
        <p class="text-lum-text-secondary mx-2 text-sm">
          {t(
            'nav.resources.plugins.noServers@@No servers added yet. Get started by adding a server and some plugins!'
          )}
        </p>
      )}

      {pluginsStore.openServer && CurrentServer?.plugins && (
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
                    pluginsStore.openServer ?? ''
                  )?.trim();
                  if (
                    newName &&
                    newName.toLowerCase() !== 'undefined' &&
                    newName !== pluginsStore.openServer &&
                    pluginsStore.openServer
                  ) {
                    if (pluginsStore.servers[newName]) {
                      alert('A server with that name already exists.');
                      return;
                    }
                    pluginsStore.servers[newName] = JSON.parse(
                      JSON.stringify(CurrentServer)
                    ) as ServerType;
                    pluginsStore.openServer = newName;
                  }
                }}
                title="Duplicate server"
              >
                <Copy size={16} />
              </button>

              <SelectMenu
                id="software"
                onChange$={(e, el) => {
                  pluginsStore.servers[pluginsStore.openServer!].software =
                    el.value as keyof typeof softwareOptions;
                }}
                values={Object.entries(softwareOptions).map(
                  ([key, option]) => ({
                    name: option.name,
                    value: key,
                  })
                )}
                value={CurrentServer?.software}
                class="lum-bg-transparent lum-btn-p-1 rounded-lum-1"
              >
                {Object.entries(softwareOptions).map(([key, Option]) => (
                  <Option.icon key={key} size={20} q:slot={`before-${key}`} />
                ))}
                <CurrentSoftware.icon size={20} q:slot="dropdown-before" />
              </SelectMenu>

              <button
                class="lum-btn lum-btn-p-1 rounded-lum-1 flex cursor-pointer items-center justify-center gap-2 border-none transition-all duration-300"
                onClick$={() => {
                  if (!CurrentServer) return;
                  const exportedPlugins = mapPluginsForExport(
                    CurrentServer.plugins
                  );
                  navigator.clipboard
                    .writeText(JSON.stringify(exportedPlugins))
                    .then(() => {
                      const notification = new Notification()
                        .setTitle('Copied plugins to clipboard')
                        .setDescription(
                          'The plugins have been copied to your clipboard.'
                        )
                        .setBgColor('lum-grad-bg-green/50');
                      notifications.push(notification.toJSON());
                    })
                    .catch((err) => {
                      console.error(
                        'Failed to copy plugins to clipboard:',
                        err
                      );
                      const notification = new Notification();
                      notification
                        .setTitle('Failed to copy plugins to clipboard')
                        .setDescription(
                          err instanceof Error ? err.message : String(err)
                        )
                        .setBgColor('lum-grad-bg-red/50')
                        .setPersist(true);
                      notifications.push(notification.toJSON());
                    });
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
                    const importJSON = JSON.parse(el.value) as Record<
                      string,
                      PluginType
                    >;
                    await Promise.all(
                      Object.values(importJSON).map(async (plugin) => {
                        if (!plugin.id || !plugin.type) {
                          throw new Error(
                            `Invalid plugin data: ${JSON.stringify(plugin)}`
                          );
                        }
                        const fetchedPlugin = await getPlugin(plugin).fetch();
                        pluginsStore.servers[pluginsStore.openServer!].plugins[
                          fetchedPlugin.id
                        ] = fetchedPlugin;
                      })
                    );
                    el.value = '';
                    const notification = new Notification()
                      .setTitle('Plugins imported successfully')
                      .setDescription(
                        'The plugins have been imported successfully.'
                      )
                      .setBgColor('lum-grad-bg-green/50');
                    notifications.push(notification.toJSON());
                  } catch (err) {
                    console.error('Failed to parse imported plugins:', err);
                    const notification = new Notification()
                      .setTitle('Failed to parse imported plugins')
                      .setDescription(
                        `An error occurred while parsing imported plugins. ${err instanceof Error ? err.message : String(err)}`
                      )
                      .setBgColor('lum-grad-bg-red/50');
                    notifications.push(notification.toJSON());
                  }
                }}
              />
              <SelectMenu
                id="filter"
                onChange$={(e, el) => {
                  if (el.value === 'all') pluginsStore.filter = undefined;
                  pluginsStore.filter = el.value as 'outdated' | PluginSource;
                }}
                values={[
                  { name: 'All', value: 'all' },
                  { name: 'Outdated', value: 'outdated' },
                  ...pluginSources,
                ]}
                value={pluginsStore.filter}
                customDropdownButton
                class="lum-bg-transparent lum-btn-p-1 rounded-lum-1"
              >
                <Fragment q:slot="dropdown">
                  <Filter size={16} />
                  Filter
                </Fragment>
              </SelectMenu>
            </div>

            {Object.keys(CurrentServer.plugins).length > 0 && (
              <div class="mx-auto flex items-center gap-1">
                {debug && (
                  <button
                    class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1"
                    onClick$={() => {
                      const plugins =
                        pluginsStore.servers[pluginsStore.openServer!].plugins;
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
                        await getPlugin(plugin).fetchVersions()
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
                        pluginsStore.servers[pluginsStore.openServer!].plugins;
                      for (const pluginId in plugins) {
                        const plugin = plugins[pluginId];
                        const updateAvailable =
                          plugin.latestVersion?.releaseDate !== undefined &&
                          plugin.currentVersion?.releaseDate !== undefined &&
                          new Date(plugin.latestVersion.releaseDate).getTime() >
                            new Date(
                              plugin.currentVersion.releaseDate
                            ).getTime();

                        if (!updateAvailable || !plugin.file?.url) continue;

                        if (plugin.type === 'spigot')
                          await downloadSpigotPlugin(plugin, spigotRateLimit);
                        else window.open(plugin.file.url, '_blank');

                        plugin.currentVersion = plugin.latestVersion;
                      }

                      isLoading.value = isLoading.value.filter(
                        (item) => item !== 'downloadAll'
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
            {Object.values(CurrentServer.plugins).map((plugin) => {
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
                        pluginsStore.servers[pluginsStore.openServer!].plugins[
                          plugin.id
                        ] = await getPlugin(plugin).fetch();
                      } catch (error) {
                        console.error('Error fetching plugin versions:', error);
                        const notification = new Notification()
                          .setTitle('Error fetching plugin versions')
                          .setDescription(
                            `An error occurred while fetching plugin versions. ${error instanceof Error ? error.message : String(error)}`
                          )
                          .setBgColor('lum-grad-bg-red/50');
                        notifications.push(notification.toJSON());
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
        class="text-lum-text lum-card lum-grad-bg-lum-card-bg/50 open:animate-in open:fade-in open:slide-in-from-top-8 animate-out fade-out slide-in-from-top-8 m-auto hidden min-w-1/4 overflow-visible drop-shadow-2xl backdrop-blur-xl duration-300 open:flex open:duration-300"
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

          <Label
            for="add-plugin-type"
            label={t('plugins.source@@Plugin Source')}
          >
            <Globe size={16} q:slot="before-label" />
            <SelectMenu
              id="add-plugin-type"
              onChange$={(e, el) => {
                resolvedPlugin.type = el.value as PluginSource;
                resolvedPlugin.plugin = undefined;
              }}
              values={pluginSources}
            >
              {Object.entries(pluginSourcesIcons).map(([key, Icon]) => (
                <Icon key={key} size={20} q:slot={`before-${key}`} />
              ))}
              {Object.entries(pluginSourcesDescriptions).map(
                ([key, description]) => (
                  <span key={key} class="text-sm" q:slot={`after-${key}`}>
                    <br />
                    {description}
                  </span>
                )
              )}
              {(() => {
                const Icon = pluginSourcesIcons[resolvedPlugin.type];
                return <Icon size={20} q:slot="dropdown-before" />;
              })()}
            </SelectMenu>
          </Label>

          {resolvedPlugin.type !== 'misc' && (
            <AddPluginDialog
              type={resolvedPlugin.type}
              currentServer={CurrentServer}
            />
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
            <div class="border-lum-border/10 animate-in fade-in slide-in-from-top-8 mt-4 flex justify-end gap-1 border-t pt-4 transition-all duration-300">
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
