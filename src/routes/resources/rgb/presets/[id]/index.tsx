import { $, component$, createContextId, isBrowser, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession, type BirdflopSession } from '~/routes/plugin@auth';
import { publishedPreset, rgbPreset } from '~/util/rgb/presets';
import { ChevronLeft, MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getPrismaClient } from '~/util/prisma';
import { migratePresetsFromCookies } from '~/util/rgb/presets/migrate';
import { NotificationContext } from '~/routes/layout';
import Input, { previewStyleContext } from '~/components/rgb/Input';
import { renderPreview, rgbStoreContext } from '../..';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { setUserData } from '~/util/dataUtils';

export const usePreset = routeLoader$(async ({ params, env }) => {
  const prisma = getPrismaClient(env.get('DATABASE_URL'));
  if (!prisma) throw new Error('No prisma client');
  if (isNaN(Number(params.id))) throw new Error('No preset ID provided');

  const presetInfo = await prisma.presets.findUnique({
    where: { id: Number(params.id) },
    cacheStrategy: {
      ttl: 60 * 60, // Cache for 1 hour
    },
  }) as publishedPreset | null;

  if (!presetInfo) throw new Error('Preset not found');

  return presetInfo;
});

export const savedPresetsContext = createContextId<Signal<rgbPreset[]>>('savedpresets-context');
export default component$(() => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);

  const session = useSession() as Readonly<Signal<BirdflopSession>>;
  const presetInfo = usePreset().value;

  const rgbStore = useStore({
    ...rgbDefaults,
    ...presetInfo.preset,
    text: presetInfo.name,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (savedPresets.value.length != 0) return;
    let newSavedPresets: rgbPreset[] = [];
    try {
      // try to get presets from localStorage
      const localStoragePresets = localStorage.getItem('savedPresets');
      // if localStorage is empty, try to get presets from cookies
      if (!localStoragePresets) migratePresetsFromCookies(newSavedPresets);
      else {
        const localStoragePresetsParsed = JSON.parse(localStoragePresets) as rgbPreset[];
        newSavedPresets = newSavedPresets.concat(localStoragePresetsParsed);
      }
      savedPresets.value = savedPresets.value.concat(newSavedPresets);
    } catch (err) {
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error parsing saved presets',
        description: `Error: ${err}`,
        bgColor: 'lum-bg-red-900/50',
      };
      notifications.push(notification);
      setTimeout(() => {
        notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
      }, 2000);
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Save size={70} /> {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
        </h1>
        <p>
          {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}{' Stay tuned for a way to submit your own presets!'}
        </p>
        <hr/>
        <div class="flex">
          <Link href="/resources/rgb/presets" class="lum-btn lum-bg-transparent">
            <ChevronLeft size={20} /> Back to Presets
          </Link>
        </div>

        <div class="flex flex-col gap-4 mt-2">
          <Input>
            {renderPreview(rgbStore, previewStyle.value == 'default' ? 4 : 2)}
          </Input>

          <h6 class="my-0!">
            {presetInfo.author}
          </h6>
          <p>
            {presetInfo.description}
          </p>

          <label for="preset" class="-mb-2">
            Preset Contents - Click to copy
          </label>
          <textarea id="preset" readOnly
            class={{
              'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
            }}
            value={JSON.stringify(presetInfo.preset, null, 2)}
            onClick$={async () => {
              const id = Math.random().toString(36).substring(2, 15);
              const notification = {
                id,
                title: await t$('rgb.copied@@Copied to clipboard!'),
                description: await t$('rgb.output.copied@@The RGB text has been copied to your clipboard successfully.'),
                bgColor: 'lum-bg-green-900/50',
              };
              navigator.clipboard.writeText(JSON.stringify(presetInfo.preset)).catch(async (err) => {
                notification.title = await t$('rgb.copyFailed@@Failed to copy to clipboard!');
                notification.description = err;
                notification.bgColor = 'lum-bg-red-900/50';
              });
              notifications.push(notification);
              setTimeout(() => {
                notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
              }, 2000);
            }}
          />

          <div class="flex gap-2">
            <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
              class={{ 'hidden sm:flex text-sm gap-1 text-orange-300': true }}>
              <div q:slot="dropdown" class="flex items-center gap-3">
                <MousePointer2 size={20} /> {t('rgb.presets.use@@Use')}
              </div>
              <Link href={`/resources/rgb?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent">
                <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
              </Link>
              <Link href={`/resources/animtab?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent">
                <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
              </Link>
            </SelectMenuRaw>
            <button class="lum-btn text-sm" onClick$={async () => {
              const existingPreset = savedPresets.value.find((savedPreset) => {
                return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
              });
              if (existingPreset) savedPresets.value = savedPresets.value.filter((p) => p !== existingPreset);
              else savedPresets.value = [...savedPresets.value, presetInfo.preset];
              if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(savedPresets.value));
              await setUserData({ savedPresets: savedPresets.value });
            }}>
              {savedPresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset))
                ? <span class="text-red-300 flex gap-3">
                  <Trash size={20} /> {t$('rgb.presets.remove@@Remove')}
                </span>
                : <span class="text-green-300 flex gap-3">
                  <Save size={20}  /> {t$('rgb.presets.save@@Save')}
                </span>}
            </button>
          </div>
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
  ads: true,
});