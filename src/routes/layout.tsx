import {
  $,
  component$,
  createContextId,
  Signal,
  Slot,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';

import Backgrounds, {
  lightBackgrounds,
} from '~/components/Elements/Background';
import Footer from '~/components/Elements/Footer';
import Nav from '~/components/Elements/Nav';
import {
  Link,
  RequestEventBase,
  routeLoader$,
  server$,
  useLocation,
} from '@qwik.dev/router';
import Cookie from 'lucide-icons-qwik/icons/Cookie';
import { inlineTranslate } from 'qwik-speak';
import { loadOpenItems } from '~/components/Elements/Accordion';
import {
  getCSSString,
  ThemeContext,
  ThemeContextType,
  ThemeName,
  themes,
} from '~/util/themeUtil';

import {
  Notification,
  NotificationContext,
  NotificationType,
} from '~/util/Notification';
import { getCookies, setCookies, setUserData } from '~/util/dataUtils';
import { identifyUmami } from '~/util/umami';
import birdThreeJS from '~/util/birdThreeJS';
import { useSession } from '~/routes/plugin@auth';
import { languages } from '~/speak-config';
import { Session } from '@auth/qwik';

export type Settings = {
  cookies?: boolean;
  theme?: ThemeName;
  locale?: keyof typeof languages;
  flopbird: {
    toggle: boolean;
  };
};

export type FlopbirdStore = {
  ref?: string;
  track?: {
    id?: string;
    ref?: string;
    nextStep?: string;
    description: string;
    openItem?: string;
  }[];
};

export const checkAdmin = function (props: RequestEventBase) {
  const { env, sharedMap } = props;

  const session = sharedMap.get('session') as Session | undefined;
  if (!session?.user?.id) return false;
  const admins =
    env
      .get('ADMINS')
      ?.split(',')
      .map((id) => id.trim()) || [];

  return admins.includes(session?.user?.id);
};

export const isAdmin = server$(function () {
  return checkAdmin(this);
});
export const useIsAdmin = routeLoader$((props) => checkAdmin(props));

export const useSettingsCookies = routeLoader$(({ cookie, url }) => {
  const settingsCookies = getCookies<Settings>(
    cookie,
    'settings',
    url.searchParams
  );

  const theme = settingsCookies.cookies.theme || 'dark';

  return {
    ...settingsCookies,
    theme: {
      currentTheme: theme,
      ...(theme !== 'auto' && {
        isDark: theme === 'dark' || theme === 'black' || theme === 'simplymc',
        css: themes[theme],
        cssString: getCSSString(theme),
      }),
    },
  };
});

export const birdStoreContext =
  createContextId<FlopbirdStore>('birdstore-context');
export const SettingsContext = createContextId<Settings>('settings-context');
export const openItemsContext =
  createContextId<Signal<string[]>>('openitems-context');
export default component$(() => {
  const t = inlineTranslate();
  const loc = useLocation();
  const session = useSession();

  /* Umami distinct ID */
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => session.value?.user?.id);
    identifyUmami(session.value?.user?.id);
  });

  // Select background images
  const Background = Backgrounds[1];
  const LightBackground = lightBackgrounds[1];

  /* Settings store */
  const { cookies: settingsCookies, theme: serverThemeData } =
    useSettingsCookies().value;
  const settingsStore = useStore<Settings>({
    ...settingsCookies,
  });
  useContextProvider(SettingsContext, settingsStore);

  /* Notification store */
  const notifications = useStore<NotificationType[]>([]);
  useContextProvider(NotificationContext, notifications);

  // Open items store
  const openItems = useSignal([] as string[]);
  useContextProvider(openItemsContext, openItems);

  /* Flopbird */
  const birdRef = useSignal<HTMLCanvasElement>();
  const anchorElementRef = useSignal<HTMLDivElement>();
  const birdStore = useStore<FlopbirdStore>({});
  useContextProvider(birdStoreContext, birdStore);

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() =>
    birdThreeJS(birdRef, anchorElementRef, notifications, birdStore)
  );

  useTask$(({ track }) => {
    if (!settingsStore.flopbird?.toggle) return;
    track(() => birdStore.track);
    if (!birdStore.track || birdStore.track.length === 0) return;

    const notification = new Notification()
      .setTitle('Flopbird:')
      .setDescription(birdStore.track[0].description)
      .setBgColor('lum-grad-bg-cyan/50')
      .setPersist(true)
      .toJSON();

    notification.action = {
      text: 'Click to continue',
      onClick$: $(() => {
        if (!birdStore.track || birdStore.track.length === 0) return;
        let nextStep = birdStore.track.shift();
        if (!nextStep) return;

        while (nextStep.id && !document.getElementById(nextStep.id)) {
          nextStep = birdStore.track.shift();
          if (!nextStep) return;
        }

        birdStore.track = [...birdStore.track]; // Trigger reactivity

        birdStore.ref = nextStep.id;
        if (nextStep.openItem && !openItems.value.includes(nextStep.openItem)) {
          openItems.value = [nextStep.openItem];
        }
      }),
    };

    notifications.push(notification);
  });

  /* Theme store */
  const themeStore = useStore<ThemeContextType>(serverThemeData);
  useContextProvider(ThemeContext, themeStore);

  /* Cookie Consent */
  const showCookieConsent = useSignal(false);

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // check if cookies have been accepted or opted out
    if (settingsStore.cookies !== undefined) return;
    try {
      // Fetch user's location information
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json();

      // Type guard for locationData
      type LocationData = {
        region_code?: string;
        country_code?: string;
      };
      const { region_code, country_code } = locationData as LocationData;

      // Check if user is from California or EU
      const isCaliforniaUser = region_code === 'CA' && country_code === 'US';
      const isEUUser = [
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'DE',
        'GR',
        'HU',
        'IE',
        'IT',
        'LV',
        'LT',
        'LU',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
        'GB',
      ].includes(country_code ?? '');

      // Only show consent popup for California or EU users
      showCookieConsent.value = isCaliforniaUser || isEUUser;
    } catch (error) {
      // Fallback to showing consent for everyone if geolocation fails
      console.error('Error determining user location:', error);
      showCookieConsent.value = true;
    }
  });

  /* Misc */
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // If the theme is not set, check the user's preference
    if (themeStore.isDark === undefined) {
      themeStore.isDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
    }

    // Load open items from localStorage
    const savedOpenItems = await loadOpenItems();
    if (savedOpenItems && savedOpenItems.length > 0) {
      openItems.value = savedOpenItems;
    }
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={`:root { ${themeStore.cssString} }`}
      ></style>
      <Nav />

      {settingsStore.flopbird?.toggle && (
        <canvas
          ref={birdRef}
          class="pointer-events-none fixed z-10 overflow-hidden blur-none"
        />
      )}

      {(themeStore.isDark === undefined || themeStore.isDark) && (
        <Background
          width={1920}
          height={1080}
          id="bg"
          alt="Background"
          class={{
            'hidden dark:flex': themeStore.isDark === undefined,
            'fixed bottom-0 -z-10 h-lvh w-lvw scale-120 overflow-hidden object-cover blur-none': true,
            'transition-all duration-1000': loc.isNavigating,
            'bottom-0! scale-150 opacity-5 blur-xl!': loc.url.pathname != '/',
          }}
        />
      )}
      {(themeStore.isDark === undefined || !themeStore.isDark) && (
        <LightBackground
          width={1920}
          height={1080}
          id="bg"
          alt="Background"
          class={{
            'flex dark:hidden': themeStore.isDark === undefined,
            'fixed bottom-0 -z-10 h-lvh w-lvw scale-120 overflow-hidden object-cover blur-none': true,
            'transition-all duration-1000': loc.isNavigating,
            'bottom-0! scale-150 opacity-0 blur-xl!': loc.url.pathname != '/',
          }}
        />
      )}
      <Slot />
      <div
        ref={anchorElementRef}
        class={{
          'fixed flex max-w-full flex-col gap-1 md:max-w-2/2 lg:max-w-2/3 xl:max-w-2/4': true,
          'right-4 bottom-4': !settingsStore.flopbird?.toggle,
        }}
        id="notifications"
        style={{
          '--lum-border-radius': '1rem',

          ...(settingsStore.flopbird?.toggle
            ? {
                transform: 'translate(-100%, -100%)',
              }
            : {}),
        }}
      >
        {notifications.map((notification) => {
          if (!notification) return null;
          const id = notification.id;
          const onClick$ = notification.action?.onClick$;

          if (!notification.persist) {
            setTimeout(() => {
              const el = document.getElementById(id);
              el?.classList.add(
                'animate-out',
                'fade-out',
                'slide-out-to-bottom-8',
                'sm:slide-out-to-right-8'
              );
              setTimeout(() => {
                notifications.splice(
                  notifications.findIndex((n) => n?.id === id),
                  1
                );
              }, 300);
            }, 4000);
          }

          return (
            <button
              id={notification.id}
              class={{
                [notification.bgColor ?? 'lum-grad-bg-lum-input-bg/60']: true,
                'lum-card sm:rounded-lum max-w-lg min-w-84 gap-0 p-4 text-left backdrop-blur-xl': true,
                'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 duration-500': true,
              }}
              key={notification.id}
              onClick$={async (e, el) => {
                await onClick$?.();
                el.classList.add(
                  'animate-out',
                  'fade-out',
                  'slide-out-to-bottom-8',
                  'sm:slide-out-to-right-8'
                );
                setTimeout(() => {
                  notifications.splice(
                    notifications.findIndex((n) => n?.id === id),
                    1
                  );
                }, 300);
              }}
            >
              <h5 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                <span class="flex flex-1 items-center gap-2">
                  {notification.title}
                </span>
              </h5>
              <p>{notification.description}</p>
              {notification.buttons && notification.buttons.length > 0 && (
                <div class="flex flex-wrap items-center justify-end gap-2">
                  {notification.buttons.map((button, index) => (
                    <Link
                      key={index}
                      href={button.href}
                      class="lum-btn lum-bg-blue hover:lum-bg-blue"
                    >
                      {button.text}
                    </Link>
                  ))}
                </div>
              )}
              {notification.persist && (
                <p class="lum-text-xs text-lum-text-secondary/50! mt-1!">
                  {notification.action?.text ??
                    t('nav.clickToDismiss@@Click to dismiss')}
                </p>
              )}
              {/*
          <audio autoplay volume={0.2}>
            <source src={`/minecraft/parrot_sounds/idle${Math.floor(Math.random() * 5) + 1}.ogg`} type="audio/ogg" />
          </audio>
          */}
            </button>
          );
        })}
      </div>
      {showCookieConsent.value && settingsStore.cookies === undefined && (
        <div
          class="lum-grad-bg-lum-input-bg/60 lum-card sm:rounded-lum animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-left-8 fixed bottom-4 left-4 min-w-84 gap-0 p-4 text-left backdrop-blur-xl duration-500"
          style={{
            '--lum-border-radius': '1rem',
          }}
        >
          <div>
            <h5 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Cookie size={24} />
              {t('nav.cookies.title@@Cookies')}
            </h5>
            <p>
              {t(
                'nav.cookies.description@@We use cookies to automatically save and load your preferences.'
              )}
            </p>
            <Link href="/privacy">
              {t('nav.privacyPolicy@@Privacy Policy')}
            </Link>
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <button
              class="lum-btn lum-btn-p-1 lum-bg-transparent rounded-lum-2"
              onClick$={async () => {
                settingsStore.cookies = false;
                setCookies('settings', settingsStore);
                await setUserData({ settings: settingsStore });
              }}
            >
              {t('nav.cookies.optOut@@Reject')}
            </button>
            <button
              class="lum-btn lum-bg-blue hover:lum-bg-blue lum-btn-p-1 rounded-lum-2"
              onClick$={async () => {
                settingsStore.cookies = true;
                setCookies('settings', settingsStore);
                await setUserData({ settings: settingsStore });
              }}
            >
              {t('nav.cookies.acknowledge@@Accept')}
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
});
