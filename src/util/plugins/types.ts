import type { softwareOptions } from '../flags';
import type { PluginSource, PluginType } from './ServerPlugin';

export interface ModrinthSearchHit {
  id?: string;
  project_id: string;
  title: string;
  description: string;
  url: string;
  icon_url: string;
  game_versions: string[];
  published: string;
  updated: string;
  source_url?: string;
}

export interface ModrinthProjectData {
  id: string;
  title: string;
  description: string;
  url: string;
  icon_url: string;
  game_versions: string[];
  published: string;
  updated: string;
  source_url?: string;
}

export interface ModrinthVersionData {
  id: string;
  name: string;
  date_published: string;
  files?: Array<{
    filename: string;
    file_type: string;
    size: number;
    url: string;
  }>;
}

export interface SpigotResource {
  id: number;
  name: string;
  tag: string;
  url: string;
  icon?: { url?: string };
  testedVersions: string[];
  releaseDate: number;
  updateDate: number;
  file?: {
    type: string;
    size: number;
    sizeUnit: string;
    url: string;
    externalUrl?: string;
  };
  sourceCodeLink?: string;
}

export interface SpigotVersion {
  id: number;
  name: string;
  releaseDate: number;
}

export type PluginsType = { [id: string]: PluginType };

export type ServerType = {
  software: keyof typeof softwareOptions;
  plugins: PluginsType;
  id?: number;
  slug?: string;
  icon?: string;
};

export type ServersType = {
  [serverName: string]: ServerType;
};

export type PluginsStoreType = {
  servers: ServersType;
  openServer?: string;
  filter?: 'outdated' | PluginSource;
};
