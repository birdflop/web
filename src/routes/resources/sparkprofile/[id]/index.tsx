import { component$, Resource } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';

import analyzeProfile from '~/analyze/functions/analyzeProfile';

const collector = server$(function (id: string) {
  const url = this.env.get('API_URL');
  if (!url) return;
  return fetch(url + '/spark', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).catch(error => {
    console.error('Fetch error:', error);
    return Promise.reject(error);
  });
});

// Qwik function to console.log API_URL environment variable
export const useEnv = server$(function () {
  console.log('API_URL:', this.env.get('API_URL'));
  return;
});

export const useResults = routeLoader$(async ({ params }) => {
  try {
    await collector(params.id);
  } catch (error) {
    console.error('Collector error:', error);
  }
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
          onResolved={(fields: Field[]) => <>
            {fields.map((field: Field, i: number) => {
              return (
                <div key={`field${i}`} class="bg-gray-800 p-6 flex flex-col gap-4 rounded-lg whitespace-pre-line">
                  <p class="text-white font-bold text-xl break-words">{field.name.replace(/\./g, '\n> ')}</p>
                  {field.value}
                  {field.buttons?.map((button: any, i2: number) => {
                    return (
                      <a key={`button${i2}-${i}`} href={button.url} class="text-white bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">
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
};