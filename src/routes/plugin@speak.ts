import type { RequestHandler } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
// import { config } from '../speak-config';

export const onRequest: RequestHandler = ({ request, locale, cookie }) => {
  const acceptLanguage = request.headers?.get('accept-language');

  let lang: string | null = null;

  // Try whether the language is stored in a cookie
  if (cookie) {
    const { cookies: settings } = getCookies(cookie, 'settings');
    if (settings) lang = settings.locale;
  }

  // Try to use user language
  if (!lang && acceptLanguage) {
    lang = acceptLanguage.split(';')[0]?.split(',')[0];
  }

  // Set Qwik locale
  locale(lang || undefined);
};