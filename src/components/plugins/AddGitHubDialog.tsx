import { component$, useContext } from '@builder.io/qwik';
import { Notification, NotificationContext } from '~/util/Notification';
import { resolvedPluginContext } from '~/routes/resources/plugins';
import { SelectList } from '../Elements/SelectList';

export default component$(() => {
  const resolvedPlugin = useContext(resolvedPluginContext);
  const notifications = useContext(NotificationContext);

  return <>
    <div class="flex flex-col gap-1 mb-2">

      <label for="plugin-link">
        Paste the GitHub link of the plugin you want to add. (wip)
      </label>
      <input type="text" class="lum-input" placeholder="Plugin name or https://modrinth.com/plugin/..." id="plugin-link"
        onInput$={(e, el) => {
          const value = el.value;
          const githubMatch = value.match(/github\.com\/(.+)/);
          if (!githubMatch) return;

        }}
        onChange$={async (e, el) => {
          const value = el.value;
          const githubMatch = value.match(/github\.com\/(.+)/);
          if (githubMatch) return;

          console.log('Searching for repo:', value);

          const searchUrl = 'https://api.github.com/search/repositories';
          const searchParams = new URLSearchParams({
            q: value,
          });

          console.log(`${searchUrl}?${searchParams.toString()}`);
          const searchRes = await fetch(`${searchUrl}?${searchParams.toString()}`);
          const searchData: {
            items: any[];
          } = await searchRes.json();

          // if there are no results, check if the user put in the full repo link 
          if (searchData.items.length === 0) {

          }

          if (searchData.items.length === 0) {
            const notification = new Notification()
              .setTitle('No results found')
              .setDescription(`No plugins found matching "${value}". Please try searching by plugin name or pasting the plugin link.`)
              .setBgColor('lum-bg-yellow/50');
            notifications.push(notification);
            return;
          }

          resolvedPlugin.plugins = searchData.items.map((data: any) => ({
            id: data.full_name,
            name: data.name,
            type: 'github',
            data: {
              name: data.name,
              tag: data.description,
              iconUrl: data.owner.avatar_url,
              releaseDate: Number(new Date(data.created_at)) / 1000,
              updateDate: Number(new Date(data.updated_at)) / 1000,
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
              {plugin.id}
            </span>
            <span class="text-xs text-lum-text-secondary">
              {plugin.data?.tag}
            </span>
          </span>,
          value: plugin.id!,
        }))
      } onChange$={(e, el) => {
        const pluginId = el.value;
        const selectedPlugin = resolvedPlugin.plugins?.find((plugin) => plugin.id === pluginId);
        if (!selectedPlugin || !selectedPlugin.data) return;
      }}/>
    </>}

  </>;
});