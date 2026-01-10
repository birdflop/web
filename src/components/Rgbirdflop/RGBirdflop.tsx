import {
  component$,
  createContextId,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
  isBrowser,
  $,
  Slot,
  Signal,
} from '@builder.io/qwik';

import {
  rgbDefaults,
  ColorGradient,
  GradientType,
  disperseColors,
  sortColors,
  hexToRGB,
  rgbToHex,
  getShadowColors,
} from '@birdflop/rgbirdflop';

import { inlineTranslate } from 'qwik-speak';
import { setCookies } from '~/util/dataUtils';

import {
  Blend,
  Clipboard,
  Grid2X2,
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
import MobileNavbar from '~/components/Rgbirdflop/MobileNavbar';

export function renderPreview(rgbStore: typeof rgbDefaults, shadowLength = 4) {
  if (!rgbStore.text) return '\u00A0';
  if (rgbStore.colors.length < 1) return rgbStore.text;

  const colorsRGB = sortColors(rgbStore.colors).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));
  const shadowColorsRGB = sortColors(getShadowColors(rgbStore)).map((color) => ({
    rgb: hexToRGB(color.hex),
    pos: color.pos,
  }));

  const gradient = new ColorGradient(
    colorsRGB,
    Math.ceil(rgbStore.text.length / rgbStore.colorlength),
    rgbStore.gradientType as GradientType,
  );
  const shadowGradient = new ColorGradient(
    shadowColorsRGB,
    Math.ceil(rgbStore.text.length / rgbStore.colorlength),
  );

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
        q:slot='input'
        key={`char${i}`}
        style={{
          color: `#${hex};`,
          ...(shadowGradient &&
            shadowHex && {
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
        {segment}
      </span>
    );
  });
}

export const rgbStoreContext = createContextId<typeof rgbDefaults>('rgbstore-context');
export const showAllGradientsContext = createContextId<Signal<boolean>>('showallgradients-context');

export const AD_VARIANTS = {
  'ai-generated': {
    image: '/ad-ai.png',
    label: 'AI Generated',
  },
  'pemi-handmade': {
    image: '/ad-pemi.png',
    label: 'Handmade by Pemi',
  },
} as const;
export type AdVariantKey = keyof typeof AD_VARIANTS;
export const AD_VARIANT_STORAGE_KEY = 'rgb-ad-variant';

export default component$(({ errors, output }: {
  errors: string[];
  output: string;
}) => {
  const t = inlineTranslate();
  const notifications = useContext(NotificationContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    errors.forEach((error) => {
      const notification = new Notification()
        .setTitle('Error loading cookies')
        .setDescription(`${error}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    });
  });

  const rgbStore = useContext(rgbStoreContext);
  const openItemsStore = useContext(openItemsContext);
  const previewStyle = useContext(previewStyleContext);
  const showAllGradients = useContext(showAllGradientsContext);

  const showAds = useSignal(false);
  const adVariant = useSignal<AdVariantKey | null>(null);

  useTask$(({ track }) => {
    if (isBrowser) setCookies('rgb', rgbStore);
    if (rgbStore.disperse) rgbStore.colors = disperseColors(rgbStore.colors);
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach((key) => {
      track(() => rgbStore[key]);
    });
  });

  // Obfuscate effect
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    if (!isBrowser || !rgbStore.obfuscate) return;
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

  // Ads
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

  // Flopbird guide
  const elementIdToLandOn = useContext(BirdLandContext);
  const flopBirdTrack = [
    {
      id: 'input',
      description: 'First, type something into the text box I\'m on top of!',
    },
    {
      id: 'colorlistcolorstext',
      description: 'Next, pick some colors from the color list to create your gradient!',
    },
    {
      id: 'output',
      description: 'Finally, copy the output and use it in Minecraft!',
    },
    {
      id: 'format-dropdown',
      description: 'You can change the format of the hex codes if the server you\'re using requires a different format.',
    },
    {
      id: 'colormaptext',
      description: 'The color map shows you how the colors are distributed across your text. You can use this to fine-tune your gradient!',
    },
    {
      id: 'formatting',
      description: 'You can also add formatting to your text over here, try it out!',
    },
    {
      id: 'presets',
      description: 'Finally, before I go, you can also check out some preset gradients that other users have made for easy access!',
    },
    {
      id: undefined,
      description: 'I\'ll be down here letting you know if there\'s anything new. Happy gradient making!',
    },
  ];

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const notification = new Notification()
      .setTitle('Flopbird:')
      .setDescription('Hi! I\'m here to help you create RGB gradients!')
      .setBgColor('lum-bg-cyan/50')
      .setPersist(true).toJSON();

    notification.action = {
      text: 'Click to continue',
      onClick$: $(() => {
        const nextStep = flopBirdTrack.shift();
        if (!nextStep) return;

        elementIdToLandOn.value = nextStep.id;

        const nextNotification = new Notification(notification)
          .setDescription(nextStep.description);
        notifications.push(nextNotification);
      }),
    };

    notifications.push(
      notification,
    );
  });

  return (
    <section class='relative flex mx-auto w-full px-6 min-h-svh pt-20 gap-8 justify-center'>
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position='Left' />
      )}
      <div class='min-h-15 max-w-6xl'>
        <Slot name="header" />

        <Input>
          <Slot name="input" />
          {previewStyle.value != 'default' && (
            <button q:slot="extra-buttons"
              class={{
                'p-1 rounded-lum-1 lum-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg transition-colors': true,
                'text-lum-primary': showAllGradients.value,
                'text-lum-text-secondary': !showAllGradients.value,
              }}
              onClick$={() => showAllGradients.value = !showAllGradients.value}
              title={showAllGradients.value ? 'Show only selected gradient' : 'Show all gradients'}
            >
              <Grid2X2 size={20} />
            </button>
          )}
        </Input>

        <ColorMap />

        <div class='grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 mt-1'>
          <MobileNavbar>
            <Slot name="mobile-navbar" />
          </MobileNavbar>

          <div class='flex flex-col gap-2 relative' id='column1'>
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Palette />
              {t('rgb.colors.title@@Colors')}
            </div>
            <ColorList hidden={!openItemsStore.items.includes('colors')}>
              <Slot name="color-list" />
            </ColorList>
            <Accordion sectionName='textshadow' pcOnly>
              <Blend />
              {t('rgb.colors.shadow.title@@Text Shadow')}
            </Accordion>
            <TextShadow hidden={!openItemsStore.items.includes('textshadow')} />
          </div>

          <div
            class='flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-lum-border/10'
            id='column2'
          >
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Clipboard />
              {t('rgb.output.title@@Output')}
            </div>
            <Output
              hidden={!openItemsStore.items.includes('output')}
              value={output}
            />

            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Settings />
              {t('rgb.options@@Options')}
            </div>
            <Options hidden={!openItemsStore.items.includes('options')}>
              <Slot name='options' />
            </Options>
          </div>

          <div class='mb-4 flex flex-col gap-2' id='column3'>
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Save />
              {t('rgb.presets.title@@Presets')}
            </div>
            <Presets hidden={!openItemsStore.items.includes('presets')} />

            {rgbStore.customFormat && <>
              <Accordion sectionName='formatoptions' pcOnly>
                <Settings />
                {t('rgb.formatting.options@@Format Options')}
              </Accordion>
              <FormatOptions
                hidden={!openItemsStore.items.includes('formatoptions')}
              />
            </>}

            <Accordion sectionName='decode' pcOnly>
              <Sparkles />
              {t('rgb.decode.title@@Decode')}
              <span class='lum-bg-blue/50 text-xs py-1 px-2 rounded-lum-1'>
                {t('rgb.decode.experimental@@experimental')}
              </span>
            </Accordion>
            <Decode hidden={!openItemsStore.items.includes('decode')} />

            <Slot name="column3" />
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