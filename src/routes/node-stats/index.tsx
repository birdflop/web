import { component$ } from '@builder.io/qwik';

import { Blobs, Hoverable } from '@luminescent/ui-qwik';
import { Activity, AppWindow } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';

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

  return <>
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20"
      style={{
        '--lum-border-radius': '1.5rem',
      }}>
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <Activity size={32} />
        {t('nav.hosting.nodeStats.title@@Node Stats')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4 text-lum-text-secondary">
        {t('nav.hosting.nodeStats.description@@Check the status of Birdflop\'s server nodes.')}
      </p>
      <div class="flex flex-wrap gap-2 mb-2">
        <a class="lum-btn lum-bg-blue hover:lum-bg-blue" href="https://status.birdflop.com/">
          <Activity size={20} />
          {t('nav.hosting.nodeStats.overview@@Overview')}
        </a>
        <a class="lum-btn lum-bg-blue hover:lum-bg-blue" href="https://netdata.birdflop.com/panel">
          <AppWindow size={20} />
          {t('nav.hosting.nodeStats.webServices@@Web Services')}
        </a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {nodes.map((node) => (
          <a class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-lum-card-bg/50 duration-200! relative"
            href={`https://telemetry.birdflop.com/d/stats/public-statistics?var-node=${node.name.toLowerCase()}.birdflop.com:9100&orgId=1`}
            key={node.name}
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
            <Blobs color={node.color as keyof typeof Blobs} class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="mb-2 flex items-center gap-2 font-bold text-2xl">
              {node.name}
            </h3>
            <p class="text-lum-text-secondary">
              {node.location}
              <br/>
              {node.name.toLowerCase()}.birdflop.com
            </p>
          </a>
        ))}
      </div>
    </section>
  </>;
});

export const head = generateHead({
  title: 'Node Stats - Birdflop',
  description: 'Check the status of Birdflop\'s nodes. ' + defaultDescription,
});