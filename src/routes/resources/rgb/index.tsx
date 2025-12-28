import {
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
  isBrowser,
} from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import { Gradient } from '~/util/rgb/HexUtils';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import {
  disperseColors,
  generateOutput,
  sortColors,
} from '~/util/rgb/RGBUtils';

import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';

import {
  Blend,
  Clipboard,
  Palette,
  Save,
  Settings,
  Sparkles,
} from 'lucide-icons-qwik';
import HostingAd from '~/components/Rgbirdflop/HostingAd';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import ColorMap from '~/components/Rgbirdflop/ColorMap';
import ColorList from '~/components/Rgbirdflop/ColorList';
import Output from '~/components/Rgbirdflop/Output';
import Presets from '~/components/Rgbirdflop/Presets';
import Decode from '~/components/Rgbirdflop/Decode';
import FormatOptions from '~/components/Rgbirdflop/FormatOptions';
import Options from '~/components/Rgbirdflop/Options';
import Accordion from '~/components/Elements/Accordion';
import { BirdLandContext, openItemsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import TextShadow from '~/components/Rgbirdflop/TextShadow';
import { hexToRGB, rgbToHex } from '~/util/rgb/Colors';
import { defaultDescription, generateHead } from '~/root';

export function renderPreview(rgbStore: typeof rgbDefaults, shadowLength = 4) {
  if (!rgbStore.text) return '\u00A0';
  if (rgbStore.colors.length < 1) return rgbStore.text;

  const shadowColors = rgbStore.syncshadow
    ? rgbStore.colors.map((color) => {
      const shadowRGB = hexToRGB(color.hex).map((c) => c * 0.25);
      const shadowHex = `#${rgbToHex(shadowRGB)}`;
      return {
        hex: shadowHex,
        pos: color.pos,
      };
    })
    : rgbStore.shadowcolors;

  const colorsRGB = sortColors(rgbStore.colors).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));
  const shadowColorsRGB = sortColors(shadowColors).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));

  const gradient = new Gradient(
    colorsRGB,
    Math.ceil(rgbStore.text.length / rgbStore.colorlength),
  );
  const shadowGradient = shadowColorsRGB.length > 0
    ? new Gradient(
      shadowColorsRGB,
      Math.ceil(rgbStore.text.length / rgbStore.colorlength),
    )
    : null;

  let hex = '';
  let shadowHex = '';
  const segments = [];
  let index = 0;
  const textArray = Array.from(rgbStore.text);
  while (index < textArray.length) {
    // check if colorlength is set and valid
    if (!rgbStore.colorlength || rgbStore.colorlength < 1)
      rgbStore.colorlength = 1;
    segments.push(
      textArray.slice(index, index + rgbStore.colorlength).join(''),
    );
    index += rgbStore.colorlength;
  }
  return segments.map((segment, i) => {
    const rgb = gradient.next();
    const rgbShadow = shadowGradient?.next();
    hex = rgbToHex(rgb);
    shadowHex = rgbShadow ? rgbToHex(rgbShadow) : '';
    return (
      <span
        key={`char${i}`}
        style={{
          color: `#${hex};`,
          ...(shadowGradient && shadowHex && {
            textShadow: `${shadowLength}px ${shadowLength}px 0 #${shadowHex};`,
          }),
        }}
        class={{
          underline: rgbStore.underline,
          strikethrough: rgbStore.strikethrough,
          'underline-strikethrough':
            rgbStore.underline && rgbStore.strikethrough,
          obfuscate: rgbStore.obfuscate,
        }}
      >
        {segment.replace(/ /g, '\u00A0')}
      </span>
    );
  });
}

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>;
    errors: string[];
  };
});

function getPosOfElement(id: string) {
  const el = document.getElementById(id);

  if (!el) return;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top,
  };
}

export const rgbStoreContext =
  createContextId<typeof rgbDefaults>('rgbstore-context');
const AD_VARIANTS = {
  'ai-generated': {
    image: '/ad-ai.png',
    label: 'AI Generated',
  },
  'pemi-handmade': {
    image: '/ad-pemi.png',
    label: 'Handmade by Pemi',
  },
} as const;
type AdVariantKey = keyof typeof AD_VARIANTS;
const AD_VARIANT_STORAGE_KEY = 'rgb-ad-variant';
export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    errors.forEach((error) => {
      const notification = new Notification('Error fetching data')
        .setDescription(`${error}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    });
  });

  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true },
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const openItemsStore = useContext(openItemsContext);
  const threshold = useSignal(50);
  const showAds = useSignal(false);
  const adVariant = useSignal<AdVariantKey | null>(null);

  useTask$(({ track }) => {
    if (isBrowser) setCookies('rgb', rgbStore);
    if (rgbStore.disperse) rgbStore.colors = disperseColors(rgbStore.colors);
    if (rgbStore.syncshadow) {
      rgbStore.shadowcolors = rgbStore.colors.map((color) => {
        const shadowRGB = hexToRGB(color.hex).map((c) => c * 0.25);
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
    let rafId = 0;
    function obfuscate() {
      const text = document.querySelectorAll('span.obfuscate');
      text.forEach((el, i) => {
        if (!rgbStore.obfuscate) {
          el.textContent = rgbStore.text[i];
          return;
        }
        el.textContent = Math.random()
          .toString(36)
          .substring(1, 3)
          .replace('.', '');
      });
      rafId = requestAnimationFrame(obfuscate);
    }
    obfuscate();
    track(() => rgbStore.obfuscate);
    return () => cancelAnimationFrame(rafId);
  });

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
      // const shouldShowAds = usPreferredRegions.some(region => tz.startsWith(region));
      const shouldShowAds = !usPreferredRegions.some(region => tz.startsWith(region));

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

  const coordinatesToLandOn = useContext(BirdLandContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    return; // Disable guided tour for now
    const chatBox = new Notification('Flopbird:')
      .setDescription('Hi! I\'m here to help you create RGB gradients!')
      .setBgColor('lum-bg-cyan/50')
      .setPersist(true);
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('input');
    chatBox.setDescription(
      'First, type something into the text box I\'m on top of!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('colorlistcolorstext');
    chatBox.setDescription(
      'Next, pick some colors from the color list to create your gradient!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('output');
    chatBox.setDescription('Finally, copy the output and use it in Minecraft!');
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('format-dropdown');
    chatBox.setDescription(
      'You can change the format of the hex codes if the server you\'re using requires a different format.',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('colormaptext');
    chatBox.setDescription(
      'The color map shows you how the colors are distributed across your text. You can use this to fine-tune your gradient!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('underline');
    chatBox.setDescription(
      'You can also add formatting to your text over here, try it out!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = getPosOfElement('presets');
    chatBox.setDescription(
      'Finally, before I go, you can also check out some preset gradients that other users have made for easy access!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    coordinatesToLandOn.value = undefined;
    chatBox.setDescription(
      'I\'ll be down here letting you know if there\'s anything new. Happy gradient making!',
    );
    notifications.splice(
      notifications.findIndex((n) => n.id === chatBox.id),
      1,
    );
    notifications.push(chatBox);
  });

  const adAsset = adVariant.value ? AD_VARIANTS[adVariant.value] : null;

  return (
    <section class='relative flex mx-auto w-full px-6 min-h-svh pt-20 gap-8 justify-center'>
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position='Left' />
      )}
      <div class='min-h-15 max-w-6xl'>
        <h1 class='flex gap-4 items-center my-3!'>
          <Palette size={70} />{' '}
          {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </h1>
        <p>
          {t(
            'nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.',
          )}
        </p>
        <hr />

        <Input>
          {renderPreview(rgbStore, previewStyle.value == 'default' ? 4 : 2)}
        </Input>

        <ColorMap />

        <div class='grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 mt-1'>
          <div class='flex flex-col gap-2 relative' id='column1'>
            <Accordion sectionName='colors' alwaysOpen>
              <Palette size={26} />
              {t('rgb.colors.title@@Colors')}
            </Accordion>
            <ColorList hidden={!openItemsStore.items.includes('colors')} />
            <Accordion sectionName='textshadow'>
              <Blend size={26} />
              {t('rgb.colors.shadow.title@@Text Shadow')}
            </Accordion>
            <TextShadow hidden={!openItemsStore.items.includes('textshadow')} />
          </div>
          <div
            class='flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-lum-border/10'
            id='column2'
          >
            <Accordion sectionName='output' alwaysOpen>
              <Clipboard size={26} />
              {t('rgb.output.title@@Output')}
            </Accordion>
            <Output
              hidden={!openItemsStore.items.includes('output')}
              value={generateOutput(rgbStore)}
            />

            <Options />
          </div>

          <div class='mb-4 flex flex-col gap-2' id='column3'>
            <Accordion sectionName='presets' alwaysOpen>
              <Save size={26} />
              {t('rgb.presets.title@@Presets')}
            </Accordion>
            <Presets hidden={!openItemsStore.items.includes('presets')} />

            {rgbStore.customFormat && (
              <>
                <Accordion sectionName='formatoptions'>
                  <Settings size={26} />
                  {t('rgb.formatting.options@@Format Options')}
                </Accordion>
                <FormatOptions
                  hidden={!openItemsStore.items.includes('formatoptions')}
                />
              </>
            )}

            <Accordion sectionName='decode'>
              <Sparkles size={26} />
              {t('rgb.decode.title@@Decode')}
              <span class='lum-bg-blue/50 text-xs py-1 px-2 rounded-lum-1'>
                {t('rgb.decode.experimental@@experimental')}
              </span>
            </Accordion>
            <Decode
              threshold={threshold}
              hidden={!openItemsStore.items.includes('decode')}
            />
          </div>
        </div>
        <p class='mt-8'>
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
          gradient creator that generates hex formatted text. RGB Birdflop is a
          public resource developed by Birdflop, a 501(c)(3) nonprofit providing
          affordable and accessible hosting and public resources. If you would
          like to support our mission, please{' '}
          <a href='https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U'>
            click here
          </a>{' '}
          to make a charitable donation, 100% tax-deductible in the US.
        </p>
        <p>
          Wanna automate generating gradients or use this in your own project?
          We have{' '}
          <a class='text-blue-400 hover:underline' href='/docs/rgbirdflop/api'>
            an API!
          </a>
        </p>
      </div>
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position='Right' />
      )}
    </section>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop - Minecraft RGB Gradient Creator',
  description:
    'Hex gradient text generator. Developed by Birdflop. ' + defaultDescription,
  ads: false, // changed from true universally to disable google ads
});
