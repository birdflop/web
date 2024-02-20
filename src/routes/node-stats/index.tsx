import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { ButtonAnchor, Card, CardHeader } from '@luminescent/ui';
import Background from '~/components/images/background.png?jsx';

export default component$(() => {
  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100svh-100px)]">
      <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-[100lvh] w-[100lvw] object-cover object-center opacity-45 blur-xl" id="bg" />
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
        Node Stats
      </h1>
      <div class="flex gap-3 justify-center">
        <ButtonAnchor href="https://status.birdflop.com/" size="lg" color="blue">
          Overview
        </ButtonAnchor>
        <ButtonAnchor href="https://netdata.birdflop.com/panel" size="lg" color="blue">
          Web Services
        </ButtonAnchor>
      </div>
      <div class="flex gap-3 justify-center">
        <Card href="https://netdata.birdflop.com/crabwings" color="red" hoverable blobs>
          <CardHeader>
            Crabwings
            <span q:slot='subheader' class="text-xs text-gray-300">US</span>
          </CardHeader>
        </Card>
        <Card href="http://impeyes.birdflop.com:19999/" color="orange" hoverable blobs>
          <CardHeader>
            Impeyes
            <span q:slot='subheader' class="text-xs text-gray-300">EU</span>
          </CardHeader>
        </Card>
        <Card href="http://jellyfishjaws.birdflop.com:19999/" color="yellow" hoverable blobs>
          <CardHeader>
            Jellyfishjaws
            <span q:slot='subheader' class="text-xs text-gray-300">EU</span>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Birdflop Node Stats',
  meta: [
    {
      name: 'description',
      content: 'Birdflop Node Stats',
    },
    {
      name: 'og:description',
      content: 'Birdflop Node Stats',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};