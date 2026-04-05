import { component$, useContext } from '@builder.io/qwik';
import { PluginWithData } from './PluginCard';
import { Notification, NotificationContext } from '~/util/Notification';
import { pluginsStoreContext, resolvedPluginContext } from '~/routes/resources/plugins';
import { SelectList } from '../Elements/SelectList';

export default component$(() => {
  const pluginsStore = useContext(pluginsStoreContext);
  const resolvedPlugin = useContext(resolvedPluginContext);
  const notifications = useContext(NotificationContext);

  return <>
    <div class="flex flex-col gap-1 mb-2">

      <label for="plugin-link">
        Search or paste the link of the plugin you want to add.
      </label>
      <input type="text" class="lum-input" placeholder="Plugin name or https://www.spigotmc.org/resources/..." id="plugin-link"
        onInput$={async (e, el) => {
          const value = el.value;
          const spigotMatch = value.match(/spigotmc\.org\/resources\/(.+)\.(\d+)/);

          if (!spigotMatch) return;

          const pluginId = Number(spigotMatch[2]);
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

          const res = await fetch(`https://api.spiget.org/v2/resources/${pluginId}`);
          const data = await res.json() as any;

          const versionsRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}/versions?size=100&sort=-releaseDate`);
          const versionsData = await versionsRes.json() as any;

          const newPlugin: PluginWithData = {
            id: data.id,
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
              testedVersions: data.testedVersions,
              sourceCodeLink: data.sourceCodeLink,
              versions: versionsData,
            },
          };

          resolvedPlugin.plugin = newPlugin;
        }}
        onChange$={async (e, el) => {
          const value = el.value;
          const spigotMatch = value.match(/spigotmc\.org\/resources\/(.+)\.(\d+)/);
          if (spigotMatch) return;

          console.log('Searching for plugin:', value);

          const searchRes = await fetch(`https://api.spiget.org/v2/search/resources/${encodeURIComponent(value)}?size=5`);
          const searchData: any[] = await searchRes.json();

          if (searchData.length === 0) {
            const notification = new Notification()
              .setTitle('No results found')
              .setDescription(`No plugins found matching "${value}". Please try searching by plugin name or pasting the plugin link.`)
              .setBgColor('lum-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          resolvedPlugin.plugins = searchData.map((data: any) => ({
            id: data.id,
            name: data.name,
            type: 'spigot',
            data: {
              external: data.external,
              name: data.name,
              tag: data.tag,
              iconUrl: data.icon?.url,
              releaseDate: data.releaseDate,
              updateDate: data.updateDate,
              testedVersions: data.testedVersions?.length
                ? data.testedVersions : undefined,
              sourceCodeLink: data.sourceCodeLink,
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
                <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
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
        const pluginId = Number(el.value);
        const selectedPlugin = resolvedPlugin.plugins?.find((plugin) => plugin.id === pluginId);
        if (!selectedPlugin || !selectedPlugin.data) return;

        const versionsRes = await fetch(`https://api.spiget.org/v2/resources/${pluginId}/versions?size=100&sort=-releaseDate`);
        const versionsData = await versionsRes.json() as any;
        selectedPlugin.data.versions = versionsData;

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
        const versionId = Number(el.value);
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