import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';
import { LogoBirdflop } from '@luminescent/ui-qwik';
import { Home } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';
import { unloadGoogleAds } from '~/util/GoogleAds';

export const onGet: RequestHandler = ({ json, request }) => {
  // check if contenttype is json
  if (request.headers.get('content-type') !== 'application/json') return;

  throw json(404, {
    error: 'Endpoint not found.',
  });
};

export default component$(() => {
  const t = inlineTranslate();

  // Keeping below unloading in case we mess up navbar in future
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh" >
      <div class="text-red-400">
        <LogoBirdflop confused size={100} fillGradient={['#54daf4', '#545eb6']} />
        <h1>
          {t('nav.404.title@@404: Page not found')}
        </h1>
        <h4 class="text-gray-400">
          {t('nav.404.description@@Whoops! You\'ve hit a dead-end.')}
        </h4>
        <div class="flex mt-4">
          <Link href="/" class="lum-btn lum-btn-p-4 lum-bg-blue-800 hover:lum-bg-blue-600 text-white!">
            <Home size={26}/> {t('nav.404.home@@Go back home')}
          </Link>
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: '404: Page not found',
  description: 'Whoops! You\'ve hit a dead-end. ' + defaultDescription,
  ads: true,
});