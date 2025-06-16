import { component$ } from '@builder.io/qwik';

import SparkProfile from '~/components/analyze/SparkProfile';
import { defaultDescription, generateHead } from '~/root';

export default component$(() => {
  return (
    <SparkProfile>
      <p class="my-12">
        1. <a href="https://spark.lucko.me/" class="text-blue-400 hover:underline">Install spark</a> on your server and restart<br />
        <span class="text-gray-300">Not required if running Purpur 1.19 and up</span><br />
        2. Do /spark profiler<br />
        3. Do /spark profiler --stop, copy the link you get<br />
      </p>
    </SparkProfile>
  );
});

export const head = generateHead({
  title: 'Automatic Minecraft Spark Profile Analyzer - Birdflop',
  description: 'Analyze your Spark Profile to get optimization recommendations. Developed by Birdflop. ' + defaultDescription,
  ads: true,
});