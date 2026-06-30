import { $ } from '@builder.io/qwik';
import { ServerPlugin, PluginVersion, PluginType } from './ServerPlugin';
import { Notification } from '../Notification';

export class SpigotPlugin implements ServerPlugin {
  static async search(query: string): Promise<any[]> {
    const searchUrl = 'https://api.spiget.org/v2/search/resources/';
    const searchParams = new URLSearchParams({
      size: '5',
    });

    const searchRes = await fetch(`${searchUrl}${encodeURIComponent(query)}?${searchParams.toString()}`);
    const searchData: any[] = await searchRes.json();
    return searchData.map((data) => new SpigotPlugin({ id: data.id }).fromData(data));
  }
  id: number | string;
  type = 'spigot' as const;
  name?: string;
  description?: string;
  url?: string;
  iconUrl?: string;
  mcVersions?: string[];
  releaseDate?: Date;
  updateDate?: Date;
  versions?: PluginVersion[];
  currentVersion?: PluginVersion;
  latestVersion?: PluginVersion;
  file?: {
    name?: string;
    type: string;
    size: number;
    sizeUnit: string;
    url: string;
    externalUrl?: string;
  };
  sourceCodeLink?: string;

  constructor(plugin: PluginType) {
    this.id = plugin.id;
    Object.assign(this, plugin);
  }

  async get() {
    await this.fetch();
    return this;
  }

  async fetch() {
    await this.fetchData();
    await this.fetchVersions();
    return this;
  }

  fromData(data: any) {
    Object.assign(this, {
      id: data.id,
      name: data.name,
      description: data.tag,
      url: data.url,
      iconUrl: data.icon?.url ? 'https://spigotmc.org/' + data.icon.url : undefined,
      mcVersions: data.testedVersions,
      releaseDate: new Date(data.releaseDate * 1000),
      updateDate: new Date(data.updateDate * 1000),
      file: data.file ? {
        type: data.file.type,
        size: data.file.size,
        sizeUnit: data.file.sizeUnit,
        url: data.file.url,
        externalUrl: data.file.externalUrl,
      } : undefined,
      sourceCodeLink: data.sourceCodeLink,
    });

    return this;
  }

  async fetchData() {
    const res = await fetch(`https://api.spiget.org/v2/resources/${this.id}`);
    const data = await res.json() as any;

    return this.fromData(data);;
  }

  async fetchVersions() {
    const versionsRes = await fetch(`https://api.spiget.org/v2/resources/${this.id}/versions?size=100&sort=-releaseDate`);
    const versionsData: any[] = await versionsRes.json();

    this.versions = versionsData.map((version) => ({
      id: version.id,
      name: version.name,
      releaseDate: new Date(version.releaseDate * 1000),
    }));

    this.latestVersion = this.versions[0];

    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      url: this.url,
      iconUrl: this.iconUrl,
      mcVersions: this.mcVersions,
      releaseDate: this.releaseDate,
      updateDate: this.updateDate,
      versions: this.versions,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
      file: this.file,
      sourceCodeLink: this.sourceCodeLink,
    };
  }

  clone(): SpigotPlugin {
    return new SpigotPlugin(this.toJSON());
  }
}

export const downloadSpigotPlugin = $(async (
  plugin: PluginType,
  spigotRateLimit?: { downloadCount: number, resetTime: number },
  notifications?: Notification[],
) => {
  const targetUrl = plugin.file?.url;

  // if the plugin has an external url, open that instead of spigot to avoid rate limits
  if (plugin.file?.externalUrl) {
    window.open(plugin.file.externalUrl, '_blank');
    return;
  }

  if (!targetUrl) return;

  const downloadWindow = window.open('about:blank', '_blank');

  // spigot rate limits downloads to 10 per minute
  if (spigotRateLimit && spigotRateLimit.downloadCount >= 10 && Date.now() < spigotRateLimit.resetTime) {
    if (notifications) {
      const notification = new Notification()
        .setTitle('Spigot Download Rate Limit Reached')
        .setDescription(`Spigot limits downloads to 10 per minute. Waiting ${Math.ceil((spigotRateLimit.resetTime - Date.now()) / 1000)} seconds to continue downloading.`)
        .setBgColor('lum-grad-bg-yellow/50')
        .setPersist(true);
      notifications.push(notification);
    }
    await new Promise((resolve) => setTimeout(resolve, spigotRateLimit.resetTime - Date.now()));
    spigotRateLimit.downloadCount = 0;
  }

  // open the plugin file url in a new tab to trigger the download
  downloadWindow?.location.replace(`https://www.spigotmc.org/${targetUrl}`);

  if (!spigotRateLimit) return;
  spigotRateLimit.downloadCount++;
  // set the reset time to 1 minute from now
  if (spigotRateLimit.resetTime < Date.now())
    spigotRateLimit.resetTime = Date.now() + 60 * 1000;
});