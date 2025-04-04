import { $, component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/components/util/HexUtils';
import { defaults, v3formats } from '~/components/util/PresetUtils';
import { convertToHex, convertToRGB, disperseColors, generateOutput, getSignificantPoints, hexToHSL } from '~/components/util/RGBUtils';

import { Dropdown, Toggle, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { ChevronDown, Clipboard, Palette, Save, Settings, Sparkles, Type } from 'lucide-icons-qwik';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import Output from '~/components/rgb/Output';
import Presets from '~/components/rgb/Presets';

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

  const decodeText = $((rgbtext: string, threshold: number) => {
    const pattern = /(?:[&§]x((?:[&§][0-9A-Fa-f]){6})|&#([0-9A-Fa-f]{6}))([^§&#]*)/;
    const spans = rgbtext.match(new RegExp(pattern, 'g'));
    if (!spans) return;
    let color = '#ffffff';
    const colors = spans.map((string: string, i: number) => {
      const result = string.match(pattern);
      if (!result) return { hex: color, pos: 0 };
      color = result[1]
        ? `#${result[1].replace(/&/g, '')}`
        : result[2]
          ? `#${result[2]}`
          : result[0];
      return { hex: color, pos: (100 / (spans.length - 1)) * i };
    });
    const text = spans.map((string: string) => {
      const result = string.match(pattern);
      if (!result) return '';
      return result[result.length - 1];
    }).join('');
    store.text = text ?? '';
    const colorHexes = colors.map((color) => color.hex);
    const significantPoints = getSignificantPoints(colorHexes, threshold);
    const newColors = significantPoints.map((color) => {
      const pos = colors.find(c => c.hex == color)?.pos ?? 0;
      return { hex: color, pos };
    });

    store.colors = newColors;
  });

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
              return (
                <span key={`segment-${i}`} style={{
                  color: `#${hex};`,
                  textShadow: `2px 2px 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
                }} class={{
                  'underline': store.underline,
                  'strikethrough': store.strikethrough,
                  'underline-strikethrough': store.underline && store.strikethrough,
                }}>
                  {segment.replace(/ /g, '\u00A0')}
                </span>
              );
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

            <div class={{
              'flex flex-col gap-2 transition-all duration-200': true,
              'max-h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('options') == -1,
              'max-h-[500px] opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('options') != -1,
            }}>
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
                    name: store.customFormat ? `Custom: ${store.format.color
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
                      .replace('$c', '')}`
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
                <div class="flex flex-col gap-1">
                  <Toggle id="disperse" checked={store.disperse}
                    onChange$={(e, el) => { store.disperse = el.checked; }}
                    label={<p class="flex flex-col"><span>Always disperse colors</span></p>} />
                  <p class="text-xs text-gray-400">Turn this on if you want the gradient to always be equally spread out. This will disable the gradient map.</p>
                </div>
                {store.format.color != 'MiniMessage' &&
                  <div class="flex flex-col gap-1">
                    <Toggle id="trimspaces" checked={store.trimspaces}
                      onChange$={(e, el) => { store.trimspaces = el.checked; }}
                      label={'Trim colors from spaces'} />
                    <p class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</p>
                  </div>
                }
              </div>

              {
                store.customFormat && <>
                  <div id="customformat" class={{
                    'flex flex-col gap-2': true,
                  }}>
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
            </div>

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
            <div class={{
              'flex flex-col gap-2 transition-all duration-300': true,
              'max-h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('decode') == -1,
              'max-h-[400px] opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('decode') != -1,
            }} id="decode">
              <p class="text-gray-500">{t('color.decodeDisclaimer@@This feature tries to predict the color points in the gradients and where they are, it is not 100% accurate and we recommend using the presets feature instead to save your gradients.')}</p>
              <label for="decode">
                <span>{t('color.decode@@Decode')}</span>
                <span class="text-gray-500"> - {t('color.decodeSubtitle@@Copy-paste an existing RGB text here to edit it')}</span>
              </label>
              <textarea id="decode" class={{
                'lum-input h-16 w-full font-mc whitespace-pre-wrap': true,
              }} placeholder={generateOutput(store.text, store.colors, store.format, store.prefixsuffix, store.trimspaces, store.colorlength, store.bold, store.italic, store.underline, store.strikethrough)}
              onInput$={(e, el) => {
                const threshold = document.getElementById('threshold') as HTMLInputElement;
                decodeText(el.value, Number(threshold.value));
              }}
              />
              <NumberInput input value={tmpstore.threshold} id="threshold" class={{ 'w-full': true }}
                onInput$={(e, el) => {
                  tmpstore.threshold = Number(el.value);
                  const importhex = document.getElementById('decode') as HTMLInputElement;
                  if (importhex.value) decodeText(importhex.value, tmpstore.threshold);
                }}
                onIncrement$={() => {
                  tmpstore.threshold = tmpstore.threshold + 10;
                  const importhex = document.getElementById('decode') as HTMLInputElement;
                  if (importhex.value) decodeText(importhex.value, tmpstore.threshold);
                }}
                onDecrement$={() => {
                  tmpstore.threshold = tmpstore.threshold - 10;
                  const importhex = document.getElementById('decode') as HTMLInputElement;
                  if (importhex.value) decodeText(importhex.value, tmpstore.threshold);
                }}
              >
                {t('color.threshold@@Threshold')}
                <span class="text-gray-500"> - {t('color.thresholdSubtitle@@Try changing this around if you\'re getting too many colors')}</span>
              </NumberInput>
            </div>
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
            <div class={{
              'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
              'h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('formatting') == -1,
              'opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('formatting') != -1,
            }} id="formatting">
              <Toggle id="bold" checked={store.bold}
                onChange$={(e, el) => { store.bold = el.checked; }}
                label={`${t('color.bold@@Bold')} - ${store.format.char ? `${store.format.char}l` : store.format.bold?.replace('$t', '')}`} />
              <Toggle id="italic" checked={store.italic}
                onChange$={(e, el) => { store.italic = el.checked; }}
                label={`${t('color.italic@@Italic')} - ${store.format.char ? `${store.format.char}o` : store.format.italic?.replace('$t', '')}`} />
              <Toggle id="underline" checked={store.underline}
                onChange$={(e, el) => { store.underline = el.checked; }}
                label={`${t('color.underline@@Underline')} - ${store.format.char ? `${store.format.char}n` : store.format.underline?.replace('$t', '')}`} />
              <Toggle id="strikethrough" checked={store.strikethrough}
                onChange$={(e, el) => { store.strikethrough = el.checked; }}
                label={`${t('color.strikethrough@@Strikethrough')} - ${store.format.char ? `${store.format.char}m` : store.format.strikethrough?.replace('$t', '')}`} />
            </div>
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

              <div class={{
                'flex flex-col gap-2 transition-all duration-200': true,
                'max-h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('formatoptions') == -1,
                'max-h-[500px] opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('formatoptions') != -1,
              }} id="formatoptions">
                {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) && <>
                  <label for="format-char">
                    {t('color.format.character@@Format Character')}
                  </label>
                  <input class="lum-input" id="format-char" value={store.format.char} placeholder="&" onInput$={(e, el) => { store.format.char = el.value; }}/>
                </>}
                {!store.format.char &&
                  <>
                    <label for="format-bold">
                      {t('color.format.bold@@Bold')}
                    </label>
                    <input class="lum-input" id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(e, el) => { store.format.bold = el.value; }}/>
                    <label for="format-italic">
                      {t('color.format.italic@@Italic')}
                    </label>
                    <input class="lum-input" id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(e, el) => { store.format.italic = el.value; }}/>
                    <label for="format-underline">
                      {t('color.format.underline@@Underline')}
                    </label>
                    <input class="lum-input" id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(e, el) => { store.format.underline = el.value; }}/>
                    <label for="format-strikethrough">
                      {t('color.format.strikethrough@@Strikethrough')}
                    </label>
                    <input class="lum-input" id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(e, el) => { store.format.strikethrough = el.value; }}/>
                    <div class="py-3 font-mono">
                      <p>{t('color.placeholders@@Placeholders:')}</p>
                      <p>$t = Output Text</p>
                    </div>
                  </>
                }
              </div>
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