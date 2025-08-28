import { component$, useContext, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import { useSession } from '~/routes/plugin@auth';
import { getPresets } from '~/util/rgb/presets';
import { NotificationContext } from '~/routes/layout';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import { ChevronLeft, Save } from 'lucide-icons-qwik';

import { getDB, users, presets, PublicPreset } from '~/util/db';
import { eq } from 'drizzle-orm';

export const useUser = routeLoader$(async ({ params }) => {
  const db = getDB();
  if (!db) throw new Error('No database connection');

  const userInfo = await db.select()
    .from(users)
    .where(eq(users.id, params.id))
    .get();

  if (!userInfo) throw new Error('User not found');

  let presetsFromDB: {
    user: typeof userInfo,
    preset: PublicPreset,
  }[] = [];
  const errors: string[] = [];
  try {
    presetsFromDB = await db.select({
      user: users,
      preset: presets,
    })
      .from(presets)
      .where(eq(presets.userId, userInfo.id))
      .innerJoin(users, eq(users.id, presets.userId))
      .then((r) => r ?? []);
  }
  catch (err) {
    errors.push(`Error fetching presets: ${err}`);
  }

  const userPresets = presetsFromDB.map(({ user, preset }) => ({
    ...preset,
    user: user,
  }));

  return { userInfo, userPresets, errors };
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
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error parsing saved presets',
        description: `Error: ${err}`,
        bgColor: 'lum-bg-red/50',
      };
      notifications.push(notification);
      setTimeout(() => {
        notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
      }, 2000);
    }
  });

  const { userInfo, userPresets, errors } = useUser().value;
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        const id = Math.random().toString(36).substring(2, 15);
        const notification = {
          id,
          title: 'Error fetching user data',
          description: `${error}`,
          bgColor: 'lum-bg-red/50',
        };
        notifications.push(notification);
      });
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <div class="flex items-center">
          <h1 class="flex gap-4 items-center my-3! flex-1">
            {userInfo.image &&
              <img src={userInfo.image} width={70} height={70} class="rounded-full! w-17 h-17" />
            }
            {userInfo?.name || 'User'}
          </h1>
        </div>
        <hr />
        <main>
          {userPresets.length > 0 && <div>
            <h3 class="flex gap-2 items-center">
              <Save size={30} />
              <span class="flex-1">
                {userInfo?.name || 'User'}'s Public RGBirdflop Presets
              </span>
              <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
                <ChevronLeft size={20} /> Go to presets
              </Link>
            </h3>
            <div class="grid sm:grid-cols-2 gap-2">
              {userPresets.map((preset) => (
                <PresetPreview key={preset.id} Preset={preset} />
              ))}
            </div>
          </div>}
        </main>
      </div>
    </section>
  );
});

export const head = generateHead({});