import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LoadingIcon } from '@luminescent/ui';
import Background from '~/components/images/background.png?jsx';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.open('https://bit.ly/acornmc1');
    window.open('https://bit.ly/acornmc2');
    window.open('https://bit.ly/acornmc3');
    window.open('https://bit.ly/acornmc6');
  });

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100svh)] pt-[72px]">
      <Background class="fixed inset-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] object-cover object-center opacity-45 blur-lg" id="bg" alt="background" />
      <h1 class="font-bold text-gray-50 text-4xl sm:text-6xl mb-4">
        AcornMC Vote
      </h1>
      <h2 class="text-gray-400 text-base sm:text-2xl flex gap-2 items-center">
        Opening Links
        <LoadingIcon width={24} class={{ 'ml-2': true }} />
      </h2>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'AcornMC Vote',
  meta: [
    {
      name: 'description',
      content: 'Birdflop Node Stats',
    },
    {
      name: 'og:description',
      content: 'Birdflop Node Stats',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};