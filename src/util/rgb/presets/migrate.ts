import { rgbPreset } from '.';
import { colorFormats } from '@birdflop/rgbirdflop';

export function migrateBetweenVersions(preset: any) {
  return migrateFromV2(preset) || migrateFromV3(preset) || migrateFromV4(preset) || undefined;
}

function migrateFromV2(preset: any) {
  if (preset.version != 2) return;
  const { name, text, speed, type, customFormat, bold, italic, underline, strikethrough, colors, length } = preset;
  return migrateFromV3({
    version: 3,
    name, text, speed, type, customFormat, bold, italic, underline, strikethrough, colors, length,
    format: colorFormats.find((f) => f.color === preset.format) || {
      color: preset.format,
      char: preset.formatchar,
    },
    prefixsuffix: preset.prefix ? `${preset.prefix}$t` : '',
  });
}

function migrateFromV3(preset: any) {
  if (preset.version != 3) return;
  return migrateFromV4({
    version: 4,
    ...preset,
    colors: preset.colors ? preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i })) : undefined,
  });
}

function migrateFromV4(preset: any) {
  if (preset.version != 4) return;

  const {
    bold, italic, underline, strikethrough, obfuscate,
    shadowcolors: shadowColors,
    format: colorFormat,
    colorlength: colorLength,
    prefixsuffix: prefixSuffix,
    trimspaces: trimSpaces,
    ...rest
  } = preset;

  // move formatting
  const defaultFormatting = {
    bold, italic, underline, strikethrough, obfuscate,
  };

  return {
    version: 5,
    ...rest,
    shadowColors,
    colorFormat,
    colorLength,
    defaultFormatting,
    prefixSuffix,
    trimSpaces,
  };
}

export function migratePresetsFromCookies(savedPresets: rgbPreset[]) {
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie['presets']) {
    const cookiePresets = decodeURIComponent(cookie['presets']);
    const privatePresetsFromCookie = JSON.parse(cookiePresets)?.savedPresets || [];
    savedPresets = savedPresets.concat(privatePresetsFromCookie);
    // remove cookie
    document.cookie = 'presets=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  localStorage.setItem('privatePresets', JSON.stringify(savedPresets));
}