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
import AdPemiAIHorizontal from '~/images/ad/AdPemiAIHorizontal.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdPemiAIDark from '~/images/ad/AdPemiAIDark.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdPemiAIDarkHorizontal from '~/images/ad/AdPemiAIDarkHorizontal.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools`
import AdAI from '~/images/ad/AdAI.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdAIHorizontal from '~/images/ad/AdAIHorizontal.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdAIDark from '~/images/ad/AdAIDark.png?jsx&format=avif&w=256;512;1024';
//@ts-expect-error vite imagetools
import AdAIDarkHorizontal from '~/images/ad/AdAIDarkHorizontal.png?jsx&format=avif&w=256;512;1024';
import { ThemeContext } from '~/util/themeUtil';
import { getClassObject } from '@luminescent/ui-qwik';

export const AD_VARIANTS = {
  'ai-generated': {
    light: AdAI as Component<PropsOf<'img'>>,
    lightHorizontal: AdAIHorizontal as Component<PropsOf<'img'>>,
    dark: AdAIDark as Component<PropsOf<'img'>>,
    darkHorizontal: AdAIDarkHorizontal as Component<PropsOf<'img'>>,
    label: 'AI Generated',
  },
  'pemi-handmade': {
    light: AdPemi as Component<PropsOf<'img'>>,
    lightHorizontal: AdPemiAIHorizontal as Component<PropsOf<'img'>>,
    dark: AdPemiAIDark as Component<PropsOf<'img'>>,
    darkHorizontal: AdPemiAIDarkHorizontal as Component<PropsOf<'img'>>,
    label: 'Handmade by Pemi',
  },
} as const;
export type AdVariantKey = keyof typeof AD_VARIANTS;

interface HostingAdProps extends PropsOf<'div'> {
  variant: AdVariantKey;
  position: 'Left' | 'Right' | 'Horizontal';
}

export default component$<HostingAdProps>(({ variant, position, ...props }) => {
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

  const LightImage =
    position === 'Horizontal'
      ? AD_VARIANTS[variant].lightHorizontal
      : AD_VARIANTS[variant].light;
  const DarkImage =
    position === 'Horizontal'
      ? AD_VARIANTS[variant].darkHorizontal
      : AD_VARIANTS[variant].dark;

  const themeStore = useContext(ThemeContext);

  return (
    <div
      class={{
        'hidden justify-center 2xl:flex': position === 'Left',
        '3xl:flex hidden justify-center': position === 'Right',
        'flex justify-center': position === 'Horizontal',
        ...getClassObject(props.class),
      }}
    >
      <a
        href="/#plans"
        class={{
          'sticky top-24 w-full opacity-70 transition-opacity hover:opacity-100': true,
          'h-144 max-w-96': position !== 'Horizontal',
        }}
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
