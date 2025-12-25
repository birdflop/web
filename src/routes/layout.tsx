import { component$, createContextId, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';

import Backgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import Footer from '~/components/Elements/Footer';
import Nav from '~/components/Elements/Nav';
import { Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { Cookie } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { loadOpenItems } from '~/components/Elements/Accordion';
import { getCSSString, ThemeContext, ThemeContextType, ThemeName, themes } from '~/util/themeUtil';

import { Notification, NotificationContext } from '~/util/Notification';
import { getCookies, setCookies } from '~/util/dataUtils';
import birdThreeJS from '~/util/birdThreeJS';

type Settings = {
  cookies?: boolean;
  theme?: ThemeName;
}

export const useAdmins = routeLoader$(({ env }) => {
  const adminIds = env.get('ADMINS')?.split(',').map(id => id.trim());
  return adminIds;
});

export const useSettingsCookies = routeLoader$(({ cookie, url }) => {
  const settingsCookies = getCookies(cookie, 'settings', url.searchParams) as {
    cookies: Settings;
    errors: string[];
  };;

  const theme = settingsCookies.cookies.theme || 'dark';

  return {
    ...settingsCookies,
    theme: {
      currentTheme: theme,
      ...(theme !== 'auto' &&
        {
          isDark: theme === 'dark',
          css: themes[theme],
          cssString: getCSSString(theme),
        }
      ),
    },
  };
});

export const SettingsContext = createContextId<Settings>('settings-context');
export const openItemsContext = createContextId<{ items: string[] }>('openitems-context');
export default component$(() => {
  const t = (string: string) => inlineTranslate()(string);
  const loc = useLocation();

  // Select background images
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const LightBackground = lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)];

  const birdRef = useSignal<HTMLCanvasElement>();
  const anchorElementRef = useSignal<HTMLDivElement>();

  // Notification store
  const notifications = useStore([] as Notification[]);
  useContextProvider(NotificationContext, notifications);

  // Settings store
  const { cookies: settingsCookies, theme: serverThemeData } = useSettingsCookies().value;
  const settingsStore = useStore({
    ...settingsCookies,
  } as Settings);
  useContextProvider(SettingsContext, settingsStore);

  // Theme store
  const themeStore = useStore<ThemeContextType>(serverThemeData);
  useContextProvider(ThemeContext, themeStore);

  // Show cookie consent notification if not already accepted/opted out
  const showCookieConsent = useSignal(false);

  // Open items store
  const openItemsStore = useStore({
    items: [] as string[],
  });
  useContextProvider(openItemsContext, openItemsStore);

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

    // check if cookies have been accepted or opted out
    if (settingsStore.cookies !== undefined) return;
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
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => birdThreeJS(birdRef, anchorElementRef));

  return <>
    <style dangerouslySetInnerHTML={`:root { ${themeStore.cssString} }`}></style>
    <Nav />

    <canvas ref={birdRef} class={{
      'fixed bottom-0 blur-none overflow-hidden z-10 w-lvw h-lvh pointer-events-none': true,
    }}/>

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
    <div ref={anchorElementRef} class={{
      'fixed flex flex-col sm:gap-2 max-w-full md:max-w-2/2 lg:max-w-2/3 xl:max-w-2/4': true,
    }} id="notifications" style={{
      '--lum-border-radius': '1.5rem',
      transform: 'translate(-100%, -100%)',
    }}>
      {notifications.map((notification) => {
        if (!notification) return null;
        const id = notification.id;

        if (!notification.persist) {
          setTimeout(() => {
            const el = document.getElementById(id);
            el?.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-8', 'sm:slide-out-to-right-8');
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 300);
          }, 4000);
        }

        return <button id={notification.id} class={{
          [notification.bgColor ?? 'lum-bg-lum-input-bg/60']: true,
          'backdrop-blur-xl lum-card sm:rounded-lum min-w-84 text-left': true,
          'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 anim-duration-500': true,
        }} key={notification.id} onClick$={(e, el) => {
          el.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-8', 'sm:slide-out-to-right-8');
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 300);
        }}>
          <h5 class="flex gap-2 items-center my-0!">
            <span class="flex gap-2 items-center flex-1">
              {notification.title}
            </span>
          </h5>
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
          {notification.persist &&
            <p class="lum-text-xs text-lum-text-secondary/50! mt-1!">
              {t('nav.clickToDismiss@@Click to dismiss')}
            </p>
          }
        </button>;
      })}
      {showCookieConsent.value && settingsStore.cookies === undefined &&
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
              settingsStore.cookies = false;
              setCookies('settings', settingsStore);
            }}>
              {t('nav.cookies.optOut@@Reject')}
            </button>
            <button class="lum-btn lum-bg-blue hover:lum-bg-blue" onClick$={() => {
              settingsStore.cookies = true;
              setCookies('settings', settingsStore);
            }}>
              {t('nav.cookies.acknowledge@@Accept')}
            </button>
          </div>
        </div>
      }
    </div>
    <Footer />
  </>;
});