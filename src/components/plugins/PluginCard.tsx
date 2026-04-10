import { component$, isBrowser, Slot, useComputed$, useContext, useSignal } from '@builder.io/qwik';
import { LinkProps } from '@builder.io/qwik-city';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Check, Download, Link, Loader2 } from 'lucide-icons-qwik';
import { downloadSpigotPlugin } from '~/routes/resources/plugins';
import { Notification, NotificationContext } from '~/util/Notification';
import { getPlugin, PluginType } from '~/util/plugins/ServerPlugin';

export interface PluginCardProps extends Omit<LinkProps, 'class'> {
  class?: {
    [key: string]: boolean;
  };
  pluginJSON: PluginType;
  updateAvailable?: boolean;
  noActions?: boolean;
  spigotRateLimit?: { downloadCount: number, resetTime: number };
}

export default component$<PluginCardProps>(({ pluginJSON, noActions, updateAvailable, spigotRateLimit, class: cardClass }) => {
  const isLoading = useSignal(false);
  const notifications = useContext(NotificationContext);

  const serverPlugin = useComputed$(async () => {
    if (!isBrowser) return; // dont request plugin data on the server
    try {
      const serverPlugin = getPlugin(pluginJSON);
      return await serverPlugin.fetch();
    }
    catch (err) {
      const notification = new Notification()
        .setTitle('Error fetching plugin data')
        .setDescription(`There was an error fetching data for ${pluginJSON.name}: ${err}`)
        .setBgColor('lum-grad-bg-red/50');
      notifications.push(notification);
    }
  });

  return <div key={serverPlugin.value?.id} class={{
    'lum-card p-4 flex-1 relative lum-grad-bg-lum-card-bg/90 overflow-clip': true,
    'border-green': updateAvailable,
    ...cardClass,
  }}
  style={{
    '--lum-border-radius': '1rem',
  }}>
    {serverPlugin.value?.iconUrl &&
      <img src={serverPlugin.value?.iconUrl} alt={`${serverPlugin.value?.name} icon`}
        width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-xl scale-250 saturate-200" />}

    <div class="flex gap-2">
      <div class="flex-1 flex-col items-center">
        {serverPlugin.value?.latestVersion && updateAvailable && <p class="text-green-500! text-xs mb-2">
          Update available as of {
            serverPlugin.value.latestVersion.releaseDate
              .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          }
        </p>}
        <p class="flex items-center gap-2">
          {(serverPlugin.value?.type === 'spigot' && !serverPlugin.value?.iconUrl)
            && <SiSpigotmc class="fill-yellow" />}
          {(serverPlugin.value?.type === 'modrinth' && !serverPlugin.value?.iconUrl)
            && <SiModrinth class="fill-green" />}
          {serverPlugin.value?.iconUrl &&
            <img src={serverPlugin.value.iconUrl} alt={`${serverPlugin.value?.name} icon`}
              width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}

          <span class="text-lg! text-lum-text!">
            {serverPlugin.value?.name}
          </span>
          {serverPlugin.value?.testedVersions &&
            <span class="text-sm text-lum-text-secondary">
              {serverPlugin.value.testedVersions[0]} - {serverPlugin.value.testedVersions[serverPlugin.value.testedVersions.length - 1]}
            </span>
          }
        </p>

        {serverPlugin.value?.type !== 'misc' &&
          <p class="text-sm text-lum-text-secondary">
            {serverPlugin.value?.description ?? 'Loading...'}
          </p>
        }
      </div>

      <div class="flex-1 flex-col gap-2 items-center">
        {serverPlugin.value?.updateDate && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Last Updated {new Date(serverPlugin.value?.updateDate).toLocaleDateString(undefined,
            { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>}
        {serverPlugin.value?.currentVersion && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Current: <span class={{
            'font-mono': true,
            'text-red-500': updateAvailable,
            'text-blue-500': !updateAvailable,
          }}>
            {serverPlugin.value?.currentVersion.name}
          </span>
        </p>}
        {serverPlugin.value?.latestVersion && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Latest: <span class="text-green-500 font-mono">
            {serverPlugin.value?.latestVersion.name}
          </span>
        </p>}
        {serverPlugin.value?.type !== 'misc' && !serverPlugin.value && <Loader2 size={16} class="animate-spin" />}
      </div>
    </div>

    {!noActions && <div class="flex items-center gap-1">
      {serverPlugin.value?.file?.url &&
        <button class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} onClick$={async () => {
          if (!serverPlugin.value?.file?.url) return;
          isLoading.value = true;

          if (serverPlugin.value?.type === 'spigot') await downloadSpigotPlugin(serverPlugin.value, spigotRateLimit);
          else window.open(serverPlugin.value?.file.url, '_blank');

          serverPlugin.value.currentVersion = serverPlugin.value?.latestVersion;
          isLoading.value = false;
        }} disabled={isLoading.value}>
          <Download size={16} /> Download
          <span class="text-xs text-lum-text-secondary">
            {serverPlugin.value?.file?.name ?? serverPlugin.value?.latestVersion?.name ?? 'latest'}
          </span>
          {!!serverPlugin.value?.file?.size &&
            <span class="text-xs text-lum-text-secondary">
              {serverPlugin.value?.file?.size} {serverPlugin.value?.file?.sizeUnit}
            </span>
          }
          {!!serverPlugin.value?.file?.externalUrl &&
            <span class="text-xs text-lum-text-secondary">
              external
            </span>
          }
          {isLoading.value && <Loader2 size={16} class="animate-spin" />}
        </button>
      }

      {serverPlugin.value?.url &&
        <a class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} href={serverPlugin.value.url} target="_blank" onClick$={() => {
          serverPlugin.value!.updateDate = new Date();
        }}>
          <Link size={16} /> View plugin
        </a>
      }

      {updateAvailable &&
        <button class="lum-btn rounded-lum-2 text-sm lum-bg-transparent" onClick$={() => {
          serverPlugin.value!.currentVersion = serverPlugin.value!.latestVersion;
          serverPlugin.value!.updateDate = new Date();
        }}>
          <Check size={16} /> Mark updated
        </button>
      }
      <div class="flex-1"/>
      {serverPlugin.value?.sourceCodeLink && (
        <a href={serverPlugin.value?.sourceCodeLink}
          target="_blank" class="lum-btn rounded-lum-2 p-2">
          <SiGithub size={16} class="fill-current" />
        </a>
      )}
      {serverPlugin.value?.type === 'spigot' && <>
        {serverPlugin.value?.file?.externalUrl?.includes('modrinth') && (
          <a href={serverPlugin.value?.file?.externalUrl}
            target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-green">
            <SiModrinth size={16} class="fill-current" />
          </a>
        )}
        <a href={`https://www.spigotmc.org/resources/${serverPlugin.value?.id}`}
          target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-yellow">
          <SiSpigotmc size={16} class="fill-current" />
        </a>
      </>}
      {serverPlugin.value?.type === 'modrinth' && <>
        <a href={`https://modrinth.com/plugin/${serverPlugin.value?.id}`}
          target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-green">
          <SiModrinth size={16} class="fill-current" />
        </a>
      </>}
      <Slot name="extra-actions" />
    </div>}
  </div>;
});