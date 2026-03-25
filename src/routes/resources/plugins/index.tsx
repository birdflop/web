import { component$, isBrowser, useContext, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';
import { Blocks, Check, Eye, Loader2 } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { SiGithub, SiSpigotmc } from 'simple-icons-qwik';

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'plugins', url.searchParams);
});

export type Plugin = {
  name: string;
  version?: string;
  type?: 'spigot';
  id?: string;
};

type PluginWithData = Plugin & {
  data?: any;
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
  }>({
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
          const response = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}`);
          const data = await response.json() as any;
          // delete unneeded data to reduce memory usage
          delete data.description;
          delete data.icon.data;
          plugin.data = data;
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

      {pluginsStore.openServer && (
        <div class="grid grid-cols-2 gap-2 my-12">
          {pluginsStore.servers[pluginsStore.openServer]?.map((plugin) => (
            <div key={plugin.name} class="lum-card flex-1">
              <p class="flex items-center gap-2 text-lg! text-lum-text!">
                {(plugin.type === 'spigot' && !plugin.data?.icon?.url)
                  && <SiSpigotmc class="fill-yellow" />}
                {plugin.data?.icon?.url &&
                  <img src={'https://spigotmc.org/' + plugin.data.icon.url} alt={`${plugin.name} icon`}
                    width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}
                {plugin.name}
                {plugin.data?.testedVersions?.length > 0 && <span class="text-sm text-lum-text/50">{plugin.data.testedVersions[0]} - {plugin.data.testedVersions[plugin.data.testedVersions.length - 1]}</span>}
                {!plugin.data && <Loader2 class="animate-spin" />}
              </p>
              <p class="text-sm">
                {JSON.stringify(plugin.version) ?? 'No version set'}
              </p>
              <textarea value={JSON.stringify(plugin.data, null, 2)} readOnly class="w-full h-32 mt-2 font-mono text-sm" />
              <div class="flex mt-2 gap-1">
                <button class="lum-btn" onClick$={async () => {
                  const data = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}/versions/latest`);
                  const json = await data.json() as any;

                  plugin.version = json.name;
                }}>
                  <Check /> Mark updated
                </button>
                <div class="flex-1"/>
                {plugin.data?.sourceCodeLink && (
                  <a href={plugin.data.sourceCodeLink} target="_blank" class="lum-btn p-2">
                    <SiGithub class="fill-current" />
                  </a>
                )}
                {plugin.type === 'spigot' && (
                  <a href={`https://www.spigotmc.org/resources/${plugin.id}`} target="_blank" class="lum-btn p-2 lum-bg-yellow">
                    <SiSpigotmc class="fill-current" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
});

export const head = generateHead({
  title: 'Plugin Updater - Birdflop',
  description: 'Keep track of plugin updates without checking every plugin page for updates. ' + defaultDescription,
});