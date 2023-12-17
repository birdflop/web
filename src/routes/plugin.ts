import type { RequestHandler } from '@builder.io/qwik-city';
import { config } from '../speak-config';

export const onRequest: RequestHandler = ({ request, locale }) => {
  const acceptLanguage = request.headers?.get('accept-language');

  let lang: string | null = null;

  // Try to use user language
  if (acceptLanguage) {
    lang = acceptLanguage.split(';')[0]?.split(',')[0];
  }

  // Check supported locales
  lang = config.supportedLocales.find(value => value.lang === lang)?.lang || config.defaultLocale.lang;

  // Set Qwik locale
  locale(lang);
};