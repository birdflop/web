import { component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/components/util/HexUtils';
import { defaults } from '~/components/util/PresetUtils';
import { convertToHex, convertToRGB, disperseColors, generateOutput, hexToHSL } from '~/components/util/RGBUtils';

import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { ChevronDown, Clipboard, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import Output from '~/components/rgb/Output';
import Presets from '~/components/rgb/Presets';
import Decode from '~/components/rgb/Decode';
import Formatting from '~/components/rgb/Formatting';
import FormatOptions from '~/components/rgb/FormatOptions';
import Options from '~/components/rgb/Options';

export const rgbDefaults = {
  version: defaults.version,
  colors: defaults.colors,
  colorlength: defaults.colorlength,
  text: defaults.text,
  format: defaults.format,
  customFormat: defaults.customFormat,
  prefixsuffix: defaults.prefixsuffix,
  trimspaces: defaults.trimspaces,
  disperse: defaults.disperse,
  bold: defaults.bold,
  italic: defaults.italic,
  underline: defaults.underline,
  strikethrough: defaults.strikethrough,
  previewStyle: defaults.previewStyle,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  const rgbCookies = await getCookies(cookie, 'rgb', url.searchParams) as typeof rgbDefaults;
  const presetCookies = await getCookies(cookie, 'presets') as { savedPresets: Partial<typeof defaults>[] };
  return {
    rgb: rgbCookies,
    presets: presetCookies,
  };
});

export default component$(() => {
  useSpeak({ assets: ['gradient', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...structuredClone(rgbDefaults),
    ...cookies.rgb,
  }, { deep: true });
  const presetstore = useStore({
    ...cookies.presets,
  });

  const tmpstore: {
    threshold: number,
    sectionsOpened: string[],
    alerts: {
      class: string,
      text: string,
    }[],
  } = useStore({
    threshold: 50,
    sectionsOpened: [],
    alerts: [] as {
      class: string,
      text: string,
    }[],
  }, { deep: true });

  useTask$(({ track }) => {
    if (isBrowser) setCookies('rgb', store);
    if (store.disperse) store.colors = disperseColors(store.colors);
    (Object.keys(store) as Array<keyof typeof store>).forEach((key) => {
      track(() => store[key]);
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    if (!input) return;
    input.focus();
    input.setSelectionRange(store.text.length, store.text.length);
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('gradient.title@@RGBirdflop')}
        </h1>
        <h2 class="text-gray-50 mt-1 mb-5">
          {t('gradient.subtitle@@Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}<br />
        </h2>

        <Input store={store}>
          {(() => {
            if (!store.text) return '\u00A0';

            const colors = sortColors(store.colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
            if (colors.length < 2) return store.text;

            const gradient = new Gradient(colors, Math.ceil(store.text.length / store.colorlength));

            let hex = '';
            const segments = [];
            let index = 0;
            const textArray = Array.from(store.text);
            while (index < textArray.length) {
              segments.push(textArray.slice(index, index + store.colorlength).join(''));
              index += store.colorlength;
            }
            return segments.map((segment, i) => {
              const rgb = gradient.next();
              hex = convertToHex(rgb);
              const shadow = hexToHSL(hex);
              if (shadow.l > 50) shadow.s = shadow.s * 0.2;
              shadow.l = Math.round(shadow.l * 0.2);
              const shadowLength = store.previewStyle == 'default' ? '4px 4px' : '2px 2px';
              return <span key={`char${i}`} style={{
                color: `#${hex};`,
                textShadow: `${shadowLength} 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
              }} class={{
                'underline': store.underline,
                'strikethrough': store.strikethrough,
                'underline-strikethrough': store.underline && store.strikethrough,
              }}>
                {segment.replace(/ /g, '\u00A0')}
              </span>;
            });
          })()}
        </Input>

        <ColorMap store={store} />

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2">
          <div class="flex flex-col gap-2 relative" id="column1">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('colors') == -1) tmpstore.sectionsOpened.push('colors');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('colors'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Palette size={26} />
                {t('color.colors@@Colors')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('colors') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <ColorList store={store} hidden={tmpstore.sectionsOpened.indexOf('colors') == -1} />
          </div>
          <div class="flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-gray-800/80" id="column2">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('output') == -1) tmpstore.sectionsOpened.push('output');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('output'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Clipboard size={26} />
                {t('color.output@@Output')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('output') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>

            <Output store={store} tmpstore={tmpstore} hidden={tmpstore.sectionsOpened.indexOf('output') == -1}
              value={generateOutput(store.text, store.colors, store.format, store.prefixsuffix, store.trimspaces, store.colorlength, store.bold, store.italic, store.underline, store.strikethrough)} />

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('options') == -1) tmpstore.sectionsOpened.push('options');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('options'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Settings size={26} />
                {t('color.options@@Options')}
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('options') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Options store={store} hidden={tmpstore.sectionsOpened.indexOf('options') == -1}/>

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('presets') == -1) tmpstore.sectionsOpened.push('presets');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('presets'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Save size={26} />
                {t('color.presets@@Presets')}
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('presets') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Presets store={store} presetstore={presetstore} tmpstore={tmpstore}
              hidden={tmpstore.sectionsOpened.indexOf('presets') == -1}/>

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('decode') == -1) tmpstore.sectionsOpened.push('decode');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('decode'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Sparkles size={26} />
                {t('color.decode@@Decode')}
                <span class="lum-bg-blue-950 rounded text-xs px-1 py-0.5 ml-1">BETA</span>
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('decode') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Decode store={store} tmpstore={tmpstore}
              hidden={tmpstore.sectionsOpened.indexOf('decode') == -1} />

          </div>
          <div class="mb-4 flex flex-col gap-2" id="column3">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (tmpstore.sectionsOpened.indexOf('formatting') == -1) tmpstore.sectionsOpened.push('formatting');
              else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('formatting'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Type size={26} />
                {t('color.formatting@@Formatting')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': tmpstore.sectionsOpened.indexOf('formatting') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Formatting store={store} hidden={tmpstore.sectionsOpened.indexOf('formatting') == -1} />

            {store.customFormat && <>
              <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
                if (tmpstore.sectionsOpened.indexOf('formatoptions') == -1) tmpstore.sectionsOpened.push('formatoptions');
                else tmpstore.sectionsOpened.splice(tmpstore.sectionsOpened.indexOf('formatoptions'), 1);
              }}>
                <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                  <Settings size={26} />
                  {t('color.formatoptions@@Format Options')}
                </h1>
                <div class={{
                  'transition-transform duration-200': true,
                  'rotate-180': tmpstore.sectionsOpened.indexOf('formatoptions') != -1,
                }}>
                  <ChevronDown size={20} />
                </div>
              </button>
              <FormatOptions store={store} hidden={tmpstore.sectionsOpened.indexOf('formatoptions') == -1} />
            </>}

          </div>
        </div>
        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
        <h3 class="text-gray-400 text-sm mb-3">
          Wanna automate generating gradients or use this in your own project? We have <a class="text-blue-400 hover:underline" href="/api/v2/docs">an API!</a>
        </h3>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  meta: [
    {
      name: 'description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};