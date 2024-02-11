import { component$, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput, { RawTextInput } from '~/components/elements/TextInput';
import ColorInput from '~/components/elements/ColorInput';
import SelectInput from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';

import { Gradient } from '~/components/util/HexUtils';
import { convertToRGB, convertToHex, getRandomColor, generateOutput } from '~/components/util/RGBUtils';
import { presetVersion } from '~/components/util/PresetUtils';
import OutputField from '~/components/elements/OutputField';

import { ChevronDown, ChevronUp, ColorFillOutline, SettingsOutline, Text } from 'qwik-ionicons';

import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookie } from '~/components/util/SharedUtils';

const formats = [
  '&#$1$2$3$4$5$6$f$c',
  '<#$1$2$3$4$5$6>$f$c',
  '&x&$1&$2&$3&$4&$5&$6$f$c',
  '§x§$1§$2§$3§$4§$5§$6$f$c',
  '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
  'MiniMessage',
];

const presets = {
  'birdflop': ['#084CFB', '#ADF3FD'],
  'SimplyMC': ['#00FFE0', '#EB00FF'],
  'Rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  'Skyline': ['#1488CC', '#2B32B2'],
  'Mango': ['#FFE259', '#FFA751'],
  'Vice City': ['#3494E6', '#EC6EAD'],
  'Dawn': ['#F3904F', '#3B4371'],
  'Rose': ['#F4C4F3', '#FC67FA'],
  'Firewatch': ['#CB2D3E', '#EF473A'],
};

export const setCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    const existingCookie = cookie[key];
    if (existingCookie === json[key]) return;
    document.cookie = `${key}=${encodeURIComponent(json[key])}; path=/`;
  });
});

export default component$(() => {
  useSpeak({ assets: ['gradient', 'color'] });
  const t = inlineTranslate();

  const store: any = useStore({
    colors: presets.birdflop,
    text: 'birdflop',
    format: '&#$1$2$3$4$5$6$f$c',
    formatchar: '&',
    customFormat: false,
    prefix: '',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alerts: [],
  }, { deep: true });

  const handleSwap = $(
    function handleSwap(currentIndex: number, newIndex: number) {
      const colorsLength = store.colors.length;
      if (newIndex < 0) {
        newIndex = colorsLength - 1;
      } else if (newIndex >= colorsLength) {
        newIndex = 0;
      }

      const temp = store.colors[currentIndex];
      store.colors[currentIndex] = store.colors[newIndex];
      store.colors[newIndex] = temp;
      setCookie(JSON.stringify(store));
    },
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const userstore = await getCookie(JSON.stringify(store));
    const parsedUserStore = JSON.parse(userstore);
    for (const key of Object.keys(parsedUserStore)) {
      const value = parsedUserStore[key];
      store[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]">
      <div class="my-10 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('gradient.title@@Hex Gradient')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-12">
          {t('gradient.subtitle@@Hex color gradient creator')}
        </h2>

        <OutputField id="Output" charlimit={256} value={generateOutput(store.text, store.colors, store.format, store.formatchar, store.prefix, store.bold, store.italic, store.underline, store.strikethrough)}>
          <h1 class="font-bold text-xl sm:text-3xl mb-2">
            {t('color.output@@Output')}
          </h1>
          <span class="text-sm sm:text-base pb-4">
            {t('color.outputSubtitle@@This is what you put in the chat. Click on it to copy.')}
          </span>
        </OutputField>

        <h1 class={{
          'text-4xl sm:text-6xl my-6 break-all max-w-7xl -space-x-[1px] font-mc': true,
          'font-mc-bold': store.bold,
          'font-mc-italic': store.italic,
          'font-mc-bold-italic': store.bold && store.italic,
        }}>
          {(() => {
            const text = store.text ? store.text : 'birdflop';

            let colors = store.colors.map((color: string) => convertToRGB(color));
            if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

            const gradient = new Gradient(colors, text.replace(/ /g, '').length);

            let hex = '';
            return text.split('').map((char: string, i: number) => {
              if (char != ' ') hex = convertToHex(gradient.next());
              return (
                <span key={`char${i}`} style={`color: #${hex};`} class={{
                  'underline': store.underline,
                  'strikethrough': store.strikethrough,
                  'underline-strikethrough': store.underline && store.strikethrough,
                }}>
                  {char}
                </span>
              );
            });
          })()}
        </h1>

        <div id="mobile-navbuttons" class="my-4 sm:hidden">
          <div class="flex gap-2">
            <Button aria-label="Colors" onClick$={() => {
              document.getElementById('colors')!.classList.remove('hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.add('hidden');
            }}>
              <ColorFillOutline width="24" />
            </Button>
            <Button aria-label="Inputs" onClick$={() => {
              document.getElementById('colors')!.classList.add('hidden');
              document.getElementById('inputs')!.classList.replace('hidden', 'flex');
              document.getElementById('formatting')!.classList.add('hidden');
            }}>
              <SettingsOutline width="24" />
            </Button>
            <Button aria-label="Formatting" onClick$={() => {
              document.getElementById('colors')!.classList.add('hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.remove('hidden');
            }}>
              <Text width="24" class="fill-white" />
            </Button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="hidden sm:flex flex-col gap-3 relative" id="colors">
            <SelectInput id="color-preset" label={t('color.colorPreset@@Color Preset')} onChange$={
              (event: any) => {
                if (event.target!.value == 'custom') return;
                store.colors = presets[event.target!.value as keyof typeof presets];
                setCookie(JSON.stringify(store));
              }
            } value={Object.keys(presets).find((preset: any) => presets[preset as keyof typeof presets].toString() == store.colors.toString()) ?? 'custom'}>
              {Object.keys(presets).map((preset: any) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value={'custom'}>
                {t('color.custom@@Custom')}
              </option>
            </SelectInput>
            <NumberInput input min={2} max={store.text.length} value={store.colors.length} id="colorsinput"
              onChange$={(event: any) => {
                if (event.target!.value > store.text.length) event.target!.value = store.text.length;
                if (event.target!.value < 2) event.target!.value = 2;
                const newColors = [];
                for (let i = 0; i < event.target!.value; i++) {
                  if (store.colors[i]) newColors.push(store.colors[i]);
                  else newColors.push(getRandomColor());
                }
                store.colors = newColors;
                setCookie(JSON.stringify(store));
              }}
              onIncrement$={() => {
                if (store.colors.length < store.text.length) {
                  store.colors.push(getRandomColor());
                  setCookie(JSON.stringify(store));
                }
              }}
              onDecrement$={() => {
                if (store.colors.length > 2) {
                  store.colors.pop();
                  setCookie(JSON.stringify(store));
                }
              }}
            >
              {t('color.colorAmount@@Color Amount')}
            </NumberInput>
            <div class="flex flex-col gap-2 overflow-auto sm:max-h-[500px]">
              {store.colors.map((color: string, i: number) => {
                return <div key={`color${i + 1}`} class="flex items-end">
                  <ColorInput
                    id={`color${i + 1}`}
                    value={color}
                    onInput$={(newColor: string) => {
                      store.colors[i] = newColor;
                      setCookie(JSON.stringify(store));
                    }}
                  >
                    {t('color.hexColor@@Hex Color')} {i + 1}
                  </ColorInput>
                  <div class="bg-gray-800 flex ml-2 rounded-md border border-gray-700">
                    <button onClick$={() => handleSwap(i, i - 1)} class="hover:bg-gray-700 px-2 py-3 rounded-l-md transition-all">
                      <ChevronUp width="20" />
                    </button>
                    <div class="bg-gray-700 w-px" />
                    <button onClick$={() => handleSwap(i, i + 1)} class="hover:bg-gray-700 px-2 py-3 rounded-r-md transition-all">
                      <ChevronDown width="20" />
                    </button>
                  </div>
                </div>;
              })}
            </div>
          </div>
          <div class="md:col-span-2 lg:col-span-3">
            <div class="flex flex-col gap-3" id="inputs">
              <TextInput id="input" value={store.text} placeholder="birdflop" onInput$={(event: any) => { store.text = event.target!.value; setCookie(JSON.stringify(store)); }}>
                {t('color.inputText@@Input Text')}
              </TextInput>

              <div class="flex flex-col md:grid grid-cols-2 gap-2">
                <SelectInput id="format" label={t('color.colorFormat@@Color Format')} value={store.customFormat ? 'custom' : store.format} onChange$={
                  (event: any) => {
                    if (event.target!.value == 'custom') {
                      store.customFormat = true;
                    }
                    else {
                      store.customFormat = false;
                      store.format = event.target!.value;
                    }
                    setCookie(JSON.stringify(store));
                  }
                }>
                  {formats.map((format: any) => (
                    <option key={format} value={format}>
                      {format
                        .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                        .replace('$f', `${store.bold ? store.formatchar + 'l' : ''}${store.italic ? store.formatchar + 'o' : ''}${store.underline ? store.formatchar + 'n' : ''}${store.strikethrough ? store.formatchar + 'm' : ''}`)
                        .replace('$c', '')}
                    </option>
                  ))}
                  <option value={'custom'}>
                    {store.customFormat ? store.format
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.formatchar + 'l' : ''}${store.italic ? store.formatchar + 'o' : ''}${store.underline ? store.formatchar + 'n' : ''}${store.strikethrough ? store.formatchar + 'm' : ''}`)
                      .replace('$c', '')
                      : t('color.custom@@Custom')}
                  </option>
                </SelectInput>
                <TextInput id="formatchar" value={store.formatchar} placeholder="&" onInput$={(event: any) => { store.formatchar = event.target!.value; setCookie(JSON.stringify(store)); }}>
                  {t('color.formatCharacter@@Format Character')}
                </TextInput>
              </div>

              {
                store.customFormat && <>
                  <TextInput id="customformat" value={store.format} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format = event.target!.value; setCookie(JSON.stringify(store)); }} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4">
                    {t('color.customFormat@@Custom Format')}
                  </TextInput>
                  <div class="pb-4">
                    <p>{t('color.placeholders@@Placeholders:')}</p>
                    <p>$1 - (R)RGGBB</p>
                    <p>$2 - R(R)GGBB</p>
                    <p>$3 - RR(G)GBB</p>
                    <p>$4 - RRG(G)BB</p>
                    <p>$5 - RRGG(B)B</p>
                    <p>$6 - RRGGB(B)</p>
                    <p>$f - {t('color.formatting@@Formatting')}</p>
                    <p>$c - {t('color.character@@Character')}</p>
                  </div>
                </>
              }

              <TextInput id="prefix" value={store.prefix} placeholder={t('gradient.prefixPlaceholder@@example: \'/nick \'')} onInput$={(event: any) => { store.prefix = event.target!.value; setCookie(JSON.stringify(store)); }}>
                {t('gradient.prefix@@Prefix (Usually used for commands)')}
              </TextInput>

              <label>
                {t('color.presets@@Presets')}
              </label>
              <div class="flex gap-2 my-2">
                <Button id="export" onClick$={() => {
                  navigator.clipboard.writeText(JSON.stringify({ version: presetVersion, ...store, alerts: undefined }));
                  const alert = {
                    class: 'text-green-500',
                    translate: 'color.exportedPreset',
                    text: 'Successfully exported preset to clipboard!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.export@@Export')}
                </Button>
                <RawTextInput name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (event: any) => {
                  let json: any;
                  try {
                    json = JSON.parse(event.target!.value);
                  } catch (error) {
                    const alert = {
                      class: 'text-red-500',
                      translate: 'color.invalidPreset',
                      text: 'INVALID PRESET!\nIf this is an old preset, please update it using the <a class="text-blue-500" href="/PresetTools">Preset Tools</a> page, If not please report to the <a class="text-blue-500" href="https://discord.gg/9vUZ9MREVz">Developers</a>.',
                    };
                    store.alerts.push(alert);
                    return setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 5000);
                  }
                  Object.keys(json).forEach((key: any) => {
                    store[key] = json[key];
                  });
                  const alert = {
                    class: 'text-green-500',
                    translate: 'color.importedPreset',
                    text: 'Successfully imported preset!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }} />
              </div>
              {store.alerts.map((alert: any, i: number) => (
                <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(`${alert.translate}@@${alert.text}`)} />
              ))}
            </div>
            <div class="sm:mt-6 mb-4 space-y-4 hidden sm:block" id="formatting">
              <Toggle id="bold" checked={store.bold} onChange$={(event: any) => { store.bold = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                {t('color.bold@@Bold')} - {store.formatchar + 'l'}
              </Toggle>
              <Toggle id="italic" checked={store.italic} onChange$={(event: any) => { store.italic = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                {t('color.italic@@Italic')} - {store.formatchar + 'o'}
              </Toggle>
              <Toggle id="underline" checked={store.underline} onChange$={(event: any) => { store.underline = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                {t('color.underline@@Underline')} - {store.formatchar + 'n'}
              </Toggle>
              <Toggle id="strikethrough" checked={store.strikethrough} onChange$={(event: any) => { store.strikethrough = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                {t('color.strikethrough@@Strikethrough')} - {store.formatchar + 'm'}
              </Toggle>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Hex Gradients',
  meta: [
    {
      name: 'description',
      content: 'Hex color gradient creator',
    },
    {
      name: 'og:description',
      content: 'Hex color gradient creator',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};