import { component$, useStore } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { DropdownRaw } from '@luminescent/ui-qwik';
import { CopyOutline, CubeOutline, SaveOutline } from 'qwik-ionicons';
import { inlineTranslate } from 'qwik-speak';
import { Gradient } from '~/components/util/HexUtils';
import { presets } from '~/components/util/PresetUtils';
import { convertToHex, convertToRGB } from '~/components/util/RGBUtils';
import { sortColors } from '~/components/util/SharedUtils';

//export const useCookies = routeLoader$(async ({ cookie, url }) => {
//  return await getCookies(cookie, 'presets', url.searchParams);
//});

export default component$(() => {
  const t = inlineTranslate();
  const store = useStore({
    searchTerm: '',
  });

  const filteredPresets = (Object.keys(presets) as Array<keyof typeof presets>).filter((preset) =>
    preset.toLowerCase().includes(store.searchTerm.toLowerCase()),
  );

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('gradient.title@@RGBirdflop')} Presets
        </h1>
        <h2 class="text-gray-50 my-1">
          Welcome to the one-stop shop for presets! Here you can find and share presets for RGBirdflop.
        </h2>

        <div class="flex flex-col gap-2">
          <input
            class="lum-input w-full my-2"
            id="search-input"
            placeholder="Search for a version..."
            value={store.searchTerm}
            onInput$={(e, el) => store.searchTerm = el.value}
          />
          {filteredPresets.map((preset, i) => (
            <div class="lum-card lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out" key={`preset-${i}`}>
              <div class="flex gap-4 items-center">
                <img src="/branding/icon.png" alt="Birdflop" class="w-16 h-16 rounded-full" />
                <div class="flex flex-col gap-2">
                  <h3 class={{
                    'text-2xl sm:text-3xl break-all max-w-7xl font-mc tracking-tight': true,
                  }}>
                    {(() => {
                      const colors = sortColors(presets[preset]).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
                      if (colors.length < 2) return preset;

                      const gradient = new Gradient(colors, Math.ceil(preset.length));

                      let hex = '';
                      const segments = [...preset.matchAll(new RegExp('.{1,1}', 'g'))];
                      return segments.map((segment, i) => {
                        hex = convertToHex(gradient.next());
                        return (
                          <span key={`segment-${i}`} style={`color: #${hex};`}>
                            {segment[0].replace(/ /g, '\u00A0')}
                          </span>
                        );
                      });
                    })()}
                  </h3>
                  <p class="text-gray-400">
                    By Birdflop
                  </p>
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button class="lum-btn">
                  <SaveOutline width={24} /> Save
                </button>
                <button class="lum-btn">
                  <CopyOutline width={24} /> Copy
                </button>
                <DropdownRaw id={`use-${i}`} hover
                  display={<div class="flex items-center gap-3"><CubeOutline width={24} />Use</div>}
                  class={{ 'hidden sm:flex': true }}>
                  <a class="lum-btn w-full lum-bg-transparent" href="/resources/rgb" q:slot='extra-buttons'>
                    {t('nav.hexGradient@@RGBirdflop')}
                  </a>
                  <a class="lum-btn w-full lum-bg-transparent" href="/resources/animtab" q:slot='extra-buttons'>
                    {t('nav.animatedTAB@@Animated TAB')}
                  </a>
                </DropdownRaw>
              </div>
            </div>
          ))}
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
      content: '/branding/icon.png',
    },
  ],
};