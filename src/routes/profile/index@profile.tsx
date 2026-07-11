import {
  component$,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";

import {
  privatePresetsContext,
  savedPresetsContext,
} from "../resources/rgb/presets";
import { useSession } from "~/routes/plugin@auth";
import { generateHead } from "~/root";
import MyPrivatePresets from "~/components/rgbirdflop/presets/MyPrivatePresets";
import UsersPublicPresets, {
  getUsersPresets,
} from "~/components/rgbirdflop/presets/UsersPublicPresets";
import { routeLoader$ } from "@qwik.dev/router";
import { Notification, NotificationContext } from "~/util/Notification";

export const useUser = routeLoader$(async ({ sharedMap }) => {
  const session = sharedMap.get("session") as { user: { id: string } } | null;
  if (!session) throw new Error("No session found");
  return getUsersPresets(session.user.id);
});

export default component$(() => {
  const notifications = useContext(NotificationContext);

  const session = useSession();

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const { userInfo, userPresets, errors } = useUser().value;
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle("Error fetching user data")
          .setDescription(`Error: ${error}`)
          .setBgColor("lum-grad-bg-red/50")
          .setPersist(true);
        notifications.push(notification);
      });
    }
  });

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
