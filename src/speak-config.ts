import type { SpeakConfig } from 'qwik-speak';

import languagesJSON from './languages.json';

export const languages = languagesJSON;

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
  assets: ['animtab', 'animtexture', 'flags', 'nav', 'rgb'],
};
