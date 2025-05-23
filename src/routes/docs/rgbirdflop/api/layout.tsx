import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getGlobalHighlighter } from '~/util/highlighter';
export const useEndpoints = routeLoader$(async ({ url }) => {
  const data = await fetch(url.origin + '/api/v2');
  const json = await data.json() as any;
  const paths = Object.keys(json.endpoints);
  for (const path of paths) {
    const endpointData = await fetch(url.origin + path);
    const endpointJson = await endpointData.json() as any;
    json.endpoints[path] = { methods: json.endpoints[path], options: endpointJson.options };
  }
  return json;
});

const highlighter = await getGlobalHighlighter();

export const Endpoints = component$(() => {
  const { endpoints } = useEndpoints().value;

  return Object.keys(endpoints).map((path) => <>
    <h3>
      {path}
    </h3>
    {Object.entries(endpoints[path].methods).map(([method, description]) =>
      <p key={method}>
        {method}: {description as string}
      </p>,
    )}
    <h4>
      Options
    </h4>
    {Object.keys(endpoints[path].options).map(option => {
      const html = highlighter.codeToHtml(`// ${endpoints[path].options[option].description}
${option}: ${endpoints[path].options[option].type} = ${JSON.stringify(endpoints[path].options[option].default, null, 2)}`, {
        lang: 'ts',
        theme: 'birdflop',
        meta: {
          title: option,
          description: endpoints[path].options[option].description,
        },
      });
      return <>
        <div dangerouslySetInnerHTML={html} />
      </>;
    })}
  </>);
});