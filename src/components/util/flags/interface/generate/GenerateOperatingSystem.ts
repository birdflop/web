import type { Generate } from '~/components/util/flags/interface/generate/Generate';

export interface GenerateOperatingSystemResult {
    'script': string,
    'flags': string[]
}

export type GenerateOperatingSystem<T extends string | number> = Generate<T, GenerateOperatingSystemResult>;
