import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

interface HostingAdProps {
  variant: {
    image: string;
    label: string;
  };
  position: 'Left' | 'Right';
}

export default component$<HostingAdProps>(({ variant, position }) => {
  const tracked = useSignal(false);

  // Track ad impressions when they become visible
  // eslint-disable-next-line qwik/no-use-visible-task
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
        `[data-ad-position="${position}"]`,
      );
      if (adElement) {
        observer.observe(adElement);
      }
    }, 100);

    return () => {
      observer.disconnect();
    };
  });

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
        class="sticky top-24 h-144 w-96 rounded-lg bg-cover bg-center opacity-70 transition-opacity hover:opacity-100"
        style={{ backgroundImage: `url(${variant.image})` }}
        aria-label="View Birdflop plans"
        data-umami-event="Hosting Ad Click"
        data-umami-event-page="RGBirdflop"
        data-umami-event-action={`${position} Ad`}
        data-umami-event-variant={variant.label}
        data-ad-position={position}
      />
    </div>
  );
});
