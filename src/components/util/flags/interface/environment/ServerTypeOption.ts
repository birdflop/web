import type { AvailableExtraFlags, AvailableFlags } from '~/data/flags';
import type { EnvironmentOption } from '~/components/util/flags/interface/environment/EnvironmentOption';
import type { AvailableServerType } from '~/data/environment/serverType';
import type { Generate } from '~/components/util/flags/interface/generate/Generate';

export interface ServerTypeOption extends EnvironmentOption {
    'flags': AvailableFlags[],
    'extraFlags'?: AvailableExtraFlags[],
    'default': {
        'flags': AvailableFlags,
        'extraFlags'?: AvailableExtraFlags[]
    },
    'generate'?: Generate<AvailableServerType | 'existingFlags'>
}
