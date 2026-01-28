import type { RequestHandler } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { languages } from '~/speak-config';

export const onRequest: RequestHandler = ({ request, locale, cookie }) => {
  const acceptLanguage = request.headers?.get('accept-language');

  let lang: keyof typeof languages | undefined = undefined;

  // Try whether the language is stored in a cookie
  const { cookies: settings } = getCookies(cookie, 'settings');

  // Check for old locale cookie as well
  const oldLocale = cookie.get('locale')?.json() as {
    lang: keyof typeof languages
  };

  if (settings.locale) lang = settings.locale;
  else if (oldLocale) lang = oldLocale.lang;

  // Set Qwik locale based on cookie or Accept-Language header
  locale(lang || acceptLanguage?.split(';')[0]?.split(',')[0]);
};