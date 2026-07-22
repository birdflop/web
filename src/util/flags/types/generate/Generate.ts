export interface FlagProps {
  fileName?: string;
  memory?: number;
  existingFlags?: string[];
  extraFlags?: string[];
  gui?: boolean;
  autoRestart?: boolean;
  variables?: boolean;
  operatingSystem?: string;
  serverType?: string;
  flags?: string;
  calcOverhead?: boolean;
  [key: string]: unknown;
}

export type Generate<_T extends string | number = string, RT = string[]> = (
  props: FlagProps
) => RT;
