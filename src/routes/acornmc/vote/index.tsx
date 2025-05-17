import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.open('https://bit.ly/acornmc1');
    window.open('https://bit.ly/acornmc2');
    window.open('https://bit.ly/acornmc3');
    window.open('https://bit.ly/acornmc6');
  });

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <h1 class="font-bold text-gray-50 text-4xl sm:text-6xl mb-4">
        AcornMC Vote
      </h1>
      <h2 class="text-gray-400 sm:text-2xl flex gap-2 items-center">
        Opening Links
        <div class={{ 'lum-loading ml-2 w-6 h-6': true }} />
      </h2>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'AcornMC Vote',
  meta: [
    {
      name: 'description',
      content: 'Vote for AcornMC!',
    },
    {
      name: 'og:description',
      content: 'Vote for AcornMC!',
    },
    {
      name: 'og:image',
      content: '/branding/acorn.png',
    },
  ],
};