import { component$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import { loadPreset } from '~/components/util/PresetUtils';
import TextInput from '~/components/elements/TextInput';
import OutputField from '~/components/elements/OutputField';

export default component$(() => {
  const store = useStore({
    preset: 'ewAiAHYAZQByAHMAaQBvAG4AIgA6ADEALAAiAGMAbwBsAG8AcgBzACIAOgBbACIAIwAwADAARgBGAEUAMAAiACwAIgAjAEUAQgAwADAARgBGACIAXQAsACIAdABlAHgAdAAiADoAIgBTAGkAbQBwAGwAeQBNAEMAIgAsACIAcwBwAGUAZQBkACIAOgA1ADAALAAiAGYAbwByAG0AYQB0AHMAIgA6ADAALAAiAG8AdQB0AHAAdQB0AC0AZgBvAHIAbQBhAHQAIgA6ACIAMAAiACwAIgBjAHUAcwB0AG8AbQAtAGYAbwByAG0AYQB0ACIAOgAiACIALAAiAHQAeQBwAGUAIgA6ADAAfQA=',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-4xl mb-2">
          Preset Updater
        </h1>
        <h2 class="text-gray-50 text-xl mb-12">
          This will update older preset versions to the newest version.
        </h2>

        <TextInput id="Preset" value={store.preset} onInput$={(event: any) => { store.preset = event.target!.value; }}>
            Preset input
        </TextInput>

        <OutputField id="Output" value={
          JSON.stringify(loadPreset(store.preset), null, 2)
        } extraClass="h-96">
          Output
        </OutputField>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Preset Tools',
  meta: [
    {
      name: 'description',
      content: 'Random Tools for simplymc presets.',
    },
    {
      name: 'og:description',
      content: 'Random Tools for simplymc presets.',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};