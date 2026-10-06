import {
  component$,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';

import {
  privatePresetsContext,
  savedPresetsContext,
} from '../resources/rgb/presets';
import { useSession } from '~/routes/plugin@auth';
import { generateHead } from '~/root';
import MyPrivatePresets from '~/components/rgbirdflop/presets/MyPrivatePresets';
import UsersPublicPresets, {
  getUsersPresets,
} from '~/components/rgbirdflop/presets/UsersPublicPresets';
import { routeLoader$ } from '@qwik.dev/router';
import { Notification, NotificationContext } from '~/util/Notification';
import { Session } from '@auth/qwik';

export const useUser = routeLoader$(async ({ sharedMap }) => {
  const session = sharedMap.get('session') as Session | undefined;
  // Logged-out visitors still get the layout's "not logged in" screen,
  // which shows their debug ID — don't error the whole page.
  if (!session?.user?.id)
    return { userInfo: null, userPresets: [], errors: [] };
  return getUsersPresets(session.user.id);
});

export default component$(() => {
  const notifications = useContext(NotificationContext);

  const session = useSession();
  const loggedIn = !!session.value?.user;

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const { userInfo, userPresets, errors } = useUser().value;
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle('Error fetching user data')
          .setDescription(`Error: ${error}`)
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true);
        notifications.push(notification.toJSON());
      });
    }
  });

  // The layout shows the login prompt (with the debug ID) instead
  if (!loggedIn) return null;

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <UsersPublicPresets
        userInfo={userInfo}
        userPresets={userPresets}
        errors={errors}
      />
      <MyPrivatePresets />
    </section>
  );
});

export const head = generateHead({});
