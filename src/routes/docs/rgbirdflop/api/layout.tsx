import { component$ } from '@builder.io/qwik';
import { getGlobalHighlighter } from '~/util/highlighter';
import { apiEndpoints } from '~/routes/api/v2';

const getEndpoints = async () => {
  const paths = Object.keys(apiEndpoints.endpoints) as (keyof typeof apiEndpoints.endpoints)[];
  const json: typeof apiEndpoints = JSON.parse(JSON.stringify(apiEndpoints));

  for (const path of paths) {
    const highlighter = await getGlobalHighlighter();
    const options = json.endpoints[path].options;
    const optionNames = Object.keys(options) as (keyof typeof options)[];

    const html = optionNames.map(option => {
      if (!options[option]) return '';
      return highlighter.codeToHtml(`// ${options[option].description}
${option}: ${options[option].type} = ${JSON.stringify(options[option].default, null, 2)}`, {
        lang: 'ts',
        theme: 'birdflop',
        meta: {
          title: option,
          description: options[option].description,
        },
      });
    });

    json.endpoints[path].html = html;
  }
  return json.endpoints;
};

const endpoints = await getEndpoints();

export const Endpoints = component$(() => {
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