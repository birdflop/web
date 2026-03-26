import { component$, isBrowser, useContext, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Download, Eye, Loader2 } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';

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

export default component$(() => {
  const t = inlineTranslate();

  const { cookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);
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

  const pluginsStore = useStore<{
    openServer: string | null;
    servers: { [key: string]: PluginWithData[] };
    showDebug: boolean;
  }>({
    showDebug: false,
    openServer: 'Example Server',
    servers: {
      ...cookies,
    },
  });

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

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl! items-center my-2!">
        <Blocks size={32} />
        {t('nav.resources.plugins.title@@Plugin Updater')}
        <span class="text-sm bg-yellow/50 text-yellow-800 px-1 rounded">
          beta
        </span>
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.')}
      </p>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        We currently only support spigot plugins
      </p>

      <div class="lum-card p-1 gap-1 flex-row">
        {pluginsStore.servers && Object.keys(pluginsStore.servers).length > 0 ? (
          Object.keys(pluginsStore.servers).map((server) => (
            <button key={server} class={{
              'lum-btn rounded-lum-1': true,
              'lum-bg-blue/50 hover:lum-bg-blue/80': pluginsStore.openServer === server,
            }} onClick$={() => pluginsStore.openServer = pluginsStore.openServer === server ? null : server}>
              <Eye size={24} />
              {server}
            </button>
          ))
        ) : (
          <p>
            {t('nav.resources.plugins.noPlugins@@No servers found.')}
          </p>
        )}
      </div>

      <div class="flex gap-2 mt-4">
        <button class="lum-btn text-sm" onClick$={() => {
          if (!pluginsStore.openServer) return;
          const plugins = pluginsStore.servers[pluginsStore.openServer];
          plugins.forEach((plugin) => {
            if (plugin.data?.latestVersion) {
              plugin.version = plugin.data.latestVersion;
            }
          });
        }}>
          <Check size={16} />
          Mark all as updated
        </button>
      </div>

      <div class="grid gap-2 my-12">
        {pluginsStore.openServer && pluginsStore.servers[pluginsStore.openServer]?.map((plugin) => (
          <div key={plugin.name} class="lum-card flex-1 relative lum-bg-lum-card-bg/80 overflow-clip">

            {plugin.data?.iconUrl &&
              <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
                width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-3xl scale-250 brightness-25 saturate-200" />}

            <p class="flex items-center gap-2">
              {(plugin.type === 'spigot' && !plugin.data?.iconUrl)
                && <SiSpigotmc class="fill-yellow" />}
              {plugin.data?.iconUrl &&
                <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
                  width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}
              <span class="text-lg! text-lum-text!">
                {plugin.name}
              </span>
              {plugin.data?.testedVersions && <span class="text-sm">{plugin.data.testedVersions[0]} - {plugin.data.testedVersions[plugin.data.testedVersions.length - 1]}</span>}
              {!plugin.data && <Loader2 class="animate-spin" />}
              {plugin.data?.latestVersion?.name &&
                <span class="text-sm">
                  {plugin.data?.latestVersion?.name}
                </span>
              }
              {plugin.version &&
                <span class="text-sm flex-1 text-right">
                  Current: {plugin.version.name}
                </span>
              }
            </p>

            <p class="flex-1">
              {plugin.data?.tag}
            </p>

            {plugin.data?.latestVersion?.releaseDate && plugin.version?.releaseDate
              && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate
                && <p class="text-green-500! text-xs">
                  Update available as of {
                    new Date(plugin.data.latestVersion.releaseDate * 1000)
                      .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  }
                </p>}

            <div class="flex mt-2 gap-1">
              <a class={{
                'lum-btn text-sm': true,
                'lum-bg-blue/50 hover:lum-bg-blue/80': plugin.data?.latestVersion?.releaseDate && plugin.version?.releaseDate
              && plugin.data.latestVersion.releaseDate > plugin.version.releaseDate,
              }} href={plugin.data?.file?.url} target="_blank">
                <Download size={16} /> Download latest
              </a>
              <button class="lum-btn text-sm lum-bg-transparent" onClick$={() => {
                plugin.version = plugin.data?.latestVersion;
              }}>
                <Check size={16} /> Mark updated
              </button>
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

            {pluginsStore.showDebug &&
              <textarea value={JSON.stringify(plugin.data, null, 2)} readOnly class="lum-input w-full mt-2 font-mono text-sm" />
            }
          </div>
        ))}
      </div>

    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updater - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});