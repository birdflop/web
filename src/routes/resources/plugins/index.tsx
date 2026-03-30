import { $, component$, createContextId, isBrowser, useComputed$, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Copy, Download, Pencil, Plus, Trash, X } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import PluginCard, { PluginSource, PluginType, PluginWithData } from '~/components/plugins/PluginCard';
import AddSpigotDialog from '~/components/plugins/AddSpigotDialog';
import AddMiscDialog from '~/components/plugins/AddMiscDialog';
import { deepTrack } from '~/util/misc';

const debug = true;

export const downloadSpigotPlugin = $(async (
  plugin: PluginWithData,
  spigotRateLimit?: { downloadCount: number, resetTime: number },
  notifications?: Notification[],
) => {
  // if the plugin has an external url, open that instead of spigot to avoid rate limits
  if (plugin.data?.file?.externalUrl) {
    window.open(plugin.data.file.externalUrl, '_blank');
    return;
  }

  // spigot rate limits downloads to 10 per minute
  if (spigotRateLimit && spigotRateLimit.downloadCount >= 10 && Date.now() < spigotRateLimit.resetTime) {
    if (notifications) {
      const notification = new Notification()
        .setTitle('Spigot Download Rate Limit Reached')
        .setDescription(`Spigot limits downloads to 10 per minute. Waiting ${Math.ceil((spigotRateLimit.resetTime - Date.now()) / 1000)} seconds to continue downloading.`)
        .setBgColor('lum-bg-yellow/50')
        .setPersist(true);
      notifications.push(notification);
    }
    await new Promise((resolve) => setTimeout(resolve, spigotRateLimit.resetTime - Date.now()));
    spigotRateLimit.downloadCount = 0;
  }

  // open the plugin file url in a new tab to trigger the download
  window.open(`https://www.spigotmc.org/${plugin.data?.file?.url}`, '_blank');

  if (!spigotRateLimit) return;
  spigotRateLimit.downloadCount++;
  // set the reset time to 1 minute from now
  if (spigotRateLimit.resetTime < Date.now())
    spigotRateLimit.resetTime = Date.now() + 60 * 1000;
});

type ResolvedPluginType = {
  type: PluginSource;
  plugin?: PluginWithData;
  plugins?: PluginWithData[];
};

type PluginsStoreType = {
  servers: {
    [serverName: string]: PluginWithData[];
  }
  openServer?: string;
  showOnlyOutdated?: boolean;
}

export const resolvedPluginContext = createContextId<ResolvedPluginType>('resolve-plugin');
export const pluginsStoreContext = createContextId<PluginsStoreType>('plugins-store');
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

  const resolvedPlugin = useStore<ResolvedPluginType>({
    type: 'spigot',
  }, { deep: true });
  useContextProvider(resolvedPluginContext, resolvedPlugin);

  const pluginsStore = useStore<PluginsStoreType>({
    servers: {},
  }, { deep: true });
  useContextProvider(pluginsStoreContext, pluginsStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!isBrowser) return; // dont load plugins on the server
    const savedPlugins = localStorage.getItem('plugins');
    if (savedPlugins) {
      try {
        const parsed = JSON.parse(savedPlugins);
        pluginsStore.servers = parsed.servers || {};
        pluginsStore.openServer = parsed.openServer;
        pluginsStore.showOnlyOutdated = parsed.showOnlyOutdated;
      } catch (e) {
        const notification = new Notification()
          .setTitle('Error loading plugins')
          .setDescription(`There was an error loading your saved plugins: ${e}.`)
          .setBgColor('lum-bg-red/50');
        notifications.push(notification);
      }
    }
  });

  useTask$(({ track }) => {
    deepTrack(track, pluginsStore);
    console.log(Date.now());

    if (!isBrowser) return;

    // strip all plugin data before saving
    const pluginsToSave = {
      ...pluginsStore,
      servers: Object.fromEntries(
        Object.entries(pluginsStore.servers).map(([serverName, plugins]) => [
          serverName,
          plugins.map((plugin) => ({
            id: plugin.id,
            iconUrl: plugin.iconUrl,
            url: plugin.url,
            name: plugin.name,
            version: plugin.version,
            type: plugin.type,
            updateDate: plugin.updateDate,
          })),
        ]),
      ),
    };

    try {
      localStorage.setItem('plugins', JSON.stringify(pluginsToSave));
    } catch (e) {
      const notification = new Notification()
        .setTitle('Error saving plugins')
        .setDescription(`There was an error saving your plugins: ${e}.`)
        .setBgColor('lum-bg-red/50');
      notifications.push(notification);
    }
  });

  const outdatedPlugins = useComputed$(() => {
    if (!pluginsStore.openServer || !pluginsStore.servers[pluginsStore.openServer]) return;
    return pluginsStore.servers[pluginsStore.openServer].filter((plugin) => {
      const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
        && plugin.version?.releaseDate !== undefined
        && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;
      return updateAvailable && plugin.data?.file?.url;
    }).length;
  });

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <Blocks size={32} />
        {t('nav.resources.plugins.title@@Plugin Updater')}
        <span class="lum-bg-blue/50 text-xs py-1 px-2 rounded-lum-1">
          {t('nav.experimental@@experimental')}
        </span>
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4 text-lum-text-secondary">
        {t('nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.')}
      </p>

      <div class="lum-card p-1 gap-1 flex-row items-center overflow-x-scroll">
        {(Object.keys(pluginsStore.servers).length > 0) && (
          Object.keys(pluginsStore.servers).map((server) => (
            <div key={server} class={{
              'lum-btn lum-btn-p-1 rounded-lum-1 lum-bg-transparent': true,
              'lum-bg-blue/50 hover:lum-bg-blue/80': pluginsStore.openServer === server,
            }} onClick$={() => pluginsStore.openServer = pluginsStore.openServer === server ? undefined : server}>
              {server}
            </div>
          ))
        )}
        <button class="lum-btn p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
          const serverName = prompt('Enter server name');
          if (serverName) {
            if (pluginsStore.servers[serverName]) {
              alert('A server with that name already exists.');
              return;
            }
            pluginsStore.servers[serverName] = [];
            pluginsStore.openServer = serverName;
          }
        }} title="Add server">
          <Plus />
        </button>
        {Object.keys(pluginsStore.servers).length < 1 && <p class="text-sm text-lum-text-secondary mx-2">
          {t('nav.resources.plugins.noServers@@No servers added yet. Get started by adding a server and some plugins!')}
        </p>}
      </div>

      {(pluginsStore.openServer && pluginsStore.servers[pluginsStore.openServer]) && <>
        <div class="lum-card p-1 gap-1 flex-row mt-4">
          <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
            modalRef.value?.showModal();
          }}>
            <Plus size={16} />
            Add plugin
          </button>

          <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
            if (!pluginsStore.openServer) return;
            const newName = prompt('Enter new server name', `${pluginsStore.openServer}`);
            if (newName && newName !== pluginsStore.openServer) {
              if (pluginsStore.servers[newName]) {
                alert('A server with that name already exists.');
                return;
              }
              delete pluginsStore.servers[pluginsStore.openServer];
              pluginsStore.servers[newName] = pluginsStore.servers[pluginsStore.openServer];
              pluginsStore.openServer = newName;
            }
          }} title="Rename server">
            <Pencil size={16} />
          </button>

          <button class="lum-btn lum-btn-p-1 lum-bg-transparent hover:lum-bg-red rounded-lum-1" onClick$={() => {
            if (!pluginsStore.openServer) return;
            if (confirm(`Are you sure you want to delete the server "${pluginsStore.openServer}"? This action cannot be undone.`)) {
              delete pluginsStore.servers[pluginsStore.openServer];
              pluginsStore.openServer = undefined;
            }
          }} title="Delete server">
            <Trash size={16} />
          </button>
          <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
            if (!pluginsStore.openServer) return;
            const plugins = pluginsStore.servers[pluginsStore.openServer];

            const notification = new Notification()
              .setTitle('Plugins copied to clipboard')
              .setDescription(`The plugins for server "${pluginsStore.openServer}" have been copied to your clipboard as JSON.`)
              .setBgColor('lum-bg-green/50');
            navigator.clipboard.writeText(JSON.stringify(plugins)).catch((err) => {
              notification.setTitle('Failed to copy plugins to clipboard')
                .setDescription(err)
                .setBgColor('lum-bg-red/50')
                .setPersist(true);
            });
            notifications.push(notification);
          }} title="Export server plugins as JSON">
            <Copy size={16} />
          </button>
          <input class="lum-input lum-input-p-1 rounded-lum-1 lum-bg-transparent" id="import" name="import" placeholder={`${t('plugins.import@@Import')} - ${t('plugins.pasteHere@@Paste here')}`}
            onInput$={(e, el) => {
              if (!pluginsStore.openServer) return;
              try {
                const importedPlugins = JSON.parse(el.value) as PluginWithData[];
                pluginsStore.servers[pluginsStore.openServer].push(...importedPlugins);
              } catch (err) {
                console.error('Failed to parse imported plugins:', err);
              }
            }}/>

          <div class="flex-1" />

          {pluginsStore.servers[pluginsStore.openServer].length > 0 && <>
            {debug && (
              <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
                const plugins = pluginsStore.servers[pluginsStore.openServer!];
                plugins.forEach((plugin) => {
                  if (plugin.data?.latestVersion) {
                    plugin.version = {
                      id: 0,
                      name: '0.0.0',
                      releaseDate: 1,
                    };
                  }
                });
              }}>
                <X size={16} />
                Mark all out of date
              </button>
            )}
            <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
              const plugins = pluginsStore.servers[pluginsStore.openServer!];
              plugins.forEach((plugin) => {
                if (plugin.data?.latestVersion) plugin.version = plugin.data.latestVersion;
                plugin.updateDate = Date.now();
              });
            }}>
              <Check size={16} />
              Mark all updated
            </button>
          </>}

          {!!outdatedPlugins.value &&
            <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1 group" onClick$={async () => {

              isLoading.value = [...isLoading.value, 'downloadAll'];

              const plugins = pluginsStore.servers[pluginsStore.openServer!];
              for (const plugin of plugins) {
                const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
                  && plugin.version?.releaseDate !== undefined
                  && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;

                if (!updateAvailable || !plugin.data?.file?.url) return;

                if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin, spigotRateLimit);
                else window.open(plugin.data.file.url, '_blank');

                plugin.version = plugin.data?.latestVersion;
              }

              isLoading.value = isLoading.value.filter((item) => item !== 'downloadAll');
            }} disabled={isLoading.value.includes('downloadAll')}>
              <Download size={16} />
              Download all out of date ({outdatedPlugins.value})
              {outdatedPlugins.value > 10 &&
                <span class="lum-card p-2 absolute bottom-full left-0 w-full text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Spigot limits downloads to 10 per minute, so some of these may not open immediately.
                </span>
              }
              {isLoading.value.includes('downloadAll') && <div class="lum-loading ml-2 w-4 h-4" />}
            </button>
          }

          <div class="flex-1" />

          <div class="px-4 flex items-center">
            <Toggle id="show-only-outdated" checked={pluginsStore.showOnlyOutdated} onChange$={(e, el) => {
              pluginsStore.showOnlyOutdated = el.checked;
            }}>
              Only show out of date
            </Toggle>
          </div>
        </div>
        <div class="grid gap-2 my-4">
          {pluginsStore.servers[pluginsStore.openServer].map((plugin) => {
            const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
              && plugin.version?.releaseDate !== undefined
              && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;

            if ((pluginsStore.showOnlyOutdated && !updateAvailable)) return;

            return <PluginCard key={plugin.name}
              plugin={plugin}
              updateAvailable={updateAvailable}
              spigotRateLimit={spigotRateLimit}>
              <button class="lum-btn rounded-lum-2 p-2 lum-bg-transparent hover:lum-bg-red" q:slot="extra-actions" onClick$={() => {
                const plugins = pluginsStore.servers[pluginsStore.openServer!];
                const index = plugins.findIndex((p) => p.name === plugin.name);
                if (index !== -1) {
                  plugins.splice(index, 1);
                }
              }}>
                <Trash size={16} />
              </button>
            </PluginCard>;
          })}
        </div>
      </>}

      <dialog ref={modalRef}
        class={{
          'm-auto hidden open:flex text-lum-text': true,
          'lum-card lum-bg-lum-card-bg/50 drop-shadow-2xl backdrop-blur-xl min-w-1/4': true,
          'open:animate-in open:fade-in open:slide-in-from-top-8 open:anim-duration-300': true,
          'animate-out fade-out slide-in-from-top-8 anim-duration-300': true,
        }}>
        <div class="flex flex-col">
          <div class="flex flex-col border-b border-lum-border/10 pb-4 mb-4">
            <h3 class="flex items-center gap-2 font-bold text-2xl">
              <Blocks size={28} />
              Add a plugin
              <button class="lum-btn p-2 lum-bg-transparent rounded-lum-1 ml-auto" onClick$={() => {
                modalRef.value?.close();
              }}>
                <X size={20} />
              </button>
            </h3>
          </div>

          <SelectMenu id="add-plugin-type" onChange$={(e, el) => {
            resolvedPlugin.type = el.value as PluginSource;
            resolvedPlugin.plugin = undefined;
          }} values={[
            { name: <span class="text-left max-w-72">
              SpigotMC.org<br/>
              <span class="text-xs text-lum-text-secondary text-wrap">
                Most popular plugin platform<br/>
                but a lot of plugin devs are moving to Modrinth.
              </span>
            </span>, value: 'spigot' },
            // { name: 'CurseForge', value: 'curseforge' },
            // { name: 'Modrinth', value: 'modrinth' },
            // { name: 'Hangar', value: 'hangar' },
            // { name: 'GitHub', value: 'github' },
            { name: <span class="text-left max-w-72">
              Misc<br/>
              <span class="text-xs text-lum-text-secondary text-wrap">
                For plugins that aren't on the above platforms,<br/>
                you can manually check for updates in one place.
              </span>
            </span>, value: 'misc' },
          ]}>
            Plugin source
          </SelectMenu>

          <hr/>

          {resolvedPlugin.type === 'spigot' && <AddSpigotDialog />}
          {resolvedPlugin.type === 'misc' && <AddMiscDialog />}

          {resolvedPlugin.plugin && <>
            <hr/>
            <PluginCard
              plugin={resolvedPlugin.plugin}
              spigotRateLimit={spigotRateLimit}
            />
          </>}

          {(resolvedPlugin.type === 'misc' || resolvedPlugin.plugin?.version) &&
            <div class={{
              'flex transition-all duration-300 gap-1 justify-end border-t border-lum-border/10 mt-4 pt-4': true,
              'animate-in fade-in slide-in-from-top-8 anim-duration-300': true,
            }}>
              <button
                class="lum-btn lum-bg-green/50 hover:lum-bg-green disabled:bg-gray-600 disabled:cursor-not-allowed"
                onClick$={() => {
                  if (!pluginsStore.openServer || !resolvedPlugin.plugin) return;

                  const plugin: PluginType = {
                    type: resolvedPlugin.type,
                    id: resolvedPlugin.plugin.id,
                    name: resolvedPlugin.plugin.name,
                    url: resolvedPlugin.plugin.url,
                    iconUrl: resolvedPlugin.plugin.data?.iconUrl,
                    version: resolvedPlugin.plugin.version ? {
                      id: resolvedPlugin.plugin.version.id,
                      name: resolvedPlugin.plugin.version.name,
                      releaseDate: resolvedPlugin.plugin.version.releaseDate,
                    } : undefined,
                  };

                  pluginsStore.servers = {
                    ...pluginsStore.servers,
                    [pluginsStore.openServer]: [
                      ...pluginsStore.servers[pluginsStore.openServer],
                      plugin,
                    ],
                  };
                  resolvedPlugin.plugin = undefined;
                  modalRef.value?.close();
                }}
              >
                <Plus size={20} /> Add
              </button>
            </div>
          }
        </div>
      </dialog>

    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updater - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});