import { component$, createContextId, useContextProvider, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { inlineTranslate } from 'qwik-speak';
import { useSession, type BirdflopSession } from '~/routes/plugin@auth';
import { defaults, presets } from '~/util/rgb/presets/defaults';
import { publishedPreset } from '~/util/rgb/presets';
import { Toggle } from '@luminescent/ui-qwik';
import PresetPreview from '~/components/rgb/PresetPreview';

export const savedPresetStoreContext = createContextId<Partial<typeof defaults>[]>('rgbstore-context');
export default component$(() => {
  const t = inlineTranslate();

  const session = useSession() as Readonly<Signal<BirdflopSession>>;

  const presetStore = useStore({
    searchTerm: '',
    showSaved: false,
  });

  const savedPresetStore = useStore((session.value?.user?.savedPresets ?? []));
  useContextProvider(savedPresetStoreContext, savedPresetStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (savedPresetStore.length != 0) return;
    let savedPresets: Partial<typeof defaults>[] = [];
    try {
      const localStoragePresets = JSON.parse(localStorage.getItem('savedPresets') || '[]');
      savedPresets = savedPresets.concat(localStoragePresets);
      if (!localStoragePresets) {
        // presets possibly stored in cookies
        const cookie: { [key: string]: string; } = {};
        document.cookie.split(/\s*;\s*/).forEach(function (pair) {
          const pairsplit = pair.split(/\s*=\s*/);
          cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
        });
        if (cookie['presets']) {
          const cookiePresets = decodeURIComponent(cookie['presets']);
          savedPresets = savedPresets.concat(JSON.parse(cookiePresets)?.savedPresets);
          // remove cookie
          document.cookie = 'presets=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
      savedPresetStore.push(...savedPresets);
      localStorage.setItem('savedPresets', JSON.stringify(presetStore));
    } catch (err) {
      console.error('Error parsing saved presets', err);
    }
  });

  const savedPresetsParsed: publishedPreset[] = [...savedPresetStore].map((preset) => ({
    name: preset.text ?? 'Birdflop',
    author: 'Personal',
    preset,
  }));

  const allPresets: publishedPreset[] = [...savedPresetsParsed, ...presets].filter((preset, index, self) =>
    index === self.findIndex((p) => {
      if (JSON.stringify(p.preset) !== JSON.stringify(preset.preset)) return false;

      if (!p.name || p.name === 'Birdflop') p.name = preset.name;
      if (!p.author || p.author === 'Personal') p.author = preset.author;
      return true;
    }),
  );
  const filteredPresets = allPresets.filter((preset) =>
    preset.name.toLowerCase().includes(presetStore.searchTerm.toLowerCase()),
  );

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}{' Stay tuned for a way to submit your own presets!'}
        </h2>
        <div class={{
          'opacity-50': savedPresetStore.length === 0,
        }}>
          <Toggle id="showsavedpresets" disabled={savedPresetStore.length === 0}
            checked={presetStore.showSaved && savedPresetStore.length > 0}
            onChange$={(e, el) => presetStore.showSaved = el.checked}
            label={<p class="flex flex-col">
              <span>
                {t('rgb.presets.showSaved.title@@Show saved presets')}
              </span>
              <span class="text-xs text-gray-400">
                {t('rgb.presets.showSaved.description@@Switches between showing all public presets and presets you have saved.')}
              </span>
            </p>} />
        </div>

        <input
          class="lum-input w-full my-4"
          id="search-input"
          placeholder="Search for a preset..."
          value={presetStore.searchTerm}
          onInput$={(e, el) => presetStore.searchTerm = el.value}
        />

        <div class="grid grid-cols-2 gap-2">
          {filteredPresets.map((presetInfo) => <PresetPreview key={`${presetInfo.name}-${presetInfo.author}`} presetInfo={presetInfo} />)}
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

export const head: DocumentHead = {
  title: 'RGBirdflop Presets',
  meta: [
    {
      name: 'description',
      content: 'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop.',
    },
    {
      name: 'og:description',
      content: 'Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop.',
    },
    {
      name: 'og:image',
      content: '/branding/.png',
    },
  ],
};