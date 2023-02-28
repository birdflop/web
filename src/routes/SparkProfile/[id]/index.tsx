import { component$, Resource } from '@builder.io/qwik';
import { DocumentHead, loader$ } from '@builder.io/qwik-city';

import analyzeProfile from '~/analyze/functions/analyzeProfile';

export const useResults = loader$(async ({ params }) => {
  return await analyzeProfile(params.id);
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
          onResolved={(fields: Field[]) => {
            return (
              <>
                {fields.map((field: Field) => {
                  return (
                    <div class="bg-gray-800 p-6 flex flex-col gap-4 rounded-lg whitespace-pre-line">
                      <p class="text-white font-bold text-xl break-words">{field.name.replace(/\./g, '\n> ')}</p>
                      {field.value}
                      {field.buttons?.map((button: any) => {
                        return (
                          <a href={button.url} class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">
                            {button.text}
                          </a>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )
          }}
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
      content: 'Analyze your Paper Timings to get optimization recommendations'
    },
    {
      name: 'og:description',
      content: 'Analyze your Paper Timings to get optimization recommendations'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}