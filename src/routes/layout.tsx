import { component$, Slot, useOnDocument, useStore, $ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { config } from '~/speak-config';

import Nav from '../components/Nav';
import { Button } from '~/components/elements/Button';
import Footer from '~/components/Footer';

export default component$(() => {
  const store = useStore({
    cookies: 'true',
    telemetry: 'false',
  });
  useOnDocument(
    'load',
    $(async () => {
      // convert cookies to json
      const cookieJSON: any = document.cookie.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=').map(decodeURIComponent);
        return Object.assign(res, { [key]: val });
      }, {});
      if (!cookieJSON['cookies']) store.cookies = 'false';
      if (!cookieJSON['telemetry']) store.telemetry = 'true';

      if (store.telemetry != 'false') {
        (window as any).clarity = (window as any).clarity || function (...args: any) {
          ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
        };
        const t = document.createElement('script');
        t.async = true;
        t.src = 'https://www.clarity.ms/tag/hf0q6m860a';
        const y = document.getElementsByTagName('script')[0];
        y.parentNode!.insertBefore(t, y);
      }
    }),
  );

  return <>
    <Nav />
    <main>
      <section>
        <Slot />
      </section>
      {store.cookies != 'true' &&
        <div id="cookieprompt" class="fixed flex flex-col bottom-4 right-4 bg-gray-800 rounded-lg shadow-md p-6" style="cursor: auto;">
          <span class="text-gray-200 text-md mb-3 max-w-[17rem]">
            We use cookies to automatically save and load your preferences.
          </span>
          <div class="flex items-center gap-2">
            <a class="flex-1 text-xs text-gray-400 hover:text-gray-200 whitespace-nowrap mr-5" href="/privacy">Privacy Policy</a>
            <Button color="primary" onClick$={async () => {
              document.cookie = 'cookies=true; path=/';
              document.getElementById('cookieprompt')!.remove();
            }}>
              Okay
            </Button>
          </div>
        </div>
      }
    </main>
    <Footer />
  </>;
});

export const onRequest: RequestHandler = ({ request, locale }) => {
  const cookie = request.headers?.get('cookie');
  const acceptLanguage = request.headers?.get('accept-language');

  let lang: string | null = null;
  // Try whether the language is stored in a cookie
  if (cookie) {
    const result = new RegExp('(?:^|; )' + encodeURIComponent('locale') + '=([^;]*)').exec(cookie);
    if (result) {
      lang = JSON.parse(result[1])['lang'];
    }
  }
  // Try to use user language
  if (!lang) {
    if (acceptLanguage) {
      lang = acceptLanguage.split(';')[0]?.split(',')[0];
    }
  }

  // Set Qwik locale
  locale(lang || config.defaultLocale.lang);
};