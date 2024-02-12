import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { ExternalButton } from '~/components/elements/Button';
import Card, { CardHeader } from '~/components/elements/Card';
import Background from '~/components/images/background.png?jsx';

export default component$(() => {
  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100svh-100px)]">
      <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] object-cover object-center opacity-45 blur-xl" id="bg" />
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
        Node Stats
      </h1>
      <div class="flex gap-3 justify-center">
        <ExternalButton href="https://status.birdflop.com/" big>
          Overview
        </ExternalButton>
        <ExternalButton href="https://netdata.birdflop.com/panel" big>
          Web Services
        </ExternalButton>
      </div>
      <div class="flex gap-3 justify-center">
        <Card href="https://netdata.birdflop.com/crabwings" color="red">
          <CardHeader subheader="US">
            Crabwings
          </CardHeader>
        </Card>
        <Card href="http://impeyes.birdflop.com:19999/" color="orange">
          <CardHeader subheader="EU">
            Impeyes
          </CardHeader>
        </Card>
        <Card href="http://jellyfishjaws.birdflop.com:19999/" color="yellow">
          <CardHeader subheader="EU">
            Jellyfishjaws
          </CardHeader>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Node Stats',
  meta: [
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};