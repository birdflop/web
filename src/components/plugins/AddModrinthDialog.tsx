import { component$, useComputed$, useContext } from '@builder.io/qwik';
import { PluginWithData } from './PluginCard';
import { Notification, NotificationContext } from '~/util/Notification';
import { pluginsStoreContext, resolvedPluginContext } from '~/routes/resources/plugins';
import { SelectList } from '../Elements/SelectList';

function getLoaders(software: string) {
  let loaders;
  switch (software) {
  case 'purpur':
    loaders = ['purpur', 'paper', 'spigot', 'bukkit'];
    break;
  case 'paper':
    loaders = ['paper', 'spigot', 'bukkit'];
    break;
  case 'spigot':
    loaders = ['spigot', 'bukkit'];
    break;
  case 'bukkit':
    loaders = ['bukkit'];
    break;
  default:
    loaders = [software];
  }

  return loaders;
}

export default component$(() => {
  const pluginsStore = useContext(pluginsStoreContext);
  const resolvedPlugin = useContext(resolvedPluginContext);
  const notifications = useContext(NotificationContext);
  const loaders = useComputed$(() => pluginsStore.servers[pluginsStore.openServer!]
    ? getLoaders(pluginsStore.servers[pluginsStore.openServer!].software)
    : []);

  return <>
    <div class="flex flex-col gap-1 mb-2">

      <label for="plugin-link">
        Search or paste the link of the plugin you want to add.
      </label>
      <input type="text" class="lum-input" placeholder="Plugin name or https://modrinth.com/plugin/..." id="plugin-link"
        onInput$={async (e, el) => {
          const value = el.value;
          const modrinthMatch = value.match(/modrinth\.com\/plugin\/(.+)/);

          if (!modrinthMatch) return;

          const pluginId = modrinthMatch[1];
          // check if the plugin is already added
          const existingPlugin = pluginsStore.servers[pluginsStore.openServer!].plugins.find((p) => p.id == pluginId);
          if (existingPlugin) {
            const notification = new Notification()
              .setTitle('Plugin already added')
              .setDescription(`The plugin ${existingPlugin.name} is already added.`)
              .setBgColor('lum-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          const res = await fetch(`https://api.modrinth.com/v2/project/${pluginId}`);
          const data = await res.json() as any;

          const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${pluginId}/version?loaders=${JSON.stringify(loaders.value)}`);
          const versionsData = await versionsRes.json() as any;
          const latestVersion = versionsData[0];

          const newPlugin: PluginWithData = {
            id: data.slug,
            name: data.title,
            type: 'modrinth',
            data: {
              name: data.title,
              tag: data.description,
              iconUrl: data.icon_url,
              releaseDate: Number(new Date(data.published)) / 1000,
              updateDate: Number(new Date(data.updated)) / 1000,
              file: latestVersion.files?.length ? {
                name: latestVersion.files[0].filename,
                type: latestVersion.files[0].file_type,
                size: Math.round(latestVersion.files[0].size / (1024 * 1024) * 100) / 100,
                sizeUnit: 'MB',
                url: latestVersion.files[0].url,
              } : undefined,
              testedVersions: data.game_versions,
              sourceCodeLink: data.source_url,
              versions: versionsData.map((version: any) => ({
                id: version.id,
                name: version.name,
                releaseDate: Number(new Date(version.date_published)) / 1000,
              })),
            },
          };

          resolvedPlugin.plugin = newPlugin;
        }}
        onChange$={async (e, el) => {
          const value = el.value;
          const modrinthMatch = value.match(/modrinth\.com\/plugin\/(.+)/);
          if (modrinthMatch) return;

          console.log('Searching for plugin:', value);

          const searchUrl = 'https://api.modrinth.com/v2/search';
          const searchParams = new URLSearchParams({
            query: value,
            facets: JSON.stringify([loaders.value.map((loader) => `categories:${loader}`)]),
          });
          console.log([loaders.value.map((loader) => `categories:${loader}`)]);

          const searchRes = await fetch(`${searchUrl}?${searchParams.toString()}`);
          const searchData: {
            hits: any[];
          } = await searchRes.json();

          if (searchData.hits.length === 0) {
            const notification = new Notification()
              .setTitle('No results found')
              .setDescription(`No plugins found matching "${value}". Please try searching by plugin name or pasting the plugin link.`)
              .setBgColor('lum-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          resolvedPlugin.plugins = searchData.hits.map((data: any) => ({
            id: data.slug,
            name: data.title,
            type: 'modrinth',
            data: {
              name: data.title,
              tag: data.description,
              iconUrl: data.icon_url,
              releaseDate: Number(new Date(data.published)) / 1000,
              updateDate: Number(new Date(data.updated)) / 1000,
              testedVersions: data.game_versions,
              sourceCodeLink: data.source_url,
            },
          }));
        }}
      />
    </div>

    {resolvedPlugin.plugins && <>
      <label>
        Search results:
      </label>
      <SelectList id="add-plugin-options" values={
        resolvedPlugin.plugins.map((plugin) => ({
          name: <span key={plugin.id} class="flex flex-col gap-2 text-left">
            <span class="flex items-center gap-2">
              {plugin.data?.iconUrl &&
                <img src={plugin.data.iconUrl} alt={`${plugin.name} icon`}
                  width={24} height={24} class="w-6 h-6 rounded-lum-1" />}
              {plugin.name}
            </span>
            <span class="text-xs text-lum-text-secondary">
              {plugin.data?.tag}
            </span>
          </span>,
          value: plugin.id!,
        }))
      } onChange$={async (e, el) => {
        const pluginId = el.value;
        const selectedPlugin = resolvedPlugin.plugins?.find((plugin) => plugin.id === pluginId);
        if (!selectedPlugin || !selectedPlugin.data) return;

        console.log(`https://api.modrinth.com/v2/project/${pluginId}/version?loaders=${JSON.stringify(loaders.value)}`);
        const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${pluginId}/version?loaders=${JSON.stringify(loaders.value)}`);
        const versionsData = await versionsRes.json() as any;
        selectedPlugin.data.versions = versionsData.map((version: any) => ({
          id: version.id,
          name: version.name,
          releaseDate: Number(new Date(version.date_published)) / 1000,
        }));

        resolvedPlugin.plugin = selectedPlugin;
        resolvedPlugin.plugins = undefined;
      }}/>
    </>}

    {resolvedPlugin.plugin?.data?.versions && <>
      <label>
        Which version are you currently using?
      </label>

      <SelectList id="add-plugin-options" values={
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
        if (!resolvedPlugin.plugin) return;
        const selectedVersion = resolvedPlugin.plugin.data?.versions
          ?.find((version) => version.id == versionId);
        if (selectedVersion) {
          resolvedPlugin.plugin.version = selectedVersion;
        }
      }}/>
    </>}
  </>;
});