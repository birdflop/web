import {
  component$,
  isBrowser,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { useSession } from '~/routes/plugin@auth';
import { getPresets, rgbPreset } from '~/util/rgb/presets';
import Check from 'lucide-icons-qwik/icons/Check';
import ChevronLeft from 'lucide-icons-qwik/icons/ChevronLeft';
import Copy from 'lucide-icons-qwik/icons/Copy';
import Loader2 from 'lucide-icons-qwik/icons/Loader2';
import Minus from 'lucide-icons-qwik/icons/Minus';
import MousePointer2 from 'lucide-icons-qwik/icons/MousePointer2';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Save from 'lucide-icons-qwik/icons/Save';
import Trash from 'lucide-icons-qwik/icons/Trash';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@qwik.dev/router';
import { NotificationContext, Notification } from '~/util/Notification';
import Input, { previewStyleContext } from '~/components/rgbirdflop/Input';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { SelectMenu } from '@luminescent/ui-qwik';
import { Birdflop, Luminescent } from '@luminescent/icons-qwik';
import {
  savePreset,
  unsavePreset,
  updatePreset,
  deletePreset,
} from '~/util/dataUtils';
import { privatePresetsContext, savedPresetsContext } from '..';
import { getDB, presets, PublicPreset, savedPresets, users } from '~/util/db';
import { eq } from 'drizzle-orm';
import { useIsAdmin } from '~/routes/layout-profile';
import { discordLink, donateLink } from '~/components/Elements/Nav';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';

export const usePreset = routeLoader$(async ({ params }) => {
  const db = getDB();
  if (!db) throw new Error('No database connection');
  if (isNaN(Number(params.id))) throw new Error('No preset ID provided');

  const presetInfo = await db
    .select({
      presets,
      user: users,
    })
    .from(presets)
    .leftJoin(users, eq(users.id, presets.userId))
    .leftJoin(savedPresets, eq(savedPresets.presetId, presets.id))
    .where(eq(presets.id, Number(params.id)))
    .groupBy(presets.id, users.id)
    .get();

  if (!presetInfo) throw new Error('Preset not found');

  return {
    ...presetInfo.presets,
    user: presetInfo.user,
  };
});

export default component$(() => {
  const t = inlineTranslate();
  const presetCopiedTitle = t('rgb.presets.copied.title@@Preset Copied!');
  const presetCopiedDescription = t(
    'rgb.presets.copied.description@@Successfully copied preset to clipboard!'
  );
  const copyFailedTitle = t('rgb.copyFailed@@Failed to copy to clipboard!');

  const notifications = useContext(NotificationContext);
  const isLoading = useSignal(false);

  const session = useSession();
  const presetInfo = usePreset().value;

  const isOwner = session.value?.user?.id === presetInfo.userId;
  const isAdmin = useIsAdmin().value;

  const rgbStore = useStore(
    {
      ...rgbDefaults,
      ...presetInfo.preset,
      text: presetInfo.name,
    },
    { deep: true }
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const privatePresets = useSignal<rgbPreset[]>(
    session.value?.user?.privatePresets ?? []
  );
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal<PublicPreset[]>(
    session.value?.user?.savedPresets ?? []
  );
  useContextProvider(savedPresetsContext, savedPresets);

  const existingPreset =
    savedPresets.value.find((savedPreset) => {
      return savedPreset.id === presetInfo.id;
    })?.preset ||
    privatePresets.value.find((savedPreset) => {
      return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
    });

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (
    Object.entries(params) as Array<[keyof typeof combinedDefaults, unknown]>
  ).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null)
      value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If savedPresets is empty, load presets from localStorage
    if (savedPresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error parsing saved presets')
        .setDescription(
          `Error: ${err instanceof Error ? err.message : String(err)}`
        )
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    }
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Save size={32} />
        {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.'
        )}
      </p>

      <div class="flex">
        <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
          <ChevronLeft size={20} /> {t('rgb.presets.back@@Back to presets')}
        </Link>
      </div>

      {presetInfo.pending && (
        <p class="my-5 text-2xl font-bold text-yellow-500!">
          {t(
            'rgb.presets.pending@@This preset is pending review and may not be available to other users yet.'
          )}
        </p>
      )}

      <h6
        class={{
          'flex items-center gap-2': true,
          'text-blue-300/80!': !presetInfo.user,
          'text-orange-300/80!': !!presetInfo.user,
        }}
      >
        {presetInfo.user && (
          <Link
            href={`/profile/${presetInfo.user.id}`}
            class="lum-btn lum-bg-transparent -ml-1 cursor-pointer p-1 text-xl font-semibold text-inherit!"
          >
            {presetInfo.user.image && presetInfo.user.name && (
              <img
                src={presetInfo.user.image}
                alt={presetInfo.user.name}
                width={32}
                height={32}
                class="h-8 w-8 rounded-full!"
              />
            )}
            {presetInfo.user.name}
          </Link>
        )}
        {presetInfo.author && !presetInfo.user && (
          <>
            {presetInfo.author == 'RGBirdflop' && (
              <Birdflop size={32} fillGradient={['#54daf4', '#545eb6']} />
            )}
            {presetInfo.author == 'SimplyMC' && (
              <Luminescent size={32} class="text-luminescent-300" />
            )}
            {presetInfo.author.includes('GitHub') && (
              <span class="fill-current">
                <SiGithub size={32} />
              </span>
            )}
            {presetInfo.author}
          </>
        )}
      </h6>
      <p class="mb-2">
        {t('rgb.presets.createdAt@@Created at')}{' '}
        {new Date(presetInfo.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      {isAdmin || isOwner ? (
        <input
          type="text"
          class="lum-input mb-4 w-full"
          value={presetInfo.description}
          onChange$={async (e, el) => {
            presetInfo.description = el.value;
            await updatePreset(presetInfo.id, {
              description: presetInfo.description,
            });
            window.location.reload();
          }}
        />
      ) : (
        <p class="mb-5 text-white!">{presetInfo.description}</p>
      )}

      <div class="flex gap-2">
        <SelectMenu
          id={`use-${presetInfo.name}-${presetInfo.author}`}
          hover
          customDropdown
          class={{
            'lum-grad-bg-orange hover:bg-orange hidden gap-1 text-sm sm:flex': true,
          }}
        >
          <span q:slot="dropdown" class="flex items-center gap-3">
            <MousePointer2 size={20} /> {t('rgb.presets.use@@Use')}
          </span>
          <Link
            href={`/resources/rgb?${searchParams.toString()}`}
            q:slot="extra-buttons"
            class="lum-btn lum-bg-transparent rounded-lum-1 w-full"
          >
            <Palette size={20} />{' '}
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </Link>
          <Link
            href={`/resources/animtab?${searchParams.toString()}`}
            q:slot="extra-buttons"
            class="lum-btn lum-bg-transparent rounded-lum-1 w-full"
          >
            <Rainbow size={20} />{' '}
            {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </Link>
        </SelectMenu>
        <button
          class={{
            'lum-btn text-sm': true,
            'lum-grad-bg-green hover:bg-green': !privatePresets.value.find(
              (savedPreset) =>
                JSON.stringify(savedPreset) ===
                JSON.stringify(presetInfo.preset)
            ),
            'lum-grad-bg-red hover:bg-red': !!privatePresets.value.find(
              (savedPreset) =>
                JSON.stringify(savedPreset) ===
                JSON.stringify(presetInfo.preset)
            ),
          }}
          disabled={isLoading.value}
          onClick$={async () => {
            isLoading.value = true;

            if (existingPreset) {
              privatePresets.value = privatePresets.value.filter(
                (p) => p !== existingPreset
              );
              if (presetInfo.id) {
                savedPresets.value = savedPresets.value.filter(
                  (p) => p.id !== presetInfo.id
                );
                await unsavePreset(presetInfo.id);
              }
            } else {
              privatePresets.value = [
                ...privatePresets.value,
                presetInfo.preset,
              ];
              if (presetInfo.id) {
                savedPresets.value = [...savedPresets.value, presetInfo];
                await savePreset(presetInfo.id);
              }
            }

            if (isBrowser)
              localStorage.setItem(
                'privatePresets',
                JSON.stringify(privatePresets.value)
              );
            isLoading.value = false;
          }}
        >
          {!isLoading.value && presetInfo.saves}
          {isLoading.value && <Loader2 size={12} class="animate-spin" />}
          {privatePresets.value.find(
            (savedPreset) =>
              JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset)
          ) ? (
            <>
              <Trash size={20} /> {t('rgb.presets.remove@@Remove')}
            </>
          ) : (
            <>
              <Save size={20} /> {t('rgb.presets.save@@Save')}
            </>
          )}
        </button>
        <button
          class="lum-btn lum-grad-bg-purple hover:bg-purple text-sm"
          disabled={isLoading.value}
          onClick$={() => {
            const notification = new Notification()
              .setTitle(presetCopiedTitle)
              .setDescription(presetCopiedDescription)
              .setBgColor('lum-grad-bg-green/50');
            navigator.clipboard
              .writeText(JSON.stringify(presetInfo.preset))
              .catch((err) => {
                notification
                  .setTitle(copyFailedTitle)
                  .setDescription('Error: ' + err)
                  .setBgColor('lum-grad-bg-red/50')
                  .setPersist(true);
              });
            notifications.push(notification);
          }}
        >
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>
      </div>
      <div class="mt-6 flex flex-col gap-4">
        <div>
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            {t('rgb.presets.preview@@Preset Preview')}
          </h3>
          <Input noLabel>
            <RgbPreview
              q:slot="input"
              shadowLength={previewStyle.value == 'default' ? 4 : 2}
            />
          </Input>
        </div>

        <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
          {t('rgb.presets.presetData@@Preset Data')}
        </h3>
        <div class="lum-card lum-grad-bg-gray-800 font-bold text-white!">
          {Object.keys(presetInfo.preset).map((key) => (
            <div
              key={key}
              class="lum-card lum-bg-transparent flex flex-row gap-2 p-0 transition-colors hover:bg-gray-900/50"
            >
              {isAdmin && (
                <button
                  class="lum-btn lum-bg-transparent hover:lum-bg-red p-1 text-red-300"
                  onClick$={async () => {
                    delete presetInfo.preset[
                      key as keyof typeof presetInfo.preset
                    ];
                    const updatedPreset = await updatePreset(presetInfo.id, {
                      preset: presetInfo.preset,
                    });
                    window.location.reload();
                    console.log('Updated preset:', updatedPreset);
                  }}
                >
                  <Trash size={16} />
                </button>
              )}
              <span class="text-lum-text-secondary font-mono">{key}:</span>
              <span class="font-mono">
                {JSON.stringify(
                  presetInfo.preset[key as keyof typeof presetInfo.preset],
                  null,
                  2
                )}
              </span>
            </div>
          ))}
        </div>

        {(isAdmin ||
          (isOwner && (presetInfo.pending || presetInfo.saves < 1))) && (
          <div class="lum-card lum-grad-bg-red/20">
            <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              Manage Preset
            </h3>
            {isOwner && (
              <p class="mb-2">
                You are the owner of this preset.
                {presetInfo.saves < 1 &&
                  ' Since this preset has no saves, you can safely delete it if you no longer want it to be available.'}
              </p>
            )}
            {isOwner && presetInfo.pending && (
              <p class="mb-2 text-yellow-500!">
                This preset is pending review. You can either delete it or wait
                for an admin to review and approve it. Once approved and the
                preset has saves, it will not be able to be deleted. If you want
                to delete this preset after it's approved, please contact us on{' '}
                <a
                  href={discordLink}
                  target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  Discord
                </a>
                .
              </p>
            )}
            <div class="flex items-center gap-1">
              {isAdmin && presetInfo.pending && (
                <button
                  class="lum-btn lum-bg-green hover:bg-green"
                  onClick$={async () => {
                    await updatePreset(presetInfo.id, { pending: false });
                    window.location.assign(
                      '/resources/rgb/presets?showPending=true'
                    );
                  }}
                >
                  <Check size={20} /> Approve
                </button>
              )}
              {isAdmin && !presetInfo.pending && (
                <button
                  class="lum-btn lum-bg-yellow hover:bg-yellow"
                  onClick$={async () => {
                    await updatePreset(presetInfo.id, { pending: true });
                    window.location.assign(
                      '/resources/rgb/presets?showPending=true'
                    );
                  }}
                >
                  <Minus size={20} /> Unapprove
                </button>
              )}
              <button
                class="lum-btn lum-bg-red hover:bg-red"
                onClick$={async () => {
                  await deletePreset(presetInfo.id);
                  window.location.assign(
                    '/resources/rgb/presets?showPending=true'
                  );
                }}
              >
                <Trash size={20} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div class="mt-8 text-sm">
        RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
        gradient creator that generates hex formatted text. RGB Birdflop is a
        public resource developed by Birdflop, a 501(c)(3) nonprofit providing
        affordable and accessible hosting and public resources. If you would
        like to support our mission, please <a href={donateLink}>click here</a>{' '}
        to make a charitable donation, 100% tax-deductible in the US.
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Presets',
  description:
    'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop. ' +
    defaultDescription,
});
