import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import SparkProfile from '~/components/analyze/SparkProfile';

export default component$(() => {
  return (
    <SparkProfile>
      <p class="text-white my-12">
        1. <a href="https://spark.lucko.me/" class="text-blue-400 hover:underline">Install spark</a> on your server and restart<br />
        <span class="text-gray-300">Not required if running Purpur 1.19 and up</span><br />
        2. Do /spark profiler<br />
        3. Do /spark profiler --stop, copy the link you get<br />
      </p>
    </SparkProfile>
  );
});

export const head: DocumentHead = {
  title: 'Automatic Minecraft Spark Profile Analyzer - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Analyze your Spark Profile to get optimization recommendations. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Analyze your Spark Profile to get optimization recommendations. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};