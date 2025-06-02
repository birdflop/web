import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import { Gradient } from '~/util/rgb/HexUtils';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import { disperseColors, generateOutput, sortColors } from '~/util/rgb/RGBUtils';

import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import { isBrowser } from '@builder.io/qwik/build';

import { Blend, Clipboard, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import Input, { previewStyleContext } from '~/components/rgb/Input';
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
import { defaultDescription, generateHead } from '~/root';

export function renderPreview(rgbStore: typeof rgbDefaults, shadowLength = 4) {
  if (!rgbStore.text) return '\u00A0';
  if (rgbStore.colors.length < 2) return rgbStore.text;

  const shadowColors = rgbStore.syncshadow
    ? rgbStore.colors.map(color => {
      const shadowRGB = hexToRGB(color.hex).map(c => c * 0.25);
      const shadowHex = `#${rgbToHex(shadowRGB)}`;
      return {
        hex: shadowHex,
        pos: color.pos,
      };
    }) : rgbStore.shadowcolors;

  const colorsRGB = sortColors(rgbStore.colors).map((color) => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
  const shadowColorsRGB = sortColors(shadowColors).map((color) =>  ({ rgb: hexToRGB(color.hex), pos: color.pos }));

  const gradient = new Gradient(colorsRGB, Math.ceil(rgbStore.text.length / rgbStore.colorlength));
  const shadowGradient = new Gradient(shadowColorsRGB, Math.ceil(rgbStore.text.length / rgbStore.colorlength));

  let hex = '';
  let shadowHex = '';
  const segments = [];
  let index = 0;
  const textArray = Array.from(rgbStore.text);
  while (index < textArray.length) {
    // check if colorlength is set and valid
    if (!rgbStore.colorlength || rgbStore.colorlength < 1) rgbStore.colorlength = 1;
    segments.push(textArray.slice(index, index + rgbStore.colorlength).join(''));
    index += rgbStore.colorlength;
  }
  return segments.map((segment, i) => {
    const rgb = gradient.next();
    const rgbShadow = shadowGradient.next();
    hex = rgbToHex(rgb);
    shadowHex = rgbToHex(rgbShadow);
    return <span key={`char${i}`} style={{
      color: `#${hex};`,
      textShadow: `${shadowLength}px ${shadowLength}px 0 #${shadowHex};`,
    }} class={{
      'underline': rgbStore.underline,
      'strikethrough': rgbStore.strikethrough,
      'underline-strikethrough': rgbStore.underline && rgbStore.strikethrough,
      'obfuscate': rgbStore.obfuscate,
    }}>
      {segment.replace(/ /g, '\u00A0')}
    </span>;
  });
}

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

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

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
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Palette size={70} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </h1>
        <p>
          {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
        </p>
        <hr/>

        <Input>
          {renderPreview(rgbStore, previewStyle.value == 'default' ? 4 : 2)}
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

            <Options />

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
        <p class="mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </p>
        <p>
          Wanna automate generating gradients or use this in your own project? We have <a class="text-blue-400 hover:underline" href="https://docs.web-d5m.pages.dev/docs/rgbirdflop/api/">an API!</a>
        </p>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description: 'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
  ads: true,
});