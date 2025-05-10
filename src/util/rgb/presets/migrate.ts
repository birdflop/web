import { formats } from './defaults';

export function migrateFromV2(preset: any) {
  if (preset.version != 2) return;
  const { name, text, speed, type, customFormat, bold, italic, underline, strikethrough } = preset;
  return { name, text, speed, type, customFormat, bold, italic, underline, strikethrough,
    colors: preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })),
    format: formats.find((f) => f.color === preset.format) || {
      color: preset.format,
      char: preset.formatchar,
    },
    prefixsuffix: preset.prefix ? `${preset.prefix}$t` : '',
  };
}

export function migrateFromV3(preset: any) {
  if (preset.version != 3) return;
  return {
    ...preset,
    colors: preset.colors ? preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })) : undefined,
  };
}