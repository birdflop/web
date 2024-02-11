import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import OutputField from '~/components/elements/OutputField';
import SelectInput from '~/components/elements/SelectInput';
import TextInput from '~/components/elements/TextInput';

import { inlineTranslate, useSpeak } from 'qwik-speak';

export default component$(() => {
  useSpeak({ assets: ['colorstrip'] });
  const t = inlineTranslate();

  const store = useStore({
    type: 0,
    input: '',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]">
      <div class="my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('colorstrip.title@@Color Code Stripper')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-12">
          {t('colorstrip.subtitle@@Strips all color / format codes from text')}
        </h2>

        <TextInput extraClass={{ 'mb-3': true }} id="input" onInput$={(event: any) => { store.input = event.target!.value; }}>
          {t('colorstrip.inputText@@Input Text')}
        </TextInput>

        <SelectInput id="gradienttype" label={t('colorstrip.colorCodeType@@Color Code Type')} onChange$={(event: any) => { store.type = event.target!.value; }}>
          <option value={0}>{'&#rrggbb'}</option>
          <option value={1}>{'<&#rrggbb>'}</option>
          <option value={2}>{'&x&r&r&g&g&b&b'}</option>
          <option value={3}>{'§x§r§r§g§g§b§b'}</option>
        </SelectInput>

        <div class="mt-3">
          <OutputField value={
            store.type == 0 ? store.input.replace(/&#([A-Fa-f0-9]){6}/g, '') :
              store.type == 1 ? store.input.replace(/<#([A-Fa-f0-9]){6}>/g, '') :
                store.type == 2 ? store.input.replace(/&x&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])&([A-Fa-f0-9])/g, '') :
                  store.input.replace(/§x§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])§([A-Fa-f0-9])/g, '')
          }>
            {t('colorstrip.output@@Output')}
          </OutputField>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Color Code Stripper',
  meta: [
    {
      name: 'description',
      content: 'Strips all color / format codes from text.',
    },
    {
      name: 'og:description',
      content: 'Strips all color / format codes from text.',
    },
    {
      name: 'og:image',
      content: 'https://birdflop.com/images/icon.png',
    },
  ],
};