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
} from '@qwik.dev/core';

import {
  rgbDefaults,
  disperseColors,
  colorFormats,
  getShadowColors,
  buildFormatCodes,
} from '@birdflop/rgbirdflop';

import { inlineTranslate } from 'qwik-speak';
import { setCookies } from '~/util/dataUtils';

import CaseLower from 'lucide-icons-qwik/icons/CaseLower';
import CaseUpper from 'lucide-icons-qwik/icons/CaseUpper';
import Settings from 'lucide-icons-qwik/icons/Settings';
import Sparkles from 'lucide-icons-qwik/icons/Sparkles';
import Hash from 'lucide-icons-qwik/icons/Hash';
import TestTube2 from 'lucide-icons-qwik/icons/TestTube2';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import HostingAd, {
  AD_VARIANTS,
  AdVariantKey,
} from '~/components/Elements/HostingAd';
import { obfuscateText } from '~/util/rgb/obfuscator';

import Input from '~/components/rgbirdflop/Input';
import ColorMap from '~/components/rgbirdflop/ColorMap';
import ColorList from '~/components/rgbirdflop/ColorList';
import Options from '~/components/rgbirdflop/Options';
import Presets from '~/components/rgbirdflop/presets/Presets';
import CustomFormat from '~/components/rgbirdflop/CustomFormat';
import Output from '~/components/Elements/Output';
import Decode from '~/components/rgbirdflop/Decode';
import Accordion from '~/components/Elements/Accordion';

import { birdStoreContext, openItemsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import MobileNavbar from '~/components/rgbirdflop/MobileNavbar';
import { donateLink } from '~/components/Elements/Nav';
import { deepTrack } from '~/util/track';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { ButtonContainer } from '../Elements/ButtonContainer';
import { Link, useLocation } from '@qwik.dev/router';

export const rgbStoreContext =
  createContextId<typeof rgbDefaults>('rgbstore-context');
export const showAllGradientsContext = createContextId<Signal<boolean>>(
  'showallgradients-context'
);

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
    const loc = useLocation();
    const notifications = useContext(NotificationContext);
    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      errors.forEach((error) => {
        const notification = new Notification()
          .setTitle('Error loading cookies')
          .setDescription(`${error}`)
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true);
        notifications.push(notification.toJSON());
      });
    });

    const rgbStore = useContext(rgbStoreContext);
    const openItems = useContext(openItemsContext);

    const showAds = useSignal<boolean>();
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
          Math.floor(rgbStore.text.length / rgbStore.colors.length)
        );
      }

      // track all rgbStore properties
      deepTrack(track, rgbStore);
    });

    // Obfuscate effect
    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      if (!isBrowser) return;

      track(() => rgbStore.baseFormatting.obfuscate);
      track(() => rgbStore.formatting);
      track(() => rgbStore.text);

      const spans = () =>
        document.querySelectorAll<HTMLElement>(
          'label[for="input"] span[data-text]'
        );
      const restore = (el: HTMLElement) => {
        const dt = el.getAttribute('data-text') ?? '';
        if (dt === '\n' || dt === '\r') return;
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
          const dt = el.getAttribute('data-text') ?? '';
          if (dt === '\n' || dt === '\r') return;
          if (el.classList.contains('obfuscate')) {
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
    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      if (!isBrowser) return;

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const stored = localStorage.getItem(
          AD_VARIANT_STORAGE_KEY
        ) as AdVariantKey | null;

        const usPreferredRegions = [
          'America/', // North/Central/South America
          'Pacific/Honolulu', // Hawaii
          'Pacific/Guam', // US territories
          'Atlantic/Bermuda', // Close to US
        ];
        const shouldShowAds = usPreferredRegions.some((region) =>
          tz.startsWith(region)
        );
        //const shouldShowAds = !usPreferredRegions.some((region) =>
        //  tz.startsWith(region)
        //);

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

    // Flopbird guide
    const birdStore = useContext(birdStoreContext);
    const flopBirdTrack = [
      {
        description: "Hi! I'm here to help you create RGB gradients!",
      },
      {
        id: 'input',
        description: "First, type something into the text box I'm on top of!",
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
          "You can change the format of the hex codes if the server you're playing on requires a different format.",
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
          "There are multiple gradient types to choose from, this is useful if the gradient doesn't look vibrant enough :)",
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
          "I'll be down here letting you know if there's anything new. Happy gradient making!",
      },
    ];

    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      birdStore.track = flopBirdTrack;
    });

    return (
      <section class="relative mx-auto flex min-h-svh w-full justify-center gap-8 px-6 pt-20">
        {showAds.value && adVariant.value && (
          <HostingAd variant={adVariant.value} position="Left" />
        )}
        <div class="min-h-15 max-w-6xl">
          <div class="flex items-start gap-2">
            <div class="flex flex-1 flex-col gap-1">
              <Slot name="header" />
            </div>

            <ButtonContainer class="[&>a]:lum-btn-p-1! hidden sm:block">
              {!loc.url.pathname.startsWith('/resources/rgb') && (
                <Link href="/resources/rgb">
                  <Palette size={18} />
                  {t('nav.resources.hexGradient.title@@RGBirdflop')}
                </Link>
              )}
              {!loc.url.pathname.startsWith('/resources/animtab') && (
                <Link href="/resources/animtab">
                  <Rainbow size={18} />
                  {t('nav.resources.animatedTAB.title@@Animated TAB')}
                </Link>
              )}
              {!loc.url.pathname.startsWith('/resources/advancedrgb') && (
                <Link href="/resources/advancedrgb">
                  <TestTube2 size={18} />
                  {t(
                    'nav.resources.hexGradient.advanced.title@@RGBirdflop Advanced'
                  )}
                </Link>
              )}
            </ButtonContainer>
          </div>

          <Input advanced={advanced}>
            <Slot name="input" />
          </Input>

          <Slot name="input-extra" />
          {!advanced && (
            <>
              <ColorMap />
              {rgbStore.shadowColors && <ColorMap id="shadow" />}
            </>
          )}

          <div class="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            <MobileNavbar>
              <Slot name="mobile-navbar" />
            </MobileNavbar>

            <div class="relative flex flex-col gap-2" id="column1">
              {!advanced && (
                <>
                  <ColorList hidden={!openItems.value.includes('colors')} />
                  {(rgbStore.colorFormat.color === 'MiniMessage' ||
                    rgbStore.colorFormat.color === 'JSON' ||
                    rgbStore.shadowColors) && (
                    <>
                      <Toggle
                        id="textshadowtoggle"
                        checked={!!rgbStore.shadowColors}
                        onChange$={(e, el) => {
                          if (!el.checked) rgbStore.shadowColors = null;
                          else if (!rgbStore.shadowColors)
                            rgbStore.shadowColors = getShadowColors(rgbStore);
                        }}
                      >
                        {t('rgb.colors.shadow.enable@@Custom Text Shadow')}
                      </Toggle>
                      {rgbStore.shadowColors && (
                        <ColorList
                          id="shadow"
                          hidden={!openItems.value.includes('colors')}
                        />
                      )}
                    </>
                  )}
                </>
              )}
              <Slot name="column1" />
            </div>

            <div
              class="border-lum-border/10 flex flex-col gap-1 sm:border-x sm:px-4 md:col-span-2"
              id="column2"
            >
              <Output
                class="font-mc h-32"
                hidden={!openItems.value.includes('output')}
                value={output}
              >
                <Slot name="output" q:slot="label" />
                <button
                  class={{
                    'lum-btn lum-btn-p-1': true,
                    'lum-bg-lum-accent hover:lum-bg-lum-accent/50':
                      rgbStore.lowercase,
                  }}
                  q:slot="label"
                  title={t('rgb.colors.lowercase.title@@Lowercase Hex Codes')}
                  id="lowercase"
                  onClick$={() => (rgbStore.lowercase = !rgbStore.lowercase)}
                >
                  <Hash size={20} />
                  {rgbStore.lowercase ? (
                    <CaseLower size={20} />
                  ) : (
                    <CaseUpper size={20} />
                  )}
                </button>
                <SelectMenu
                  q:slot="label"
                  align="right"
                  title={t('rgb.colors.format@@Color Format')}
                  id="format"
                  value={
                    rgbStore.customFormat
                      ? 'custom'
                      : colorFormats.indexOf(rgbStore.colorFormat)
                  }
                  class="lum-btn-p-1 w-full text-sm whitespace-nowrap"
                  btnProps={{
                    class: 'lum-btn-p-1',
                  }}
                  outerProps={{
                    class: 'max-w-3/4',
                  }}
                  onChange$={(e, el) => {
                    if (el.value == 'custom') {
                      rgbStore.customFormat = true;
                    } else {
                      rgbStore.customFormat = false;
                      rgbStore.colorFormat = colorFormats[parseInt(el.value)];
                    }
                  }}
                  values={[
                    ...colorFormats.map((format, i) => ({
                      name: format.color
                        .replace('$1', 'r')
                        .replace('$2', 'r')
                        .replace('$3', 'g')
                        .replace('$4', 'g')
                        .replace('$5', 'b')
                        .replace('$6', 'b')
                        .replace(
                          '$f',
                          buildFormatCodes(rgbStore.baseFormatting, rgbStore)
                        )
                        .replace('$c', ''),
                      value: i.toString(),
                    })),
                    {
                      name: t('rgb.colors.customFormat@@Custom Format'),
                      value: 'custom',
                    },
                  ]}
                />
              </Output>

              <div class="mt-2 grid gap-2 md:grid-cols-2">
                {rgbStore.customFormat && (
                  <div class="col-span-2 flex flex-col">
                    <Accordion sectionName="formatoptions" pcOnly>
                      <Settings />
                      {t('rgb.formatting.options@@Format Options')}
                      <span class="text-lum-text-secondary text-xs text-ellipsis">
                        {rgbStore.colorFormat.color
                          .replace('$1', 'r')
                          .replace('$2', 'r')
                          .replace('$3', 'g')
                          .replace('$4', 'g')
                          .replace('$5', 'b')
                          .replace('$6', 'b')
                          .replace(
                            '$f',
                            buildFormatCodes(rgbStore.baseFormatting, rgbStore)
                          )
                          .replace('$c', '')}
                      </span>
                    </Accordion>
                    <CustomFormat
                      hidden={!openItems.value.includes('formatoptions')}
                    />
                  </div>
                )}
                <div class="flex flex-col">
                  <Accordion sectionName="options" pcOnly>
                    <Settings />
                    {t('rgb.advancedoptions@@Advanced Options')}
                  </Accordion>
                  <Options hidden={!openItems.value.includes('options')} />
                </div>
                <div class="flex flex-col">
                  <Accordion sectionName="decode" pcOnly>
                    <Sparkles />
                    {t('rgb.decode.title@@Decode')}
                    <span class="lum-grad-bg-blue/50 rounded-lum-1 px-2 py-1 text-xs">
                      {t('nav.experimental@@experimental')}
                    </span>
                  </Accordion>
                  <Decode hidden={!openItems.value.includes('decode')} />
                </div>
                <Slot name="column2" />
              </div>
            </div>

            <div class="mb-4 flex flex-col gap-2" id="column3">
              <Presets hidden={!openItems.value.includes('presets')} />

              <Slot name="column3" />
            </div>
          </div>
          <div class="text-lum-text-secondary mt-8 flex flex-col gap-2 text-sm sm:flex-row">
            <p class="sm:border-lum-border/10 sm:border-r">
              RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB
              gradient creator that generates hex formatted text. RGB Birdflop
              is a public resource developed by Birdflop, a 501(c)(3) nonprofit
              providing affordable and accessible hosting and public resources.
              If you would like to support our mission, please{' '}
              <a href={donateLink}>click here</a> to make a charitable donation,
              100% tax-deductible in the US.
            </p>
            <p class="sm:text-right">
              Wanna automate generating gradients or use this in your own
              project? We have{' '}
              <a
                class="text-lum-accent hover:underline"
                href="/docs/rgbirdflop/npm_package"
              >
                an NPM package
              </a>{' '}
              and{' '}
              <a
                class="text-lum-accent hover:underline"
                href="/docs/rgbirdflop/api"
              >
                an API!
              </a>
            </p>
          </div>
        </div>
        {showAds.value && adVariant.value && (
          <HostingAd variant={adVariant.value} position="Right" />
        )}
      </section>
    );
  }
);
