import { component$, isBrowser, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { inlineTranslate } from 'qwik-speak';
import { ArrowLeft, Clipboard, Palette, Settings, Type } from 'lucide-icons-qwik';
import { deepTrack } from '~/util/misc';
import { setCookies } from '~/util/dataUtils';
import Output from '~/components/Rgbirdflop/Output';
import HostingAd from '~/components/Rgbirdflop/HostingAd';
import { AD_VARIANTS, AD_VARIANT_STORAGE_KEY, rgbStoreContext, type AdVariantKey } from '~/components/Rgbirdflop/RGBirdflop';
import { donateLink } from '~/components/Elements/Nav';
import { generateAdvancedOutput } from './output';
import StylePanel from './StylePanel';
import AdvancedOptions from './AdvancedOptions';
import { obfuscateText } from '~/util/rgb/obfuscator';
import Input from '../Rgbirdflop/Input';
import { segmentsStoreContext } from '~/routes/resources/rgb/beta/index';
import SegmentInspector from './SegmentInspector';

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(segmentsStoreContext);
  const rgbStore = useContext(rgbStoreContext);

  useTask$(({ track }) => {
    deepTrack(track, store);
    if (isBrowser) setCookies('rgbsegments', store);
  });

  // Obfuscate animation. Spans are mutated imperatively (Qwik won't rewrite a text
  // node it believes is unchanged), so we reconcile against `data-text`: obfuscated
  // spans get scrambled each frame, every other span is restored to its real glyph.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$((ctx) => {
    if (!isBrowser) return;
    ctx.track(() => store.segments);

    const spans = () => document.querySelectorAll<HTMLElement>('label[for="advanced-input"] span[data-text]');
    const restore = (el: HTMLElement) => {
      const dt = el.getAttribute('data-text') ?? '';
      if (el.textContent !== dt) el.textContent = dt;
    };

    const isObfuscated = rgbStore.baseFormatting.obfuscate || rgbStore.formatting.some((s) => s.obfuscate);
    if (!isObfuscated) {
      spans().forEach(restore);
      return;
    }

    let raf = 0;
    let active = true;
    const tick = () => {
      if (!active) return;
      spans().forEach((el) => {
        if (el.classList.contains('obfuscate')) {
          const dt = el.getAttribute('data-text') ?? '';
          el.textContent = obfuscateText(dt);
        } else {
          restore(el);
        }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    ctx.cleanup(() => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    });
  });

  const showAds = useSignal(false);
  const adVariant = useSignal<AdVariantKey | null>(null);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!isBrowser) return;

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const stored = localStorage.getItem(
        AD_VARIANT_STORAGE_KEY,
      ) as AdVariantKey | null;

      const usPreferredRegions = [
        'America/', // North/Central/South America
        'Pacific/Honolulu', // Hawaii
        'Pacific/Guam', // US territories
        'Atlantic/Bermuda', // Close to US
      ];
      const shouldShowAds = !usPreferredRegions.some((region) =>
        tz.startsWith(region),
      );

      if (shouldShowAds) {
        showAds.value = true;
        if (stored && AD_VARIANTS[stored]) {
          adVariant.value = stored;
        } else {
          const keys = Object.keys(AD_VARIANTS) as AdVariantKey[];
          const chosen = keys[Math.floor(Math.random() * keys.length)];
          adVariant.value = chosen;
          localStorage.setItem(AD_VARIANT_STORAGE_KEY, chosen);
        }
      }
    } catch (err) {
      console.warn('Ad region detection failed', err);
    }
  });

  const adAsset = adVariant.value ? AD_VARIANTS[adVariant.value] : null;
  const output = generateAdvancedOutput(store.segments, rgbStore);

  return (
    <section class="relative flex mx-auto w-full px-6 min-h-svh pt-20 gap-8 justify-center">
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position="Left" />
      )}
      <div class="min-h-15 max-w-6xl w-full">
        {/* Header */}
        <div class="flex flex-col gap-2 mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="flex gap-3 text-2xl font-extrabold items-center flex-1">
              <Palette size={30} />
              {t('rgb.beta.title@@RGBirdflop Advanced')}
              <span class="lum-grad-bg-blue/50 text-xs py-1 px-2 rounded-lum-1 self-center">
                {t('nav.experimental@@experimental')}
              </span>
            </h1>
            <Link href="/resources/rgb" class="lum-btn lum-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg rounded-lum p-2 gap-2 text-sm">
              <ArrowLeft size={18} />
              {t('rgb.beta.backToClassic@@Classic editor')}
            </Link>
          </div>
          <p class="text-lum-text-secondary">
            {t('rgb.beta.howItWorks@@Type your text, highlight any part of it, then give that part its own color and formatting. Mix as many gradients, solid colors, and styles as you like.')}
          </p>
        </div>

        {/* Input */}
        <Input />

        {/* Grid Layout (matching regular rgb columns) */}
        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 mt-4">

          {/* Column 1: Styling / Editor Panel */}
          <div class="flex flex-col gap-2 relative" id="column1">
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Palette />
              {t('rgb.colors.title@@Colors')}
            </div>
            <StylePanel />
          </div>

          {/* Column 2-3: Output & Options */}
          <div class="flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-lum-border/10" id="column2">
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Clipboard />
              {t('rgb.output.title@@Output')}
            </div>
            <Output hidden={false} value={output} />

            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold mt-4">
              <Settings />
              {t('rgb.options@@Options')}
            </div>
            <AdvancedOptions hidden={false} />
          </div>

          {/* Column 4: Custom formats, decode, hosting ads, etc. */}
          <div class="mb-4 flex flex-col gap-2" id="column3">
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Type />
              {t('rgb.segments.title@@Segments')}
            </div>
            <SegmentInspector />
          </div>

        </div>

        {/* Footer */}
        <p class="mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
          gradient creator that generates hex formatted text. RGB Birdflop is a
          public resource developed by Birdflop, a 501(c)(3) nonprofit providing
          affordable and accessible hosting and public resources. If you would
          like to support our mission, please{' '}
          <a href={donateLink}>
            click here
          </a>{' '}
          to make a charitable donation, 100% tax-deductible in the US.
        </p>
        <p>
          Wanna automate generating gradients or use this in your own project?
          We have{' '}
          <a class="text-blue-400 hover:underline" href="/docs/rgbirdflop/npm_package">
            an NPM package
          </a>
          {' '}and{' '}
          <a class="text-blue-400 hover:underline" href="/docs/rgbirdflop/api">
            an API!
          </a>
        </p>
      </div>
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position="Right" />
      )}
    </section>
  );
});
