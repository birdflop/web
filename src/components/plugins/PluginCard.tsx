import { component$, Slot, useSignal } from '@builder.io/qwik';
import { LinkProps } from '@builder.io/qwik-city';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Check, Download, Link, Loader2 } from 'lucide-icons-qwik';
import { downloadSpigotPlugin } from '~/util/plugins/SpigotPlugin';
import { PluginType } from '~/util/plugins/ServerPlugin';

export interface PluginCardProps extends Omit<LinkProps, 'class'> {
  class?: {
    [key: string]: boolean;
  };
  plugin: PluginType;
  updateAvailable?: boolean;
  noActions?: boolean;
  spigotRateLimit?: { downloadCount: number, resetTime: number };
}

export default component$<PluginCardProps>(({ plugin, noActions, updateAvailable, spigotRateLimit, class: cardClass }) => {
  const isLoading = useSignal(false);

  return <div key={plugin.id} class={{
    'lum-card p-4 flex-1 relative lum-grad-bg-lum-card-bg/90 overflow-clip': true,
    'border-green': updateAvailable,
    ...cardClass,
  }}
  style={{
    '--lum-border-radius': '1rem',
  }}>
    {plugin.iconUrl &&
      <img src={plugin.iconUrl} alt={`${plugin.name} icon`}
        width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-xl scale-250 saturate-200" />}

    <div class="flex gap-2">
      <div class="flex-1 flex-col items-center">
        {plugin.latestVersion && updateAvailable && <p class="text-green-500! text-xs mb-2">
          Update available as of {
            new Date(plugin.latestVersion.releaseDate)
              .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          }
        </p>}
        <p class="flex items-center gap-2">
          {(plugin.type === 'spigot' && !plugin.iconUrl)
            && <SiSpigotmc class="fill-yellow" />}
          {(plugin.type === 'modrinth' && !plugin.iconUrl)
            && <SiModrinth class="fill-green" />}
          {plugin.iconUrl &&
            <img src={plugin.iconUrl} alt={`${plugin.name} icon`}
              width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}

          <span class="text-lg! text-lum-text!">
            {plugin.name}
          </span>
          {plugin.mcVersions &&
            <span class="text-sm text-lum-text-secondary">
              {plugin.mcVersions[0]} - {plugin.mcVersions[plugin.mcVersions.length - 1]}
            </span>
          }
        </p>

        {plugin.type !== 'misc' &&
          <p class="text-sm text-lum-text-secondary">
            {plugin.description ?? 'Loading...'}
          </p>
        }
      </div>

      <div class="flex-1 flex-col gap-2 items-center">
        {plugin.updateDate && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Last Updated {new Date(plugin.updateDate).toLocaleDateString(undefined,
            { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>}
        {plugin.currentVersion && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Current: <span class={{
            'font-mono': true,
            'text-red-500': updateAvailable,
            'text-blue-500': !updateAvailable,
          }}>
            {plugin.currentVersion.name}
          </span>
        </p>}
        {plugin.latestVersion && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Latest: <span class="text-green-500 font-mono">
            {plugin.latestVersion.name}
          </span>
        </p>}
        {plugin.type !== 'misc' && !plugin && <Loader2 size={16} class="animate-spin" />}
      </div>
    </div>

    {!noActions && <div class="flex items-center gap-1">
      {plugin.file?.url &&
        <button class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} onClick$={async () => {
          if (!plugin.file?.url) return;
          isLoading.value = true;

          if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin, spigotRateLimit);
          else window.open(plugin.file.url, '_blank');

          plugin.currentVersion = plugin.latestVersion;
          isLoading.value = false;
        }} disabled={isLoading.value}>
          <Download size={16} /> Download
          <span class="text-xs text-lum-text-secondary">
            {plugin.file?.name ?? plugin.latestVersion?.name ?? 'latest'}
          </span>
          {!!plugin.file?.size &&
            <span class="text-xs text-lum-text-secondary">
              {plugin.file?.size} {plugin.file?.sizeUnit}
            </span>
          }
          {!!plugin.file?.externalUrl &&
            <span class="text-xs text-lum-text-secondary">
              external
            </span>
          }
          {isLoading.value && <Loader2 size={16} class="animate-spin" />}
        </button>
      }

      {plugin.url &&
        <a class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} href={plugin.url} target="_blank" onClick$={() => {
          plugin.updateDate = new Date();
        }}>
          <Link size={16} /> View plugin
        </a>
      }

      {updateAvailable &&
        <button class="lum-btn rounded-lum-2 text-sm lum-bg-transparent" onClick$={() => {
          plugin.currentVersion = plugin.latestVersion;
          plugin.updateDate = new Date();
        }}>
          <Check size={16} /> Mark updated
        </button>
      }
      <div class="flex-1"/>
      {plugin.sourceCodeLink && (
        <a href={plugin.sourceCodeLink}
          target="_blank" class="lum-btn rounded-lum-2 p-2">
          <SiGithub size={16} class="fill-current" />
        </a>
      )}
      {plugin.type === 'spigot' && <>
        {plugin.file?.externalUrl?.includes('modrinth') && (
          <a href={plugin.file?.externalUrl}
            target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-green">
            <SiModrinth size={16} class="fill-current" />
          </a>
        )}
        <a href={`https://www.spigotmc.org/resources/${plugin.id}`}
          target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-yellow">
          <SiSpigotmc size={16} class="fill-current" />
        </a>
      </>}
      {plugin.type === 'modrinth' && <>
        <a href={`https://modrinth.com/plugin/${plugin.id}`}
          target="_blank" class="lum-btn rounded-lum-2 p-2 lum-grad-bg-green">
          <SiModrinth size={16} class="fill-current" />
        </a>
      </>}
      <Slot name="extra-actions" />
    </div>}
  </div>;
});