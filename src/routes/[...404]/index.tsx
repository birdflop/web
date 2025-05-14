import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { LogoBirdflop } from '@luminescent/ui-qwik';
import { Home } from 'lucide-icons-qwik';
import { unloadGoogleAds } from '~/util/GoogleAds';

export const onGet: RequestHandler = ({ json, request }) => {
  // check if contenttype is json
  if (request.headers.get('content-type') !== 'application/json') return;

  throw json(404, {
    error: 'Endpoint not found.',
  });
};

export default component$(() => {
  // Keeping below unloading in case we mess up navbar in future
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh" >
      <div class="text-red-400 text-4xl">
        <LogoBirdflop confused width={100} fillGradient={['#54daf4', '#545eb6']} />
        <h1 class="font-bold mb-4 mt-6">404: Page not found</h1>
        <p class="font-italic text-gray-400 text-xl">
          Whoops! You've hit a dead-end.
        </p>
        <div class="flex mt-4">
          <Link href="/" class="lum-btn lum-btn-p-4 rounded-lg text-lg lum-bg-blue-600/80 hover:lum-bg-blue-600">
            <Home size={26}/> Go back home
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