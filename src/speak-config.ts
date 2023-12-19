import type { SpeakConfig } from 'qwik-speak';
export const languages = {
  'da-DK': 'Dansk',
  'en-US': 'English',
  'es-ES': 'Español',
  'nl-NL': 'Nederlands',
  'pl-PL': 'Polski',
  'pt-PT': 'Português',
  'ru-RU': 'Русский',
};

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
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
    'flags',
  ],
};