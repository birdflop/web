import type { JSXOutput, NoSerialize } from '@builder.io/qwik';
import { component$, createContextId, noSerialize, Slot, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';

import { Header } from '@luminescent/ui-qwik';
import Backgrounds from '~/components/backgrounds';
import Footer from '~/components/Footer';
import Nav from '../components/Nav';
import { Link } from '@builder.io/qwik-city';
import { Bell, Cookie, X } from 'lucide-icons-qwik';

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

export const NotificationContext = createContextId<Notification[]>('notification-context');
export default component$(() => {
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const notifications = useStore([] as Notification[]);
  useContextProvider(NotificationContext, notifications);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // convert cookies to json
    const cookieJSON: any = document.cookie.split(';').reduce((res, c) => {
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
        'backdrop-blur-xl lum-card lum-bg-gray-800/60 lum-pad-equal-2xl': true,
        'animate-in fade-in slide-in-from-bottom-8, sm:slide-in-from-right-8 anim-duration-500': true,
      }}>
        <div>
          <Header subheader="We use cookies to automatically save and load your preferences.">
            <Cookie size={26} /> Cookies
          </Header>
          <Link class="lum-bg-transparent underline text-gray-500 text-sm" href="/privacy">
            Privacy Policy
          </Link>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button class="lum-btn lum-pad-xs" onClick$={async () => {
            document.cookie = 'optout=true; path=/';
            notifications.splice(notifications.findIndex((n) => n?.id === 'cookieprompt'), 1);
          }}>
            Turn off cookies
          </button>
          <button class="lum-btn lum-pad-xs lum-bg-blue-700 hover:lum-bg-blue-600" onClick$={async () => {
            document.cookie = 'cookies=true; path=/';
            notifications.splice(notifications.findIndex((n) => n?.id === 'cookieprompt'), 1);
          }}>
            Okay
          </button>
        </div>
      </div>,
    });
    notifications.push(cookiePrompt);
  });

  return <>
    <Nav />
    <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-lvh w-lvw object-cover object-center opacity-40" id="bg" alt="background" />
    <Slot />
    <div class={{
      'fixed bottom-0 sm:bottom-4 sm:right-4 z-[1000] flex flex-col sm:gap-2 max-w-full md:max-w-1/2 lg:max-w-1/3 xl:max-w-1/4': true,
    }} id="notifications">
      {notifications.map((notification) => {
        if (!notification) return null;
        if ('element' in notification) return notification.element;
        return <div class={{
          [notification.bgColor ?? 'lum-bg-gray-800/60']: true,
          'backdrop-blur-xl lum-card lum-pad-equal-2xl rounded-none sm:rounded-lg break-words': true,
          'animate-in fade-in slide-in-from-bottom-8, sm:slide-in-from-right-8 anim-duration-500': true,
        }} key={notification.id}>
          <Header subheader={notification.description}>
            <span class="flex gap-2 items-center flex-1"><Bell size={26} /> {notification.title}</span>
            <button class="lum-btn lum-pad-equal-xs lum-bg-transparent cursor-pointer" onClick$={() => {
              notifications.splice(notifications.findIndex((n) => n?.id === notification.id), 1);
            }}><X size={16}/></button>
          </Header>
        </div>;
      })}
    </div>
    <Footer />
  </>;
});