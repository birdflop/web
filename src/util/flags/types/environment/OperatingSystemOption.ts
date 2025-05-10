import type { EnvironmentOption } from '~/util/flags/types/environment/EnvironmentOption';
import type { GenerateOperatingSystem } from '~/util/flags/types/generate/GenerateOperatingSystem';
import type { AvailableConfig } from '~/util/flags/config';

interface File {
    'name'?: string,
    'mime': string,
    'extension': string
}

export interface OperatingSystemOption extends EnvironmentOption {
    'file': File | false,
    'generate': GenerateOperatingSystem<AvailableConfig | 'existingFlags'>
}
