import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Anchor } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

import { defaults, v3formats } from '~/util/PresetUtils';

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

export default component$(() => {
  const t = inlineTranslate();
  const { endpoints } = useEndpoints().value;

  return <>
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="flex flex-col gap-2 my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.hexGradient.title@@RGBirdflop')} API Documentation
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
        </h2>
        <h2 class="text-gray-100 text-xl sm:text-3xl font-semibold">
          Get Started
        </h2>
        <p>
          This API is used to generate RGB gradient text for Minecraft and is based on JSON. Useful for creating gradient text in your own code for anything Minecraft-related.
          The API has default values that are the same as the RGBirdflop website, which are also shown in the docs below.
          To generate a gradient, make a GET request to /api/v2/rgb. The API will return a JSON object with the gradient output.
        </p>
        <h2 class="text-gray-100 text-xl sm:text-3xl font-semibold">
          Endpoints
        </h2>
        <div>
          {Object.keys(endpoints).map((path) => <div key={path}>
            <h3 class="text-gray-100 text-lg sm:text-2xl mb-2">
              {path}
            </h3>
            {Object.entries(endpoints[path].methods).map(([method, description]) =>
              <p key={method} class="text-gray-400 sm:text-lg">
                {method}: {description as string}
              </p>,
            )}
            <h4 class="text-gray-400 sm:text-lg my-2">
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
        <h2 class="text-gray-100 text-xl sm:text-3xl font-semibold">
          Data Models
        </h2>
        <div class="lum-card lum-bg-gray-800 transition duration-1000 hover:duration-100 ease-in-out">
          <Anchor id="formatobject">
            <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
              Format
            </h2>
          </Anchor>
          <div>
            <p class="font-bold text-white">color</p>
            <p class="text-red-500">required</p>
            <p>type: string</p>
            <p class="text-gray-400">The format to use for the color codes. $1 = #(r)rggbb, $2 = #r(r)ggbb, $3 = #rr(g)gbb, $4 = #rrg(g)bb, $5 = #rrgg(b)b, $6 = #rrggb(b), $f = format tags, $c = the character</p>
            <p class="text-gray-500">example: "{defaults.format.color}" or "MiniMessage" or "JSON"</p>
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
          <div>
            <p class="font-bold text-white">obfuscate</p>
            <p>type: string</p>
            <p class="text-gray-400">The code to use for making the text obfuscated. $t is where the output text will go. If $t is not included, the output will not show.</p>
            <p class="text-gray-500">example: {v3formats.find(format => format.color == 'MiniMessage')?.obfuscate}</p>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800 transition duration-1000 hover:duration-100 ease-in-out">
          <Anchor id="color">
            <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
              Color
            </h2>
          </Anchor>
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