import {
  component$,
  useSignal,
  useVisibleTask$,
  Component,
  PropsOf,
  useContext,
} from '@qwik.dev/core';
//@ts-expect-error vite imagetools
import AdPemi from '~/images/ad/AdPemi.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdPemiAIDark from '~/images/ad/AdPemiAIDark.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdAI from '~/images/ad/AdAI.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdAIDark from '~/images/ad/AdAIDark.png?jsx&format=avif&w=256;512;1024';
import { ThemeContext } from '~/util/themeUtil';

export const AD_VARIANTS = {
  'ai-generated': {
    light: AdAI as Component<PropsOf<'img'>>,
    dark: AdAIDark as Component<PropsOf<'img'>>,
    label: 'AI Generated',
  },
  'pemi-handmade': {
    light: AdPemi as Component<PropsOf<'img'>>,
    dark: AdPemiAIDark as Component<PropsOf<'img'>>,
    label: 'Handmade by Pemi',
  },
} as const;
export type AdVariantKey = keyof typeof AD_VARIANTS;

interface HostingAdProps {
  variant: AdVariantKey;
  position: 'Left' | 'Right';
}

export default component$<HostingAdProps>(({ variant, position }) => {
  const tracked = useSignal(false);

  // Track ad impressions when they become visible
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Track when at least 50% of the ad is visible
    };

    const trackAdView = (adElement: Element) => {
      if (tracked.value) return;

      const variant = adElement.getAttribute('data-umami-event-variant');

      // Send the impression event to Umami
      if (window.umami) {
        window.umami.track('Hosting Ad View', {
          page: 'RGBirdflop',
          action: `${position} Ad`,
          variant: variant || 'unknown',
        });
      }

      tracked.value = true;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackAdView(entry.target);
        }
      });
    }, observerOptions);

    // Wait for ad to be rendered in DOM
    setTimeout(() => {
      const adElement = document.querySelector(
        `[data-ad-position="${position}"]`
      );
      if (adElement) {
        observer.observe(adElement);
      }
    }, 100);

    return () => {
      observer.disconnect();
    };
  });

  const LightImage = AD_VARIANTS[variant].light;
  const DarkImage = AD_VARIANTS[variant].dark;

  const themeStore = useContext(ThemeContext);

  return (
    <div
      class={
        position === 'Left'
          ? 'hidden justify-center 2xl:flex'
          : '3xl:flex hidden justify-center'
      }
    >
      <a
        href="/#plans"
        class="sticky top-24 h-144 w-96 opacity-70 transition-opacity hover:opacity-100"
        aria-label="View Birdflop plans"
        data-umami-event="Hosting Ad Click"
        data-umami-event-page="RGBirdflop"
        data-umami-event-action={`${position} Ad`}
        data-umami-event-variant={AD_VARIANTS[variant].label}
        data-ad-position={position}
      >
        {(themeStore.isDark === undefined || themeStore.isDark) && (
          <DarkImage
            alt="Ad Image - Birdflop Hosting"
            class={{
              'rounded-lum': true,
              'hidden dark:flex': themeStore.isDark === undefined,
            }}
          />
        )}
        {(themeStore.isDark === undefined || !themeStore.isDark) && (
          <LightImage
            alt="Ad Image - Birdflop Hosting"
            class={{
              'rounded-lum': true,
              'flex dark:hidden': themeStore.isDark === undefined,
            }}
          />
        )}
      </a>
    </div>
  );
});
