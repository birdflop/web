import type { AvailableConfig } from '~/util/flags/config';

export interface EnvironmentOption {
    'icon': any, // todo: when tabler icons works with qwik
    'config': AvailableConfig[]
}
