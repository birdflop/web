import { component$ } from '@qwik.dev/core';
import type { RequestHandler } from '@qwik.dev/router';
import { Link } from '@qwik.dev/router';
import { Birdflop } from '@luminescent/icons-qwik';
import Home from 'lucide-icons-qwik/icons/Home';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';

export const onGet: RequestHandler = ({ json, request }) => {
  // check if contenttype is json
  if (request.headers.get('content-type') !== 'application/json') return;

  throw json(404, {
    error: 'Endpoint not found.',
  });
};

export default component$(() => {
  const t = inlineTranslate();

  return (
    <section class="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-6">
      <div>
        <Birdflop
          confused
          size={100}
          fillGradient={['#54daf4', '#545eb6']}
        />
        <h1 class="text-red-400">{t('nav.404.title@@404: Page not found')}</h1>
        <h2 class="text-lum-text-secondary">
          {t('nav.404.description@@Whoops! You\'ve hit a dead-end.')}
        </h2>
        <div class="mt-4 flex">
          <Link
            href="/"
            class="lum-btn lum-btn-p-4 lum-grad-bg-blue/60 hover:lum-bg-blue"
          >
            <Home size={26} /> {t('nav.404.home@@Go back home')}
          </Link>
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: '404: Page not found',
  description: 'Whoops! You\'ve hit a dead-end. ' + defaultDescription,
});
