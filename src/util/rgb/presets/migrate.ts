import { rgbPreset } from '.';
import { formats } from './defaults';

export function migrateFromV2(preset: any) {
  if (preset.version != 2) return;
  const { name, text, speed, type, customFormat, bold, italic, underline, strikethrough, colors, length } = preset;
  return { name, text, speed, type, customFormat, bold, italic, underline, strikethrough, colors, length,
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
  localStorage.setItem('savedPresets', JSON.stringify(savedPresets));
}