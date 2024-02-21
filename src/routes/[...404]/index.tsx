import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { Button, LogoBirdflop } from '@luminescent/ui';
import Background from '~/components/images/background.png?jsx';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]" >
      <Background class="fixed inset-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] object-cover object-center opacity-45 grayscale blur-lg" id="bg" alt="background" />
      <div class="text-red-400 text-4xl">
        <div class="hidden sm:flex">
          <LogoBirdflop confused width={200} fillGradient={['#54daf4', '#545eb6']} />
        </div>
        <div class="sm:hidden">
          <LogoBirdflop confused width={100} fillGradient={['#54daf4', '#545eb6']} />
        </div>
        <h1 class="font-bold mb-4 mt-12">404: Page not found</h1>
        <p class="font-italic text-gray-400 text-xl">
          Whoops! You've hit a dead-end.
        </p>
        <div class="flex mt-4">
          <Link href="/">
            <Button size="lg" color="blue">
              Go back home
            </Button>
          </Link>
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