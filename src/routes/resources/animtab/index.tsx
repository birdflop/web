import { component$, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$, isBrowser } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import { animationStyles, rgbDefaults, animTABDefaults, AnimationOutput, generateAnimTABFrames, hexToRGB, GRADIENT_TYPES, disperseColors } from '@birdflop/rgbirdflop';
import { AD_VARIANT_STORAGE_KEY, AD_VARIANTS, AdVariantKey, rgbStoreContext } from '../rgb';

import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';

import { Clipboard, FileJson, Palette, Rainbow, Save, Settings, Sparkles } from 'lucide-icons-qwik';
import { SelectMenu, NumberInput } from '@luminescent/ui-qwik';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import ColorMap from '~/components/Rgbirdflop/ColorMap';
import ColorList from '~/components/Rgbirdflop/ColorList';
import Output from '~/components/Rgbirdflop/Output';
import Presets from '~/components/Rgbirdflop/Presets';
import Decode from '~/components/Rgbirdflop/Decode';
import FormatOptions from '~/components/Rgbirdflop/FormatOptions';
import Options from '~/components/Rgbirdflop/Options';
import Accordion from '~/components/Elements/Accordion';
import { openItemsContext, showAllGradientsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import { defaultDescription, generateHead } from '~/root';
import MobileNavbar from '~/components/Rgbirdflop/MobileNavbar';
import HostingAd from '~/components/Rgbirdflop/HostingAd';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'rgb', url.searchParams) as {
    cookies: Partial<typeof rgbDefaults>
    errors: string[]
  };
});

export const useAnimTABCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'animtab', url.searchParams) as {
    cookies: Partial<typeof animTABDefaults>
    errors: string[]
  };
});

export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const { cookies: animTABCookies, errors: animTABErrors } = useAnimTABCookies().value;
  const errors = [...rgbErrors, ...animTABErrors];
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

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const animtabStore = useStore({
    ...animTABDefaults,
    ...animTABCookies,
  }, { deep: true });

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

  const showAllGradients = useContext(showAllGradientsContext);

  const openItemsStore = useContext(openItemsContext);

  const showAds = useSignal(false);
  const adVariant = useSignal<AdVariantKey | null>(null);

  const frames = useStore({
    list: [] as (string | null)[][],
    current: 0,
  }, { deep: true });

  useTask$(({ track }) => {
    if (isBrowser) {
      setCookies('rgb', rgbStore);
      setCookies('animtab', { version: rgbStore.version, ...animtabStore });
    }
    if (rgbStore.disperse) rgbStore.colors = disperseColors(rgbStore.colors);
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach((key) => {
      track(() => rgbStore[key]);
    });
    (Object.keys(animtabStore) as Array<keyof typeof animtabStore>).forEach((key) => {
      track(() => animtabStore[key]);
    });

    const { frames: newFrames } = generateAnimTABFrames({ ...rgbStore, text: rgbStore.text != '' ? rgbStore.text : 'Birdflop' }, animtabStore);

    switch (animtabStore.type) {
    case 1:
      // Reverse
      frames.list = newFrames.reverse();
      break;
    case 3: {
      // Ping Pong
      const frames2 = newFrames.slice();
      frames.list = newFrames.reverse().concat(frames2);
      break;
    }
    default:
      frames.list = newFrames;
    }
  });

  // Animtab frames updater
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (frames.list[0] && deltaTime > animtabStore.speed) {
        frames.current = frames.current + 1 >= frames.list.length ? 0 : frames.current + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  // Obfuscate effect
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

  return (
    <section class='relative flex mx-auto w-full px-6 min-h-svh pt-20 gap-8 justify-center'>
      {showAds.value && adAsset && (
        <HostingAd variant={adAsset} position='Left' />
      )}
      <div class='min-h-15 max-w-6xl'>
        <h2 class='flex gap-3 items-center my-2!'>
          <Rainbow size={46} />
          {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </h2>
        <p class="mb-4 border-b border-lum-border/10 pb-4">
          {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
        </p>

        <Input>
          {(() => {
            if (!rgbStore.text) return '\u00A0';

            const renderFrames = (store: typeof rgbDefaults) => {
              // Generate frames for this specific gradient type
              const { frames: framesList } = generateAnimTABFrames(
                { ...store, text: store.text || 'Birdflop' },
                animtabStore,
              );

              let processedFrames = framesList;
              if (animtabStore.type == 1) {
                processedFrames = [...framesList].reverse();
              } else if (animtabStore.type == 3) {
                const frames2 = framesList.slice();
                processedFrames = [...framesList].reverse().concat(frames2);
              }

              if (!processedFrames[0]) return '\u00A0';
              const colors = processedFrames[frames.current % processedFrames.length];
              if (!colors) return '\u00A0';

              const segments = [...store.text.matchAll(new RegExp(`.{1,${store.colorlength}}`, 'g'))];
              let i = 0;
              return segments.map((segment) => {
                const color = `#${colors[i]}`;
                const shadowLength = previewStyle.value == 'default' ? '4px 4px' : '2px 2px';
                const shadowRGB = hexToRGB(color).map(c => Math.round(c * 0.25));
                const shadowColor = `rgb(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]})`;
                i = store.trimspaces && segment[0] != ' ' && colors[i + 1] ? i + 1 : i;
                return <span key={`char${i}`} style={{
                  color,
                  textShadow: `${shadowLength} 0 ${shadowColor};`,
                }} class={{
                  'underline': store.underline,
                  'strikethrough': store.strikethrough,
                  'underline-strikethrough': store.underline && store.strikethrough,
                  'obfuscate': store.obfuscate,
                }}>
                  {segment[0].replace(/ /g, '\u00A0')}
                </span>;
              });
            };

            if (showAllGradients.value && previewStyle.value != 'default') {
              return GRADIENT_TYPES.map((gradientType) => {
                const tempStore = {
                  ...rgbStore,
                  gradientType: gradientType,
                };
                const isActive = gradientType === rgbStore.gradientType;
                return (
                  <span key={gradientType} class='flex items-center gap-2'>
                    <span
                      class={{
                        'lum-bg-lum-input-bg lum-btn-p-1 rounded-lum text-[10px] min-w-15 text-center': true,
                        'text-lum-text': isActive,
                        'text-gray-400': !isActive,
                      }}
                    >
                      {gradientType}
                    </span>
                    <span class='flex-1'>
                      {renderFrames(tempStore)}
                    </span>
                  </span>
                );
              });
            }

            return renderFrames(rgbStore);
          })()}
        </Input>

        <ColorMap />

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2 mt-1">
          <MobileNavbar animtab />

          <div class="flex flex-col gap-2 relative" id="column1">
            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Palette />
              {t('rgb.colors.title@@Colors')}
            </div>
            <ColorList hidden={!openItemsStore.items.includes('colors')}>
              <NumberInput id="length" input disabled value={animtabStore.length * rgbStore.text.length} min={rgbStore.text.length} class={{ 'w-full opacity-100!': true }}
                onIncrement$={() => animtabStore.length++}
                onDecrement$={() => animtabStore.length--}
              >
                {t('animtab.length@@Gradient Length')}
              </NumberInput>
            </ColorList>
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
              value={AnimationOutput(rgbStore, animtabStore)}
            />

            <div class="hidden sm:flex items-center p-2 gap-2 font-semibold">
              <Settings />
              {t('rgb.options@@Options')}
            </div>
            <Options hidden={!openItemsStore.items.includes('options')}>
              <div class="flex flex-col gap-1 col-span-2">
                <label for="nameinput">
                  {t('animtab.animation.name@@Animation Name')}
                </label>
                <input class="lum-input" id="nameinput" value={animtabStore.name} placeholder={'name'} onInput$={(e, el) => { animtabStore.name = el.value; }}/>
              </div>
              <NumberInput id="speed" input value={animtabStore.speed} class={{ 'w-full': true }} step={50} min={50}
                onInput$={(event, el) => {
                  animtabStore.speed = Number(el.value);
                }}
                onIncrement$={() => {
                  animtabStore.speed = Number(animtabStore.speed) + 50;
                }}
                onDecrement$={() => {
                  animtabStore.speed = Number(animtabStore.speed) - 50;
                }}>
                {t('animtab.animation.interval@@Animation Interval')} (ms)
              </NumberInput>
              <SelectMenu id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabStore.type = Number(el.value); }}
                values={animationStyles}
                value={animtabStore.type}>
                {t('animtab.animation.style@@Animation Style')}
              </SelectMenu>
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

            <Accordion sectionName="outputformat" pcOnly>
              <FileJson />
              {t('animtab.outputFormat.title@@Output Format')}
            </Accordion>
            <div class={{
              'flex flex-col gap-2 transition-all duration-200': true,
              'max-h-0 opacity-0 pointer-events-none': !openItemsStore.items.includes('outputformat'),
              'max-h-125 opacity-100 pointer-events-auto': openItemsStore.items.includes('outputformat'),
            }}>
              <label for="outputformat" class="text-lum-text-secondary">
                {t('animtab.outputFormat.description@@Only use this if you\'re trying to use this tool for a different plugin or know what you\'re doing.')}
              </label>
              <textarea class="lum-input h-32 whitespace-pre" id="outputformat"
                value={animtabStore.outputFormat}
                placeholder={animTABDefaults.outputFormat}
                onInput$={(e, el) => { animtabStore.outputFormat = el.value; }}/>
            </div>
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
  title: 'RGB Birdflop Animated TAB',
  description: 'TAB plugin gradient animation creator. ' + defaultDescription,
});