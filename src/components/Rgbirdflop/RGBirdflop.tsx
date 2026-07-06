import {
  component$,
  createContextId,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
  isBrowser,
  Slot,
  Signal,
} from '@builder.io/qwik';

import { rgbDefaults, disperseColors } from '@birdflop/rgbirdflop';

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
import { obfuscateText } from '~/util/rgb/obfuscator';

import Input from '~/components/Rgbirdflop/Input';
import ColorMap from '~/components/Rgbirdflop/ColorMap';
import ColorList from '~/components/Rgbirdflop/ColorList';
import TextShadow from '~/components/Rgbirdflop/TextShadow';
import Options from '~/components/Rgbirdflop/Options';
import Presets from '~/components/Rgbirdflop/Presets';
import FormatOptions from '~/components/Rgbirdflop/FormatOptions';
import Output from '~/components/Rgbirdflop/Output';
import Decode from '~/components/Rgbirdflop/Decode';
import Accordion from '~/components/Elements/Accordion';

import { birdStoreContext, openItemsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import MobileNavbar from '~/components/Rgbirdflop/MobileNavbar';
import { donateLink } from '~/components/Elements/Nav';
import { deepTrack } from '~/util/misc';

export const rgbStoreContext =
  createContextId<typeof rgbDefaults>('rgbstore-context');
export const showAllGradientsContext = createContextId<Signal<boolean>>(
  'showallgradients-context',
);

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

export default component$(
  ({
    errors,
    output,
    advanced,
  }: {
    errors: string[];
    output: string;
    advanced?: boolean;
  }) => {
    const t = inlineTranslate();
    const notifications = useContext(NotificationContext);
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle('Error loading cookies')
          .setDescription(`${error}`)
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true);
        notifications.push(notification);
      });
    });

    const rgbStore = useContext(rgbStoreContext);
    const openItems = useContext(openItemsContext);
    const showAllGradients = useContext(showAllGradientsContext);

    const showAds = useSignal(false);
    const adVariant = useSignal<AdVariantKey | null>(null);

    useTask$(({ track }) => {
      if (isBrowser) setCookies('rgb', rgbStore);

      // Disperse colors if enabled
      if (rgbStore.disperse) rgbStore.colors = disperseColors(rgbStore.colors);

      // update characters per color if over max
      if (
        rgbStore.colorLength >
        rgbStore.text.length / rgbStore.colors.length
      ) {
        rgbStore.colorLength = Math.max(
          1,
          Math.floor(rgbStore.text.length / rgbStore.colors.length),
        );
      }

      // track all rgbStore properties
      deepTrack(track, rgbStore);
    });

    // Obfuscate effect
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      if (!isBrowser) return;

      track(() => rgbStore.baseFormatting.obfuscate);
      track(() => rgbStore.formatting);
      track(() => rgbStore.text);

      const spans = () =>
        document.querySelectorAll<HTMLElement>(
          'label[for="input"] span[data-text]',
        );
      const restore = (el: HTMLElement) => {
        const dt = el.getAttribute('data-text') ?? '';
        if (el.textContent !== dt) el.textContent = dt;
      };

      const hasObfuscate =
        rgbStore.baseFormatting.obfuscate ||
        rgbStore.formatting.some((s) => s.obfuscate);

      if (!hasObfuscate) {
        spans().forEach(restore);
        return;
      }

      const tick = () => {
        spans().forEach((el) => {
          if (el.classList.contains('obfuscate')) {
            const dt = el.getAttribute('data-text') ?? '';
            el.textContent = obfuscateText(dt);
          } else {
            restore(el);
          }
        });
        requestAnimationFrame(tick);
      };
      tick();
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
    const birdStore = useContext(birdStoreContext);
    const flopBirdTrack = [
      {
        description: 'Hi! I\'m here to help you create RGB gradients!',
      },
      {
        id: 'input',
        description: 'First, type something into the text box I\'m on top of!',
      },
      {
        id: 'colorlistcolorstext',
        description:
          'Next, pick some colors from the color list to create your gradient!',
        openItem: 'colors',
      },
      {
        id: 'output',
        description: 'Finally, copy the output and use it in Minecraft!',
        openItem: 'output',
      },
      {
        id: 'format-dropdown',
        description:
          'You can change the format of the hex codes if the server you\'re playing on requires a different format.',
        openItem: 'options',
      },
      {
        id: 'length',
        description:
          'This setting changes how long the gradient scroll effect is, a higher value gives you a smoother, longer animation',
        openItem: 'colors',
      },
      {
        id: 'type-dropdown',
        description:
          'This is the animation type, which changes the style of your gradient animation.',
        openItem: 'options',
      },
      {
        id: 'colormaptext',
        description:
          'The color map shows you how the colors are distributed across your text. You can use this to fine-tune your gradient!',
      },
      {
        id: 'gradientType-dropdown',
        description:
          'There are multiple gradient types to choose from, this is useful if the gradient doesn\'t look vibrant enough :)',
        openItem: 'options',
      },
      {
        id: 'prefixsuffix',
        description:
          'If you are using a command such as /nick, you can add a prefix/suffix to your text here to make it easier to copy and paste! Make sure to include $t where you want your text to go.',
        openItem: 'options',
      },
      {
        id: 'formatting',
        description:
          'You can also add formatting to your text over here, try it out!',
      },
      {
        id: 'findmorepresets',
        description:
          'Finally, before I go, you can also check out some preset gradients that other users have made for easy access!',
        openItem: 'presets',
      },
      {
        description:
          'I\'ll be down here letting you know if there\'s anything new. Happy gradient making!',
      },
    ];

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      birdStore.track = flopBirdTrack;
    });

    return (
      <section class="relative mx-auto flex min-h-svh w-full justify-center gap-8 px-6 pt-20">
        {showAds.value && adAsset && (
          <HostingAd variant={adAsset} position="Left" />
        )}
        <div class="min-h-15 max-w-6xl">
          <Slot name="header" />

          <Input advanced={advanced}>
            <Slot name="input" />
            <button
              q:slot="extra-buttons"
              class={{
                'rounded-lum-1 lum-grad-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg p-1 transition-colors': true,
                'text-lum-primary': showAllGradients.value,
                'text-lum-text-secondary': !showAllGradients.value,
              }}
              onClick$={() =>
                (showAllGradients.value = !showAllGradients.value)
              }
              title={
                showAllGradients.value
                  ? 'Show only selected gradient'
                  : 'Show all gradients'
              }
            >
              <Grid2X2 size={20} />
            </button>
          </Input>

          <ColorMap />

          <div class="mt-1 grid gap-2 sm:grid-cols-3 sm:gap-2 md:grid-cols-4">
            <MobileNavbar>
              {!advanced && (
                <button
                  onClick$={() => {
                    openItems.value = openItems.value.includes('textshadow')
                      ? openItems.value.filter((item) => item !== 'textshadow')
                      : ['textshadow'];
                  }}
                  class={{
                    'lum-grad-bg-blue!': openItems.value.includes('textshadow'),
                  }}
                  q:slot="mobile-navbar"
                >
                  <Blend />
                  {t('rgb.colors.shadow.title@@Text Shadow')}
                </button>
              )}
              <Slot name="mobile-navbar" />
            </MobileNavbar>

            <div class="relative flex flex-col gap-2" id="column1">
              {!advanced && (
                <>
                  <div class="hidden items-center gap-2 p-2 font-semibold sm:flex">
                    <Palette />
                    {t('rgb.colors.title@@Colors')}
                  </div>
                  <ColorList hidden={!openItems.value.includes('colors')} />
                  <Accordion sectionName="textshadow" pcOnly>
                    <Blend />
                    {t('rgb.colors.shadow.title@@Text Shadow')}
                  </Accordion>
                  <TextShadow
                    hidden={!openItems.value.includes('textshadow')}
                  />
                </>
              )}
              <Slot name="column1" />
            </div>

            <div
              class="border-lum-border/10 flex flex-col gap-1 sm:border-x sm:px-2 md:col-span-2"
              id="column2"
            >
              <div class="hidden items-center gap-2 p-2 font-semibold sm:flex">
                <Clipboard />
                {t('rgb.output.title@@Output')}
              </div>
              <Output
                hidden={!openItems.value.includes('output')}
                value={output}
              />

              <div class="hidden items-center gap-2 p-2 font-semibold sm:flex">
                <Settings />
                {t('rgb.options@@Options')}
              </div>
              {!advanced && (
                <Options hidden={!openItems.value.includes('options')}>
                  <Slot name="options" />
                </Options>
              )}
              {advanced && <Slot name="options" />}
            </div>

            <div class="mb-4 flex flex-col gap-2" id="column3">
              {!advanced && (
                <>
                  <div
                    q:slot="column3"
                    class="hidden items-center gap-2 p-2 font-semibold sm:flex"
                  >
                    <Save />
                    {t('rgb.presets.title@@Presets')}
                  </div>
                  <Presets
                    q:slot="column3"
                    hidden={!openItems.value.includes('presets')}
                  />

                  {rgbStore.customFormat && (
                    <>
                      <Accordion
                        q:slot="column3"
                        sectionName="formatoptions"
                        pcOnly
                      >
                        <Settings />
                        {t('rgb.formatting.options@@Format Options')}
                      </Accordion>
                      <FormatOptions
                        q:slot="column3"
                        hidden={!openItems.value.includes('formatoptions')}
                      />
                    </>
                  )}
                </>
              )}

              <Slot name="column3" />

              <Accordion sectionName="decode" pcOnly>
                <Sparkles />
                {t('rgb.decode.title@@Decode')}
                <span class="lum-grad-bg-blue/50 rounded-lum-1 px-2 py-1 text-xs">
                  {t('nav.experimental@@experimental')}
                </span>
              </Accordion>
              <Decode hidden={!openItems.value.includes('decode')} />
            </div>
          </div>
          <p class="mt-8">
            RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
            gradient creator that generates hex formatted text. RGB Birdflop is
            a public resource developed by Birdflop, a 501(c)(3) nonprofit
            providing affordable and accessible hosting and public resources. If
            you would like to support our mission, please{' '}
            <a href={donateLink}>click here</a> to make a charitable donation,
            100% tax-deductible in the US.
          </p>
          <p>
            Wanna automate generating gradients or use this in your own project?
            We have{' '}
            <a
              class="text-blue-400 hover:underline"
              href="/docs/rgbirdflop/npm_package"
            >
              an NPM package
            </a>{' '}
            and{' '}
            <a
              class="text-blue-400 hover:underline"
              href="/docs/rgbirdflop/api"
            >
              an API!
            </a>
          </p>
        </div>
        {showAds.value && adAsset && (
          <HostingAd variant={adAsset} position="Right" />
        )}
      </section>
    );
  },
);
