import { $, component$, createContextId, isBrowser, useComputed$, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Copy, Download, Ellipsis, Filter, Pencil, Plus, Trash, X } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SelectMenu, SelectMenuRaw } from '@luminescent/ui-qwik';
import PluginCard, { PluginSource, PluginType, PluginWithData } from '~/components/plugins/PluginCard';
import AddSpigotDialog from '~/components/plugins/AddSpigotDialog';
import AddModrinthDialog from '~/components/plugins/AddModrinthDialog';
import AddGitHubDialog from '~/components/plugins/AddGitHubDialog';
import AddMiscDialog from '~/components/plugins/AddMiscDialog';
import { deepTrack } from '~/util/misc';
import { softwareOptions } from '../flags';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';

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
        .setBgColor('lum-grad-bg-yellow/50')
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

type ServerType = {
  software: string;
  plugins: PluginWithData[];
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
  plugins: [],
};

type PluginSourceComponent = {
  noDescription?: boolean;
}

const Modrinth = component$(({ noDescription }: PluginSourceComponent) => <span class="text-left">
  <span class="flex items-center gap-2">
    <SiModrinth class="fill-current" size={20} />
    Modrinth<br/>
  </span>
  {!noDescription
    && <span class="text-xs flex text-lum-text-secondary text-wrap whitespace-pre-line mt-2">
      {`Newer plugin platform that's gaining popularity.
      Many plugins are primarily releasing on Modrinth now,
      so check here first when adding a plugin.`}
    </span>
  }
</span>);

const SpigotMC = component$(({ noDescription }: PluginSourceComponent) => <span class="text-left">
  <span class="flex items-center gap-2">
    <SiSpigotmc class="fill-current" size={20} />
    SpigotMC<br/>
  </span>
  {!noDescription
    && <span class="text-xs flex text-lum-text-secondary text-wrap whitespace-pre-line mt-2">
      {`Most popular plugin platform.
      Many plugins are moving to Modrinth,
      use this if the plugin isn't on Modrinth yet.`}
    </span>
  }
</span>);

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

const Misc = component$(({ noDescription }: PluginSourceComponent) => <span class="text-left">
  <span class="flex items-center gap-2">
    <Ellipsis size={20} />
    Misc<br/>
  </span>
  {!noDescription
    && <span class="text-xs flex text-lum-text-secondary text-wrap whitespace-pre-line mt-2">
      {`For plugins that aren't on the above platforms,
      you can manually check for updates in one place.`}
    </span>
  }
</span>);

const pluginSources = [
  { component: Modrinth, value: 'modrinth' },
  { component: SpigotMC, value: 'spigot' },
  // { component: CurseForge, value: 'curseforge' },
  // { component: Modrinth, value: 'modrinth' },
  // { component: Hangar, value: 'hangar' },
  { component: GitHub, value: 'github' },
  { component: Misc, value: 'misc' },
];

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
    type: 'modrinth',
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
        pluginsStore.filter = parsed.filter;
      } catch (e) {
        const notification = new Notification()
          .setTitle('Error loading plugins')
          .setDescription(`There was an error loading your saved plugins: ${e}.`)
          .setBgColor('lum-grad-bg-red/50');
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
        Object.entries(pluginsStore.servers).map(([serverName, { plugins, ...rest }]) => [
          serverName,
          {
            ...rest,
            plugins: plugins.map((plugin) => ({
              id: plugin.id,
              iconUrl: plugin.iconUrl,
              url: plugin.url,
              name: plugin.name,
              version: plugin.version,
              type: plugin.type,
              updateDate: plugin.updateDate,
            })),
          },
        ]),
      ),
    };

    try {
      localStorage.setItem('plugins', JSON.stringify(pluginsToSave));
    } catch (e) {
      const notification = new Notification()
        .setTitle('Error saving plugins')
        .setDescription(`There was an error saving your plugins: ${e}.`)
        .setBgColor('lum-grad-bg-red/50');
      notifications.push(notification);
    }
  });

  const outdatedPlugins = useComputed$(() => {
    if (!pluginsStore.openServer || !pluginsStore.servers[pluginsStore.openServer].plugins) return;
    return pluginsStore.servers[pluginsStore.openServer].plugins.filter((plugin) => {
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
        {t('nav.resources.plugins.title@@Plugin Updates')}
        <span class="lum-grad-bg-blue/50 text-xs py-1 px-2 rounded-lum-1">
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
              'lum-grad-bg-blue/50 hover:lum-bg-blue/80': pluginsStore.openServer === server,
            }} onClick$={() => pluginsStore.openServer = pluginsStore.openServer === server ? undefined : server}>
              {server}
            </div>
          ))
        )}
        <button class="lum-btn p-2 lum-bg-transparent rounded-lum-1" onClick$={() => {
          const serverName = prompt('Enter server name');
          if (serverName) {
            if (pluginsStore.servers[serverName]) {
              alert('A server with that name already exists.');
              return;
            }
            pluginsStore.servers[serverName] = serverDefaults;
            pluginsStore.openServer = serverName;
          }
        }} title="Add server">
          <Plus size={16} />
        </button>
        {Object.keys(pluginsStore.servers).length < 1 && <p class="text-sm text-lum-text-secondary mx-2">
          {t('nav.resources.plugins.noServers@@No servers added yet. Get started by adding a server and some plugins!')}
        </p>}
      </div>

      {(pluginsStore.openServer && pluginsStore.servers[pluginsStore.openServer].plugins) && <>
        <div class="lum-card p-1 gap-1 mt-4 lum-grad-bg-lum-card-bg">
          <div class="flex items-center gap-1">
            <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
              modalRef.value?.showModal();
            }}>
              <Plus size={16} />
              Add plugin
            </button>

            <button class="lum-btn p-2 lum-bg-transparent rounded-lum-1" onClick$={() => {
              const newName = prompt('Enter new server name', `${pluginsStore.openServer}`);
              if (newName && newName !== pluginsStore.openServer) {
                if (pluginsStore.servers[newName]) {
                  alert('A server with that name already exists.');
                  return;
                }
                delete pluginsStore.servers[pluginsStore.openServer!];
                pluginsStore.servers[newName] = pluginsStore.servers[pluginsStore.openServer!];
                pluginsStore.openServer = newName;
              }
            }} title="Rename server">
              <Pencil size={16} />
            </button>
            <button class="lum-btn p-2 lum-bg-transparent hover:lum-bg-red rounded-lum-1" onClick$={() => {
              if (confirm(`Are you sure you want to delete the server "${pluginsStore.openServer}"? This action cannot be undone.`)) {
                delete pluginsStore.servers[pluginsStore.openServer!];
                pluginsStore.openServer = undefined;
              }
            }} title="Delete server">
              <Trash size={16} />
            </button>

            <SelectMenuRaw id="software" onChange$={(e, el) => {
              pluginsStore.servers[pluginsStore.openServer!].software = el.value;
            }} values={softwareOptions} value={pluginsStore.servers[pluginsStore.openServer].software}
            class={{ 'lum-bg-transparent lum-btn-p-1 rounded-lum-1': true }}/>

            <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
              const plugins = pluginsStore.servers[pluginsStore.openServer!].plugins;

              const notification = new Notification()
                .setTitle('Plugins copied to clipboard')
                .setDescription(`The plugins for server "${pluginsStore.openServer}" have been copied to your clipboard as JSON.`)
                .setBgColor('lum-grad-bg-green/50');
              navigator.clipboard.writeText(JSON.stringify(plugins)).catch((err) => {
                notification.setTitle('Failed to copy plugins to clipboard')
                  .setDescription(err)
                  .setBgColor('lum-grad-bg-red/50')
                  .setPersist(true);
              });
              notifications.push(notification);
            }} title="Export server plugins as JSON">
              <Copy size={16} /> Export (Recommended for backup for now.)
            </button>

            <input class="lum-input lum-input-p-1 rounded-lum-1 lum-bg-transparent flex-1" id="import" name="import" placeholder={`${t('plugins.import@@Import')} - ${t('plugins.pasteHere@@Paste here')}`}
              onInput$={(e, el) => {
                try {
                  const importedPlugins = JSON.parse(el.value) as PluginWithData[];
                  pluginsStore.servers[pluginsStore.openServer!].plugins.push(...importedPlugins);
                } catch (err) {
                  console.error('Failed to parse imported plugins:', err);
                }
              }}/>
            <SelectMenuRaw id="filter" onChange$={(e, el) => {
              if (el.value === 'all') pluginsStore.filter = undefined;
              pluginsStore.filter = el.value as 'outdated' | PluginSource;
            }} values={[
              { name: 'All', value: 'all' },
              { name: 'Outdated', value: 'outdated' },
              ...pluginSources.map((Source) => ({ name: <Source.component noDescription />, value: Source.value })),
            ]} value={pluginsStore.filter} customDropdown
            class={{ 'lum-bg-transparent lum-btn-p-1 rounded-lum-1': true }}>
              <span class="flex items-center gap-2" q:slot="dropdown">
                <Filter size={16} />
                Filter
              </span>
            </SelectMenuRaw>
          </div>

          <div class="flex gap-1 items-center mx-auto">
            {pluginsStore.servers[pluginsStore.openServer].plugins.length > 0 && <>
              {debug && (
                <button class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-1" onClick$={() => {
                  const plugins = pluginsStore.servers[pluginsStore.openServer!].plugins;
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
                const plugins = pluginsStore.servers[pluginsStore.openServer!].plugins;
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

                const plugins = pluginsStore.servers[pluginsStore.openServer!].plugins;
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
          </div>
        </div>
        <div class="grid gap-2 my-4">
          {pluginsStore.servers[pluginsStore.openServer].plugins.map((plugin) => {
            const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
              && plugin.version?.releaseDate !== undefined
              && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;

            if (pluginsStore.filter === 'outdated' && !updateAvailable) return null;
            if (pluginsStore.filter && pluginsStore.filter !== 'outdated' && plugin.type !== pluginsStore.filter) return null;

            return <PluginCard key={plugin.name}
              plugin={plugin}
              updateAvailable={updateAvailable}
              spigotRateLimit={spigotRateLimit}>
              <button class="lum-btn rounded-lum-2 p-2 lum-bg-transparent hover:lum-bg-red" q:slot="extra-actions" onClick$={() => {
                const plugins = pluginsStore.servers[pluginsStore.openServer!].plugins;
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
          'lum-card lum-grad-bg-lum-card-bg/50 drop-shadow-2xl backdrop-blur-xl min-w-1/4': true,
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
          }} values={pluginSources.map((Source) => ({ name: <Source.component />, value: Source.value }))}>
            Plugin source
          </SelectMenu>

          <hr/>

          {resolvedPlugin.type === 'spigot' && <AddSpigotDialog />}
          {resolvedPlugin.type === 'modrinth' && <AddModrinthDialog />}
          {resolvedPlugin.type === 'github' && <AddGitHubDialog />}
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
                  if (!resolvedPlugin.plugin) return;

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

                  pluginsStore.servers[pluginsStore.openServer!].plugins.push(plugin);

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
  title: 'Plugin Updates - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});