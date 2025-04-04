import { component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, types, v3formats } from '~/components/util/PresetUtils';
import { AnimationOutput, getAnimFrames, hexToHSL } from '~/components/util/RGBUtils';

import { Dropdown, Toggle, NumberInput } from '@luminescent/ui-qwik';
import { ChevronDown, Clipboard, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { rgbDefaults } from '../rgb';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import Output from '~/components/rgb/Output';
import Presets from '~/components/rgb/Presets';
import Decode from '~/components/rgb/Decode';
import Formatting from '~/components/rgb/Formatting';
import FormatOptions from '~/components/rgb/FormatOptions';

export const animTABDefaults = {
  name: defaults.name,
  type: defaults.type,
  speed: defaults.speed,
  length: defaults.length,
  outputFormat: defaults.outputFormat,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  const animtabCookies = await getCookies(cookie, 'animtab', url.searchParams) as Partial<typeof animTABDefaults>;
  const rgbCookies = await getCookies(cookie, 'rgb', url.searchParams) as Partial<typeof rgbDefaults>;
  const presetCookies = await getCookies(cookie, 'presets') as { savedPresets: Partial<typeof defaults>[] };
  if (!rgbCookies.customFormat) {
    delete rgbCookies.format;
    delete animtabCookies.outputFormat;
  }
  return {
    animtab: animtabCookies,
    rgb: rgbCookies,
    presets: presetCookies,
  };
});

export default component$(() => {
  useSpeak({ assets: ['animtab', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...structuredClone(rgbDefaults),
    ...cookies.rgb,
  }, { deep: true });
  const presetstore = useStore({
    ...cookies.presets,
  });

  const animtabstore = useStore({
    ...animTABDefaults,
    ...cookies.animtab,
  }, { deep: true });

  const settingStore = useStore({
    advanced: false,
  });

  const tmpstore: {
    threshold: number,
    sectionsOpened: string[],
    alerts: {
      class: string,
      text: string,
    }[],
    frames: (string | null)[][],
    frame: number,
  } = useStore({
    threshold: 50,
    sectionsOpened: [],
    alerts: [] as {
      class: string,
      text: string,
    }[],
    frames: [],
    frame: 0,
  }, { deep: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (tmpstore.frames[0] && deltaTime > animtabstore.speed) {
        tmpstore.frame = tmpstore.frame + 1 >= tmpstore.frames.length ? 0 : tmpstore.frame + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  useTask$(({ track }) => {
    if (isBrowser) {
      setCookies('rgb', store);
      setCookies('animtab', { version: store.version, ...animtabstore });
    }
    (Object.keys(store) as Array<keyof typeof store>).forEach((key) => {
      track(() => store[key]);
    });
    (Object.keys(animtabstore) as Array<keyof typeof animtabstore>).forEach((key) => {
      track(() => animtabstore[key]);
    });
    const { frames } = getAnimFrames({ ...store, ...animtabstore, text: store.text != '' ? store.text : 'Birdflop' });
    if (animtabstore.type == 1) {
      tmpstore.frames = frames.reverse();
    }
    else if (animtabstore.type == 3) {
      const frames2 = frames.slice();
      tmpstore.frames = frames.reverse().concat(frames2);
    }
    else {
      tmpstore.frames = frames;
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

        <Input store={store}>
          {(() => {
            if (!store.text || !tmpstore.frames[0]) return '\u00A0';

            const colors = tmpstore.frames[tmpstore.frame];
            if (!colors) return '\u00A0';

            const segments = [...store.text.matchAll(new RegExp(`.{1,${store.colorlength}}`, 'g'))];
            let i = 0;
            return segments.map((segment) => {
              i = store.trimspaces ? segment[0] == ' ' ? i : i + 1 : i + 1;
              const color = `#${colors[i] ?? colors[i - 1] ?? colors[0]}`;
              const shadow = hexToHSL(color);
              if (shadow.l > 50) shadow.s = shadow.s * 0.2;
              shadow.l = Math.round(shadow.l * 0.2);
              return <span key={`char${i}`} style={{
                color,
                textShadow: `2px 2px 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
              }} class={{
                'underline': store.underline,
                'strikethrough': store.strikethrough,
                'underline-strikethrough': store.underline && store.strikethrough,
              }}>
                {segment[0].replace(/ /g, '\u00A0')}
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
            <NumberInput id="length" input disabled value={animtabstore.length * store.text.length} min={store.text.length} class={{ 'w-full !opacity-100': true }}
              onIncrement$={() => {
                animtabstore.length++;
              }}
              onDecrement$={() => {
                animtabstore.length--;
              }}
            >
              {t('animtab.length@@Gradient Length')}
            </NumberInput>
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
              value={AnimationOutput({ ...store, ...animtabstore })} />

            <div class="flex flex-col md:grid grid-cols-2 gap-2">
              <Dropdown id="format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)} class={{ 'w-full': true }} onChange$={
                (e, el) => {
                  if (el.value == 'custom') {
                    store.customFormat = true;
                  }
                  else {
                    store.customFormat = false;
                    store.format = JSON.parse(el.value);
                  }
                }
              } values={[
                ...v3formats.map(format => ({
                  name: format.color
                    .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                    .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
                    .replace('$c', ''),
                  value: JSON.stringify(format),
                })),
                {
                  name: store.customFormat ? store.format.color
                    .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                    .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
                    .replace('$c', '')
                    : t('color.custom@@Custom'),
                  value: 'custom',
                },
              ]}>
                {t('color.colorFormat@@Color Format')}
              </Dropdown>
              <div class="flex flex-col gap-1">
                <label for="prefixsuffix">
                  {t('color.prefixsuffix@@Prefix/Suffix')}
                </label>
                <input class="lum-input" id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(e, el) => { store.prefixsuffix = el.value; }}/>
              </div>

              <Toggle id="trimspaces" checked={store.trimspaces}
                onChange$={(e, el) => { store.trimspaces = el.checked; }}
                label={<p class="flex flex-col"><span>Trim colors from spaces</span><span class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</span></p>} />

              <div class="flex flex-col gap-1">
                <label for="nameinput">
                  {t('animtab.animationName@@Animation Name')}
                </label>
                <input class="lum-input" id="nameinput" value={animtabstore.name} placeholder={'name'} onInput$={(e, el) => { animtabstore.name = el.value; }}/>
              </div>
              <NumberInput id="speed" input value={animtabstore.speed} class={{ 'w-full': true }} step={50} min={50}
                onInput$={(event, el) => {
                  animtabstore.speed = Number(el.value);
                }}
                onIncrement$={() => {
                  animtabstore.speed = Number(animtabstore.speed) + 50;
                }}
                onDecrement$={() => {
                  animtabstore.speed = Number(animtabstore.speed) - 50;
                }}>
                {t('animtab.speed@@Speed')}
              </NumberInput>
              <Dropdown id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabstore.type = Number(el.value); }}
                values={types}
                value={animtabstore.type}>
                {t('animtab.outputType@@Output Type')}
              </Dropdown>
            </div>
            {
              store.customFormat && <>
                <div class="flex flex-col gap-1">
                  <label for="customformat">
                    {t('color.customFormat@@Custom Format')}
                  </label>
                  <input class="lum-input" id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { store.format.color = el.value; }}/>
                  <div class="py-3 font-mono">
                    <p>{t('color.placeholders@@Placeholders:')}</p>
                    <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
                    <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
                    <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
                    <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
                    <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
                    <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
                    {store.format.char && <p>$f = {t('color.formatting@@Formatting')}</p>}
                    <p>$c = {t('color.character@@Character')}</p>
                  </div>
                </div>
              </>
            }
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
            <Toggle id="advanced" checked={settingStore.advanced}
              onChange$={(e, el) => { settingStore.advanced = el.checked; }}
              label={<p class="flex flex-col"><span>Show advanced settings</span><span class="text-xs text-gray-400">These settings are hidden, only use them if you're trying to use this tool for a different plugin or know what you're doing.</span></p>} />

            {settingStore.advanced && <div class="flex flex-col gap-1">
              <label for="formatinput">
                {t('animtab.outputFormat@@Output Format')}
              </label>
              <textarea class="lum-input h-32 whitespace-pre" id="formatinput" value={animtabstore.outputFormat} placeholder="birdflop" onInput$={(e, el) => { animtabstore.outputFormat = el.value; }}/>
            </div>}
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
