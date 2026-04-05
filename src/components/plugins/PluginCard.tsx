import { component$, isBrowser, Slot, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { LinkProps } from '@builder.io/qwik-city';
import { SiGithub, SiModrinth, SiSpigotmc } from 'simple-icons-qwik';
import { Check, Download, Link } from 'lucide-icons-qwik';
import { downloadSpigotPlugin } from '~/routes/resources/plugins';
import { Notification, NotificationContext } from '~/util/Notification';

export type PluginVersion = {
  id: number | string;
  name: string;
  releaseDate: number;
}

export type PluginSource = 'spigot' | 'misc' | 'modrinth' | 'github'; // | 'curseforge';

export type PluginType = {
  id?: number | string;
  url?: string;
  iconUrl?: string;
  name?: string;
  updateDate?: number;
  version?: PluginVersion;
  type?: PluginSource;
};

export type PluginData = {
  name?: string
  external?: boolean;
  tag?: string;
  iconUrl?: string;
  releaseDate?: number;
  updateDate?: number;
  file?: {
    name?: string;
    type: string;
    size: number;
    sizeUnit: string;
    url: string;
    externalUrl?: string;
  };
  testedVersions?: string[];
  latestVersion?: PluginVersion;
  sourceCodeLink?: string;
  versions?: PluginVersion[];
}

export type PluginWithData = PluginType & {
  data?: PluginData;
};

export interface PluginCardProps extends Omit<LinkProps, 'class'> {
  class?: {
    [key: string]: boolean;
  };
  plugin: PluginWithData;
  updateAvailable?: boolean;
  noActions?: boolean;
  spigotRateLimit?: { downloadCount: number, resetTime: number };
}

export default component$<PluginCardProps>(({ plugin, noActions, updateAvailable, spigotRateLimit, class: cardClass }) => {
  const isLoading = useSignal(false);
  const notifications = useContext(NotificationContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!isBrowser) return; // dont request plugin data on the server
    if (plugin.data || !plugin.id) return;
    try {
      switch (plugin.type) {
      case 'spigot': {
        const res = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}`);
        const data = await res.json() as any;

        plugin.data = {
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
        };

        // fetch latest version
        const latestVerResponse = await fetch(`https://api.spiget.org/v2/resources/${plugin.id}/versions/latest`);
        const latestVersion = await latestVerResponse.json() as any;
        plugin.data.latestVersion = {
          id: latestVersion.id,
          name: latestVersion.name,
          releaseDate: latestVersion.releaseDate,
        };

        break;
      }
      case 'modrinth': {
        const res = await fetch(`https://api.modrinth.com/v2/project/${plugin.id}`);
        const data = await res.json() as any;

        plugin.data = {
          name: data.title,
          tag: data.description,
          iconUrl: data.icon_url,
          releaseDate: Number(new Date(data.published)) / 1000,
          updateDate: Number(new Date(data.updated)) / 1000,
          testedVersions: data.game_versions,
          sourceCodeLink: data.source_url,
        };

        // fetch latest version
        const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${plugin.id}/version`);
        const versionsData = await versionsRes.json() as any;
        plugin.data.versions = versionsData.map((version: any) => ({
          id: version.id,
          name: version.name,
          releaseDate: Number(new Date(version.date_published)) / 1000,
        }));

        const latestVersion = versionsData[0];
        plugin.data.file = latestVersion.files?.length ? {
          name: latestVersion.files[0].filename,
          type: latestVersion.files[0].file_type,
          size: Math.round(latestVersion.files[0].size / (1024 * 1024) * 100) / 100,
          sizeUnit: 'MB',
          url: latestVersion.files[0].url,
        } : undefined;

        plugin.data.latestVersion = plugin.data.versions?.[0];

        break;
      }
      }
    }
    catch (err) {
      const notification = new Notification()
        .setTitle('Error fetching plugin data')
        .setDescription(`There was an error fetching data for ${plugin.name}: ${err}`)
        .setBgColor('lum-grad-bg-red/50');
      notifications.push(notification);
    }
  });

  const iconUrl = plugin.iconUrl ?? plugin.data?.iconUrl;
  const iconUrlWithLink = plugin.type === 'spigot'
    ? 'https://spigotmc.org/' + iconUrl
    : iconUrl;

  return <div key={plugin.name} class={{
    'lum-card p-4 flex-1 relative lum-grad-bg-lum-card-bg/90 overflow-clip': true,
    'border-green': updateAvailable,
    ...cardClass,
  }}
  style={{
    '--lum-border-radius': '1rem',
  }}>
    {iconUrlWithLink &&
      <img src={iconUrlWithLink} alt={`${plugin.name} icon`}
        width={720} height={720} class="absolute w-full h-full inset-0 object-cover -z-1 blur-xl scale-250 saturate-200" />}

    <div class="flex gap-2">
      <div class="flex-1 flex-col items-center">
        {plugin.data?.latestVersion && updateAvailable && <p class="text-green-500! text-xs mb-2">
          Update available as of {
            new Date(plugin.data.latestVersion.releaseDate * 1000)
              .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          }
        </p>}
        <p class="flex items-center gap-2">
          {(plugin.type === 'spigot' && !iconUrlWithLink)
            && <SiSpigotmc class="fill-yellow" />}
          {(plugin.type === 'modrinth' && !iconUrlWithLink)
            && <SiModrinth class="fill-green" />}
          {iconUrlWithLink &&
            <img src={iconUrlWithLink} alt={`${plugin.name} icon`}
              width={24} height={24} class="w-6 h-6 rounded-lum-2! object-cover" />}

          <span class="text-lg! text-lum-text!">
            {plugin.name}
          </span>
          {plugin.data?.testedVersions &&
            <span class="text-sm text-lum-text-secondary">
              {plugin.data.testedVersions[0]} - {plugin.data.testedVersions[plugin.data.testedVersions.length - 1]}
            </span>
          }
        </p>

        {plugin.type !== 'misc' &&
          <p class="text-sm text-lum-text-secondary">
            {plugin.data ? plugin.data?.tag : 'Loading...'}
          </p>
        }
      </div>

      <div class="flex-1 flex-col gap-2 items-center">
        {plugin.updateDate && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Last Updated {new Date(plugin.updateDate).toLocaleDateString(undefined,
            { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>}
        {plugin.version && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Current: <span class={{
            'font-mono': true,
            'text-red-500': updateAvailable,
            'text-blue-500': !updateAvailable,
          }}>
            {plugin.version.name}
          </span>
        </p>}
        {plugin.data?.latestVersion && <p class="text-sm text-lum-text-secondary flex-1 text-right">
          Latest: <span class="text-green-500 font-mono">
            {plugin.data.latestVersion.name}
          </span>
        </p>}
        {plugin.type !== 'misc' && !plugin.data && <div class="lum-loading ml-2 w-4 h-4" />}
      </div>
    </div>

    {!noActions && <div class="flex items-center gap-1">
      {plugin.data?.file?.url &&
        <button class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} onClick$={async () => {
          if (!plugin.data?.file?.url) return;
          isLoading.value = true;

          if (plugin.type === 'spigot') await downloadSpigotPlugin(plugin, spigotRateLimit);
          else window.open(plugin.data.file.url, '_blank');

          plugin.version = plugin.data?.latestVersion;
          isLoading.value = false;
        }} disabled={isLoading.value}>
          <Download size={16} /> Download
          <span class="text-xs text-lum-text-secondary">
            {plugin.data?.file?.name ?? plugin.data?.latestVersion?.name ?? 'latest'}
          </span>
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
      }

      {plugin.url &&
        <a class={{
          'lum-btn rounded-lum-2 text-sm cursor-pointer lum-grad-bg-gray-900/0 hover:lum-bg-blue backdrop-saturate-200 backdrop-contrast-80': true,
        }} href={plugin.url} target="_blank" onClick$={() => {
          plugin.updateDate = Date.now();
        }}>
          <Link size={16} /> View plugin
        </a>
      }

      {updateAvailable &&
        <button class="lum-btn rounded-lum-2 text-sm lum-bg-transparent" onClick$={() => {
          plugin.version = plugin.data?.latestVersion;
          plugin.updateDate = Date.now();
        }}>
          <Check size={16} /> Mark updated
        </button>
      }
      <div class="flex-1"/>
      {plugin.data?.sourceCodeLink && (
        <a href={plugin.data.sourceCodeLink}
          target="_blank" class="lum-btn rounded-lum-2 p-2">
          <SiGithub size={16} class="fill-current" />
        </a>
      )}
      {plugin.type === 'spigot' && <>
        {plugin.data?.file?.externalUrl?.includes('modrinth') && (
          <a href={plugin.data?.file?.externalUrl}
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