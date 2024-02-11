import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { SPAButton } from '~/components/elements/Button';
import BirdflopConfused from '~/components/icons/BirdflopConfused';
import Background from '~/components/images/background.png?jsx';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]" >
      <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] object-cover object-center opacity-45 grayscale blur-xl" id="bg" />
      <div class="text-red-400 text-4xl">
        <div class="hidden sm:flex">
          <BirdflopConfused width={200} />
        </div>
        <div class="sm:hidden">
          <BirdflopConfused width={100} />
        </div>
        <h1 class="font-bold mb-4 mt-12">404: Page not found</h1>
        <p class="font-italic text-gray-400 text-xl">
          Whoops! You've hit a dead-end.
        </p>
        <div class="flex mt-4">
          <SPAButton href="/" big color="blue">
            Go back home
          </SPAButton>
        </div>
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