import { component$, Resource } from '@builder.io/qwik';
import { DocumentHead, routeLoader$ } from '@builder.io/qwik-city';

import analyzeTimings from '~/analyze/functions/analyzeTimings';

export const useResults = routeLoader$(async ({ params }) => {
  return await analyzeTimings(params.id);
});

import PaperTimings from '~/components/analyze/PaperTimings';

export default component$(() => {
  const results = useResults();

  return (
    <PaperTimings>
      <div class="w-full my-12 grid grid-cols-3 gap-4">
        <Resource
          value={results}
          onPending={() => <p>Loading...</p>}
          onRejected={() => <p>Error</p>}
          onResolved={(fields: Field[]) => <>
            {fields.map((field: Field) => {
              return <>
                <div class="bg-gray-800 p-6 flex flex-col gap-4 rounded-lg whitespace-pre-line">
                  <p class="text-white font-bold text-xl break-words">{field.name.replace(/\./g, '\n> ')}</p>
                  {field.value}
                  {field.buttons?.map((button: any) => {
                    return <>
                      <a href={button.url} class="text-white bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">
                        {button.text}
                      </a>
                    </>;
                  })}
                </div>
              </>;
            })}
          </>}
        />
      </div>
      <p class="text-white">
        Got another Timings Report to analyze?
      </p>
    </PaperTimings>
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
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};