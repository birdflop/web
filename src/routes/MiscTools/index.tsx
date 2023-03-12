import { component$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import NumberInput from '~/components/elements/NumberInput';
import OutputField from '~/components/elements/OutputField';
import SelectInput from '~/components/elements/SelectInput';
import TextInput from '~/components/elements/TextInput';

export default component$(() => {
  const store = useStore({
    ram: 4096,
    gradientType: 0,
    gradientInput: '',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-4xl mb-2">
          Random Misc minecraft server tools
        </h1>
        <h2 class="text-gray-50 text-xl mb-12">
          These are all random useful things that are too small to dedicate a whole page to.
        </h2>

        <h1 class="font-bold text-gray-50 text-3xl mb-2">
          RAM Calculator
        </h1>
        <h2 class="text-gray-50 text-lg mb-2">
          This will help calculate how much RAM to use for Aikar's Flags.
        </h2>

        <NumberInput id="ram" input value={store.ram} min={2048} step={256} onInput$={(event: any) => { store.ram = Number(event.target!.value); }} onIncrement$={() => { store.ram += 512; }} onDecrement$={() => { store.ram -= 512; }}>
          RAM Amount
        </NumberInput>

        <OutputField value={
          Math.ceil((11 * store.ram / 12 - 1200) / 100) * 100
        }>
          11({store.ram}) ÷ 12 - 1200 =
        </OutputField>

        <h1 class="font-bold text-gray-50 text-3xl mb-2 mt-12">
          Gradient Decoder
        </h1>
        <h2 class="text-gray-50 text-lg mb-2">
          Strips all color/format codes from text
        </h2>

        <TextInput id="gradientinput" onInput$={(event: any) => { store.gradientInput = event.target!.value; }}>
          Input Text
        </TextInput>

        <SelectInput id="gradienttype" label="Gradient Type" onChange$={(event: any) => { store.gradientType = event.target!.value; }}>
          <option value={0}>{'&#rrggbb'}</option>
          <option value={1}>{'<&#rrggbb>'}</option>
          <option value={2}>{'&x&r&r&g&g&b&b'}</option>
          <option value={3}>{'§x§r§r§g§g§b§b'}</option>
        </SelectInput>

        <OutputField value={
          store.gradientType == 0 ? store.gradientInput.replace(/&#([A-Fa-f0-9]){6}/g, '') :
            store.gradientType == 1 ? store.gradientInput.replace(/<#([A-Fa-f0-9]){6}>/g, '') :
              store.gradientType == 2 ? store.gradientInput.replace(/&x&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])/g, '') :
                store.gradientInput.replace(/§x§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])/g, '')
        }>
          Output
        </OutputField>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Misc Tools',
  meta: [
    {
      name: 'description',
      content: 'These are all random useful things that are too small to dedicate a whole page to.',
    },
    {
      name: 'og:description',
      content: 'These are all random useful things that are too small to dedicate a whole page to.',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};