import {
  FORMAT_KEYS,
  rgbDefaults,
  type Formatting,
} from '@birdflop/rgbirdflop';
import { component$ } from '@qwik.dev/core';

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
          (formatting as any)[key] = segment[key];
        }
      }
      if (segment.font !== undefined) {
        formatting.font = segment.font;
      }
    }
  }

  return formatting;
}

export function getFormattingClasses(formatting: Formatting) {
  return {
    'font-mc-bold': !!formatting.bold,
    'font-mc-italic': !!formatting.italic,
    'font-mc-bold-italic': !!formatting.bold && !!formatting.italic,
    underline: !!formatting.underline,
    strikethrough: !!formatting.strikethrough,
    'underline-strikethrough':
      !!formatting.underline && !!formatting.strikethrough,
    obfuscate: !!formatting.obfuscate,
  };
}

export const EmptyPreview = component$(() => (
  <span class="text-lum-text-secondary/25" q:slot="input">
    Birdflop
  </span>
));
