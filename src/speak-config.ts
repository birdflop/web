import { $ } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import type {
  LoadTranslationFn,
  SpeakConfig,
  TranslationFn,
} from 'qwik-speak';

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: [
    { lang: 'en-US' },
    { lang: 'es-ES' },
    { lang: 'nl-NL' },
  ],
  assets: [
    'home',
    'gradient',
    'animpreview',
    'animtab',
    'animtexture',
    'colorstrip',
    'presettools',
    'ramcalculator',
    'app',
  ],
};

export const languages = {
  'en-US': 'English',
  'es-ES': 'Español (Spanish)',
  'nl-NL': 'Nederlands (Dutch)',
};

export const loadTranslation$: LoadTranslationFn = $(async (lang: string, asset: string, origin?: string) => {
  let url = '';
  if (isServer && origin) {
    url = origin;
  }
  url += `/i18n/${lang}/${asset}.json`;
  const response = await fetch(url);

  if (response.ok) {
    return response.json();
  }
  else if (response.status === 404) {
    console.warn(`loadTranslation$: ${url} not found`);
  }
});

export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$,
};