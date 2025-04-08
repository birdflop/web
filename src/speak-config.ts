import type { SpeakConfig } from 'qwik-speak';
export const languages = {
  'en-US': 'English',
  'es-ES': 'Español',
  'ko-KR': '한국어',
  'nl-NL': 'Nederlands',
  'pt-PT': 'Português',
  'ru-RU': 'Русский',
  'zh-CN': '中文',
};

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
  assets: [
    'gradient',
    'animtab',
    'animtexture',
    'flags',
    'nav',
  ],
};