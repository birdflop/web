import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/util/rgb/HexUtils';
import { defaults } from '~/util/rgb/presets/defaults';
import { disperseColors, generateOutput, sortColors } from '~/util/rgb/RGBUtils';

import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import { isBrowser } from '@builder.io/qwik/build';

import { Blend, Clipboard, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import Output from '~/components/rgb/Output';
import Presets from '~/components/rgb/Presets';
import Decode from '~/components/rgb/Decode';
import Formatting from '~/components/rgb/Formatting';
import FormatOptions from '~/components/rgb/FormatOptions';
import Options from '~/components/rgb/Options';
import Accordion from '~/components/Accordion';
import { NotificationContext, OpenSectionsContext } from '~/routes/layout';
import TextShadow from '~/components/rgb/TextShadow';
import { hexToRGB, rgbToHex } from '~/util/rgb/Colors';

export const rgbDefaults = {
  version: defaults.version,
  colors: defaults.colors,
  shadowcolors: defaults.shadowcolors,
  colorlength: defaults.colorlength,
  text: defaults.text,
  format: defaults.format,
  customFormat: defaults.customFormat,
  prefixsuffix: defaults.prefixsuffix,
  trimspaces: defaults.trimspaces,
  disperse: defaults.disperse,
  lowercase: defaults.lowercase,
  syncshadow: defaults.syncshadow,
  bold: defaults.bold,
  italic: defaults.italic,
  underline: defaults.underline,
  strikethrough: defaults.strikethrough,
  obfuscate: defaults.obfuscate,
  previewStyle: defaults.previewStyle,
};

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>
    errors: string[]
  };
});

export const rgbStoreContext = createContextId<typeof rgbDefaults>('rgbstore-context');
export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    errors.forEach((error) => {
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error fetching data',
        description: `${error}`,
        bgColor: 'lum-bg-red-900/50',
      };
      notifications.push(notification);
    });
  });

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const openSections = useContext(OpenSectionsContext);
  const threshold = useSignal(50);

  useTask$(({ track }) => {
    if (isBrowser) setCookies('rgb', rgbStore);
    if (rgbStore.disperse) rgbStore.colors = disperseColors(rgbStore.colors);
    if (rgbStore.syncshadow) {
      rgbStore.shadowcolors = rgbStore.colors.map(color => {
        const shadowRGB = hexToRGB(color.hex).map(c => c * 0.25);
        const shadowHex = `#${rgbToHex(shadowRGB)}`;
        return {
          hex: shadowHex,
          pos: color.pos,
        };
      });
    }
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach((key) => {
      track(() => rgbStore[key]);
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    if (!isBrowser && !rgbStore.obfuscate) return;
    function obfuscate() {
      const text = document.querySelectorAll('span.obfuscate');
      text.forEach((el, i) => {
        if (!rgbStore.obfuscate) {
          el.textContent = rgbStore.text[i];
          return;
        }
        el.textContent = Math.random().toString(36).substring(1, 3).replace('.', '');
      });
      requestAnimationFrame(obfuscate);
    }
    obfuscate();
    track(() => rgbStore.obfuscate);
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
        </h2>

        <Input>
          {(() => {
            if (!rgbStore.text) return '\u00A0';

            const colors = sortColors(rgbStore.colors).map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
            const shadowColors = sortColors(rgbStore.shadowcolors).map((color) =>  ({ rgb: hexToRGB(color.hex), pos: color.pos }));
            if (colors.length < 2) return rgbStore.text;

            const gradient = new Gradient(colors, Math.ceil(rgbStore.text.length / rgbStore.colorlength));
            const shadowGradient = new Gradient(shadowColors, Math.ceil(rgbStore.text.length / rgbStore.colorlength));

            let hex = '';
            let shadowHex = '';
            const segments = [];
            let index = 0;
            const textArray = Array.from(rgbStore.text);
            while (index < textArray.length) {
              segments.push(textArray.slice(index, index + rgbStore.colorlength).join(''));
              index += rgbStore.colorlength;
            }
            return segments.map((segment, i) => {
              const rgb = gradient.next();
              const rgbShadow = shadowGradient.next();
              hex = rgbToHex(rgb);
              shadowHex = rgbToHex(rgbShadow);
              const shadowLength = rgbStore.previewStyle == 'default' ? '4px 4px' : '2px 2px';
              return <span key={`char${i}`} style={{
                color: `#${hex};`,
                textShadow: `${shadowLength} 0 #${shadowHex};`,
              }} class={{
                'underline': rgbStore.underline,
                'strikethrough': rgbStore.strikethrough,
                'underline-strikethrough': rgbStore.underline && rgbStore.strikethrough,
                'obfuscate': rgbStore.obfuscate,
              }}>
                {segment.replace(/ /g, '\u00A0')}
              </span>;
            });
          })()}
        </Input>

        <ColorMap />

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2">
          <div class="flex flex-col gap-2 relative" id="column1">
            <Accordion sectionName="colors" alwaysOpen>
              <Palette size={26} />
              {t('rgb.colors.title@@Colors')}
            </Accordion>
            <ColorList hidden={openSections.indexOf('colors') == -1} />
            <Accordion sectionName="textshadow">
              <Blend size={26} />
              {t('rgb.colors.shadow.title@@Text Shadow')}
            </Accordion>
            <TextShadow hidden={openSections.indexOf('textshadow') == -1} />

          </div>
          <div class="flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-gray-800/80" id="column2">
            <Accordion sectionName="output" alwaysOpen>
              <Clipboard size={26} />
              {t('rgb.output.title@@Output')}
            </Accordion>
            <Output hidden={openSections.indexOf('output') == -1}
              value={generateOutput(rgbStore)} />

            <Accordion sectionName="options">
              <Settings size={26} />
              {t('rgb.options@@Options')}
            </Accordion>
            <Options hidden={openSections.indexOf('options') == -1}/>

            <Accordion sectionName="presets">
              <Save size={26} />
              {t('rgb.presets.title@@Presets')}
            </Accordion>
            <Presets hidden={openSections.indexOf('presets') == -1}/>

            <Accordion sectionName="decode">
              <Sparkles size={26} />
              {t('rgb.decode.title@@Decode')}
              <span class="lum-bg-blue-900/50 text-xs py-1 px-2 rounded-md">
                experimental
              </span>
            </Accordion>
            <Decode threshold={threshold} hidden={openSections.indexOf('decode') == -1} />

          </div>

          <div class="mb-4 flex flex-col gap-2" id="column3">
            <Accordion sectionName="formatting" alwaysOpen>
              <Type size={26} />
              {t('rgb.formatting.title@@Formatting')}
            </Accordion>
            <Formatting hidden={openSections.indexOf('formatting') == -1} />

            {rgbStore.customFormat && <>
              <Accordion sectionName="formatoptions">
                <Settings size={26} />
                {t('rgb.formatting.options@@Format Options')}
              </Accordion>
              <FormatOptions hidden={openSections.indexOf('formatoptions') == -1} />
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