import { component$, useBrowserVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';

export default component$(() => {
  const store: any = useStore({
    colors: []
  });

  useBrowserVisibleTask$(() => {
    store.colors = ['#D1552E', '#EB00FF'];
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js"></script>
      <div class="mt-10 min-h-[60px] p-20">
        <h1 class="font-bold tracking-tight text-purple-100 text-4xl mb-2">
          Hex Gradients
        </h1>
        <h2 class="font-bold tracking-tight text-purple-100 text-xl mb-24">
          Hex color gradient creator
        </h2>

        <h1 class="font-bold tracking-tight text-purple-100 text-4xl mb-2">
          Output
        </h1>
        <h2 class="font-bold tracking-tight text-purple-100 text-xl mb-4">
          This is what you put in the chat. Click on it to copy.
        </h2>
        <pre class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-4">
          &#d1552eS&#d5494ci&#d83d6am&#dc3188p&#e024a5l&#e418c3y&#e70ce1M&#eb00ffC
        </pre>

        <h1 class="tracking-tight text-6xl my-6">
          SimplyMC
        </h1>

        <div class="grid grid-cols-4 gap-2">
          <div class="overflow-auto max-h-[530px] pr-4">
            <label class="font-bold tracking-tight text-purple-100 text-xl">
              {store.colors.length} Colors
            </label>
            <div class="mt-2 mb-4">
              <a onClick$={() => {
                store.colors = [...store.colors, '#ffffff'];
              }} class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">Add</a>
              <a onClick$={() => {store.colors.pop(); store.colors = [...store.colors]}} class={`text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2 ml-2 ${store.colors.length < 3 && 'hidden'}`}>Remove</a>
            </div>
            {store.colors.map((color: string, i: number) => {
              return <>
                <label class="font-bold tracking-tight text-purple-100 text-xl">
                    Hex Color {i + 1}
                </label>
                <input id={`color${i + 1}`} value={color} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4" data-jscolor="{preset:'small dark', position:'right'}" onInput$={(event: any) => { console.log(event) }} />
                {i + 1 == store.colors.length && <script dangerouslySetInnerHTML={'jscolor.install()'}></script>}
              </>
            })}
          </div>
          <div class="col-span-3">
            <label class="font-bold tracking-tight text-purple-100 text-xl">
              Input Text
            </label>
            <input id="input" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4" />

            <label class="font-bold tracking-tight text-purple-100 text-xl">
              Output Format
            </label>
            <select id="format" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4" />

            <label class="font-bold tracking-tight text-purple-100 text-xl">
              Preset
            </label>
            <select id="preset" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4" />

            <label class="font-bold tracking-tight text-purple-100 text-xl">
              Custom Presets
            </label>
            <div class="mt-2 mb-4">
              <a class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">Export Preset</a>
              <a class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2 ml-2">Import Preset</a>
            </div>
            <div class="mt-6 mb-4 space-y-4">
              <Toggle id="bold" checked>
                Bold
              </Toggle>
              <Toggle id="italic" checked>
                Italic
              </Toggle>
              <Toggle id="underline" checked>
                Underline
              </Toggle>
              <Toggle id="strikethrough" checked>
                Strikethrough
              </Toggle>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Hex Gradient Creator',
  meta: [
    {
      name: 'description',
      content: 'Hex color gradient creator'
    },
    {
      name: 'og:description',
      content: 'Hex color gradient creator'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}