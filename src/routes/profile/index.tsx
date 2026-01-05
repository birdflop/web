import { component$, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';

import { privatePresetsContext, savedPresetsContext } from '../resources/rgb/presets';
import { useSession } from '~/routes/plugin@auth';
import { generateHead } from '~/root';
import MyPrivatePresets from '~/components/Rgbirdflop/MyPrivatePresets';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  const session = useSession();

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  return <MyPrivatePresets />;
});

export const head = generateHead({});