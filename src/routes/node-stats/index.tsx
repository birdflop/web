import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import background from '~/components/images/background.png';

export default component$(() => {
  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100svh-100px)]">
      <picture class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw]" id="bg">
        <img
          width={1920}
          height={1080}
          src={background}
          class="object-cover object-center h-full w-full opacity-55 blur-xl"
          alt="Background"
        />
      </picture>
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
        Node Stats
      </h1>
      <div class="flex gap-3 justify-center">
        <a href="https://status.birdflop.com/" class="flex transition duration-200 rounded-xl bg-blue-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
          Overview
        </a>
        <a href="https://netdata.birdflop.com/panel" class="flex transition duration-200 rounded-xl bg-blue-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
          Web Services
        </a>
      </div>
      <div class="flex gap-3 justify-center">
        <a href="https://netdata.birdflop.com/crabwings" class="flex transition duration-200 rounded-xl bg-blue-600/80 hover:bg-sky-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
          Crabwings (NYC)
        </a>
        <a href="http://impeyes.birdflop.com:19999/" class="flex transition duration-200 rounded-xl bg-blue-600/80 hover:bg-blue-600 border-sky-600 border-2 px-6 py-3 font-bold text-sky-100 md:py-4 md:px-8 md:text-lg whitespace-nowrap justify-center">
          Impeyes (EU)
        </a>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Node Stats',
  meta: [
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};