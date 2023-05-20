import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { CafeOutline } from 'qwik-ionicons';

// @ts-ignore
import iconAVIF from '~/images/icon.png?format=avif';
// @ts-ignore
import iconWEBP from '~/images/icon.png?format=webp';
// @ts-ignore
import icon from '~/images/icon.png?metadata';

import { initiateTyper } from '~/components/util/Typer';
import {
  $translate as t,
  Speak,
} from 'qwik-speak';

export default component$(() => {
  useVisibleTask$(() => {
    initiateTyper();
  }, { strategy: 'document-idle' });
  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <Speak assets={['home']}>
        <div class="text-center justify-center">
          <div id="noise" class="flex relative justify-center align-center mb-10">
            <div class="absolute top-24 w-32 h-32 sm:w-64 sm:h-64 bg-pink-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl left-[45%]"></div>
            <div class="absolute top-24 w-32 h-32 sm:w-64 sm:h-64 bg-luminescent-600 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl right-[50%] animation-delay-2000"></div>
            <div class="absolute bottom-32 w-32 h-32 sm:w-64 sm:h-64 bg-violet-500 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl left-[30%] animation-delay-4000"></div>
            <div class="z-10">
              <picture>
                <source srcSet={iconAVIF} type="image/avif" />
                <source srcSet={iconWEBP} type="image/webp" />
                <img
                  src={icon}
                  height={300}
                  width={300}
                  alt="SimplyMC icon"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
          <div class="mt-10 space-y-3 min-h-[60px]">
            <h1 class="text-gray-50 text-4xl mb-12">
              {t('home.subtitle@@A Minecraft multitool for')} <span class="typer" id="main" data-words={t('home.typerWords@@developers,server owners,players,you')} data-colors="#cd2032,#ad3960,#8e518d,#6e6abb" data-delay="50" data-deleteDelay="1000"></span>
              <span class="cursor" data-owner="main" data-cursor-display="|"></span>
            </h1>
            <div class="flex justify-center">
              <a href="https://ko-fi.com/akiradev" class="flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-gradient-to-b from-pink-900/80 to-pink-700/80 hover:bg-pink-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
                <CafeOutline width="30" class="text-3xl"/> {t('home.kofi@@Consider donating if this helped you')}
              </a>
            </div>
          </div>
        </div>
      </Speak>
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
