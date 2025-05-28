import { component$, Signal, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';

import { unloadGoogleAds } from '~/util/GoogleAds';
import { savedPresetsContext } from '../resources/rgb/presets';
import { BirdflopSession, useSession } from '../plugin@auth';
import PresetPreview from '~/components/rgb/PresetPreview';
import { publishedPreset } from '~/util/rgb/presets';
import { generateHead } from '~/root';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  const session = useSession() as Readonly<Signal<BirdflopSession>>;

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const savedPresetsParsed: publishedPreset[] = [...savedPresets.value].map((preset) => ({
    name: preset.text ?? 'Birdflop',
    id: Math.round(Math.random() * 1000000),
    author: 'Personal',
    description: 'This preset was saved by you.',
    preset: preset,
    createdAt: new Date(),
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

export const head = generateHead({});