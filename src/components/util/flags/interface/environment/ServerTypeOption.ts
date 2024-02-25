import type { EnvironmentOption } from '~/components/util/flags/interface/environment/EnvironmentOption';
import type { Generate } from '~/components/util/flags/interface/generate/Generate';
import type { AvailableServerType } from '~/data/environment/serverType';
import type { AvailableExtraFlags, AvailableFlags } from '~/data/flags';

export interface ServerTypeOption extends EnvironmentOption {
    'flags': AvailableFlags[],
    'extraFlags'?: AvailableExtraFlags[],
    'default': {
        'flags': AvailableFlags,
        'extraFlags'?: AvailableExtraFlags[]
    },
    'generate'?: Generate<AvailableServerType | 'existingFlags'>
}
