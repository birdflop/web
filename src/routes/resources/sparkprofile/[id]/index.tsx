import { component$, Resource } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import analyzeProfile from '~/util/analyze/functions/analyzeProfile';
import { collector } from '~/util/analyze/functions/collector';

export const useResults = routeLoader$(async ({ params }) => {
  const results = await analyzeProfile(params.id);
  try {
    await collector(params.id, 'https://api.profiler.birdflop.com', 'spark');
  } catch (error) {
    console.error('Collector error:', error);
  }
  return results;
});

import SparkProfile from '~/components/analyze/SparkProfile';
import { defaultDescription, generateHead } from '~/root';

export default component$(() => {
  const results = useResults();

  return (
    <SparkProfile>
      <div class="w-full my-12 grid grid-cols-3 gap-4">
        <Resource
          value={results}
          onPending={() => <p>Loading...</p>}
          onRejected={() => <p>Error</p>}
          onResolved={(fields: Field[]) => <>
            {fields.map((field: Field, i: number) => {
              return (
                <div class="lum-card" key={`field${i}`}>
                  <p class="font-bold text-xl break-words">
                    {field.name.replace(/\./g, '\n> ')}
                  </p>
                  {field.value}
                  {field.buttons?.map((button: any, i2: number) => {
                    return (
                      <a class="lum-btn" key={`button${i2}-${i}`} href={button.url}>
                        {button.text}
                      </a>
                    );
                  })}
                </div>
              );
            })}
          </>}
        />
      </div>
      <p class="text-white">
        Got another Spark Profile to analyze?
      </p>
    </SparkProfile>
  );
});

export const head = generateHead({
  title: 'Automatic Minecraft Spark Profile Analyzer - Birdflop',
  description: 'Analyze your Spark Profile to get optimization recommendations. Developed by Birdflop. ' + defaultDescription,
  ads: true,
});