import { component$, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, types } from '~/util/PresetUtils';
import { AnimationOutput, getAnimFrames, hexToHSL } from '~/util/RGBUtils';

import { Dropdown, NumberInput } from '@luminescent/ui-qwik';
import { ChevronDown, Clipboard, FileJson, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { rgbDefaults, rgbStoreContext, useCookies } from '../rgb';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import Output from '~/components/rgb/Output';
import Presets from '~/components/rgb/Presets';
import Decode from '~/components/rgb/Decode';
import Formatting from '~/components/rgb/Formatting';
import FormatOptions from '~/components/rgb/FormatOptions';
import Options from '~/components/rgb/Options';

export const animTABDefaults = {
  name: defaults.name,
  type: defaults.type,
  speed: defaults.speed,
  length: defaults.length,
  outputFormat: defaults.outputFormat,
};

export const useAnimTABCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, 'animtab', url.searchParams) as Partial<typeof animTABDefaults>;
});

export default component$(() => {
  useSpeak({ assets: ['animtab', 'color'] });
  const t = inlineTranslate();
  const rgbCookies = useCookies().value;
  const animTABCookies = useAnimTABCookies();

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const animtabStore = useStore({
    ...animTABDefaults,
    ...animTABCookies,
  }, { deep: true });

  const frames = useStore({
    list: [] as (string | null)[][],
    current: 0,
  }, { deep: true });

  const openSections = useStore([] as string[]);
  const threshold = useSignal(50);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
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

  useTask$(({ track }) => {
    if (isBrowser) {
      setCookies('rgb', rgbStore);
      setCookies('animtab', { version: rgbStore.version, ...animtabStore });
    }
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach((key) => {
      track(() => rgbStore[key]);
    });
    (Object.keys(animtabStore) as Array<keyof typeof animtabStore>).forEach((key) => {
      track(() => animtabStore[key]);
    });
    const { frames: newFrames } = getAnimFrames({ ...rgbStore, ...animtabStore, text: rgbStore.text != '' ? rgbStore.text : 'Birdflop' });
    if (animtabStore.type == 1) {
      frames.list = newFrames.reverse();
    }
    else if (animtabStore.type == 3) {
      const frames2 = newFrames.slice();
      frames.list = newFrames.reverse().concat(frames2);
    }
    else {
      frames.list = newFrames;
    }
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('animtab.title@@Animated TAB')}
        </h1>
        <h2 class="text-gray-50 mt-1 mb-5">
          {t('animtab.subtitle@@TAB plugin gradient animation creator')}
        </h2>

        <Input>
          {(() => {
            if (!rgbStore.text || !frames.list[0]) return '\u00A0';

            const colors = frames.list[frames.current];
            if (!colors) return '\u00A0';

            const segments = [...rgbStore.text.matchAll(new RegExp(`.{1,${rgbStore.colorlength}}`, 'g'))];
            let i = 0;
            return segments.map((segment) => {
              const color = `#${colors[i]}`;
              const shadow = hexToHSL(color);
              if (shadow.l > 50) shadow.s = shadow.s * 0.2;
              shadow.l = Math.round(shadow.l * 0.2);
              const shadowLength = rgbStore.previewStyle == 'default' ? '4px 4px' : '2px 2px';
              i = rgbStore.trimspaces ? segment[0] == ' ' ? i : i + 1 : i + 1;
              return <span key={`char${i}`} style={{
                color,
                textShadow: `${shadowLength} 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
              }} class={{
                'underline': rgbStore.underline,
                'strikethrough': rgbStore.strikethrough,
                'underline-strikethrough': rgbStore.underline && rgbStore.strikethrough,
              }}>
                {segment[0].replace(/ /g, '\u00A0')}
              </span>;
            });
          })()}
        </Input>

        <ColorMap />

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2">
          <div class="flex flex-col gap-2 relative" id="column1">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (openSections.indexOf('colors') == -1) openSections.push('colors');
              else openSections.splice(openSections.indexOf('colors'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Palette size={26} />
                {t('color.colors@@Colors')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': openSections.indexOf('colors') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <ColorList hidden={openSections.indexOf('colors') == -1}>
              <NumberInput id="length" input disabled value={animtabStore.length * rgbStore.text.length} min={rgbStore.text.length} class={{ 'w-full !opacity-100': true }}
                onIncrement$={() => animtabStore.length++}
                onDecrement$={() => animtabStore.length--}
              >
                {t('animtab.length@@Gradient Length')}
              </NumberInput>
            </ColorList>
          </div>

          <div class="flex flex-col gap-1 md:col-span-2 sm:px-2 sm:border-x border-gray-800/80" id="column2">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (openSections.indexOf('output') == -1) openSections.push('output');
              else openSections.splice(openSections.indexOf('output'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Clipboard size={26} />
                {t('color.output@@Output')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': openSections.indexOf('output') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Output hidden={openSections.indexOf('output') == -1}
              value={AnimationOutput({ ...rgbStore, ...animtabStore })} />

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (openSections.indexOf('options') == -1) openSections.push('options');
              else openSections.splice(openSections.indexOf('options'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Settings size={26} />
                {t('color.options@@Options')}
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': openSections.indexOf('options') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Options hidden={openSections.indexOf('options') == -1}>
              <div class="flex flex-col gap-1 col-span-2">
                <label for="nameinput">
                  {t('animtab.animationName@@Animation Name')}
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
                {t('animtab.interval@@Animation Interval')} (ms)
              </NumberInput>
              <Dropdown id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabStore.type = Number(el.value); }}
                values={types}
                value={animtabStore.type}>
                {t('animtab.animationStyle@@Animation Style')}
              </Dropdown>
            </Options>

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (openSections.indexOf('presets') == -1) openSections.push('presets');
              else openSections.splice(openSections.indexOf('presets'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Save size={26} />
                {t('color.presets@@Presets')}
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': openSections.indexOf('presets') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Presets hidden={openSections.indexOf('presets') == -1}/>

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (openSections.indexOf('decode') == -1) openSections.push('decode');
              else openSections.splice(openSections.indexOf('decode'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Sparkles size={26} />
                {t('color.decode@@Decode')}
                <span class="lum-bg-blue-950 rounded text-xs px-1 py-0.5 ml-1">BETA</span>
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': openSections.indexOf('decode') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Decode threshold={threshold} hidden={openSections.indexOf('decode') == -1} />

          </div>

          <div class="mb-4 flex flex-col gap-2" id="column3">
            <button class={{
              'lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md': true,
              'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': true,
              'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': true,
            }} onClick$={() => {
              if (openSections.indexOf('formatting') == -1) openSections.push('formatting');
              else openSections.splice(openSections.indexOf('formatting'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <Type size={26} />
                {t('color.formatting@@Formatting')}
              </h1>
              <div class={{
                'transition-transform duration-200 sm:hidden': true,
                'rotate-180': openSections.indexOf('formatting') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <Formatting hidden={openSections.indexOf('formatting') == -1} />

            {rgbStore.customFormat && <>
              <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
                if (openSections.indexOf('formatoptions') == -1) openSections.push('formatoptions');
                else openSections.splice(openSections.indexOf('formatoptions'), 1);
              }}>
                <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                  <Settings size={26} />
                  {t('color.formatoptions@@Format Options')}
                </h1>
                <div class={{
                  'transition-transform duration-200': true,
                  'rotate-180': openSections.indexOf('formatoptions') != -1,
                }}>
                  <ChevronDown size={20} />
                </div>
              </button>
              <FormatOptions hidden={openSections.indexOf('formatoptions') == -1} />
            </>}

            <button class="lum-btn lum-bg-gray-800/30 rounded-md lum-pad-md" onClick$={() => {
              if (openSections.indexOf('outputformat') == -1) openSections.push('outputformat');
              else openSections.splice(openSections.indexOf('outputformat'), 1);
            }}>
              <h1 class="flex flex-1 md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                <FileJson size={26} />
                {t('animtab.outputFormat@@Output Format')}
              </h1>
              <div class={{
                'transition-transform duration-200': true,
                'rotate-180': openSections.indexOf('outputformat') != -1,
              }}>
                <ChevronDown size={20} />
              </div>
            </button>
            <div class={{
              'flex flex-col gap-2 transition-all duration-200': true,
              'max-h-0 opacity-0 pointer-events-none': openSections.indexOf('outputformat') == -1,
              'max-h-[500px] opacity-100 pointer-events-auto': openSections.indexOf('outputformat') != -1,
            }}>
              <label for="outputformat" class="text-gray-500">
                Only use this if you're trying to use this tool for a different plugin or know what you're doing
              </label>
              <textarea class="lum-input h-32 whitespace-pre" id="outputformat"
                value={animtabStore.outputFormat}
                placeholder={animTABDefaults.outputFormat}
                onInput$={(e, el) => { animtabStore.outputFormat = el.value; }}/>
            </div>
          </div>
        </div>
        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
        </div>
      </div>
      <script
        async
        type='text/javascript'
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947"
        crossOrigin='anonymous' />
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Animated TAB',
  meta: [
    {
      name: 'description',
      content: 'TAB plugin gradient animation creator',
    },
    {
      name: 'og:description',
      content: 'TAB plugin gradient animation creator',
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
