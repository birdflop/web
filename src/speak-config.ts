import { toPrefixAsNeeded, type SpeakConfig } from 'qwik-speak';
import { rewriteRoutes } from './speak-routes';
export const languages = {
  'da-DK': 'Dansk',
  'en-US': 'English',
  'es-ES': 'Español',
  'ko-KR': '한국어',
  'nl-NL': 'Nederlands',
  'pl-PL': 'Polski',
  'pt-PT': 'Português',
  'ru-RU': 'Русский',
  'zh-CN': '中文',
};

export const config: SpeakConfig = {
  rewriteRoutes: toPrefixAsNeeded(rewriteRoutes),
  defaultLocale: { lang: 'en-US' },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
  assets: [
    'gradient',
    'animpreview',
    'animtab',
    'animtexture',
    'colorstrip',
    'presettools',
    'flags',
    'nav',
  ],
};