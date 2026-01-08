import { $, component$, isBrowser, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession } from '~/routes/plugin@auth';
import { getPresets } from '~/util/rgb/presets';
import { Check, ChevronLeft, Copy, Github, MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { NotificationContext, Notification } from '~/util/Notification';
import { useAdmins } from '~/routes/layout';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { renderPreview, rgbStoreContext } from '../..';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
import { savePreset, unsavePreset, updatePreset, deletePreset } from '~/util/dataUtils';
import { privatePresetsContext, savedPresetsContext } from '..';
import { getDB, presets, savedPresets, users } from '~/util/db';
import { eq, sql } from 'drizzle-orm';

export const usePreset = routeLoader$(async ({ params }) => {
  const db = getDB();
  if (!db) throw new Error('No database connection');
  if (isNaN(Number(params.id))) throw new Error('No preset ID provided');

  const presetInfo = await db.select({
    presets, user: users,
    saveCount: sql<number>`COUNT(${savedPresets.userId})`.as('saveCount'),
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
    saveCount: presetInfo.saveCount,
  };
});

export default component$(() => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const loading = useSignal(false);

  const session = useSession();
  const presetInfo = usePreset().value;

  const admins = useAdmins().value;
  const admin = session.value?.user?.id && admins?.includes(session.value.user.id);

  const rgbStore = useStore({
    ...rgbDefaults,
    ...presetInfo.preset,
    text: presetInfo.name,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const existingPreset = savedPresets.value.find((savedPreset) => {
    return savedPreset.id === presetInfo.id;
  })?.preset
  || privatePresets.value.find((savedPreset) => {
    return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
  });

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If savedPresets is empty, load presets from localStorage
    if (savedPresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error parsing saved presets')
        .setDescription(`Error: ${err}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-15 w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Save size={48} /> {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
        </h1>
        <p>
          {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}
        </p>
        <hr/>
        <div class="flex">
          <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
            <ChevronLeft size={20} /> {t('rgb.presets.back@@Back to presets')}
          </Link>
        </div>

        <h6 class={{
          'flex items-center gap-2 mb-0!': true,
          'text-blue-300/80!': !presetInfo.user,
          'text-orange-300/80!': !!presetInfo.user,
        }}>
          { presetInfo.user && <Link href={`/profile/${presetInfo.user.id}`}
            class="lum-btn lum-bg-transparent p-1 -ml-1 cursor-pointer font-semibold text-inherit! text-xl">
            {presetInfo.user.image && presetInfo.user.name && (
              <img src={presetInfo.user.image} alt={presetInfo.user.name}
                width={32} height={32} class="w-8 h-8 rounded-full!" />
            )}
            {presetInfo.user.name}
          </Link>
          }
          { presetInfo.author && !presetInfo.user && <>
            {presetInfo.author == 'RGBirdflop' &&
              <LogoBirdflop size={32} fillGradient={['#54daf4', '#545eb6']} />
            }
            {presetInfo.author == 'SimplyMC' &&
              <LogoLuminescent size={32} class="text-luminescent-300" />
            }
            {presetInfo.author.includes('GitHub') &&
              <Github size={32} />
            }
            {presetInfo.author}
          </>}
        </h6>
        <p class="mb-2">
          {t('rgb.presets.createdAt@@Created at')} {new Date(presetInfo.createdAt)
            .toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
        </p>
        {admin ?
          <input type="text" class="lum-input w-full mb-4" value={presetInfo.description}
            onChange$={async (e, el) => {
              presetInfo.description = el.value;
              await updatePreset(presetInfo.id, {
                description: presetInfo.description,
              });
              window.location.reload();
            }} />
          :
          <p class="text-white! mb-5">
            {presetInfo.description}
          </p>
        }

        {presetInfo.pending &&
        <p class="lum-card text-white! my-5 font-bold text-2xl lum-bg-orange">
          {t('rgb.presets.pending@@This preset is pending review and may not be available to other users yet.')}
        </p>}

        <div class="flex gap-2">
          <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
            class={{ 'hidden sm:flex text-sm gap-1 lum-bg-orange hover:bg-orange': true }}>
            <div q:slot="dropdown" class="flex items-center gap-3">
              <MousePointer2 size={20} /> {t('rgb.presets.use@@Use')}
            </div>
            <Link href={`/resources/rgb?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1">
              <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
            </Link>
            <Link href={`/resources/animtab?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1">
              <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
            </Link>
          </SelectMenuRaw>
          <button class={{
            'lum-btn text-sm': true,
            'lum-bg-green hover:bg-green': !privatePresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset)),
            'lum-bg-red hover:bg-red': !!privatePresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset)),
          }} disabled={loading.value} onClick$={async () => {
            loading.value = true;

            if (existingPreset) {
              privatePresets.value = privatePresets.value.filter((p) => p !== existingPreset);
              if (presetInfo.id) {
                savedPresets.value = savedPresets.value.filter((p) => p.id !== presetInfo.id);
                presetInfo.saveCount--;
                await unsavePreset(presetInfo.id);
              }
            }
            else {
              privatePresets.value = [...privatePresets.value, presetInfo.preset];
              if (presetInfo.id) {
                savedPresets.value = [...savedPresets.value, presetInfo];
                presetInfo.saveCount++;
                await savePreset(presetInfo.id);
              }
            }

            if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
            loading.value = false;
          }}>
            {!loading.value && presetInfo.saveCount}
            {loading.value && <div class="lum-loading w-3 h-3" />}
            {privatePresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset))
              ? <>
                <Trash size={20} /> {t('rgb.presets.remove@@Remove')}
              </>
              : <>
                <Save size={20}  /> {t('rgb.presets.save@@Save')}
              </>}
          </button>
          <button class="lum-btn text-sm lum-bg-purple hover:bg-purple" disabled={loading.value} onClick$={async () => {
            const notification = new Notification()
              .setTitle(await t$('rgb.copied@@Copied to clipboard!'))
              .setDescription(await t$('rgb.presets.copied@@Successfully copied preset to clipboard!'))
              .setBgColor('lum-bg-green/50');
            navigator.clipboard.writeText(JSON.stringify(presetInfo.preset))
              .catch(async (err) => {
                notification.setTitle(await t$('rgb.copyFailed@@Failed to copy to clipboard!'))
                  .setDescription('Error: ' + err)
                  .setBgColor('lum-bg-red/50')
                  .setPersist(true);
              });
            notifications.push(notification);
          }}>
            <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
          </button>
        </div>
        <div class="flex flex-col gap-4 mt-6">
          <div>
            <h3 class="my-0!">
              {t('rgb.presets.preview@@Preset Preview')}
            </h3>
            <Input noLabel>
              {renderPreview(rgbStore, previewStyle.value == 'default' ? 4 : 2)}
            </Input>
          </div>

          <h3 class="my-0!">
            {t('rgb.presets.presetData@@Preset Data')}
          </h3>
          <div class="text-white! font-bold lum-card lum-bg-gray-800">
            {Object.keys(presetInfo.preset).map((key) => (
              <div key={key} class="flex gap-2 hover:bg-gray-900/50 lum-card flex-row p-0 lum-bg-transparent transition-colors">
                {admin &&
                  <button class="lum-btn lum-bg-transparent text-red-300 p-1 hover:lum-bg-red" onClick$={async () => {
                    delete presetInfo.preset[key as keyof typeof presetInfo.preset];
                    const updatedPreset = await updatePreset(presetInfo.id, {
                      preset: presetInfo.preset,
                    });
                    window.location.reload();
                    console.log('Updated preset:', updatedPreset);
                  }}>
                    <Trash size={16} />
                  </button>
                }
                <span class="font-mono text-lum-text-secondary">{key}:</span>
                <span class="font-mono">{JSON.stringify((presetInfo.preset as any)[key], null, 2)}</span>
              </div>
            ))}
          </div>

          {admin &&
            <>
              <h3 class="my-0!">
                Manage Preset
              </h3>
              <div class="flex items-center gap-1">
                {presetInfo.pending &&
                  <button class="lum-btn lum-bg-green hover:bg-green" onClick$={async () => {
                    await updatePreset(presetInfo.id, { pending: false });
                    window.location.assign('/resources/rgb/presets');
                  }}>
                    <Check size={20} /> Approve
                  </button>
                }
                <button class="lum-btn lum-bg-red hover:bg-red" onClick$={async () => {
                  await deletePreset(presetInfo.id);
                  window.location.reload();
                }}>
                  <Trash size={20} /> Delete
                </button>
              </div>
            </>
          }
        </div>

        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGBirdflop Presets',
  description: 'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop. ' + defaultDescription,
});