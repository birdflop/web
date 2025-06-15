import type { JSXOutput, NoSerialize } from '@builder.io/qwik';
import { $, component$, createContextId, noSerialize, Slot, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';

import Backgrounds from '~/components/Backgrounds';
import Footer from '~/components/Footer';
import Nav from '~/components/Nav';
import { Link, RequestHandler, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { Bell, Cookie, X } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { generateThemeCSS, getThemePreference, themes } from '~/util/theme-store';

type rawNotification = NoSerialize<{
  id: string;
  element: JSXOutput;
}>
type Notification = {
  id: string;
  title: string;
  description?: string;
  bgColor?: string;
} | rawNotification;

export const onGet: RequestHandler = ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 5,
    sMaxAge: 10,
    staleWhileRevalidate: 60 * 60 * 24 * 365,
  });
};

export const useServerTheme = routeLoader$(async ({ cookie }) => {
  const serverTheme = await getThemePreference(cookie) || 'auto';
  console.log(serverTheme);
  const themeCSS = generateThemeCSS(serverTheme);

  return {
    theme: serverTheme,
    css: themeCSS,
  };
});

export const NotificationContext = createContextId<Notification[]>('notification-context');
export const OpenSectionsContext = createContextId<string[]>('opensections-context');
export default component$(() => {
  const t$ = $((string: string) => inlineTranslate()(string));

  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const loc = useLocation();
  const notifications = useStore([] as Notification[]);
  useContextProvider(NotificationContext, notifications);
  const openSections = useStore([] as string[]);
  useContextProvider(OpenSectionsContext, openSections);

  // Get server-side theme data
  const serverThemeData = useServerTheme();  // Apply server-side theme only on initial load to prevent flash
  // Don't track serverThemeData to avoid overriding client-side theme changes on navigation
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (typeof document !== 'undefined' && serverThemeData.value) {
      const root = document.documentElement;

      // Only apply server theme if no client theme is already set
      const currentThemeVariant = root.getAttribute('data-theme-variant');
      if (!currentThemeVariant || currentThemeVariant === 'undefined') {
        const { theme, css } = serverThemeData.value;

        // Apply CSS variables immediately
        const cssVars = css.split('\n    ').filter((line) => line.trim());
        cssVars.forEach((cssVar) => {
          if (cssVar.includes(':')) {
            const [property, value] = cssVar.split(':').map((s) => s.trim());
            if (property && value) {
              root.style.setProperty(property, value.replace(';', ''));
            }
          }
        });

        // Set data attributes immediately
        const effectiveTheme = theme === 'auto' ? 'dark' : theme;
        root.setAttribute('data-theme', effectiveTheme);
        root.setAttribute('data-theme-variant', theme);
      }
    }
  });
  // Ensure theme persistence across page navigations
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const currentThemeVariant = root.getAttribute('data-theme-variant');

      // If no theme is set or if we need to check cookies for user preference
      if (!currentThemeVariant || currentThemeVariant === 'undefined') {
        try {
          const savedTheme = await getThemePreference();
          if (savedTheme && themes[savedTheme]) {
            let effectiveTheme = savedTheme;
            if (savedTheme === 'auto') {
              effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            }

            const themeColors = themes[effectiveTheme];
            Object.entries(themeColors).forEach(([key, value]) => {
              const cssVarName = `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
              root.style.setProperty(cssVarName, value);
            });

            root.setAttribute('data-theme', effectiveTheme);
            root.setAttribute('data-theme-variant', savedTheme);
          }
        } catch (error) {
          console.warn('Failed to load theme preference:', error);
        }
      }
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // convert cookies to json
    const cookieJSON: {
      [key: string]: string;
    } = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});
    if (cookieJSON['cookies']) return;

    let showConsent: boolean = false;
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
      showConsent = isCaliforniaUser || isEUUser;
    } catch (error) {
      // Fallback to showing consent for everyone if geolocation fails
      console.error('Error determining user location:', error);
      showConsent = true;
    }

    if (!showConsent) return;
    const cookiePrompt = noSerialize({
      id: 'cookieprompt',
      element: <div class={{
        ['lum-bg-gray-800/60']: true,
        'backdrop-blur-xl lum-card rounded-none sm:rounded-lum break-words': true,
        'animate-in fade-in slide-in-from-bottom-8, sm:slide-in-from-right-8 anim-duration-500': true,
      }}>
        <div>
          <h4 class="flex gap-2 items-center mt-0!">
            <Cookie size={30} /> {t$('nav.cookies.title@@Cookies')}
          </h4>
          <p>
            {t$('nav.cookies.description@@We use cookies to automatically save and load your preferences.')}
          </p>
          <Link href="/privacy">
            {t$('nav.privacyPolicy@@Privacy Policy')}
          </Link>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button class="lum-btn" onClick$={() => {
            document.cookie = 'optout=true; path=/';
            notifications.splice(notifications.findIndex((n) => n?.id === 'cookieprompt'), 1);
          }}>
            {t$('nav.cookies.optOut@@Turn off cookies')}
          </button>
          <button class="lum-btn lum-bg-blue-700 hover:lum-bg-blue-600" onClick$={() => {
            document.cookie = 'cookies=true; path=/';
            notifications.splice(notifications.findIndex((n) => n?.id === 'cookieprompt'), 1);
          }}>
            {t$('nav.cookies.acknowledge@@Okay')}
          </button>
        </div>
      </div>,
    });
    notifications.push(cookiePrompt);
  });

  return <>
    <Nav />
    <Background id="bg" class={{
      'fixed scale-120 bottom-0 overflow-hidden -z-10 w-lvw h-lvh object-cover brightness-50': true,
      'transition-all duration-1000 blur-xl opacity-30 scale-150': loc.url.pathname != '/',
    }}/>
    <Slot />
    <div class={{
      'fixed bottom-0 sm:bottom-4 sm:right-4 z-[1000] flex flex-col sm:gap-2 max-w-full md:max-w-1/2 lg:max-w-1/3 xl:max-w-1/4': true,
    }} id="notifications">
      {notifications.map((notification) => {
        if (!notification) return null;
        if ('element' in notification) return notification.element;
        return <div class={{
          [notification.bgColor ?? 'lum-bg-gray-800/60']: true,
          'backdrop-blur-xl lum-card rounded-none sm:rounded-lum break-words': true,
          'animate-in fade-in slide-in-from-bottom-8, sm:slide-in-from-right-8 anim-duration-500': true,
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
        </div>;
      })}
    </div>
    <Footer />
  </>;
});