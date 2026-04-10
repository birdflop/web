import { ServerPlugin, PluginVersion, PluginType } from './ServerPlugin';

export class SpigotPlugin implements ServerPlugin {
  id: number | string;
  type = 'spigot' as const;
  name?: string;
  description?: string;
  url?: string;
  iconUrl?: string;
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

  async fetchData() {
    const res = await fetch(`https://api.spiget.org/v2/resources/${this.id}`);
    const data = await res.json() as any;

    Object.assign(this, {
      name: data.name,
      description: data.tag,
      url: data.url,
      iconUrl: data.icon?.url,
      updateDate: new Date(data.updateDate),
      file: data.file ? {
        type: data.file.type,
        size: data.file.size,
        sizeUnit: data.file.sizeUnit,
        url: data.file.url,
        externalUrl: data.file.externalUrl,
      } : undefined,
    });

    return this;
  }

  async fetchVersions() {
    const res = await fetch(`https://api.spiget.org/v2/resources/${this.id}/versions/latest`);
    const latestVersion = await res.json() as any;

    this.latestVersion = {
      id: latestVersion.id,
      name: latestVersion.name,
      releaseDate: new Date(latestVersion.releaseDate),
    };

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
      updateDate: this.updateDate,
      versions: this.versions,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
      file: this.file,
    };
  }
}