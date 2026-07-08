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
  spigotRateLimit?: { downloadCount: number; resetTime: number };
}

export default component$<PluginCardProps>(
  ({
    plugin,
    noActions,
    updateAvailable,
    spigotRateLimit,
    class: cardClass,
  }) => {
    const isLoading = useSignal(false);

    return (
      <div
        key={plugin.id}
        class={{
          'lum-card lum-grad-bg-lum-card-bg/90 relative flex-1 overflow-clip p-4': true,
          'border-green': updateAvailable,
          ...cardClass,
        }}
        style={{
          '--lum-border-radius': '1rem',
        }}
      >
        {plugin.iconUrl && (
          <img
            src={plugin.iconUrl}
            alt={`${plugin.name} icon`}
            width={720}
            height={720}
            class="absolute inset-0 -z-1 h-full w-full scale-250 object-cover blur-xl saturate-200"
          />
        )}

        <div class="flex gap-2">
          <div class="flex-1 flex-col items-center">
            {plugin.latestVersion && updateAvailable && (
              <p class="mb-2 text-xs text-green-500!">
                Update available as of{' '}
                {new Date(plugin.latestVersion.releaseDate).toLocaleDateString(
                  undefined,
                  { year: 'numeric', month: 'short', day: 'numeric' },
                )}
              </p>
            )}
            <p class="flex items-center gap-2">
              {plugin.type === 'spigot' && !plugin.iconUrl && (
                <SiSpigotmc class="fill-yellow" />
              )}
              {plugin.type === 'modrinth' && !plugin.iconUrl && (
                <SiModrinth class="fill-green" />
              )}
              {plugin.iconUrl && (
                <img
                  src={plugin.iconUrl}
                  alt={`${plugin.name} icon`}
                  width={24}
                  height={24}
                  class="rounded-lum-2! h-6 w-6 object-cover"
                />
              )}

              <span class="text-lum-text! text-lg!">{plugin.name}</span>
              {plugin.mcVersions && (
                <span class="text-lum-text-secondary text-sm">
                  {plugin.mcVersions[0]} -{' '}
                  {plugin.mcVersions[plugin.mcVersions.length - 1]}
                </span>
              )}
            </p>

            {plugin.type !== 'misc' && (
              <p class="text-lum-text-secondary text-sm">
                {plugin.description ?? 'Loading...'}
              </p>
            )}
          </div>

          <div class="flex-1 flex-col items-center gap-2">
            {plugin.updateDate && (
              <p class="text-lum-text-secondary flex-1 text-right text-sm">
                Last Updated{' '}
                {new Date(plugin.updateDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
            {plugin.currentVersion && (
              <p class="text-lum-text-secondary flex-1 text-right text-sm">
                Current:{' '}
                <span
                  class={{
                    'font-mono': true,
                    'text-red-500': updateAvailable,
                    'text-blue-500': !updateAvailable,
                  }}
                >
                  {plugin.currentVersion.name}
                </span>
              </p>
            )}
            {plugin.latestVersion && (
              <p class="text-lum-text-secondary flex-1 text-right text-sm">
                Latest:{' '}
                <span class="font-mono text-green-500">
                  {plugin.latestVersion.name}
                </span>
              </p>
            )}
            {plugin.type !== 'misc' && !plugin && (
              <Loader2 size={16} class="animate-spin" />
            )}
          </div>
        </div>

        {!noActions && (
          <div class="flex items-center gap-1">
            {plugin.file?.url && (
              <button
                class={{
                  'lum-btn rounded-lum-2 lum-grad-bg-gray-900/0 hover:lum-bg-blue cursor-pointer text-sm backdrop-contrast-80 backdrop-saturate-200': true,
                }}
                onClick$={async () => {
                  if (!plugin.file?.url) return;
                  isLoading.value = true;

                  if (plugin.type === 'spigot')
                    await downloadSpigotPlugin(plugin, spigotRateLimit);
                  else window.open(plugin.file.url, '_blank');

                  plugin.currentVersion = plugin.latestVersion;
                  isLoading.value = false;
                }}
                disabled={isLoading.value}
              >
                <Download size={16} /> Download
                <span class="text-lum-text-secondary text-xs">
                  {plugin.file?.name ?? plugin.latestVersion?.name ?? 'latest'}
                </span>
                {!!plugin.file?.size && (
                  <span class="text-lum-text-secondary text-xs">
                    {plugin.file?.size} {plugin.file?.sizeUnit}
                  </span>
                )}
                {!!plugin.file?.externalUrl && (
                  <span class="text-lum-text-secondary text-xs">external</span>
                )}
                {isLoading.value && <Loader2 size={16} class="animate-spin" />}
              </button>
            )}

            {plugin.url && (
              <a
                class={{
                  'lum-btn rounded-lum-2 lum-grad-bg-gray-900/0 hover:lum-bg-blue cursor-pointer text-sm backdrop-contrast-80 backdrop-saturate-200': true,
                }}
                href={plugin.url}
                target="_blank"
                onClick$={() => {
                  plugin.updateDate = new Date();
                }}
              >
                <Link size={16} /> View plugin
              </a>
            )}

            {updateAvailable && (
              <button
                class="lum-btn rounded-lum-2 lum-bg-transparent text-sm"
                onClick$={() => {
                  plugin.currentVersion = plugin.latestVersion;
                  plugin.updateDate = new Date();
                }}
              >
                <Check size={16} /> Mark updated
              </button>
            )}
            <div class="flex-1" />
            {plugin.sourceCodeLink && (
              <a
                href={plugin.sourceCodeLink}
                target="_blank"
                class="lum-btn rounded-lum-2 p-2"
              >
                <SiGithub size={16} class="fill-current" />
              </a>
            )}
            {plugin.type === 'spigot' && (
              <>
                {plugin.file?.externalUrl?.includes('modrinth') && (
                  <a
                    href={plugin.file?.externalUrl}
                    target="_blank"
                    class="lum-btn rounded-lum-2 lum-grad-bg-green p-2"
                  >
                    <SiModrinth size={16} class="fill-current" />
                  </a>
                )}
                <a
                  href={`https://www.spigotmc.org/resources/${plugin.id}`}
                  target="_blank"
                  class="lum-btn rounded-lum-2 lum-grad-bg-yellow p-2"
                >
                  <SiSpigotmc size={16} class="fill-current" />
                </a>
              </>
            )}
            {plugin.type === 'modrinth' && (
              <>
                <a
                  href={`https://modrinth.com/plugin/${plugin.id}`}
                  target="_blank"
                  class="lum-btn rounded-lum-2 lum-grad-bg-green p-2"
                >
                  <SiModrinth size={16} class="fill-current" />
                </a>
              </>
            )}
            <Slot name="extra-actions" />
          </div>
        )}
      </div>
    );
  },
);
