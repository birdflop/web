import { component$, useSignal } from '@builder.io/qwik';
import { LinkProps } from '@builder.io/qwik-city';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Check, Download, Loader2 } from 'lucide-icons-qwik';
import { downloadSpigotPlugin } from '~/routes/resources/plugins';

export type Plugin = {
  name: string;
  version?: any;
  type?: 'spigot';
  id?: string;
};

export type PluginData = {
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
  versions?: {
    id: string;
    name: string;
    releaseDate: number;
  }[];
}

export type PluginWithData = Plugin & {
  data?: PluginData;
};

export interface PluginCardProps extends Omit<LinkProps, 'class'> {
  plugin: PluginWithData;
  updateAvailable?: boolean;
  noActions?: boolean;
  spigotRateLimit?: { downloadCount: number, resetTime: number };
}

export default component$<PluginCardProps>(({ plugin, noActions, updateAvailable, spigotRateLimit }) => {
  const isLoading = useSignal(false);

  return <div key={plugin.name} class={{
    'lum-card flex-1 relative lum-bg-lum-card-bg/90 overflow-clip': true,
    'border-green': updateAvailable,
  }}>
    {plugin.data?.iconUrl &&
      <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
        width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-xl scale-250 saturate-200" />}

    <div class="flex items-center gap-2">
      <div class="flex-1 flex-col items-center">
        <p class="flex items-center gap-2">
          {(plugin.type === 'spigot' && !plugin.data?.iconUrl)
            && <SiSpigotmc class="fill-yellow" />}
          {plugin.data?.iconUrl &&
            <img src={'https://spigotmc.org/' + plugin.data.iconUrl} alt={`${plugin.name} icon`}
              width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}

          <span class="text-lg! text-lum-text!">
            {plugin.name}
          </span>
          {plugin.data?.testedVersions &&
            <span class="text-sm">
              {plugin.data.testedVersions[0]} - {plugin.data.testedVersions[plugin.data.testedVersions.length - 1]}
            </span>
          }
        </p>

        {plugin.data?.tag &&
          <p class="text-sm mt-1">
            {plugin.data?.tag}
          </p>
        }
      </div>

      {!noActions &&
        <div class="flex-1 flex-col gap-2 items-center">
          {plugin.version && <p class="text-sm flex-1 text-right">
            Current: <span class={{
              'text-red-500': updateAvailable,
              'text-blue-500': !updateAvailable,
            }}>
              {plugin.version.name}
            </span>
          </p>}
          {plugin.data?.latestVersion && <p class="text-sm flex-1 text-right">
            Latest: <span class="text-green-500">
              {plugin.data.latestVersion.name}
            </span>
          </p>}
          {!plugin.data && <Loader2 class="animate-spin" />}
        </div>
      }
    </div>

    {!noActions && <div class="flex items-center mt-2 gap-1">
      <button class={{
        'lum-btn text-sm': true,
      }} onClick$={async () => {
        if (!plugin.data?.file?.url) return;
        isLoading.value = true;

        if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin, spigotRateLimit);
        else window.open(plugin.data.file.url, '_blank');

        plugin.version = plugin.data?.latestVersion;
        isLoading.value = false;
      }} disabled={!plugin.data?.file?.url || isLoading.value}>
        <Download size={16} /> Download latest
        {!!plugin.data?.file?.size &&
          <span class="text-xs text-lum-text-secondary">
            {plugin.data?.file?.size} {plugin.data?.file?.sizeUnit}
          </span>
        }
        {!!plugin.data?.external &&
          <span class="text-xs text-lum-text-secondary">
            external
          </span>
        }
        {isLoading.value && <div class="lum-loading ml-2 w-4 h-4" />}
      </button>
      <button class="lum-btn text-sm lum-bg-transparent" onClick$={() => {
        plugin.version = plugin.data?.latestVersion;
      }}>
        <Check size={16} /> Mark updated
      </button>
      {plugin.data?.latestVersion && updateAvailable && <p class="text-green-500! text-xs">
        Update available as of {
          new Date(plugin.data.latestVersion.releaseDate * 1000)
            .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        }
      </p>}
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
    </div>}
  </div>;
});