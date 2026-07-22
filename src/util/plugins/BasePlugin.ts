import type {
  ServerPlugin,
  PluginVersion,
  PluginType,
  PluginSource,
} from './ServerPlugin';

export abstract class BasePlugin<
  T = Record<string, unknown>,
> implements ServerPlugin<T> {
  id: number | string;
  abstract type: PluginSource;
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

  abstract fromData(data: T): this;
  abstract fetchData(): Promise<this>;
  abstract fetchVersions(): Promise<this>;
  abstract toJSON(): PluginType;
  abstract clone(): this;
}
