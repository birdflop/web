import type { EnvironmentOption } from '~/util/flags/types/environment/EnvironmentOption';

export interface EnvironmentOptions<OptionType = EnvironmentOption> {
  readonly [key: string]: OptionType;
}
