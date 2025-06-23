import { component$ } from '@builder.io/qwik';

import PaperTimings from '~/components/analyze/PaperTimings';
import { defaultDescription, generateHead } from '~/root';

export default component$(() => {
  return (
    <PaperTimings>
      <p class="my-12">
        1. Do /timings report<br />
        <span class="text-lum-text-secondary">May not be present in Purpur 1.19 and up</span><br />
        2. Follow the instructions given if you weren't shown a link
      </p>
    </PaperTimings>
  );
});

export const head = generateHead({
  title: 'Automatic Minecraft Timings Analyzer - Birdflop',
  description: 'Analyze your Paper Timings to get optimization recommendations. Developed by Birdflop. ' + defaultDescription,
  ads: true,
});