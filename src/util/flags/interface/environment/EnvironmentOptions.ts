import type { EnvironmentOption } from '~/util/flags/interface/environment/EnvironmentOption';

export interface EnvironmentOptions<OptionType = EnvironmentOption> {
    readonly [key: string]: OptionType
}
