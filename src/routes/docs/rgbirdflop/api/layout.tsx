import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getGlobalHighlighter } from '~/util/highlighter';
import { apiEndpoints } from '~/routes/api/v2';

export const useEndpoints = routeLoader$(async ({ url }) => {
  const paths = Object.keys(apiEndpoints.endpoints) as (keyof typeof apiEndpoints.endpoints)[];
  const json: typeof apiEndpoints = JSON.parse(JSON.stringify(apiEndpoints));

  for (const path of paths) {
    const endpointData = await fetch(url.origin + path);
    const { options } = await endpointData.json() as any;

    const highlighter = await getGlobalHighlighter();

    const html = Object.keys(options).map(option => (
      highlighter.codeToHtml(`// ${options[option].description}
${option}: ${options[option].type} = ${JSON.stringify(options[option].default, null, 2)}`, {
        lang: 'ts',
        theme: 'birdflop',
        meta: {
          title: option,
          description: options[option].description,
        },
      })
    ));

    json.endpoints[path].html = html;
  }
  return json.endpoints;
});

export const Endpoints = component$(() => {
  const endpoints = useEndpoints().value;
  const endpointNames = Object.keys(endpoints) as (keyof typeof endpoints)[];

  return endpointNames.map((path) => <>
    <h3>
      {path}
    </h3>
    {Object.entries(endpoints[path].methods).map(([method, description]) =>
      <p key={method}>
        {method}: {description}
      </p>,
    )}
    <h4>
      Options
    </h4>
    {endpoints[path].html?.map((option, i) => <div key={i} dangerouslySetInnerHTML={option} />)}
  </>);
});