import { ServerPlugin, PluginVersion, PluginType } from './ServerPlugin';

export class SpigotPlugin implements ServerPlugin {
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
      name: data.name,
      description: data.tag,
      url: data.url,
      iconUrl: data.icon?.url ? 'https://spigotmc.org/' + data.icon.url : undefined,
      mcVersions: data.testedVersions,
      releaseDate: new Date(data.releaseDate),
      updateDate: new Date(data.updateDate),
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
      releaseDate: new Date(version.releaseDate),
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