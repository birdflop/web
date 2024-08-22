import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '@luminescent/ui-qwik';

import { DocumentOutline } from 'qwik-ionicons';
import { defaults, v3formats } from '~/components/util/PresetUtils';

export const useEndpoints = routeLoader$(async ({ url }) => {
  const data = await fetch(url.origin + '/api/v2');
  const json = await data.json();
  const paths = Object.keys(json.endpoints);
  for (const path of paths) {
    const endpointData = await fetch(url.origin + path);
    const endpointJson = await endpointData.json();
    json.endpoints[path] = { methods: json.endpoints[path], options: endpointJson.options };
  }
  return json;
});

export default component$(() => {
  const { endpoints } = useEndpoints().value;

  return <>
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 py-16 min-h-svh">
      <div>
        <h1 class="flex gap-4 items-center text-gray-100 text-2xl sm:text-4xl font-bold my-12 drop-shadow-lg">
          <DocumentOutline width="64" /> RGBirdflop API Docs
        </h1>
        <h2 class="flex gap-4 items-center text-gray-100 text-xl sm:text-3xl font-bold mb-3 drop-shadow-lg">
          Get Started
        </h2>
        <p>
          This API is used to generate RGB gradient text for Minecraft and is based on JSON. Useful for creating gradient text in your own code for anything Minecraft-related.
          The API has default values that are the same as the RGBirdflop website, which are also shown in the docs below.
          To generate a gradient, make a GET request to /api/v2/rgb. The API will return a JSON object with the gradient output.
        </p>
        <h2 class="flex gap-4 items-center text-gray-100 text-xl sm:text-3xl font-bold mt-12 mb-6 drop-shadow-lg">
          Endpoints
        </h2>
        <div>
          {Object.keys(endpoints).map((path) => <div key={path}>
            <h3 class="flex gap-4 items-center text-gray-100 text-lg sm:text-2xl font-bold mb-2 drop-shadow-lg">
              {path}
            </h3>
            {(Object.entries(endpoints[path].methods) as [string, string][]).map(([method, description]) =>
              <p key={method} class="flex gap-4 items-center text-gray-400 sm:text-lg drop-shadow-lg">
                {method}: {description}
              </p>,
            )}
            <h4 class="flex gap-4 items-center text-gray-400 sm:text-lg my-2 drop-shadow-lg">
              Options
            </h4>
            <div class="lum-card lum-bg-gray-800 transition duration-1000 hover:duration-100 ease-in-out" >
              {Object.keys(endpoints[path].options).map(option => {
                return <div key={option}>
                  <p class="font-bold text-white">{option}</p>
                  <p>type: {endpoints[path].options[option].type}</p>
                  <p class="text-gray-400">{endpoints[path].options[option].description}</p>
                  <p class="text-gray-500">default: {JSON.stringify(endpoints[path].options[option].default, null, 1)}</p>
                </div>;
              })}
            </div>
          </div>)}
        </div>
        <h2 class="flex gap-4 items-center text-gray-100 text-xl sm:text-3xl font-bold mt-12 mb-6 drop-shadow-lg">
          Data Models
        </h2>
        <div class="lum-card lum-bg-gray-800 transition duration-1000 hover:duration-100 ease-in-out" >
          <Header id="formatobject" anchor>
            Format
          </Header>
          <div>
            <p class="font-bold text-white">color</p>
            <p class="text-red-500">required</p>
            <p>type: string</p>
            <p class="text-gray-400">The format to use for the color codes. $1 = #(r)rggbb, $2 = #r(r)ggbb, $3 = #rr(g)gbb, $4 = #rrg(g)bb, $5 = #rrgg(b)b, $6 = #rrggb(b), $f = format tags, $c = the character</p>
            <p class="text-gray-500">example: "{defaults.format.color}" or "MiniMessage"</p>
          </div>
          <div>
            <p class="font-bold text-white">char</p>
            <p>type: string</p>
            <p class="text-gray-400">The character to use for the format tags. (such as &l, &o, &n, &m)</p>
            <p class="text-gray-500">example: "{defaults.format.char}"</p>
          </div>
          <div>
            <p class="font-bold text-white">bold</p>
            <p>type: string</p>
            <p class="text-gray-400">The code to use for making the text bold. $t is where the output text will go. If $t is not included, the output will not show.</p>
            <p class="text-gray-500">example: {v3formats.find(format => format.color == 'MiniMessage')?.bold}</p>
          </div>
          <div>
            <p class="font-bold text-white">italic</p>
            <p>type: string</p>
            <p class="text-gray-400">The code to use for making the text italic. $t is where the output text will go. If $t is not included, the output will not show.</p>
            <p class="text-gray-500">example: {v3formats.find(format => format.color == 'MiniMessage')?.italic}</p>
          </div>
          <div>
            <p class="font-bold text-white">underline</p>
            <p>type: string</p>
            <p class="text-gray-400">The code to use for making the text underline. $t is where the output text will go. If $t is not included, the output will not show.</p>
            <p class="text-gray-500">example: {v3formats.find(format => format.color == 'MiniMessage')?.underline}</p>
          </div>
          <div>
            <p class="font-bold text-white">strikethrough</p>
            <p>type: string</p>
            <p class="text-gray-400">The code to use for making the text strikethrough. $t is where the output text will go. If $t is not included, the output will not show.</p>
            <p class="text-gray-500">example: {v3formats.find(format => format.color == 'MiniMessage')?.strikethrough}</p>
          </div>
        </div>
        <br/>
        <div class="lum-card lum-bg-gray-800 transition duration-1000 hover:duration-100 ease-in-out" >
          <Header id="color" anchor>
            Color
          </Header>
          <div>
            <p class="font-bold text-white">hex</p>
            <p class="text-red-500">required</p>
            <p>type: string</p>
            <p class="text-gray-400">The color in hex format.</p>
            <p class="text-gray-500">example: "#00ffe0"</p>
          </div>
          <div>
            <p class="font-bold text-white">pos</p>
            <p class="text-red-500">required</p>
            <p>type: number</p>
            <p class="text-gray-400">The position of the color in the gradient as a percentage</p>
            <p class="text-gray-500">example: 50</p>
          </div>
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'RGBirdflop API Docs',
  meta: [
    {
      name: 'description',
      content: 'This API is used to generate RGB gradient text for Minecraft',
    },
    {
      name: 'og:description',
      content: 'This API is used to generate RGB gradient text for Minecraft',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};