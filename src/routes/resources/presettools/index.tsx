import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { loadPreset } from '~/components/util/PresetUtils';

import {
  inlineTranslate,
  useSpeak,
} from 'qwik-speak';
import { TextArea, TextInput } from '@luminescent/ui';

export default component$(() => {
  useSpeak({ assets: ['presettools'] });
  const t = inlineTranslate();

  const store = useStore({
    preset: 'ewAiAHYAZQByAHMAaQBvAG4AIgA6ADEALAAiAGMAbwBsAG8AcgBzACIAOgBbACIAIwAwADAARgBGAEUAMAAiACwAIgAjAEUAQgAwADAARgBGACIAXQAsACIAdABlAHgAdAAiADoAIgBTAGkAbQBwAGwAeQBNAEMAIgAsACIAcwBwAGUAZQBkACIAOgA1ADAALAAiAGYAbwByAG0AYQB0AHMAIgA6ADAALAAiAG8AdQB0AHAAdQB0AC0AZgBvAHIAbQBhAHQAIgA6ACIAMAAiACwAIgBjAHUAcwB0AG8AbQAtAGYAbwByAG0AYQB0ACIAOgAiACIALAAiAHQAeQBwAGUAIgA6ADAAfQA=',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100svh)] pt-[72px]">
      <div class="my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('presettools.title@@Preset Updater')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-12">
          {t('presettools.subtitle@@This will update older preset versions to the newest version.')}
        </h2>
        <TextInput id="Preset" value={store.preset} onInput$={(event: any) => { store.preset = event.target!.value; }}>
          {t('presettools.input@@Preset Input')}
        </TextInput>

        <div class="mt-3">
          <TextArea output id="Output" value={
            JSON.stringify(loadPreset(store.preset), null, 2)
          } class={{ 'h-96': true }}>
            {t('presettools.output@@Output')}
          </TextArea>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Preset Tools',
  meta: [
    {
      name: 'description',
      content: 'Random Tools for birdflop presets.',
    },
    {
      name: 'og:description',
      content: 'Random Tools for birdflop presets.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};