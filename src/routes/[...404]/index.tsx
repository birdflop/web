import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import BirdflopConfused from '~/components/icons/BirdflopConfused';
import background from '~/components/images/background.png';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]" >
      <picture class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] bg-red-500/40" id="bg">
        <img
          width={1920}
          height={1080}
          src={background}
          class="object-cover object-center h-full w-full opacity-55 grayscale blur-xl"
          alt="Background"
        />
      </picture>
      <div class="font-bold text-red-400 text-4xl mb-12">
        <div class="hidden sm:flex">
          <BirdflopConfused width={200} />
        </div>
        <div class="sm:hidden">
          <BirdflopConfused width={100} />
        </div>
        <h1 class="mt-12">404: Page not found</h1>
        <p class="font-italic text-gray-400 text-xl">
          Whoops! You've hit a dead-end. <a href="/" class="text-blue-300/50 underline">Go back home</a>
        </p>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: '404: Page not found',
  meta: [
    {
      name: 'description',
      content: 'Whoops! You\'ve hit a dead-end.',
    },
    {
      name: 'og:description',
      content: 'Whoops! You\'ve hit a dead-end.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};