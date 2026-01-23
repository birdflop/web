import { component$, useContext, useContextProvider, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import PresetPreview from '~/components/Rgbirdflop/PresetPreview';
import { useSession } from '~/routes/plugin@auth';
import { getPresets } from '~/util/rgb/presets';
import { Notification, NotificationContext } from '~/util/Notification';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import { ChevronLeft, Save } from 'lucide-icons-qwik';

import { getDB, users, presets, PublicPreset } from '~/util/db';
import { eq } from 'drizzle-orm';
import { inlineTranslate } from 'qwik-speak';

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
  const t = inlineTranslate();

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
      <h1 class="flex gap-3 text-2xl! items-center my-2!">
        {userInfo.image &&
          <img src={userInfo.image} width={48} height={48} class="rounded-full!" />
        }
        {userInfo?.name || 'User'}
      </h1>
      <main>
        {userPresets.length > 0 && <div>
          <h3 class="flex gap-2 items-center">
            <Save size={30} />
            <span class="flex-1">
              {userInfo?.name || 'User'}'s Public RGBirdflop Presets
            </span>
            <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
              <ChevronLeft size={20} /> {t('rgb.presets.back@@Back to presets')}
            </Link>
          </h3>
          <div class="grid sm:grid-cols-2 gap-2">
            {userPresets.map((preset) => (
              <PresetPreview key={preset.id} Preset={preset} />
            ))}
          </div>
        </div>}
      </main>
    </section>
  );
});

export const head = generateHead({});