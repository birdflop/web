import { component$ } from '@qwik.dev/core';
import { routeLoader$ } from '@qwik.dev/router';

import Analyze from '~/components/analyze/Analyze';
import { analyzeProfile, analyzeTimings, collector } from '@birdflop/analyze';
import { defaultDescription, generateHead } from '~/root';

export const useResults = routeLoader$(async ({ params }) => {
  // paper timings id is 32 characters and spark profile id is 10 characters
  // just in case spark decides to use more than 10, just check if it's less than 30 characters idk
  if (params.id.length < 30) {
    const results = await analyzeProfile(params.id);
    try {
      await collector(params.id, 'https://api.profiler.birdflop.com', 'spark');
    } catch (error) {
      console.error('Collector error:', error);
    }
    return results;
  } else {
    const results = await analyzeTimings(params.id);
    try {
      await collector(
        params.id,
        'https://api.profiler.birdflop.com',
        'timings'
      );
    } catch (error) {
      console.error('Collector error:', error);
    }
    return results;
  }
});

export default component$(() => {
  const results = useResults();

  return (
    <Analyze>
      <div class="my-12 grid w-full grid-cols-3 gap-4">
        {results.value.map((field, i) => {
          return (
            <div class="lum-card" key={`field${i}`}>
              <p class="text-xl font-bold wrap-break-word">
                {field.name.replace(/\./g, '\n> ')}
              </p>
              <p class="lum-text-secondary">{field.value}</p>
              {field.buttons?.map((button, i2) => {
                return (
                  <a class="lum-btn" key={`button${i2}-${i}`} href={button.url}>
                    {button.text}
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
      <p class="text-lum-text-secondary">
        Got another Spark Profile to analyze?
      </p>
    </Analyze>
  );
});

export const head = generateHead({
  title: 'Analysis Results - Birdflop',
  description: defaultDescription,
});
