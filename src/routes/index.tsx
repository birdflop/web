import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { CashOutline, ServerOutline } from 'qwik-ionicons';
import { initiateTyper } from '~/components/util/Typer';

import background from '~/images/background.png';

export default component$(() => {

  useVisibleTask$(() => {
    initiateTyper();
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]">
      <picture class="fixed top-0 overflow-hidden" style={{ height: '100lvh', width: '100lvw' }}>
        <img
          width={1920}
          height={1080}
          src={background}
          class="object-cover object-center h-full w-full opacity-50 blur-sm"
          alt="Birdflop Hosting"
        />
      </picture>
      <div class="text-center justify-center">
        <div id="noise" class="flex relative justify-center align-center">
          {/* <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-indigo-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl"></div>
          <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-blue-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl -animation-delay-5"></div>
          <div class="absolute w-32 h-32 sm:w-48 sm:h-48 bottom-0 bg-violet-700 rounded-full opacity-10 animate-blob ease-in-out filter blur-xl -animation-delay-10"></div> */}
          <div class="mt-10 space-y-3 min-h-[60px]">
            <h1 class="text-gray-100 text-6xl font-bold mb-6 fade-in animation-delay-100">
              Birdflop Hosting
            </h1>
            <h2 class="text-gray-300 text-2xl mb-12 fade-in animation-delay-100">
              A nonprofit dedicated to <span class="typer" id="main" data-words={'minecraft hosting,public resources,communities,you'} data-colors="#54DAF4,#54B1DF,#5487CB,#545EB6,#545EB6,#5487CB,#54B1DF,#54DAF4" data-delay="50" data-deleteDelay="1000"></span>
              <span class="cursor" data-owner="main" data-cursor-display="|"></span>
            </h2>
            <div class="flex justify-center fade-in animation-delay-100">
              <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="mr-4 flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-sky-700/80 hover:bg-sky-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 mt-10 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
                <ServerOutline width="30" class="text-3xl" /> Hosting
              </a>
              <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-pink-700/80 hover:bg-pink-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 mt-10 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
                <CashOutline width="30" class="text-3xl" /> Donate Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Hosting & Resources',
  meta: [
    {
      name: 'description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
