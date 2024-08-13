import { component$, Resource } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ButtonAnchor, Card } from '@luminescent/ui';

import analyzeProfile from '~/analyze/functions/analyzeProfile';
import { collector } from '~/analyze/functions/collector';

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
                <Card key={`field${i}`}>
                  <p class="text-white font-bold text-xl break-words">
                    {field.name.replace(/\./g, '\n> ')}
                  </p>
                  {field.value}
                  {field.buttons?.map((button: any, i2: number) => {
                    return (
                      <ButtonAnchor key={`button${i2}-${i}`} href={button.url}>
                        {button.text}
                      </ButtonAnchor>
                    );
                  })}
                </Card>
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

export const head: DocumentHead = {
  title: 'Analyze Timings',
  meta: [
    {
      name: 'description',
      content: 'Analyze your Paper Timings to get optimization recommendations',
    },
    {
      name: 'og:description',
      content: 'Analyze your Paper Timings to get optimization recommendations',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};