import { component$, Signal, useContextProvider, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import { unloadGoogleAds } from '~/util/GoogleAds';
import { savedPresetStoreContext } from '../resources/rgb/presets';
import { BirdflopSession, useSession } from '../plugin@auth';
import PresetPreview from '~/components/rgb/PresetPreview';
import { publishedPreset } from '~/util/rgb/presets';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  const session = useSession() as Readonly<Signal<BirdflopSession>>;

  const savedPresetStore = useStore((session.value?.user?.savedPresets ?? []));
  useContextProvider(savedPresetStoreContext, savedPresetStore);

  const savedPresetsParsed: publishedPreset[] = [...savedPresetStore].map((preset) => ({
    name: preset.text ?? 'Birdflop',
    author: 'Personal',
    preset,
  }));

  return <div>
    <h2>
      My RGBirdflop Presets
    </h2>

    <div class="grid grid-cols-2 gap-2">
      {savedPresetsParsed.map((presetInfo) =>
        <PresetPreview key={`${presetInfo.name}-${presetInfo.author}`} presetInfo={presetInfo} />,
      )}
      <div class="lum-card lum-bg-gray-800/40 hover:lum-bg-gray-800 w-full transition duration-1000 hover:duration-75 ease-out">
        Stay tuned for a way to submit your own presets!
      </div>
    </div>
  </div>;
});

export const head: DocumentHead = {
  title: 'Profile',
  meta: [
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};