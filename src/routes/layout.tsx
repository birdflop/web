import { component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';

import Nav from '../components/Nav';
import Footer from '~/components/Footer';
import { Button } from '@luminescent/ui';

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
    <Slot />
    {store.cookies != 'true' &&
      <div id="cookieprompt" class="fixed flex flex-col bottom-4 right-4 bg-gray-800 rounded-lg shadow-md p-6" style="cursor: auto;">
        <span class="text-gray-200 text-md mb-3 max-w-[17rem]">
          We use cookies to automatically save and load your preferences.
        </span>
        <div class="flex items-center gap-2">
          <a class="flex-1 text-xs text-gray-400 hover:text-gray-200 whitespace-nowrap mr-5" href="/privacy">Privacy Policy</a>
          <Button color="blue" onClick$={async () => {
            document.cookie = 'cookies=true; path=/';
            document.getElementById('cookieprompt')!.remove();
          }}>
            Okay
          </Button>
        </div>
      </div>
    }
    <Footer />
  </>;
});
