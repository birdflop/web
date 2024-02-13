import type { RequestHandler } from '@builder.io/qwik-city';
import { config } from '../speak-config';
import { extractFromUrl, validateLocale } from 'qwik-speak';

export const onRequest: RequestHandler = ({ locale, error, url }) => {
  let lang: string | undefined = undefined;

  const prefix = extractFromUrl(url);
  if (prefix && validateLocale(prefix)) {
    // Check supported locales
    lang = config.supportedLocales.find(value => value.lang === prefix)?.lang;
    // 404 error page
    if (!lang) throw error(404, 'Page not found');
  } else {
    lang = config.defaultLocale.lang;
  }

  // Set Qwik locale
  console.log(lang);
  locale(lang);
};