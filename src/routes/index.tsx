import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { CafeOutline } from 'qwik-ionicons';

import Birdflop from '~/components/icons/Birdflop';

import {
  inlineTranslate,
} from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]">
      <div class="text-center justify-center">
        <div id="noise" class="flex relative justify-center align-center">
          <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-indigo-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl"></div>
          <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-blue-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl -animation-delay-5"></div>
          <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-violet-700 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl -animation-delay-10"></div>
          <div class="z-10 fade-in mb-5 pb-5">
            <Birdflop width={200} />
          </div>
        </div>
        <div class="mt-10 space-y-3 min-h-[60px]">
          <h1 class="text-gray-100 text-6xl font-bold mb-6 fade-in animation-delay-100">
            Birdflop Hosting
          </h1>
          <h2 class="text-gray-400 text-2xl fade-in animation-delay-100">
            The only 501(c)(3) <span class="font-bold">nonprofit</span> Minecraft server host.
          </h2>
          <div class="flex justify-center fade-in animation-delay-100">
            <a href="https://ko-fi.com/akiradev" class="flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-gradient-to-b from-pink-900/80 to-pink-700/80 hover:bg-pink-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 mt-10 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
              <CafeOutline width="30" class="text-3xl" /> {t('home.kofi@@Consider donating if this helped you')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'A Minecraft Multitool',
  meta: [
    {
      name: 'description',
      content: 'A Minecraft multitool for you',
    },
    {
      name: 'og:description',
      content: 'A Minecraft multitool for you',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
