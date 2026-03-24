export type Generate<T extends string | number, RT = string[]> = (props: Partial<Record<T, any>>) => RT;
