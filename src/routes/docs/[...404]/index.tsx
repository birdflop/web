import { component$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { LogoBirdflop } from '@luminescent/ui-qwik';
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

  // Keeping below unloading in case we mess up navbar in future
  return (
    <section>
      <div>
        <LogoBirdflop confused size={100} fillGradient={['#54daf4', '#545eb6']} />
        <h1>
          {t('nav.404.title@@404: Page not found')}
        </h1>
        <h4 class="text-lum-text-secondary">
          {t('nav.404.description@@Whoops! You\'ve hit a dead-end.')}
        </h4>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: '404: Page not found',
  description: 'Whoops! You\'ve hit a dead-end. ' + defaultDescription,
});