import { $, component$, isBrowser, useComputed$, useContext, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Download, Plus, X } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import PluginCard, { PluginData, PluginWithData } from '~/components/plugins/PluginCard';

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'plugins', url.searchParams);
});

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

export default component$(() => {
  const t = inlineTranslate();

  const { cookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);
  const modalRef = useSignal<HTMLDialogElement>();

  const isLoading = useSignal([] as string[]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    errors.forEach((error) => {
      const notification = new Notification()
        .setTitle('Error loading cookies')
        .setDescription(`${error}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    });
  });

  // spigot only allows 10 downloads per minute
  const spigotRateLimit = useStore({
    downloadCount: 0,
    resetTime: 0,
  });

  const resolvedPlugin = useStore<{
    plugin?: PluginWithData;
  }>({
    plugin: undefined,
  }, { deep: true });

  const pluginsStore = useStore<{
    openServer?: string;
    servers: { [key: string]: PluginWithData[] };
    showOnlyOutdated: boolean;
  }>({
    showOnlyOutdated: false,
    openServer: 'Luminara SMP',
    servers: {
      ...cookies,
      // temp data
      'Luminara SMP': [
        {
          name: 'AdvancedPortals',
          type: 'spigot',
          id: '14356',
        },
        {
          name: 'AntiCheatReplay',
          type: 'spigot',
          id: '97845',
        },
        {
          name: 'ArmorStandEditor',
          type: 'spigot',
          id: '94503',
        },
        {
          name: 'ChestShopNotifier',
          type: 'spigot',
          id: '30313',
        },
        {
          name: 'CMILib',
          type: 'spigot',
          id: '87610',
        },
        {
          name: 'DeathMessages',
          type: 'spigot',
          id: '3789',
        },
        {
          name: 'GeyserUpdater',
          type: 'spigot',
          id: '88555',
        },
        {
          name: 'GSit',
          type: 'spigot',
          id: '62325',
        },
        {
          name: 'iWarp',
          type: 'spigot',
          id: '68157',
        },
        {
          name: 'Jobs',
          type: 'spigot',
          id: '4216',
        },
        {
          name: 'LibsDisguises',
          type: 'spigot',
          id: '81',
        },
        {
          name: 'MarriageMaster',
          type: 'spigot',
          id: '19273',
        },
        {
          name: 'NuVotifier',
          type: 'spigot',
          id: '13449',
        },
        {
          name: 'PaperMoney',
          type: 'spigot',
          id: '42464',
        },
        {
          name: 'PerWorldInventory',
          type: 'spigot',
          id: '4482',
        },
        {
          name: 'PlaceholderAPI',
          type: 'spigot',
          id: '6245',
        },
        {
          name: 'SimpleRename',
          type: 'spigot',
          id: '16220',
        },
        {
          name: 'UltraStaffChatPro',
          type: 'spigot',
          id: '80461',
        },
        {
          name: 'WorldGuardExtraFlags',
          type: 'spigot',
          id: '4823',
        },
      ],

    },
  }, { deep: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => pluginsStore.openServer);
    if (!isBrowser) return; // dont request plugin data on the server
    if (pluginsStore.openServer) {
      const plugins = pluginsStore.servers[pluginsStore.openServer];
      for (const plugin of plugins) {
        if (plugin.data || !plugin.id) return;
        try {
          const res = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}`);
          const data = await res.json() as any;

          const pluginData: PluginData = {
            external: data.external,
            name: data.name,
            tag: data.tag,
            iconUrl: data.icon?.url,
            releaseDate: data.releaseDate,
            updateDate: data.updateDate,
            file: data.file ? {
              type: data.file.type,
              size: data.file.size,
              sizeUnit: data.file.sizeUnit,
              url: data.file.url,
              externalUrl: data.file.externalUrl,
            } : undefined,
            testedVersions: data.testedVersions?.length
              ? data.testedVersions : undefined,
            sourceCodeLink: data.sourceCodeLink,
          };
          // fetch latest version
          const latestVerResponse = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}/versions/latest`);
          const latestVersion = await latestVerResponse.json() as any;
          pluginData.latestVersion = {
            id: latestVersion.id,
            name: latestVersion.name,
            releaseDate: latestVersion.releaseDate,
          };

          plugin.data = pluginData;
        }
        catch (err) {
          console.error(`Failed to fetch plugin data for ${plugin.name}:`, err);
        }
      }
    }
  });

  const outdatedPlugins = useComputed$(() => {
    if (!pluginsStore.openServer) return;
    return pluginsStore.servers[pluginsStore.openServer]?.filter((plugin) => {
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

      <div class="lum-card p-1 gap-1 flex-row">
        <button class="lum-btn lum-bg-transparent rounded-lum-1" onClick$={() => {
          pluginsStore.servers['Server ' + (Object.keys(pluginsStore.servers).length + 1)] = [];
        }}>
          <Plus size={16} />
          Add server
        </button>
        {pluginsStore.servers && Object.keys(pluginsStore.servers).length > 0 ? (
          Object.keys(pluginsStore.servers).map((server) => (
            <button key={server} class={{
              'lum-btn rounded-lum-1': true,
              'lum-bg-blue/50 hover:lum-bg-blue/80': pluginsStore.openServer === server,
            }} onClick$={() => pluginsStore.openServer = pluginsStore.openServer === server ? undefined : server}>
              {server}
            </button>
          ))
        ) : (
          <p>
            {t('nav.resources.plugins.noPlugins@@No servers found.')}
          </p>
        )}
      </div>
      {pluginsStore.openServer &&
        <div class="lum-card p-1 gap-1 flex-row mt-4">
          <button class="lum-btn lum-bg-transparent rounded-lum-1" onClick$={() => {
            modalRef.value?.showModal();
          }}>
            <Plus size={16} />
            Add plugin
          </button>

          <div class="flex-1" />

          {debug && (
            <button class="lum-btn lum-bg-transparent rounded-lum-1" onClick$={() => {
              if (!pluginsStore.openServer) return;
              const plugins = pluginsStore.servers[pluginsStore.openServer];
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

          <button class="lum-btn lum-bg-transparent rounded-lum-1" onClick$={() => {
            if (!pluginsStore.openServer) return;
            const plugins = pluginsStore.servers[pluginsStore.openServer];
            plugins.forEach((plugin) => {
              if (plugin.data?.latestVersion) {
                plugin.version = plugin.data.latestVersion;
              }
            });
          }}>
            <Check size={16} />
            Mark all updated
          </button>

          {!!outdatedPlugins.value &&
            <button class="lum-btn lum-bg-transparent rounded-lum-1 group" onClick$={async () => {
              if (!pluginsStore.openServer) return;

              isLoading.value = [...isLoading.value, 'downloadAll'];

              const plugins = pluginsStore.servers[pluginsStore.openServer];
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
      }

      <div class="grid gap-2 my-4">
        {pluginsStore.openServer && pluginsStore.servers[pluginsStore.openServer]?.map((plugin) => {
          const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
            && plugin.version?.releaseDate !== undefined
            && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;

          if (pluginsStore.showOnlyOutdated && !updateAvailable) {
            return null;
          }

          return <PluginCard key={plugin.name}
            plugin={plugin}
            updateAvailable={updateAvailable}
            spigotRateLimit={spigotRateLimit} />;
        })}
      </div>

      <dialog ref={modalRef}
        class={{
          'm-auto hidden open:flex text-lum-text': true,
          'lum-card drop-shadow-2xl backdrop-blur-xl min-w-1/4': true,
          'open:animate-in open:fade-in open:slide-in-from-top-8 open:anim-duration-300': true,
          'animate-out fade-out slide-in-from-top-8 anim-duration-300': true,
        }}>
        <div class="flex flex-col">
          <h3 class="mb-2 flex items-center gap-2 font-bold text-2xl">
            Add plugin
          </h3>

          <hr/>

          <div class="flex flex-col gap-1 mb-2">
            <label for="plugin-link">
              Enter the plugin link. Supported links:<br />
              - Spigot: https://www.spigotmc.org/resources/...
            </label>
            <input type="text" class="lum-input" placeholder="https://www.spigotmc.org/resources/..." id="plugin-link"
              onInput$={async (e, el) => {
                const value = el.value;
                const spigotMatch = value.match(/spigotmc\.org\/resources\/(.+)\.(\d+)/);
                if (spigotMatch) {
                  const pluginId = spigotMatch[2];
                  // check if the plugin is already added
                  const existingPlugin = pluginsStore.servers[pluginsStore.openServer!].find((p) => p.id === pluginId);
                  if (existingPlugin) {
                    const notification = new Notification()
                      .setTitle('Plugin already added')
                      .setDescription(`The plugin ${existingPlugin.name} is already added.`)
                      .setBgColor('lum-bg-yellow/50');
                    notifications.push(notification);
                    return;
                  }

                  const res = await fetch(`https://api.spiget.org/v2/resources/${pluginId}`);
                  const data = await res.json() as any;

                  const versionsRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}/versions?size=100&sort=-releaseDate`);
                  const versionsData = await versionsRes.json() as any;

                  console.log(versionsData);

                  const newPlugin: PluginWithData = {
                    id: pluginId,
                    name: data.name,
                    type: 'spigot',
                    data: {
                      external: data.external,
                      name: data.name,
                      tag: data.tag,
                      iconUrl: data.icon?.url,
                      releaseDate: data.releaseDate,
                      updateDate: data.updateDate,
                      file: data.file ? {
                        type: data.file.type,
                        size: data.file.size,
                        sizeUnit: data.file.sizeUnit,
                        url: data.file.url,
                        externalUrl: data.file.externalUrl,
                      } : undefined,
                      testedVersions: data.testedVersions?.length
                        ? data.testedVersions : undefined,
                      sourceCodeLink: data.sourceCodeLink,
                      versions: versionsData.map((version: any) => version),
                    },
                  };

                  resolvedPlugin.plugin = newPlugin;
                } else {
                  const notification = new Notification()
                    .setTitle('Invalid link')
                    .setDescription('Please enter a valid plugin link.')
                    .setBgColor('lum-bg-red/50');
                  notifications.push(notification);
                }
              }}
            />
          </div>

          {resolvedPlugin.plugin && <>
            <SelectMenu id="add-plugin-options" values={
              resolvedPlugin.plugin.data?.versions?.map((version) => ({
                name: <>
                  <span class="flex-1 font-mono text-left">
                    {version.name}
                  </span>
                  <span class="text-xs text-lum-text-secondary ml-1 text-right">
                    {new Date(version.releaseDate * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </>,
                value: version.id,
              })) || []
            } onChange$={(e, el) => {
              const versionId = el.value;
              const selectedVersion = resolvedPlugin.plugin?.data?.versions?.find((version) => version.id === versionId);
              if (selectedVersion) {
                resolvedPlugin.plugin!.version = {
                  id: selectedVersion.id,
                  name: selectedVersion.name,
                  releaseDate: selectedVersion.releaseDate,
                };
              }
            }} customDropdown>
              {resolvedPlugin.plugin.version &&
                <span q:slot="dropdown" class="flex items-center gap-2">
                  <span class="flex-1 font-mono text-left">
                    {resolvedPlugin.plugin.version.name}
                  </span>
                  <span class="text-xs text-lum-text-secondary ml-1 text-right">
                    {new Date(resolvedPlugin.plugin.version.releaseDate * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </span>
              }
              Which version are you currently using?
            </SelectMenu>
          </>}

          <hr/>

          {resolvedPlugin.plugin && <>
            <PluginCard
              plugin={resolvedPlugin.plugin}
              spigotRateLimit={spigotRateLimit}
              noActions />
            <hr/>
          </>}

          <div class="flex gap-2 justify-end">
            <button class="lum-btn" onClick$={() => {
              modalRef.value?.close();
            }}>
              <X size={20} /> Cancel
            </button>
            <button
              class="lum-btn lum-bg-green/50 hover:lum-bg-green disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>
      </dialog>

    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updater - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});