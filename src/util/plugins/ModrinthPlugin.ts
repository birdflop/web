import { ServerPlugin, PluginVersion, PluginType } from './ServerPlugin';

export class ModrinthPlugin implements ServerPlugin {
  static async search(query: string, loaders?: string[]): Promise<any[]> {
    const searchUrl = 'https://api.modrinth.com/v2/search';
    const searchParams = new URLSearchParams({
      query: query,
      ...loaders ? {
        facets: JSON.stringify([loaders.map((loader) => `categories:${loader}`)]),
      } : {},
    });

    const searchRes = await fetch(`${searchUrl}?${searchParams.toString()}`);
    const searchData: { hits: any[]; } = await searchRes.json();
    return searchData.hits;
  }
  id: number | string;
  type = 'modrinth' as const;
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
      name: data.title,
      description: data.description,
      url: data.url,
      iconUrl: data.icon_url,
      mcVersions: data.game_versions,
      releaseDate: new Date(data.published),
      updateDate: new Date(data.updated),
      sourceCodeLink: data.source_url,
    });

    return this;
  }

  async fetchData() {
    const res = await fetch(`https://api.modrinth.com/v2/project/${this.id}`);
    const data = await res.json() as any;

    return this.fromData(data);
  }

  async fetchVersions() {
    const res = await fetch(`https://api.modrinth.com/v2/project/${this.id}/version?loaders=["paper"]`);
    const versions = await res.json() as any;
    console.log('Fetched versions for plugin', this.name, versions);

    this.versions = versions.map((version: any) => ({
      id: version.id,
      name: version.name,
      releaseDate: new Date(version.date_published),
    }));
    this.latestVersion = this.versions?.[0];

    const latestVersion = versions[0];
    this.file = latestVersion.files?.length ? {
      name: latestVersion.files[0].filename,
      type: latestVersion.files[0].file_type,
      size: Math.round(latestVersion.files[0].size / (1024 * 1024) * 100) / 100,
      sizeUnit: 'MB',
      url: latestVersion.files[0].url,
    } : undefined;

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

  clone() {
    return new ModrinthPlugin(this.toJSON());
  }
}