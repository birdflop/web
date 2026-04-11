import { component$, useContext, useSignal } from '@builder.io/qwik';
import { Notification, NotificationContext } from '~/util/Notification';
import { pluginsStoreContext, resolvedPluginContext } from '~/routes/resources/plugins';
import { SelectList } from '../Elements/SelectList';
import { SiSpigotmc } from 'simple-icons-qwik';
import { Loader2 } from 'lucide-icons-qwik';
import { SpigotPlugin } from '~/util/plugins/SpigotPlugin';
import { getPlugin } from '~/util/plugins/ServerPlugin';

export default component$(() => {
  const pluginsStore = useContext(pluginsStoreContext);
  const resolvedPlugin = useContext(resolvedPluginContext);
  const notifications = useContext(NotificationContext);
  const isLoading = useSignal<boolean>(false);

  return <>
    <div class="flex flex-col gap-1 mt-6">
      <div class="flex flex-col border-b border-lum-border/10 pb-4 mb-4">
        <h4 class="flex items-center gap-2 font-bold text-xl fill-current">
          <SiSpigotmc size={28} />
          SpigotMC
          {isLoading.value && <Loader2 size={16} class="animate-spin" />}
        </h4>
      </div>

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
              .setBgColor('lum-grad-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          try {
            isLoading.value = true;

            const newPlugin = await new SpigotPlugin({ id: pluginId }).fetch();
            resolvedPlugin.plugin = newPlugin.toJSON();
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
          const spigotMatch = value.match(/spigotmc\.org\/resources\/(.+)\.(\d+)/);
          if (spigotMatch) return;

          console.log('Searching for plugin:', value);

          const searchUrl = 'https://api.spiget.org/v2/search/resources/';
          const searchParams = new URLSearchParams({
            size: '5',
          });

          try {
            isLoading.value = true;
            const searchRes = await fetch(`${searchUrl}${encodeURIComponent(value)}?${searchParams.toString()}`);
            const searchData: any[] = await searchRes.json();

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
              new SpigotPlugin({
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
      <label>
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
        const pluginId = Number(el.value);
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
      <label>
        Which version are you currently using?
      </label>

      <SelectList id="add-plugin-options" values={
        resolvedPlugin.plugin.versions?.map((version: any) => ({
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
        const selectedVersion = resolvedPlugin.plugin.versions
          ?.find((version) => version.id == versionId);
        if (selectedVersion) {
          resolvedPlugin.plugin.currentVersion = selectedVersion;
        }
      }}/>
    </>}
  </>;
});