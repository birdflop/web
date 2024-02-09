import { component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { config } from '~/speak-config';

import Nav from '../components/Nav';
import { Button } from '~/components/elements/Button';
import Footer from '~/components/Footer';
import type { Session } from '@auth/core/types';

export default component$(() => {
  const store = useStore({
    cookies: 'true',
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // convert cookies to json
    const cookieJSON: any = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});
    if (!cookieJSON['cookies']) store.cookies = 'false';
  });

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

export const onRequest: RequestHandler = ({ request, locale, sharedMap, redirect, url }) => {

  const session: Session | null = sharedMap.get('session');

  if (!session || new Date(session.expires) < new Date()) {
    throw redirect(302, `/api/auth/signin?callbackUrl=${url.pathname}`);
  }

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