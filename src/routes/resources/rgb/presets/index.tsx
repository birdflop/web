import { component$, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { isBrowser } from '@builder.io/qwik/build';
import { DropdownRaw, Toggle } from '@luminescent/ui-qwik';
import { Box, Copy, Save, Trash } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { useSession, type BirdflopSession } from '~/routes/plugin@auth';
import { Gradient } from '~/util/HexUtils';
import { defaults, type publishedPreset } from '~/util/PresetUtils';
import { presets } from '~/util/PresetUtils';
import { rgbToHex, hexToRGB } from '~/util/RGBUtils';
import { setUserData, sortColors } from '~/util/SharedUtils';

export default component$(() => {
  const t = inlineTranslate();

  const session = useSession() as Readonly<Signal<BirdflopSession>>;
  const presetStore = useStore({
    searchTerm: '',
    showSaved: false,
    savedPresets: (session.value?.user?.savedPresets ?? []),
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (presetStore.savedPresets.length != 0) return;
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
      presetStore.savedPresets.push(...savedPresets);
      localStorage.setItem('savedPresets', JSON.stringify(presetStore));
    } catch (err) {
      console.error('Error parsing saved presets', err);
    }
  });

  const savedPresetsParsed: publishedPreset[] = [...presetStore.savedPresets].map((preset) => ({
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
          'opacity-50': presetStore.savedPresets.length === 0,
        }}>
          <Toggle id="showsavedpresets" disabled={presetStore.savedPresets.length === 0}
            checked={presetStore.showSaved && presetStore.savedPresets.length > 0}
            onChange$={(e, el) => presetStore.showSaved = el.checked}
            label={<p class="flex flex-col">
              <span>
                Show saved presets
              </span>
              <span class="text-xs text-gray-400">
                Switches between showing all public presets and presets you have saved.
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
          {filteredPresets.map((p, i) => {
            const searchParams = new URLSearchParams();
            const params = { ...p.preset };
            (Object.entries(params) as Array<[keyof typeof defaults, any]>).forEach(([key, value]) => {
              if (key == 'format' || key == 'colors') value = JSON.stringify(value);
              searchParams.set(key, String(value));
            });
            return (
              <div class="lum-card p-7 lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out" key={`preset-${i}`}>
                <div class="flex gap-4 items-center">
                  <div class="flex flex-col gap-2">
                    <p class="text-gray-400 text-sm">
                      {p.author}
                    </p>
                    <h3 class={{
                      'text-2xl sm:text-3xl break-all max-w-7xl font-mc tracking-tight': true,
                    }}>
                      {(() => {
                        const preset = p.preset;
                        if (!p.name) p.name = 'Birdflop';

                        const colors = sortColors(preset.colors ?? defaults.colors).map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
                        if (colors.length < 2) return preset.name;

                        const gradient = new Gradient(colors, Math.ceil(p.name.length / (preset.colorlength || 1)));

                        let hex = '';
                        const segments = [];
                        let index = 0;
                        const textArray = Array.from(p.name);
                        while (index < textArray.length) {
                          segments.push(textArray.slice(index, index + (preset.colorlength ?? 1)).join(''));
                          index += preset.colorlength ?? 1;
                        }
                        return segments.map((segment, i) => {
                          const rgb = gradient.next();
                          hex = rgbToHex(rgb);
                          const shadowRGB = rgb.map(c => Math.round(c * 0.25));
                          const shadowColor = `rgb(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]})`;
                          return <span key={`char${i}`} style={{
                            color: `#${hex};`,
                            textShadow: `3px 3px 0 ${shadowColor};`,
                          }} class={{
                            'underline': preset.underline,
                            'strikethrough': preset.strikethrough,
                            'underline-strikethrough': preset.underline && preset.strikethrough,
                          }}>
                            {segment.replace(/ /g, '\u00A0')}
                          </span>;
                        });
                      })()}
                    </h3>
                  </div>
                </div>
                <div class="hidden sm:flex gap-2 mt-2">
                  <button class="lum-btn text-sm" onClick$ ={async () => {
                    const existingPreset = presetStore.savedPresets.find((savedPreset) => {
                      return JSON.stringify(savedPreset) === JSON.stringify(p.preset);
                    });
                    if (existingPreset) presetStore.savedPresets = presetStore.savedPresets.filter((p) => p !== existingPreset);
                    else presetStore.savedPresets.push(p.preset);
                    if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(presetStore.savedPresets));
                    await setUserData({ savedPresets: presetStore.savedPresets });
                  }}>
                    {presetStore.savedPresets.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(p.preset)) ? <>
                      <Trash size={20} /> Remove
                    </> : <>
                      <Save size={20} /> Save
                    </>}
                  </button>
                  <button class="lum-btn text-sm" onClick$ ={async () => {
                    await navigator.clipboard.writeText(JSON.stringify(p.preset));
                  }}>
                    <Copy size={20} /> Copy
                  </button>
                  <DropdownRaw id={`use-${i}`} hover
                    display={<div class="flex items-center gap-3"><Box size={20} />Use</div>}
                    class={{ 'hidden sm:flex px-3 text-sm': true }}>
                    <a class="lum-btn w-full lum-bg-transparent" href={`/resources/rgb?${searchParams.toString()}`} q:slot='extra-buttons'>
                      {t('nav.resources.hexGradient.title@@RGBirdflop')}
                    </a>
                    <a class="lum-btn w-full lum-bg-transparent" href={`/resources/animtab?${searchParams.toString()}`} q:slot='extra-buttons'>
                      {t('nav.resources.animatedTAB.title@@Animated TAB')}
                    </a>
                  </DropdownRaw>
                </div>
              </div>
            );
          })}
          {filteredPresets.length === 0 && (
            <div class="lum-card lum-bg-gray-800/40 hover:lum-bg-gray-800 w-full transition duration-1000 hover:duration-75 ease-out">
              <p class="text-center text-gray-400">No results found. Stay tuned for a way to submit your own presets!</p>
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