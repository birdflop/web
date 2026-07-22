import { rgbPreset } from '.';
import { colorFormats } from '@birdflop/rgbirdflop';
import { getClientCookies } from '~/util/dataUtils';

export function migrateBetweenVersions(
  preset: Record<string, unknown>
): rgbPreset | undefined {
  return (
    migrateFromV2(preset) ||
    migrateFromV3(preset) ||
    migrateFromV4(preset) ||
    undefined
  );
}

function migrateFromV2(
  preset: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (preset.version != 2) return;
  const { prefix, format, formatchar, ...rest } = preset;
  return migrateFromV3({
    version: 3,
    ...rest,
    format: colorFormats.find((f) => f.color === format) || {
      color: format,
      char: formatchar,
    },
    prefixsuffix: typeof prefix === 'string' ? `${prefix}$t` : '',
  });
}

function migrateFromV3(
  preset: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (preset.version != 3) return;
  const colors = preset.colors as string[] | undefined;
  return migrateFromV4({
    version: 4,
    ...preset,
    colors: colors
      ? colors.map((color: string, i: number) => ({
          hex: color,
          pos: (100 / (colors.length - 1)) * i,
        }))
      : undefined,
  });
}

function migrateFromV4(preset: Record<string, unknown>): rgbPreset | undefined {
  if (preset.version != 4) return;

  const {
    bold,
    italic,
    underline,
    strikethrough,
    obfuscate,
    shadowcolors: shadowColors,
    format: colorFormat,
    colorLength,
    prefixsuffix: prefixSuffix,
    trimspaces: trimSpaces,
    ...rest
  } = preset;

  // move formatting
  const baseFormatting =
    bold || italic || underline || strikethrough || obfuscate
      ? {
          ...(bold ? { bold: Boolean(bold) } : {}),
          ...(italic ? { italic: Boolean(italic) } : {}),
          ...(underline ? { underline: Boolean(underline) } : {}),
          ...(strikethrough ? { strikethrough: Boolean(strikethrough) } : {}),
          ...(obfuscate ? { obfuscate: Boolean(obfuscate) } : {}),
        }
      : undefined;

  console.log(baseFormatting);

  return {
    version: 5,
    ...(rest as Partial<rgbPreset>),
    ...(shadowColors
      ? { shadowColors: shadowColors as rgbPreset['shadowColors'] }
      : {}),
    ...(colorFormat
      ? { colorFormat: colorFormat as rgbPreset['colorFormat'] }
      : {}),
    ...(colorLength
      ? { colorLength: colorLength as rgbPreset['colorLength'] }
      : {}),
    ...(baseFormatting ? { baseFormatting } : {}),
    ...(prefixSuffix
      ? { prefixSuffix: prefixSuffix as rgbPreset['prefixSuffix'] }
      : {}),
    ...(trimSpaces
      ? { trimSpaces: trimSpaces as rgbPreset['trimSpaces'] }
      : {}),
  };
}

export function migratePresetsFromCookies(savedPresets: rgbPreset[]) {
  const cookie = getClientCookies();
  if (cookie['presets']) {
    const cookiePresets = decodeURIComponent(cookie['presets']);
    const parsed = JSON.parse(cookiePresets) as { savedPresets?: rgbPreset[] };
    const privatePresetsFromCookie = parsed?.savedPresets || [];
    savedPresets = savedPresets.concat(privatePresetsFromCookie);
    // remove cookie
    document.cookie =
      'presets=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  localStorage.setItem('privatePresets', JSON.stringify(savedPresets));
}
