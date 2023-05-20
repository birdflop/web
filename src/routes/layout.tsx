import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { config } from '~/speak-config';

import Nav from '../components/Nav';
import { Button } from '~/components/elements/Button';

export const useCookies = routeLoader$(({ cookie }) => cookie.get('cookies')?.value);
export default component$(() => {
  const cookies = useCookies();
  return (
    <main>
      <Nav />
      <section class="pt-16">
        <Slot />
      </section>
      {!cookies.value &&
        <div id="cookieprompt" class="fixed flex flex-col bottom-4 right-4 bg-gray-800 rounded-lg shadow-md p-6" style="cursor: auto;">
          <span class="text-gray-200 text-md mb-3 max-w-[17rem]">
            We use cookies to automatically save and load your preferences.
          </span>
          <div class="flex items-center gap-2">
            <a class="flex-1 text-xs text-gray-400 hover:text-gray-200 whitespace-nowrap mr-5" href="/Privacy">Privacy Policy</a>
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
  );
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