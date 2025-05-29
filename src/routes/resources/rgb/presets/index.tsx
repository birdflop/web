import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession, type BirdflopSession } from '~/routes/plugin@auth';
import { publishedPreset, rgbPreset } from '~/util/rgb/presets';
import { Toggle } from '@luminescent/ui-qwik';
import PresetPreview from '~/components/rgb/PresetPreview';
import { Save } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getPrismaClient } from '~/util/prisma';
import { migratePresetsFromCookies } from '~/util/rgb/presets/migrate';
import { NotificationContext } from '~/routes/layout';

export const usePresets = routeLoader$(async ({ env }) => {
  const prisma = getPrismaClient(env.get('DATABASE_URL'));
  if (!prisma) throw new Error('No prisma client');

  const presets = await prisma.presets.findMany({
    where: {},
    cacheStrategy: {
      ttl: 60 * 60, // Cache for 1 hour
    },
  }) as publishedPreset[];

  return presets;
});

export const savedPresetsContext = createContextId<Signal<rgbPreset[]>>('savedpresets-context');
export default component$(() => {
  const t = inlineTranslate();
  const notifications = useContext(NotificationContext);

  const session = useSession() as Readonly<Signal<BirdflopSession>>;
  const presets = usePresets().value;

  const presetStore = useStore({
    searchTerm: '',
    showSaved: false,
  });

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

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

  const savedPresetsParsed: publishedPreset[] = [...savedPresets.value].map((preset) => ({
    name: preset.text ?? 'Saved Preset',
    author: 'Saved by you',
    preset: preset,
    createdAt: new Date(),
  }));

  const allPresets: publishedPreset[] = [...savedPresetsParsed, ...presets].filter((preset, index, self) =>
    index === self.findIndex((savedPreset) => {
      if (JSON.stringify(savedPreset.preset) !== JSON.stringify(preset.preset)) return false;
      if (!savedPreset.id && preset.id) {
        Object.assign(savedPreset, preset);
      }
      return true;
    }),
  );

  let filteredPresets = allPresets.filter((preset) =>
    preset.name.toLowerCase().includes(presetStore.searchTerm.toLowerCase()),
  );

  if (presetStore.showSaved) {
    filteredPresets = filteredPresets.filter((preset) => savedPresets.value.some((savedPreset) =>
      JSON.stringify(savedPreset) === JSON.stringify(preset.preset),
    ));
  }

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
        <div class={{
          'opacity-50': savedPresets.value.length === 0,
        }}>
          <Toggle id="showsavedpresets" disabled={savedPresets.value.length === 0}
            checked={presetStore.showSaved && savedPresets.value.length > 0}
            onChange$={(e, el) => presetStore.showSaved = el.checked}
            label={t('rgb.presets.showSaved.title@@Show saved presets')} />
          <p class="text-xs text-gray-400 mt-1">
            {t('rgb.presets.showSaved.description@@Turn this on to show only your saved presets.')}
          </p>
        </div>

        <input
          class="lum-input w-full my-4"
          id="search-input"
          placeholder="Search for a preset..."
          value={presetStore.searchTerm}
          onInput$={(e, el) => presetStore.searchTerm = el.value}
        />

        <div class="grid grid-cols-2 gap-2">
          {filteredPresets.map((presetInfo) =>
            <PresetPreview key={`${presetInfo.name}-${presetInfo.author}`} presetInfo={presetInfo} />,
          )}
          {filteredPresets.length === 0 && (
            <div class="lum-card lum-bg-gray-800/40 hover:lum-bg-gray-800 w-full transition duration-1000 hover:duration-75 ease-out">
              <p class="text-center text-gray-400">
                {t('rgb.presets.noResults@@No results found.')}
                Stay tuned for a way to submit your own presets!
              </p>
            </div>
          )}
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