import { operatingSystem } from './environment/operatingSystem';
import { serverType } from './environment/serverType';
import type { AvailableExtraFlags, AvailableFlags } from './flags';
import { extraFlags, flags } from './flags';

interface GenerateResult {
  'script'?: string,
  'flags'?: string[]
}

export interface flagsSchema {
  operatingSystem: string,
  serverType: string,
  gui: boolean,
  variables: boolean,
  autoRestart: boolean,
  extraFlags: AvailableExtraFlags[],
  fileName: string,
  flags: AvailableFlags,
  withResult: boolean,
  withFlags: boolean,
  memory: number,
}

export function generateResult(parsed: flagsSchema): GenerateResult {
  const selectedFlags = flags[parsed.flags];
  let generatedFlags: string[] = selectedFlags.generate(parsed);

  const selectedServerType = serverType[parsed.serverType];

  generatedFlags = selectedServerType.generate?.({
    ...parsed,
    'existingFlags': generatedFlags,
  }) ?? generatedFlags;

  if (parsed.extraFlags) {
    for (const currentFlags of parsed.extraFlags) {
      if (!extraFlags[currentFlags].supports.includes(parsed.flags) || !selectedServerType.extraFlags?.includes(currentFlags)) continue;
      const selectedFlags = extraFlags[currentFlags];

      generatedFlags = selectedFlags.generate({
        ...parsed,
        'existingFlags': generatedFlags,
      }) ?? generatedFlags;
    }
  }

  const selectedOperatingSystem = operatingSystem[parsed.operatingSystem];
  const result = selectedOperatingSystem.generate({
    ...parsed,
    'existingFlags': generatedFlags,
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