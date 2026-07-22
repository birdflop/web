import { $ } from '@qwik.dev/core';
import { BasePlugin } from './BasePlugin';
import { PluginType } from './ServerPlugin';
import { Notification, NotificationType } from '../Notification';
import type { SpigotResource, SpigotVersion } from './types';

export class SpigotPlugin extends BasePlugin {
  static async search(query: string): Promise<SpigotPlugin[]> {
    const searchUrl = 'https://api.spiget.org/v2/search/resources/';
    const searchParams = new URLSearchParams({
      size: '5',
    });

    const searchRes = await fetch(
      `${searchUrl}${encodeURIComponent(query)}?${searchParams.toString()}`
    );
    const searchData = await searchRes.json();
    return searchData.map((data) =>
      new SpigotPlugin({ id: data.id }).fromData(
        data as unknown as Record<string, unknown>
      )
    );
  }

  type = 'spigot' as const;

  fromData(data: Record<string, unknown>) {
    const spigotData = data as unknown as SpigotResource;
    Object.assign(this, {
      id: spigotData.id,
      name: spigotData.name,
      description: spigotData.tag,
      url: spigotData.url,
      iconUrl: spigotData.icon?.url
        ? 'https://spigotmc.org/' + spigotData.icon.url
        : undefined,
      mcVersions: spigotData.testedVersions,
      releaseDate: new Date(spigotData.releaseDate * 1000),
      updateDate: new Date(spigotData.updateDate * 1000),
      file: spigotData.file
        ? {
            type: spigotData.file.type,
            size: spigotData.file.size,
            sizeUnit: spigotData.file.sizeUnit,
            url: spigotData.file.url,
            externalUrl: spigotData.file.externalUrl,
          }
        : undefined,
      sourceCodeLink: spigotData.sourceCodeLink,
    });

    return this;
  }

  async fetchData() {
    const res = await fetch(`https://api.spiget.org/v2/resources/${this.id}`);
    const data = await res.json();

    return this.fromData(data as unknown as Record<string, unknown>);
  }

  async fetchVersions() {
    const versionsRes = await fetch(
      `https://api.spiget.org/v2/resources/${this.id}/versions?size=100&sort=-releaseDate`
    );
    const versionsData = await versionsRes.json();

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

export const downloadSpigotPlugin = $(
  async (
    plugin: PluginType,
    spigotRateLimit?: { downloadCount: number; resetTime: number },
    notifications?: NotificationType[]
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
    if (
      spigotRateLimit &&
      spigotRateLimit.downloadCount >= 10 &&
      Date.now() < spigotRateLimit.resetTime
    ) {
      if (notifications) {
        const notification = new Notification()
          .setTitle('Spigot Download Rate Limit Reached')
          .setDescription(
            `Spigot limits downloads to 10 per minute. Waiting ${Math.ceil((spigotRateLimit.resetTime - Date.now()) / 1000)} seconds to continue downloading.`
          )
          .setBgColor('lum-grad-bg-yellow/50')
          .setPersist(true);
        notifications.push(notification.toJSON());
      }
      await new Promise((resolve) =>
        setTimeout(resolve, spigotRateLimit.resetTime - Date.now())
      );
      spigotRateLimit.downloadCount = 0;
    }

    // open the plugin file url in a new tab to trigger the download
    downloadWindow?.location.replace(`https://www.spigotmc.org/${targetUrl}`);

    if (!spigotRateLimit) return;
    spigotRateLimit.downloadCount++;
    // set the reset time to 1 minute from now
    if (spigotRateLimit.resetTime < Date.now())
      spigotRateLimit.resetTime = Date.now() + 60 * 1000;
  }
);
