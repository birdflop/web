import { component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';

import { Button, ButtonAnchor, Card, Header } from '@luminescent/ui';
import Footer from '~/components/Footer';
import Nav from '../components/Nav';

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
      <div class={{
        'fixed bottom-4 right-4 backdrop-blur-xl z-[1000] animate-in fade-in slide-in-from-bottom-8 anim-duration-1000': true,
      }}>
        <Card id="cookieprompt">
          <Header>
            Cookies
          </Header>
          <span class="text-gray-200 text-md mb-3 max-w-[17rem]">
            We use cookies to automatically save and load your preferences.
          </span>
          <div class="flex items-center justify-end gap-2">
            <ButtonAnchor href="/privacy" color="transparent">
              Privacy Policy
            </ButtonAnchor>
            <Button color="blue" onClick$={async () => {
              document.cookie = 'cookies=true; path=/';
              document.getElementById('cookieprompt')!.remove();
            }}>
              Okay
            </Button>
          </div>
        </Card>
      </div>
    }
    <Footer />
  </>;
});