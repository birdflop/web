import { component$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const store = useStore({
      ram: 4096,
      gradientType: 0,
      gradientInput: ''
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold text-purple-100 text-4xl mb-2">
          Random Misc minecraft server tools
        </h1>
        <h2 class="text-purple-100 text-xl mb-24">
          These are all random useful things that are too small to dedicate a whole page to.
        </h2>

        <h1 class="font-bold text-purple-100 text-4xl mb-2">
          RAM Calculator
        </h1>
        <h2 class="text-purple-100 text-xl mb-2">
          This will help calculate how much RAM to use for Aikar's Flags.
        </h2>
        
        <label for="ram">RAM Amount</label>
        <div class="flex w-48 h-9 mt-2.5">
          <button data-action="decrement" onClick$={() => {store.ram -= 512}} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-l-lg cursor-pointer">
              -
          </button>
          <input type="number" id="ram" onInput$={(event: any) => {store.ram = event.target!.value}} class="text-sm text-center w-full bg-gray-700 placeholder-gray-400 text-white focus:bg-gray-600 appearance-none" value={store.ram} />
          <button data-action="increment" onClick$={() => {store.ram += 512}} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-r-lg cursor-pointer">
              +
          </button>
        </div>
        <p class="py-4">
          11({store.ram}) ÷ 12 - 1200 =
        </p>
        <pre class="w-48 text-lg text-center bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2">
          {Math.ceil((11 * store.ram / 12 - 1200) / 100) * 100}
        </pre>

        <h1 class="font-bold text-purple-100 text-4xl mb-2 mt-16">
          Gradient Decoder
        </h1>
        <h2 class="text-purple-100 text-xl mb-2">
          Strips all color/format codes from text
        </h2>

        <label for="gradientinput">Text</label>
        <input id="gradientinput" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mb-4" onInput$={(event: any) => {store.gradientInput = event.target!.value}} />
        <p>Gradient Type</p>
        <select class="text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mb-4" onChange$={(event: any) => {store.gradientType = event.target!.value}}>
          <option value={0}>{'&#rrggbb'}</option>
          <option value={1}>{'<&#rrggbb>'}</option>
          <option value={2}>{'&x&r&r&g&g&b&b'}</option>
          <option value={3}>{'§x§r§r§g§g§b§b'}</option>
        </select>
        <p>Output</p>
        <pre class="text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2">
          {
            store.gradientType == 0 ? store.gradientInput.replace(/&#([A-Fa-f0-9]){6}/g, "") :
            store.gradientType == 1 ? store.gradientInput.replace(/<#([A-Fa-f0-9]){6}>/g, "") :
            store.gradientType == 2 ? store.gradientInput.replace(/&x&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])/g, "") :
            store.gradientInput.replace(/§x§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])/g, "")
          }
        </pre>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Misc Tools',
  meta: [
    {
      name: 'description',
      content: 'Random minecraft server tools'
    },
    {
      name: 'og:description',
      content: 'Random minecraft server tools'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}