import { component$, useComputed$, useContext, useSignal } from '@builder.io/qwik';
import { Notification, NotificationContext } from '~/util/Notification';
import { pluginsStoreContext, resolvedPluginContext } from '~/routes/resources/plugins';
import { SelectList } from '../Elements/SelectList';
import { SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Loader2 } from 'lucide-icons-qwik';
import { getPlugin, PluginSource, searchPlugins } from '~/util/plugins/ServerPlugin';

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

const urlRegex = {
  modrinth: /modrinth\.com\/plugin\/(.+)/,
  spigot: /spigotmc\.org\/resources\/(.+)\.(\d+)/,
};

const urls = {
  modrinth: 'https://modrinth.com/plugin/',
  spigot: 'https://www.spigotmc.org/resources/',
};

export default component$(({
  type = 'modrinth',
}: {
  type?: Exclude<PluginSource, 'misc'>;
}) => {
  const pluginsStore = useContext(pluginsStoreContext);
  const resolvedPlugin = useContext(resolvedPluginContext);
  const notifications = useContext(NotificationContext);
  const loaders = useComputed$(() => pluginsStore.servers[pluginsStore.openServer!]
    ? getLoaders(pluginsStore.servers[pluginsStore.openServer!].software)
    : []);
  const isLoading = useSignal<boolean>(false);

  return <>
    <div class="flex flex-col gap-1 mt-6">
      <div class="flex flex-col border-b border-lum-border/10 pb-4 mb-4">
        <h4 class="flex items-center gap-2 font-bold text-xl fill-current">
          {type === 'modrinth' && <>
            <SiModrinth size={28} />
            Modrinth
          </>}
          {type === 'spigot' && <>
            <SiSpigotmc size={28} />
            SpigotMC
          </>}
          {isLoading.value && <Loader2 size={16} class="animate-spin" />}
        </h4>
      </div>

      <label for="plugin-link">
        Search or paste the link of the plugin you want to add.
      </label>
      <input type="text" class="lum-input" id="plugin-link"
        placeholder={`Plugin name or ${urls[type]}...`}
        onInput$={async (e, el) => {
          const value = el.value;
          const match = value.match(urlRegex[type]);

          if (!match) return;

          const pluginId = match[1];
          // check if the plugin is already added
          const existingPlugin = pluginsStore.servers[pluginsStore.openServer!].plugins.find((p) => p.id == pluginId);
          if (existingPlugin) {
            const notification = new Notification()
              .setTitle('Plugin already added')
              .setDescription(`The plugin ${existingPlugin.name} is already added.`)
              .setBgColor('lum-grad-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          try {
            isLoading.value = true;

            const newPlugin = getPlugin({
              type: type,
              id: pluginId,
            });
            await newPlugin.fetch();

            resolvedPlugin.plugin = newPlugin;
          } catch (error) {
            console.error('Error fetching plugin data:', error);
            const notification = new Notification()
              .setTitle('Error fetching plugin data')
              .setDescription(`An error occurred while fetching plugin data. ${error}`)
              .setBgColor('lum-grad-bg-red/50');
            notifications.push(notification);
          }
          isLoading.value = false;
        }}
        onChange$={async (e, el) => {
          const value = el.value;
          const match = value.match(urlRegex[type]);
          if (match) return;

          console.log('Searching for plugin:', value);
          try {
            isLoading.value = true;
            const searchData = await searchPlugins(type, value, loaders.value);

            if (searchData.length === 0) {
              const notification = new Notification()
                .setTitle('No results found')
                .setDescription(`No plugins found matching "${value}". Please try searching by plugin name or pasting the plugin link.`)
                .setBgColor('lum-grad-bg-yellow/50');
              notifications.push(notification);
              isLoading.value = false;
              return;
            }

            resolvedPlugin.plugins = searchData.map((data: any) =>
              getPlugin({
                type: type,
                id: data.id,
              }).fromData(data),
            );
          } catch (error) {
            console.error('Error searching for plugins:', error);
            const notification = new Notification()
              .setTitle('Error searching for plugins')
              .setDescription(`An error occurred while searching for plugins. ${error}`)
              .setBgColor('lum-grad-bg-red/50');
            notifications.push(notification);
          }
          isLoading.value = false;
        }}
      />
    </div>

    {resolvedPlugin.plugins && <>
      <label for="add-plugin-options">
        Search results:
      </label>
      <SelectList id="add-plugin-options" values={
        resolvedPlugin.plugins.map((plugin) => ({
          name: <span key={plugin.id} class="flex flex-col gap-2 text-left">
            <span class="flex items-center gap-2">
              {plugin.iconUrl &&
                <img src={plugin.iconUrl} alt={`${plugin.name} icon`}
                  width={24} height={24} class="w-6 h-6 rounded-lum-1" />}
              {plugin.name}
            </span>
            <span class="text-xs text-lum-text-secondary">
              {plugin.description}
            </span>
          </span>,
          value: plugin.id,
        }))
      } onChange$={async (e, el) => {
        const pluginId = el.value;
        const selectedPlugin = resolvedPlugin.plugins?.find((plugin) => plugin.id === pluginId);
        if (!selectedPlugin) return;

        isLoading.value = true;
        try {
          const plugin = await getPlugin(selectedPlugin).fetchVersions();
          resolvedPlugin.plugin = plugin.toJSON();
          resolvedPlugin.plugins = undefined;
        } catch (error) {
          console.error('Error fetching plugin versions:', error);
          const notification = new Notification()
            .setTitle('Error fetching plugin versions')
            .setDescription(`An error occurred while fetching plugin versions. ${error}`)
            .setBgColor('lum-grad-bg-red/50');
          notifications.push(notification);
        }
        isLoading.value = false;
      }}/>
    </>}

    {resolvedPlugin.plugin?.versions && <>
      <label for="add-plugin-options">
        Which version are you currently using?
      </label>

      <SelectList id="add-plugin-options" values={
        resolvedPlugin.plugin.versions?.map((version) => ({
          name: <>
            <span class="flex-1 font-mono text-left">
              {version.name}
            </span>
            <span class="text-xs text-lum-text-secondary ml-1 text-right">
              {version.releaseDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </>,
          value: version.id,
        })) || []
      } onChange$={(e, el) => {
        const versionId = el.value;
        if (!resolvedPlugin.plugin) return;
        const selectedVersion = resolvedPlugin.plugin.versions
          ?.find((version) => version.id == versionId);
        if (selectedVersion) {
          resolvedPlugin.plugin.currentVersion = selectedVersion;
        }
      }}/>
    </>}
  </>;
});