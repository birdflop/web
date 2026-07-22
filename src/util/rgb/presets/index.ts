import { combinedDefaults } from '@birdflop/rgbirdflop';
import { migrateBetweenVersions, migratePresetsFromCookies } from './migrate';

export type rgbPreset = Partial<typeof combinedDefaults>;

export function loadPreset(p: string): rgbPreset {
  const preset = JSON.parse(p) as Record<string, unknown>;
  let newPreset: rgbPreset = {};

  const colors = preset.colors as string[] | unknown[] | undefined;
  // Migrate colors from strings to objects
  if (colors && colors.length && typeof colors[0] == 'string') {
    preset.colors = (colors as string[]).map((color: string, i: number) => ({
      hex: color,
      pos: (100 / (colors.length - 1)) * i,
    }));
  }

  // if version is current, return the preset
  if (preset.version === combinedDefaults.version || !preset.version)
    return preset;

  // if version is not current, migrate the preset
  const migratedPreset = migrateBetweenVersions(preset);
  if (migratedPreset) newPreset = migratedPreset;

  newPreset.version = combinedDefaults.version;

  // remove any properties that are the same as the defaults
  (Object.keys(newPreset) as Array<keyof typeof newPreset>).forEach((key) => {
    if (newPreset[key] === combinedDefaults[key] && key !== 'version') {
      delete newPreset[key];
    }
  });

  return newPreset;
}

export function getPresets(): rgbPreset[] {
  let privatePresets: rgbPreset[] = [];

  // try to get presets from localStorage
  const localStoragePresets = localStorage.getItem('privatePresets');

  // if localStorage is empty, try to get presets from cookies
  if (localStoragePresets) {
    const localStoragePresetsParsed = JSON.parse(
      localStoragePresets
    ) as rgbPreset[];
    privatePresets = privatePresets.concat(localStoragePresetsParsed);
  } else {
    migratePresetsFromCookies(privatePresets);
  }

  return privatePresets;
}
