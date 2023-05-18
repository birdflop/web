import type { SpeakConfig } from 'qwik-speak';

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: [
    { lang: 'en-US' },
    { lang: 'es-ES' },
    { lang: 'nl-NL' },
    { lang: 'pt-PT' },
  ],
  assets: [
    'home',
    'gradient',
    'animpreview',
    'animtab',
    'animtexture',
    'colorstrip',
    'privacypolicy',
    'presettools',
    'ramcalculator',
    'app',
  ],
};

export const languages = {
  'en-US': 'English (US)',
  'es-ES': 'Español (Spanish - ES)',
  'nl-NL': 'Nederlands (Dutch - NL)',
  'pt-PT': 'Português (Portuguese - PT)',
};