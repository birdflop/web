import type { EnvironmentOption } from '~/util/flags/interface/environment/EnvironmentOption';
import type { Generate } from '~/util/flags/interface/generate/Generate';
import type { AvailableServerType } from '~/util/flags/environment/serverType';
import type { AvailableExtraFlags, AvailableFlags } from '~/util/flags/flags';

export interface ServerTypeOption extends EnvironmentOption {
    'flags': AvailableFlags[],
    'extraFlags'?: AvailableExtraFlags[],
    'default': {
        'flags': AvailableFlags,
        'extraFlags'?: AvailableExtraFlags[]
    },
    'generate'?: Generate<AvailableServerType | 'existingFlags'>
}
