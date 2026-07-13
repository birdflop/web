import {
  component$,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';
import { generateHead } from '~/root';
import { Link, server$ } from '@qwik.dev/router';
import PresetPreview from '~/components/rgbirdflop/presets/PresetPreview';
import { useSession } from '~/routes/plugin@auth';
import { getPresets } from '~/util/rgb/presets';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  privatePresetsContext,
  savedPresetsContext,
} from '~/routes/resources/rgb/presets';
import ChevronLeft from 'lucide-icons-qwik/icons/ChevronLeft';
import Save from 'lucide-icons-qwik/icons/Save';

import { inlineTranslate } from 'qwik-speak';
import { getDB, presets, PublicPreset, User, users } from '~/util/db';
import { eq } from 'drizzle-orm';

export const getUsersPresets = server$(async (userId: string) => {
  const db = getDB();
  if (!db) throw new Error('No database connection');

  const userInfo = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!userInfo) throw new Error('User not found');

  let presetsFromDB: {
    user: typeof userInfo;
    preset: PublicPreset;
  }[] = [];
  const errors: string[] = [];
  try {
    presetsFromDB = await db
      .select({
        user: users,
        preset: presets,
      })
      .from(presets)
      .where(eq(presets.userId, userInfo.id))
      .innerJoin(users, eq(users.id, presets.userId))
      .then((r) => r ?? []);
  } catch (err) {
    errors.push(
      `Error fetching presets: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const userPresets = presetsFromDB.map(({ user, preset }) => ({
    ...preset,
    user: user,
  }));

  return { userInfo, userPresets, errors };
});

export default component$(
  ({
    userInfo,
    userPresets,
    errors,
  }: {
    userInfo: User;
    userPresets: PublicPreset[];
    errors: string[];
  }) => {
    const notifications = useContext(NotificationContext);
    const t = inlineTranslate();

    const session = useSession();
    const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
    useContextProvider(privatePresetsContext, privatePresets);

    const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
    useContextProvider(savedPresetsContext, savedPresets);

    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      // If privatePresets is empty, load presets from localStorage
      if (privatePresets.value.length != 0) return;

      try {
        const localStoragePresets = getPresets();
        privatePresets.value = privatePresets.value.concat(localStoragePresets);
      } catch (err) {
        const notification = new Notification()
          .setTitle('Error loading saved presets')
          .setDescription(
            `Error: ${err instanceof Error ? err.message : String(err)}`
          )
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true);
        notifications.push(notification);
      }
    });

    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      if (errors.length > 0) {
        errors.forEach((error) => {
          const notification = new Notification()
            .setTitle('Error fetching user data')
            .setDescription(`Error: ${error}`)
            .setBgColor('lum-grad-bg-red/50')
            .setPersist(true);
          notifications.push(notification);
        });
      }
    });

    return (
      <>
        {userPresets.length > 0 && (
          <div class="mt-4">
            <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Save size={30} />
              <span class="flex-1">
                {userInfo?.name || 'User'}'s Public RGBirdflop Presets
              </span>
              <Link
                href="/resources/rgb/presets"
                class="lum-btn lum-bg-transparent"
              >
                <ChevronLeft size={20} />{' '}
                {t('rgb.presets.back@@Back to presets')}
              </Link>
            </h2>
            <div class="grid gap-2 sm:grid-cols-2">
              {userPresets.map((preset) => (
                <PresetPreview key={preset.id} Preset={preset} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }
);

export const head = generateHead({});
