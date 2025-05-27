import { defaults } from './defaults';
import { migrateFromV2, migrateFromV3 } from './migrate';

export interface format {
  color: string;
  char?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
  obfuscate?: string;
}

export interface publishedPreset {
  name: string;
  author: string;
  preset: Partial<typeof defaults>;
}

export function loadPreset(p: string): Partial<typeof defaults> {
  const preset = JSON.parse(p);
  let newPreset: Partial<typeof defaults> = {};

  // Migrate colors from strings to objects
  if (preset.colors && preset.colors.length && typeof preset.colors[0] == 'string') {
    if (typeof preset.colors[0] == 'string') preset.colors = preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i }));
  }

  // Check for any negative numbers in the preset
  Object.keys(preset).forEach(key => {
    if (typeof preset[key] === 'number' && preset[key] < 0) {
      preset[key] = 1; // Reset negative values to 1
    }
  });

  // if version is current, return the preset
  if (preset.version === defaults.version || !preset.version) return preset;

  // if version is not current, migrate the preset
  const migratedFromV2 = migrateFromV2(preset);
  if (migratedFromV2) newPreset = migratedFromV2;
  const migratedFromV3 = migrateFromV3(preset);
  if (migratedFromV3) newPreset = migratedFromV3;
  newPreset.version = defaults.version;

  // remove any properties that are the same as the defaults
  (Object.keys(newPreset) as Array<keyof typeof newPreset>).forEach((key) => {
    if (newPreset[key] === defaults[key] && key !== 'version') {
      delete newPreset[key];
    }
  });

  return newPreset;
}