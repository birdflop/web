import { component$ } from '@qwik.dev/core';

import { Hoverable } from '@luminescent/ui-qwik';
import Activity from 'lucide-icons-qwik/icons/Activity';
import AppWindow from 'lucide-icons-qwik/icons/AppWindow';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';

const nodes = [
  {
    name: 'Crabwings',
    location: 'New York City Metro, USA',
    color: 'bg-red/30',
  },
  {
    name: 'Impeyes',
    location: 'Falkenstein, Germany (EU)',
    color: 'bg-orange/30',
  },
  {
    name: 'Jellyfishjaws',
    location: 'Falkenstein, Germany (EU)',
    color: 'bg-yellow/30',
  },
  {
    name: 'Koalaknees',
    location: 'Ashburn, VA, USA',
    color: 'bg-green/30',
  },
  {
    name: 'Llamalips',
    location: 'Falkenstein, Germany (EU)',
    color: 'bg-teal/30',
  },
  {
    name: 'Monkeymouth',
    location: 'New York City Metro, USA',
    color: 'bg-blue/30',
  },
  {
    name: 'Narwhalnose',
    location: 'Ashburn, VA, USA',
    color: 'bg-violet/30',
  },
  {
    name: 'Owlorgans',
    location: 'Falkenstein, Germany (EU)',
    color: 'bg-pink/30',
  },
];

export default component$(() => {
  const t = inlineTranslate();

  return (
    <>
      <section
        class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20"
        style={{
          '--lum-border-radius': '1.5rem',
        }}
      >
        <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
          <Activity size={32} />
          {t('nav.hosting.nodeStats.title@@Node Stats')}
        </h1>
        <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
          {t(
            "nav.hosting.nodeStats.description@@Check the status of Birdflop's server nodes."
          )}
        </p>
        <div class="mb-2 flex flex-wrap gap-2">
          <a
            class="lum-btn lum-bg-blue/50 hover:lum-bg-blue"
            href="https://status.birdflop.com/"
          >
            <Activity size={20} />
            {t('nav.hosting.nodeStats.overview@@Overview')}
          </a>
          <a
            class="lum-btn lum-bg-blue/50 hover:lum-bg-blue"
            href="https://netdata.birdflop.com/panel"
          >
            <AppWindow size={20} />
            {t('nav.hosting.nodeStats.webServices@@Web Services')}
          </a>
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nodes.map((node) => (
            <a
              class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-lum-card-bg/50 relative duration-200!"
              href={`https://telemetry.birdflop.com/d/stats/public-statistics?var-node=${node.name.toLowerCase()}.birdflop.com:9100&orgId=1`}
              key={node.name}
              onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
              onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
            >
              <div class="rounded-lum absolute inset-0 -z-10 h-full w-full overflow-clip object-cover saturate-200">
                <div
                  class={{
                    'absolute top-0 h-full w-full -translate-y-1/2 scale-75 rounded-full blur-2xl': true,
                    [node.color]: true,
                  }}
                />
              </div>
              <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                {node.name}
              </h3>
              <p class="text-lum-text-secondary">
                {node.location}
                <br />
                {node.name.toLowerCase()}.birdflop.com
              </p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
});

export const head = generateHead({
  title: 'Node Stats - Birdflop',
  description: "Check the status of Birdflop's nodes. " + defaultDescription,
});
