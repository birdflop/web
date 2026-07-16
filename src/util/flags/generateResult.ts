import { environmentOptions, softwareOptionsFlags } from '.';
import { operatingSystem } from './environment/operatingSystem';
import { serverType } from './environment/serverType';
import type { AvailableExtraFlags, AvailableFlags } from './flags';
import { extraFlags, flags } from './flags';

interface GenerateResult {
  script?: string;
  flags?: string[];
}

export const flagsDefaults = {
  operatingSystem: 'linux' as keyof typeof environmentOptions,
  serverType: 'paper' as keyof typeof softwareOptionsFlags,
  gui: false,
  variables: false,
  autoRestart: false,
  extraFlags: [] as AvailableExtraFlags[],
  fileName: 'server.jar',
  flags: 'aikars' as AvailableFlags,
  withResult: true,
  withFlags: false,
  memory: 8,
  calcOverhead: true,
};

export type flagsSchema = typeof flagsDefaults;

export function generateResult(parsed: flagsSchema): GenerateResult {
  const selectedFlags = flags[parsed.flags];
  let generatedFlags: string[] = selectedFlags.generate(parsed);

  const selectedServerType = serverType[parsed.serverType];

  generatedFlags =
    selectedServerType.generate?.({
      ...parsed,
      existingFlags: generatedFlags,
    }) ?? generatedFlags;

  if (parsed.extraFlags) {
    for (const currentFlags of parsed.extraFlags) {
      if (
        !extraFlags[currentFlags].supports.includes(parsed.flags) ||
        !selectedServerType.extraFlags?.includes(currentFlags)
      )
        continue;
      const selectedFlags = extraFlags[currentFlags];

      generatedFlags =
        selectedFlags.generate({
          ...parsed,
          existingFlags: generatedFlags,
        }) ?? generatedFlags;
    }
  }

  const selectedOperatingSystem = operatingSystem[parsed.operatingSystem];
  const result =
    selectedOperatingSystem.generate({
      ...parsed,
      existingFlags: generatedFlags,
    }) ?? generatedFlags;

  const data: GenerateResult = {};

  if (parsed.withResult) {
    data.script = result.script;
  }

  if (parsed.withFlags) {
    data.flags = result.flags;
  }

  return data;
}
