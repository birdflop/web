import type { JSXOutput, NoSerialize } from '@builder.io/qwik';
import { component$, createContextId, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';

import Backgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import Footer from '~/components/Elements/Footer';
import Nav from '~/components/Elements/Nav';
import { Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { Bell, Cookie, X } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { loadOpenItems } from '~/components/Elements/Accordion';
import { getCSSString, getThemePreference, ThemeContext, ThemeContextType, themes } from '~/util/theme-store';

type rawNotification = NoSerialize<{
  id: string;
  element: JSXOutput;
}>
type Notification = {
  id: string;
  title: string;
  description?: string;
  bgColor?: string;
  buttons?: { text: string; href: string }[];
} | rawNotification;

export const useServerTheme = routeLoader$(({ cookie }) => {
  const serverTheme = getThemePreference(cookie);
  if (serverTheme == 'auto') return {
    currentTheme: serverTheme,
  };

  const css = themes[serverTheme];
  const cssString = getCSSString(serverTheme);
  return {
    currentTheme: serverTheme,
    isDark: serverTheme === 'dark',
    css,
    cssString,
  };
});

export const useAdmins = routeLoader$(({ env }) => {
  const adminIds = env.get('ADMINS')?.split(',').map(id => id.trim());
  return adminIds;
});

export const NotificationContext = createContextId<Notification[]>('notification-context');
export const openItemsContext = createContextId<{ items: string[] }>('openitems-context');
export default component$(() => {
  const t = (string: string) => inlineTranslate()(string);
  const loc = useLocation();

  // Select background images
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const LightBackground = lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)];

  // Notification store
  const notifications = useStore([] as Notification[]);
  useContextProvider(NotificationContext, notifications);

  // Show cookie consent notification if not already accepted/opted out
  const showCookieConsent = useSignal(false);

  // Open items store
  const openItemsStore = useStore({
    items: [] as string[],
  });
  useContextProvider(openItemsContext, openItemsStore);

  // Get server-side theme data
  const serverThemeData = useServerTheme();

  // Theme store
  const themeStore = useStore<ThemeContextType>(serverThemeData.value);
  useContextProvider(ThemeContext, themeStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // If the theme is not set, check the user's preference
    if (themeStore.isDark === undefined) {
      themeStore.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Load open items from localStorage
    const savedOpenItems = await loadOpenItems();
    if (savedOpenItems && savedOpenItems.length > 0) {
      openItemsStore.items = savedOpenItems;
    }

    // convert cookies to json
    const cookieJSON: {
      [key: string]: string;
    } = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});
    if (cookieJSON['cookies'] || cookieJSON['optout']) return;

    try {
      // Fetch user's location information
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json() as any;

      // Check if user is from California or EU
      const isCaliforniaUser = locationData.region_code === 'CA' && locationData.country_code === 'US';
      const isEUUser = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB',
      ].includes(locationData.country_code);

      // Only show consent popup for California or EU users
      showCookieConsent.value = isCaliforniaUser || isEUUser;
    } catch (error) {
      // Fallback to showing consent for everyone if geolocation fails
      console.error('Error determining user location:', error);
      showCookieConsent.value = true;
    }

    if (!showCookieConsent.value) return;
  });

  return <>
    <style dangerouslySetInnerHTML={`:root { ${themeStore.cssString} }`}></style>
    <Nav />

    {(themeStore.isDark === undefined || themeStore.isDark) &&
      <Background id="bg" class={{
        'hidden dark:flex': themeStore.isDark === undefined,
        'fixed scale-120 bottom-0 blur-none overflow-hidden -z-10 w-lvw h-lvh object-cover brightness-50': true,
        'transition-all duration-1000': loc.isNavigating,
        'blur-xl! bottom-0! opacity-5 scale-150': loc.url.pathname != '/',
      }}/>
    }
    {(themeStore.isDark === undefined || !themeStore.isDark) &&
      <LightBackground id="bg" class={{
        'flex dark:hidden': themeStore.isDark === undefined,
        'fixed scale-120 bottom-0 blur-none overflow-hidden -z-10 w-lvw h-lvh object-cover brightness-50': true,
        'transition-all duration-1000': loc.isNavigating,
        'blur-xl! bottom-0! opacity-5 scale-150': loc.url.pathname != '/',
      }}/>
    }
    <Slot />
    <div class={{
      'fixed bottom-0 sm:bottom-4 sm:right-4 z-1000 flex flex-col sm:gap-2 max-w-full md:max-w-1/2 lg:max-w-1/3 xl:max-w-1/4': true,
    }} id="notifications">
      {notifications.map((notification) => {
        if (!notification) return null;
        if ('element' in notification) return notification.element;
        return <div class={{
          [notification.bgColor ?? 'lum-bg-lum-input-bg/60']: true,
          'backdrop-blur-xl lum-card rounded-none sm:rounded-lum wrap-break-word': true,
          'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 anim-duration-500': true,
        }} key={notification.id}>
          <h4 class="flex gap-2 items-center mt-0!">
            <span class="flex gap-2 items-center flex-1">
              <Bell size={30} /> {notification.title}
            </span>
            <button class="lum-btn p-1 lum-bg-transparent cursor-pointer" onClick$={() => {
              notifications.splice(notifications.findIndex((n) => n?.id === notification.id), 1);
            }}>
              <X size={20}/>
            </button>
          </h4>
          <p>
            {notification.description}
          </p>
          {notification.buttons && notification.buttons.length > 0 &&
            <div class="flex flex-wrap gap-2 mt-2">
              {notification.buttons.map((button, index) =>
                <Link key={index} href={button.href} class="lum-btn lum-bg-blue hover:lum-bg-blue">
                  {button.text}
                </Link>,
              )}
            </div>
          }
        </div>;
      })}
      {showCookieConsent.value &&
        <div class={{
          'lum-bg-lum-input-bg/60': true,
          'backdrop-blur-xl lum-card rounded-none sm:rounded-lum wrap-break-word': true,
          'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 anim-duration-500': true,
        }}>
          <div>
            <h4 class="flex gap-2 items-center mt-0!">
              <Cookie size={30} /> {t('nav.cookies.title@@Cookies')}
            </h4>
            <p>
              {t('nav.cookies.description@@We use cookies to automatically save and load your preferences.')}
            </p>
            <Link href="/privacy">
              {t('nav.privacyPolicy@@Privacy Policy')}
            </Link>
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <button class="lum-btn" onClick$={() => {
              document.cookie = 'optout=true; path=/';
              showCookieConsent.value = false;
            }}>
              {t('nav.cookies.optOut@@Turn off cookies')}
            </button>
            <button class="lum-btn lum-bg-blue hover:lum-bg-blue" onClick$={() => {
              document.cookie = 'cookies=true; path=/';
              showCookieConsent.value = false;
            }}>
              {t('nav.cookies.acknowledge@@Okay')}
            </button>
          </div>
        </div>
      }
    </div>
    <Footer />
  </>;
});