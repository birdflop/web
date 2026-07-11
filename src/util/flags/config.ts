import * as v from 'valibot';
import { defaultOperatingSystem } from './environment/operatingSystem';
import { defaultServerType, serverType } from './environment/serverType';
import { extraFlags, flags } from './flags';

export type AvailableConfig =
  | 'fileName'
  | 'flags'
  | 'extraFlags'
  | 'memory'
  | 'gui'
  | 'autoRestart'
  | 'variables';

export interface Config {
  [key: string]: {
    isAdvanced?: boolean;
    type: any; // Valibot schema
    default?: any;
  };
}

type DefaultConfig = {
  [key in AvailableConfig]: any;
};

export const config: Config = {
  fileName: {
    type: v.pipe(v.string(), v.minLength(1), v.maxLength(25)),
    default: 'server.jar',
  },
  flags: {
    type: v.picklist(Object.keys(flags)),
  },
  extraFlags: {
    type: v.array(v.picklist(Object.keys(extraFlags))),
  },
  memory: {
    type: v.pipe(v.number(), v.minValue(2), v.maxValue(16)),
    default: 4,
  },
  gui: {
    type: v.boolean(),
    default: false,
  },
  autoRestart: {
    type: v.boolean(),
    default: false,
  },
  variables: {
    type: v.boolean(),
    isAdvanced: true,
    default: false,
  },
};

export function getDefaults() {
  const defaultConfig: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    defaultConfig[key] = value.default;
  }

  const selectedServerType = serverType[defaultServerType];
  defaultConfig.operatingSystem = defaultOperatingSystem;
  defaultConfig.serverType = defaultServerType;
  defaultConfig.flags = selectedServerType.default.flags;
  defaultConfig.extraFlags = selectedServerType.default.extraFlags;

  return defaultConfig;
}
