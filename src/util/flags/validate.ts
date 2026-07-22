import * as v from 'valibot';
import type { AvailableConfig } from './config';
import { config } from './config';
import type { AvailableOperatingSystem } from './environment/operatingSystem';
import {
  defaultOperatingSystem,
  operatingSystem,
} from './environment/operatingSystem';
import type { AvailableServerType } from './environment/serverType';
import { defaultServerType, serverType } from './environment/serverType';

const operatingSystemKeys = Object.keys(operatingSystem);
const serverTypeKeys = Object.keys(serverType);

export const BaseConfigValidation = v.object({
  operatingSystem: v.optional(
    v.picklist(operatingSystemKeys),
    defaultOperatingSystem
  ),
  serverType: v.optional(v.picklist(serverTypeKeys), defaultServerType),
  withHTML: v.optional(v.boolean(), false),
  withFlags: v.optional(v.boolean(), true),
  withResult: v.optional(v.boolean(), true),
});

type GenerateConfigSchema = {
  [key in AvailableConfig]: v.BaseSchema<
    unknown,
    unknown,
    v.BaseIssue<unknown>
  >;
};

export function generateConfigSchema(
  requestOperatingSystem: AvailableOperatingSystem,
  requestServerType: AvailableServerType
) {
  const schema = {} as GenerateConfigSchema;

  const selectedOperatingSystem = operatingSystem[requestOperatingSystem];
  const selectedServerType = serverType[requestServerType];

  for (const [key, value] of Object.entries(config) as [
    AvailableConfig,
    (typeof config)[string],
  ][]) {
    if (
      !selectedOperatingSystem.config.includes(key) ||
      !selectedServerType.config.includes(key)
    ) {
      schema[key] = v.optional(v.never());
      continue;
    }

    schema[key] =
      value.default !== undefined
        ? v.optional(value.type, value.default as never)
        : value.type;
  }

  // flags
  schema.flags = v.optional(
    v.picklist(Object.values(selectedServerType.flags)),
    selectedServerType.default.flags
  );

  // extraFlags
  schema.extraFlags =
    !selectedServerType.extraFlags || selectedServerType.extraFlags.length === 0
      ? v.optional(v.never())
      : v.optional(
          v.array(v.picklist(selectedServerType.extraFlags)),
          selectedServerType.default.extraFlags ?? []
        );

  return v.object({
    ...BaseConfigValidation.entries,
    ...schema,
  });
}
