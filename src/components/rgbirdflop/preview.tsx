import {
  FORMAT_KEYS,
  rgbDefaults,
  type Formatting,
} from '@birdflop/rgbirdflop';
import { getClassObject } from '@luminescent/ui-qwik';
import { ClassList, component$ } from '@qwik.dev/core';

export function toCSS(rgb?: number[]): string {
  return `rgba(${rgb?.slice(0, 3).join(',') || '0,0,0'}, ${rgb?.[3] !== undefined ? rgb[3] / 255 : 1})`;
}

export function getFormattingSignature(formatting: Formatting) {
  return (
    FORMAT_KEYS.map((key) => (formatting[key] ? '1' : '0')).join('') +
    ':' +
    (formatting.font || '')
  );
}

export function getEffectiveFormatting(
  rgbStore: typeof rgbDefaults,
  index: number
) {
  const formatting: Formatting = { ...rgbStore.baseFormatting };

  for (const segment of rgbStore.formatting) {
    if (segment.start <= index && index < segment.end) {
      for (const key of FORMAT_KEYS) {
        if (segment[key] !== undefined) {
          formatting[key] = segment[key];
        }
      }
      if (segment.font !== undefined) {
        formatting.font = segment.font;
      }
    }
  }

  return formatting;
}

export function getFormattingClasses(
  formatting?: Formatting,
  Class?: ClassList
) {
  const decorations = {
    underline: !!formatting?.underline,
    strikethrough: !!formatting?.strikethrough,
    'underline-strikethrough':
      !!formatting?.underline && !!formatting?.strikethrough,
    obfuscate: !!formatting?.obfuscate,
  };

  if (Class)
    return {
      ...getClassObject(Class),
      'font-bold': !!formatting?.bold,
      italic: !!formatting?.italic,
      ...decorations,
    };
  return {
    'font-mc': true,
    'font-mc-bold': !!formatting?.bold,
    'font-mc-italic': !!formatting?.italic,
    'font-mc-bold-italic': !!formatting?.bold && !!formatting?.italic,
    ...decorations,
  };
}

export const EmptyPreview = component$(() => (
  <span class="text-lum-text-secondary/25" q:slot="input">
    Birdflop
  </span>
));
