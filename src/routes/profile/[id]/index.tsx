import { component$, useContext, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { generateHead } from '~/root';
import { routeLoader$ } from '@builder.io/qwik-city';
import { useSession } from '~/routes/plugin@auth';
import { getPresets } from '~/util/rgb/presets';
import { Notification, NotificationContext } from '~/util/Notification';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';

import UsersPublicPresets, { getUsersPresets } from '~/components/Rgbirdflop/UsersPublicPresets';

export const useUser = routeLoader$(async ({ params }) => {
  return getUsersPresets(params.id);
});

export default component$(() => {
  const notifications = useContext(NotificationContext);

  const session = useSession();
  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If privatePresets is empty, load presets from localStorage
    if (privatePresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error loading saved presets')
        .setDescription(`Error: ${err}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    }
  });

  const { userInfo, userPresets, errors } = useUser().value;
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle('Error fetching user data')
          .setDescription(`Error: ${error}`)
          .setBgColor('lum-bg-red/50')
          .setPersist(true);
        notifications.push(notification);
      });
    }
  });

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        {userInfo.image &&
          <img src={userInfo.image} width={48} height={48} class="rounded-full!" />
        }
        {userInfo?.name || 'User'}
      </h1>
      <main>
        <UsersPublicPresets userInfo={userInfo} userPresets={userPresets} errors={errors} />
      </main>
    </section>
  );
});

export const head = generateHead({});