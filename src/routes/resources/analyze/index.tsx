import { component$ } from '@qwik.dev/core';

import { defaultDescription, generateHead } from '~/root';
import Analyze from '~/components/analyze/Analyze';

export default component$(() => {
  return (
    <>
      <Analyze>
        <p class="my-12">
          1.{' '}
          <a
            href="https://spark.lucko.me/"
            class="text-blue-400 hover:underline"
          >
            Install spark
          </a>{' '}
          on your server and restart
          <br />
          <span class="text-lum-text-secondary">
            Not required if running Purpur 1.19 and up
          </span>
          <br />
          2. Do /spark profiler
          <br />
          3. Do /spark profiler --stop, copy the link you get
          <br />
        </p>
      </Analyze>
    </>
  );
});

export const head = generateHead({
  title: 'Automatic Minecraft Spark Profile and Timings Analyzer - Birdflop',
  description:
    'Analyze your Spark Profile and Paper Timings to get optimization recommendations. Developed by Birdflop. ' +
    defaultDescription,
});
