import { component$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import NumberInput from '~/components/elements/NumberInput';
import OutputField from '~/components/elements/OutputField';

import {
  $translate as t,
  Speak,
} from 'qwik-speak';

export default component$(() => {
  const store = useStore({
    ram: 4096,
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-80px)]">
      <Speak assets={['ramcalculator']}>
        <div class="my-10 min-h-[60px]">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('ramcalculator.title@@RAM Calculator')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-12">
            {t('ramcalculator.subtitle@@This will help calculate how much RAM to use for Aikar\'s Flags.')}
          </h2>

          <NumberInput id="ram" input value={store.ram} min={2048} step={256} onInput$={(event: any) => { store.ram = Number(event.target!.value); }} onIncrement$={() => { store.ram += 512; }} onDecrement$={() => { store.ram -= 512; }}>
            {t('ramcalculator.ramAmount@@RAM Amount')}
          </NumberInput>

          <OutputField id="OutPut" value={
            Math.ceil((11 * store.ram / 12 - 1200) / 100) * 100
          }>
            11({store.ram}) ÷ 12 - 1200 =
          </OutputField>
        </div>
      </Speak>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'RAM Calculator',
  meta: [
    {
      name: 'description',
      content: 'This will help calculate how much RAM to use for Aikar\'s Flags.',
    },
    {
      name: 'og:description',
      content: 'This will help calculate how much RAM to use for Aikar\'s Flags.',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};