import { $, component$, isBrowser, useComputed$, useContext, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Download, Loader2, Plus, X } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Toggle } from '@luminescent/ui-qwik';
import { loadingItemsContext } from '~/routes/layout';

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'plugins', url.searchParams);
});

export type Plugin = {
  name: string;
  version?: any;
  type?: 'spigot';
  id?: string;
};

type PluginData = {
  name: string;
  external?: boolean;
  tag?: string;
  iconUrl?: string;
  releaseDate?: number;
  updateDate?: number;
  file?: {
    type: string;
    size: number;
    sizeUnit: string;
    url: string;
    externalUrl?: string;
  };
  testedVersions?: string[];
  latestVersion?: {
    id: string;
    name: string;
    releaseDate: number;
  };
  sourceCodeLink?: string;
}

type PluginWithData = Plugin & {
  data?: PluginData;
};

const debug = true;

export default component$(() => {
  const t = inlineTranslate();

  const { cookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);

  const loadingItemsStore = useContext(loadingItemsContext);

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
          console.log(latestVersion);
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

  const downloadSpigotPlugin = $(async (plugin: PluginWithData) => {
    // if the plugin has an external url, open that instead of spigot to avoid rate limits
    if (plugin.data?.file?.externalUrl) {
      window.open(plugin.data.file.externalUrl, '_blank');
      return;
    }

    // spigot rate limits downloads to 10 per minute
    if (spigotRateLimit.downloadCount >= 10 && Date.now() < spigotRateLimit.resetTime) {
      const notification = new Notification()
        .setTitle('Spigot Download Rate Limit Reached')
        .setDescription(`Spigot limits downloads to 10 per minute. Waiting ${Math.ceil((spigotRateLimit.resetTime - Date.now()) / 1000)} seconds to continue downloading.`)
        .setBgColor('lum-bg-yellow/50')
        .setPersist(true);
      notifications.push(notification);
      await new Promise((resolve) => setTimeout(resolve, spigotRateLimit.resetTime - Date.now()));
      spigotRateLimit.downloadCount = 0;
    }

    // open the plugin file url in a new tab to trigger the download
    window.open(`https://www.spigotmc.org/${plugin.data?.file?.url}`, '_blank');

    spigotRateLimit.downloadCount++;
    // set the reset time to 1 minute from now
    if (spigotRateLimit.resetTime < Date.now())
      spigotRateLimit.resetTime = Date.now() + 60 * 1000;
  });

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl! items-center my-2!">
        <Blocks size={32} />
        {t('nav.resources.plugins.title@@Plugin Updater')}
        <span class="lum-bg-blue/50 text-xs py-1 px-2 rounded-lum-1">
          {t('nav.experimental@@experimental')}
        </span>
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.')}
      </p>

      <div class="lum-card p-1 gap-1 flex-row">
        <button class="lum-btn lum-bg-transparent rounded-lum-1">
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
          <button class="lum-btn lum-bg-transparent rounded-lum-1">
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

              loadingItemsStore.items = [...loadingItemsStore.items, 'downloadAll'];

              const plugins = pluginsStore.servers[pluginsStore.openServer];
              for (const plugin of plugins) {
                const updateAvailable = plugin.data?.latestVersion?.releaseDate !== undefined
                  && plugin.version?.releaseDate !== undefined
                  && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate;

                if (!updateAvailable || !plugin.data?.file?.url) return;

                if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin);
                else window.open(plugin.data.file.url, '_blank');

                plugin.version = plugin.data?.latestVersion;
              }

              loadingItemsStore.items = loadingItemsStore.items.filter((item) => item !== 'downloadAll');
            }} disabled={loadingItemsStore.items.includes('downloadAll')}>
              <Download size={16} />
              Download all out of date ({outdatedPlugins.value})
              {outdatedPlugins.value > 10 &&
                <span class="lum-card p-2 absolute bottom-full left-0 w-full text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Spigot limits downloads to 10 per minute, so some of these may not open immediately.
                </span>
              }
              {loadingItemsStore.items.includes('downloadAll') && <div class="lum-loading ml-2 w-4 h-4" />}
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

          return <div key={plugin.name} class={{
            'lum-card flex-1 relative lum-bg-lum-card-bg/90 overflow-clip': true,
            'border-green': updateAvailable,
          }}>
            {plugin.data?.iconUrl &&
              <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
                width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-xl scale-250 saturate-200" />}

            <div class="flex items-center gap-2">
              <div class="flex-1 flex-col items-center">
                <p class="flex items-center gap-2">
                  {(plugin.type === 'spigot' && !plugin.data?.iconUrl)
                    && <SiSpigotmc class="fill-yellow" />}
                  {plugin.data?.iconUrl &&
                    <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
                      width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}

                  <span class="text-lg! text-lum-text!">
                    {plugin.name}
                  </span>
                  {plugin.data?.testedVersions &&
                    <span class="text-sm">
                      {plugin.data.testedVersions[0]} - {plugin.data.testedVersions[plugin.data.testedVersions.length - 1]}
                    </span>
                  }
                </p>

                {plugin.data?.tag &&
                  <p class="text-sm mt-1">
                    {plugin.data?.tag}
                  </p>
                }
              </div>

              <div class="flex-1 flex-col gap-2 items-center">
                {plugin.version && <p class="text-sm flex-1 text-right">
                  Current: <span class={{
                    'text-red-500': updateAvailable,
                    'text-blue-500': !updateAvailable,
                  }}>
                    {plugin.version.name}
                  </span>
                </p>}
                {plugin.data?.latestVersion && <p class="text-sm flex-1 text-right">
                  Latest: <span class="text-green-500">
                    {plugin.data.latestVersion.name}
                  </span>
                </p>}
                {!plugin.data && <Loader2 class="animate-spin" />}
              </div>
            </div>

            <div class="flex items-center mt-2 gap-1">
              <button class={{
                'lum-btn text-sm': true,
              }} onClick$={async () => {
                if (!plugin.data?.file?.url) return;
                loadingItemsStore.items = [...loadingItemsStore.items, `download-${plugin.id}`];

                if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin);
                else window.open(plugin.data.file.url, '_blank');

                plugin.version = plugin.data?.latestVersion;
                loadingItemsStore.items = loadingItemsStore.items.filter((item) => item !== `download-${plugin.id}`);
              }} disabled={!plugin.data?.file?.url
                || loadingItemsStore.items.includes(`download-${plugin.id}`)}>
                <Download size={16} /> Download latest
                {!!plugin.data?.file?.size &&
                  <span class="text-xs text-lum-text-secondary">
                    {plugin.data?.file?.size} {plugin.data?.file?.sizeUnit}
                  </span>
                }
                {!!plugin.data?.external &&
                  <span class="text-xs text-lum-text-secondary">
                    external
                  </span>
                }
                {loadingItemsStore.items.includes(`download-${plugin.id}`)
                  && <div class="lum-loading ml-2 w-4 h-4" />}
              </button>
              <button class="lum-btn text-sm lum-bg-transparent" onClick$={() => {
                plugin.version = plugin.data?.latestVersion;
              }}>
                <Check size={16} /> Mark updated
              </button>
              {plugin.data?.latestVersion && updateAvailable && <p class="text-green-500! text-xs">
                Update available as of {
                  new Date(plugin.data.latestVersion.releaseDate * 1000)
                    .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                }
              </p>}
              <div class="flex-1"/>
              {plugin.data?.sourceCodeLink && (
                <a href={plugin.data.sourceCodeLink} target="_blank" class="lum-btn p-2">
                  <SiGithub size={16} class="fill-current" />
                </a>
              )}
              {plugin.data?.file?.externalUrl?.includes('modrinth') && (
                <a href={plugin.data?.file?.externalUrl} target="_blank" class="lum-btn p-2 lum-bg-green">
                  <SiModrinth size={16} class="fill-current" />
                </a>
              )}
              {plugin.type === 'spigot' && (
                <a href={`https://www.spigotmc.org/resources/${plugin.id}`} target="_blank" class="lum-btn p-2 lum-bg-yellow">
                  <SiSpigotmc size={16} class="fill-current" />
                </a>
              )}
            </div>

            {debug &&
              <textarea value={JSON.stringify(plugin.data, null, 2)} readOnly class="lum-input w-full mt-2 font-mono text-sm" />
            }
          </div>;
        })}
      </div>

    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updater - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});