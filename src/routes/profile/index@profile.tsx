import { component$, useContextProvider, useSignal } from '@builder.io/qwik';

import { privatePresetsContext, savedPresetsContext } from '../resources/rgb/presets';
import { useSession } from '~/routes/plugin@auth';
import { generateHead } from '~/root';
import MyPrivatePresets from '~/components/Rgbirdflop/MyPrivatePresets';

export default component$(() => {

  const session = useSession();

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  return <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
    <MyPrivatePresets />
  </section>;
});

export const head = generateHead({});