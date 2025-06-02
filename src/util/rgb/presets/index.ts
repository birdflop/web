import { Presets } from '@prisma/client';
import { combinedDefaults } from './defaults';
import { migrateFromV2, migrateFromV3, migratePresetsFromCookies } from './migrate';
import { BirdflopUser } from '~/routes/plugin@auth';

export type rgbPreset = Partial<typeof combinedDefaults>;

export interface format {
  color: string;
  char?: string;
  class?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
  obfuscate?: string;
}

export interface publishedPreset extends Omit<Presets, 'preset' | 'description' | 'userId'> {
  userId?: string;
  user?: BirdflopUser;
  description?: string;
  savedBy?: BirdflopUser[];
  preset: rgbPreset;
}

export interface presetInfo extends Omit<publishedPreset, 'id' | 'author' | 'createdAt' > {
  createdAt?: Date;
  author?: string;
  id?: number;
}

export type presetSubmission = Omit<presetInfo, 'pending'>;

export function loadPreset(p: string): rgbPreset {
  const preset = JSON.parse(p);
  let newPreset: rgbPreset = {};

  // Migrate colors from strings to objects
  if (preset.colors && preset.colors.length && typeof preset.colors[0] == 'string') {
    if (typeof preset.colors[0] == 'string') preset.colors = preset.colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (preset.colors.length - 1)) * i }));
  }

  // if version is current, return the preset
  if (preset.version === combinedDefaults.version || !preset.version) return preset;

  // if version is not current, migrate the preset
  const migratedFromV2 = migrateFromV2(preset);
  if (migratedFromV2) newPreset = migratedFromV2;
  const migratedFromV3 = migrateFromV3(preset);
  if (migratedFromV3) newPreset = migratedFromV3;
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
    const localStoragePresetsParsed = JSON.parse(localStoragePresets) as rgbPreset[];
    privatePresets = privatePresets.concat(localStoragePresetsParsed);
  }
  else {
    migratePresetsFromCookies(privatePresets);
  }

  return privatePresets;
}