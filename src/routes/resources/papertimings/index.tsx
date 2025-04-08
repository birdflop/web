import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import PaperTimings from '~/components/analyze/PaperTimings';

export default component$(() => {
  return (
    <PaperTimings>
      <p class="text-white my-12">
        1. Do /timings report<br />
        <span class="text-gray-300">May not be present in Purpur 1.19 and up</span><br />
        2. Follow the instructions given if you weren't shown a link
      </p>
    </PaperTimings>
  );
});

export const head: DocumentHead = {
  title: 'Automatic Minecraft Timings Analyzer - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Analyze your Paper Timings to get optimization recommendations. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Analyze your Paper Timings to get optimization recommendations. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};