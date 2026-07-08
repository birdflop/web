import type { SpeakConfig } from 'qwik-speak';
export const languages = {
  'en-US': 'English',
  'es-ES': 'Español',
  'ko-KR': '한국어',
  'de-DE': 'Deutsch',
  'nl-NL': 'Nederlands',
  'pl-PL': 'Polski',
  'pt-PT': 'Português',
  'ru-RU': 'Русский',
  'tr-TR': 'Türkçe',
  'zh-CN': '中文',
};

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en-US' },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
  assets: ['animtab', 'animtexture', 'flags', 'nav', 'rgb'],
};
