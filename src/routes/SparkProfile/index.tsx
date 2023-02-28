import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import SparkProfile from '~/components/analyze/SparkProfile';

export default component$(() => {
  return (
    <SparkProfile>
      <p class="text-white my-12">
        1. <a href="https://spark.lucko.me/" class="text-blue-400">Install spark</a> on your server and restart<br/>
        <span class="text-gray-300">Not required if running Purpur 1.19 and up</span><br/>
        2. Do /spark profiler<br/>
        3. Do /spark profiler --stop, copy the link you get<br/>
      </p>
    </SparkProfile>
  );
});

export const head: DocumentHead = {
  title: 'Analyze Spark Profile',
  meta: [
    {
      name: 'description',
      content: 'Analyze your Spark Profile to get optimization recommendations'
    },
    {
      name: 'og:description',
      content: 'Analyze your Spark Profile to get optimization recommendations'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}