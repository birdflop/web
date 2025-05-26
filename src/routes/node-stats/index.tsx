import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import { Blobs } from '@luminescent/ui-qwik';
import { Activity } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { unloadGoogleAds } from '~/util/GoogleAds';

export default component$(() => {
  const t = inlineTranslate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return <>
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Activity size={70} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </h1>
        <p>
          {t('nav.hosting.nodeStats.description@@Check the status of Birdflop\'s server nodes.')}
        </p>
        <hr/>
        <div class="flex flex-wrap gap-2 mb-2">
          <a class="lum-btn lum-bg-blue-600/70 hover:lum-bg-blue-600" href="https://status.birdflop.com/">
            Overview
          </a>
          <a class="lum-btn lum-bg-blue-600/70 hover:lum-bg-blue-600" href="https://netdata.birdflop.com/panel">
            Web Services
          </a>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <a class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=crabwings.birdflop.com:9100&orgId=1">
            <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Crabwings
            </h3>
            <p>
              New York City Metro, USA
            </p>
            crabwings.birdflop.com
          </a>
          <a class="lum-card lum-bg-orange-900/30 hover:lum-bg-orange-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=impeyes.birdflop.com:9100&orgId=1">
            <Blobs color='orange' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Impeyes
            </h3>
            <p>
              Falkenstein, Germany (EU)
            </p>
            impeyes.birdflop.com
          </a>
          <a class="lum-card lum-bg-yellow-900/30 hover:lum-bg-yellow-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=jellyfishjaws.birdflop.com:9100&orgId=1">
            <Blobs color='yellow' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Jellyfishjaws
            </h3>
            <p>
              Falkenstein, Germany (EU)
            </p>
            jellyfishjaws.birdflop.com
          </a>
          <a class="lum-card lum-bg-green-900/30 hover:lum-bg-green-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=koalaknees.birdflop.com:9100&orgId=1">
            <Blobs color='green' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Koalaknees
            </h3>
            <p>
              Ashburn, VA, USA
            </p>
            koalaknees.birdflop.com
          </a>
          <a class="lum-card lum-bg-teal-900/30 hover:lum-bg-teal-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=llamalips.birdflop.com:9100&orgId=1">
            <Blobs color='teal' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Llamalips
            </h3>
            <p>
              Falkenstein, Germany (EU)
            </p>
            llamalips.birdflop.com
          </a>
          <a class="lum-card lum-bg-blue-900/30 hover:lum-bg-blue-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=monkeymouth.birdflop.com:9100&orgId=1">
            <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Monkeymouth
            </h3>
            <p>
              New York City Metro, USA
            </p>
            monkeymouth.birdflop.com
          </a>
          <a class="lum-card lum-bg-violet-900/30 hover:lum-bg-violet-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=narwhalnose.birdflop.com:9100&orgId=1">
            <Blobs color='violet' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Narwhalnose
            </h3>
            <p>
              Ashburn, VA, USA
            </p>
            narwhalnose.birdflop.com
          </a>
          <a class="lum-card lum-bg-pink-900/30 hover:lum-bg-pink-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://telemetry.birdflop.com/d/stats/public-statistics?var-node=owlorgans.birdflop.com:9100&orgId=1">
            <Blobs color='pink' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h3 class="my-0!">
              Owlorgans
            </h3>
            <p>
              Falkenstein, Germany (EU)
            </p>
            owlorgans.birdflop.com
          </a>
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'Birdflop Node Stats',
  meta: [
    {
      name: 'description',
      content: 'Check the status of Birdflop\'s nodes.',
    },
    {
      name: 'og:description',
      content: 'Check the status of Birdflop\'s nodes.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};