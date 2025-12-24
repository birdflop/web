import { component$, useVisibleTask$ } from '@builder.io/qwik';

import { Blobs } from '@luminescent/ui-qwik';
import { Activity } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';
import { unloadGoogleAds } from '~/util/GoogleAds';

const nodes = [
  {
    name: 'Crabwings',
    location: 'New York City Metro, USA',
    color: 'red',
  },
  {
    name: 'Impeyes',
    location: 'Falkenstein, Germany (EU)',
    color: 'orange',
  },
  {
    name: 'Jellyfishjaws',
    location: 'Falkenstein, Germany (EU)',
    color: 'yellow',
  },
  {
    name: 'Koalaknees',
    location: 'Ashburn, VA, USA',
    color: 'green',
  },
  {
    name: 'Llamalips',
    location: 'Falkenstein, Germany (EU)',
    color: 'teal',
  },
  {
    name: 'Monkeymouth',
    location: 'New York City Metro, USA',
    color: 'blue',
  },
  {
    name: 'Narwhalnose',
    location: 'Ashburn, VA, USA',
    color: 'violet',
  },
  {
    name: 'Owlorgans',
    location: 'Falkenstein, Germany (EU)',
    color: 'pink',
  },
];

export default component$(() => {
  const t = inlineTranslate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return <>
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-15 w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Activity size={70} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </h1>
        <p>
          {t('nav.hosting.nodeStats.description@@Check the status of Birdflop\'s server nodes.')}
        </p>
        <hr/>
        <div class="flex flex-wrap gap-2 mb-2">
          <a class="lum-btn lum-bg-blue hover:lum-bg-blue" href="https://status.birdflop.com/">
            {t('nav.hosting.nodeStats.overview@@Overview')}
          </a>
          <a class="lum-btn lum-bg-blue hover:lum-bg-blue" href="https://netdata.birdflop.com/panel">
            {t('nav.hosting.nodeStats.webServices@@Web Services')}
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {nodes.map((node) => (
            <a class={`lum-card lum-bg-${node.color}/30 hover:lum-bg-${node.color}/70 transition duration-300 hover:duration-75 ease-out relative min-w-64`}
              href={`https://telemetry.birdflop.com/d/stats/public-statistics?var-node=${node.name.toLowerCase()}.birdflop.com:9100&orgId=1`}
              key={node.name}
            >
              <Blobs color={node.color as keyof typeof Blobs} class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h3 class="my-0!">
                {node.name}
              </h3>
              <p>
                {node.location}
              </p>
              {node.name.toLowerCase()}.birdflop.com
            </a>
          ))}
        </div>
      </div>
    </section>
  </>;
});

export const head = generateHead({
  title: 'Node Stats - Birdflop',
  description: 'Check the status of Birdflop\'s nodes. ' + defaultDescription,
  ads: true,
});