import { component$ } from '@builder.io/qwik';
import { defaultDescription, generateHead } from '~/root';
import RGBirdflop from '~/components/Rgbirdflop/RGBirdflop';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies } from '~/util/dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>;
    errors: string[];
  };
});

export default component$(() => {
  const useCookiesValue = useCookies().value;
  return (
    <RGBirdflop useCookiesValue={useCookiesValue}>
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
});
