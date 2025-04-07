import type { EnvironmentOption } from '~/util/flags/interface/environment/EnvironmentOption';
import type { GenerateOperatingSystem } from '~/util/flags/interface/generate/GenerateOperatingSystem';
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
