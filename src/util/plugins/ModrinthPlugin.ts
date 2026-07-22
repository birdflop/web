import { BasePlugin } from './BasePlugin';
import type {
  ModrinthProjectData,
  ModrinthSearchHit,
  ModrinthVersionData,
} from './types';

export class ModrinthPlugin extends BasePlugin {
  static async search(
    query: string,
    loaders?: string[]
  ): Promise<ModrinthPlugin[]> {
    const searchUrl = 'https://api.modrinth.com/v2/search';
    const searchParams = new URLSearchParams({
      query: query,
      ...(loaders
        ? {
            facets: JSON.stringify([
              loaders.map((loader) => `categories:${loader}`),
            ]),
          }
        : {}),
    });

    const searchRes = await fetch(`${searchUrl}?${searchParams.toString()}`);
    const searchData = (await searchRes.json()) as {
      hits: ModrinthSearchHit[];
    };
    return searchData.hits.map((data) =>
      new ModrinthPlugin({ id: data.project_id }).fromData(
        data as unknown as Record<string, unknown>
      )
    );
  }

  type = 'modrinth' as const;

  fromData(data: Record<string, unknown>) {
    const modrinthData = data as unknown as ModrinthProjectData &
      ModrinthSearchHit;
    Object.assign(this, {
      id: modrinthData.id ?? modrinthData.project_id,
      name: modrinthData.title,
      description: modrinthData.description,
      url: modrinthData.url,
      iconUrl: modrinthData.icon_url,
      mcVersions: modrinthData.game_versions,
      releaseDate: new Date(modrinthData.published),
      updateDate: new Date(modrinthData.updated),
      sourceCodeLink: modrinthData.source_url,
    });

    return this;
  }

  async fetchData() {
    const res = await fetch(`https://api.modrinth.com/v2/project/${this.id}`);
    const data = (await res.json()) as ModrinthProjectData;

    return this.fromData(data as unknown as Record<string, unknown>);
  }

  async fetchVersions() {
    const res = await fetch(
      `https://api.modrinth.com/v2/project/${this.id}/version?loaders=["paper"]`
    );
    const versions = (await res.json()) as ModrinthVersionData[];
    console.log('Fetched versions for plugin', this.name, versions);

    this.versions = versions.map((version) => ({
      id: version.id,
      name: version.name,
      releaseDate: new Date(version.date_published),
    }));
    this.latestVersion = this.versions?.[0];

    const latestVersion = versions[0];
    this.file = latestVersion?.files?.length
      ? {
          name: latestVersion.files[0].filename,
          type: latestVersion.files[0].file_type,
          size:
            Math.round((latestVersion.files[0].size / (1024 * 1024)) * 100) /
            100,
          sizeUnit: 'MB',
          url: latestVersion.files[0].url,
        }
      : undefined;

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
