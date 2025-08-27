import { component$, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';

import { unloadGoogleAds } from '~/util/GoogleAds';
import { privatePresetsContext, savedPresetsContext } from '../resources/rgb/presets';
import { useSession } from '~/routes/plugin@auth';
import { generateHead } from '~/root';
import MySavedPresets from '~/components/Rgbirdflop/MySavedPresets';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());
  const session = useSession();

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  return <MySavedPresets />;
});

export const head = generateHead({});