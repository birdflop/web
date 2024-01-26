import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]">
      <div class="my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          Node Stats
        </h1>
        <div class="mt-6 mb-12 grid grid-cols-2 md:grid-cols-2 gap-3 justify-center">
          <a href="https://status.birdflop.com/" class="flex transition duration-200 rounded-xl bg-sky-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
            Overview
          </a>
          <a href="https://netdata.birdflop.com/panel" class="flex transition duration-200 rounded-xl bg-sky-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
            Web Services
          </a>
        </div>
        <div class="mb-12 grid grid-cols-3 md:grid-cols-3 gap-3 justify-center">
          <a href="https://netdata.birdflop.com/crabwings" class="flex transition duration-200 rounded-xl bg-sky-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
            Crabwings (NYC)
          </a>
          <a href="https://netdata.birdflop.com/hippohips" class="flex transition duration-200 rounded-xl bg-sky-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
            Hippohips (EU)
          </a>
          <a href="http://impeyes.birdflop.com:19999/" class="flex transition duration-200 rounded-xl bg-sky-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
            Impeyes (EU)
          </a>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Color Code Stripper',
  meta: [
    {
      name: 'description',
      content: 'Strips all color / format codes from text.',
    },
    {
      name: 'og:description',
      content: 'Strips all color / format codes from text.',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};