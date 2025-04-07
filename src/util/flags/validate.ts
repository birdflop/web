import type { ZodType } from 'zod';
import { z } from 'zod';
import type { AvailableConfig } from './config';
import { config } from './config';
import type { AvailableOperatingSystem } from './environment/operatingSystem';
import { defaultOperatingSystem, operatingSystem } from './environment/operatingSystem';
import type { AvailableServerType } from './environment/serverType';
import { defaultServerType, serverType } from './environment/serverType';

type GenerateConfigSchema = {
  [key in AvailableConfig]: ZodType
}

const operatingSystemKeys = Object.keys(operatingSystem);
const serverTypeKeys = Object.keys(serverType);

export const BaseConfigValidation = z.object({
  //@ts-ignore
  'operatingSystem': z.enum(operatingSystemKeys).default(defaultOperatingSystem), // todo: types
  //@ts-ignore
  'serverType': z.enum(serverTypeKeys).default(defaultServerType), // todo: types
  'withHTML': z.boolean().default(false),
  'withFlags': z.boolean().default(true),
  'withResult': z.boolean().default(true),
});

export function generateConfigSchema(requestOperatingSystem: AvailableOperatingSystem, requestServerType: AvailableServerType) {
  const schema: GenerateConfigSchema = {};

  const selectedOperatingSystem = operatingSystem[requestOperatingSystem];
  const selectedServerType = serverType[requestServerType];

  for (const [key, value] of Object.entries(config)) {
    // Config option not supported
    if (!selectedOperatingSystem.config.includes(key) || !selectedServerType.config.includes(key)) {
      schema[key] = z.never().optional();
      continue;
    }

    schema[key] = value.type.default(value.default);
  }

  // Server type's accepted flags
  //@ts-ignore
  schema.flags = z.nativeEnum(selectedServerType.flags).default(selectedServerType.default.flags); // todo: types

  // Server type's accepted extra flags
  //@ts-ignore
  schema.extraFlags = (!selectedServerType.extraFlags || selectedServerType.extraFlags.length === 0) ? z.never().optional() : z.array(z.nativeEnum(selectedServerType.extraFlags)).default(selectedServerType.default.extraFlags ?? []); // todo: types

  return BaseConfigValidation.extend(schema);
}
