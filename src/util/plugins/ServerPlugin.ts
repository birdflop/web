import { ModrinthPlugin } from './ModrinthPlugin';
import { SpigotPlugin } from './SpigotPlugin';

export type PluginVersion = {
  id: number | string;
  name: string;
  releaseDate: Date;
};

export type PluginSource = 'spigot' | 'modrinth' | 'misc';

export type PluginType3 = {
  type?: PluginSource;
  id?: number | string;
  url?: string;
  iconUrl?: string;
  name?: string;
  updateDate?: number;
  currentVersion?: PluginVersion;
};

export type PluginData = {
  name?: string;
  external?: boolean;
  tag?: string;
  iconUrl?: string;
  releaseDate?: Date;
  updateDate?: Date;
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
};

export type PluginWithData = PluginType & {
  data?: PluginData;
};

export type PluginType = {
  id: number | string;
  type?: PluginSource;
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
};

export function getPlugin(plugin: PluginType): ServerPlugin {
  switch (plugin.type) {
    case 'spigot':
      return new SpigotPlugin(plugin);
    case 'modrinth':
      return new ModrinthPlugin(plugin);
    default:
      throw new Error(`Unsupported plugin type: ${plugin.type}`);
  }
}

export function searchPlugins(
  type: PluginSource,
  query: string,
  loaders?: string[]
) {
  switch (type) {
    case 'spigot':
      return SpigotPlugin.search(query);
    case 'modrinth':
      return ModrinthPlugin.search(query, loaders);
    default:
      throw new Error(`Unsupported plugin type: ${type}`);
  }
}

export interface ServerPlugin extends PluginType {
  get(): Promise<this>;
  fetch(): Promise<this>;
  fromData(data: any): this;
  fetchData(): Promise<this>;
  fetchVersions(): Promise<this>;

  toJSON(): PluginType;
  clone(): ServerPlugin;
}
