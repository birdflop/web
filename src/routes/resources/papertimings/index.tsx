import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import PaperTimings from '~/components/analyze/PaperTimings';

export default component$(() => {
  return (
    <PaperTimings>
      <p class="text-white my-12">
        1. Do /timings report<br/>
        <span class="text-gray-300">May not be present in Purpur 1.19 and up</span><br/>
        2. Follow the instructions given if you weren't shown a link
      </p>
    </PaperTimings>
  );
});

export const head: DocumentHead = {
  title: 'Analyze Timings',
  meta: [
    {
      name: 'description',
      content: 'Analyze your Paper Timings to get optimization recommendations',
    },
    {
      name: 'og:description',
      content: 'Analyze your Paper Timings to get optimization recommendations',
    },
    {
      name: 'og:image',
      content: 'https://birdflop.com/images/icon.png',
    },
  ],
};