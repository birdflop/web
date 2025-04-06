import type { AvailableConfig } from '~/components/flags/config';

export interface EnvironmentOption {
    'icon': any, // todo: when tabler icons works with qwik
    'config': AvailableConfig[]
}
