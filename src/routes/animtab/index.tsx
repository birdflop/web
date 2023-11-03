import { component$, useVisibleTask$, useStore, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput, { RawTextInput } from '~/components/elements/TextInput';
import ColorInput from '~/components/elements/ColorInput';
import SelectInput from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';

import { presetVersion } from '~/components/util/PresetUtils';
import OutputField from '~/components/elements/OutputField';
import { getAnimFrames, getRandomColor } from '~/components/util/RGBUtils';
import { AnimationOutput } from '~/components/util/RGBUtils';

import { ColorFillOutline, SettingsOutline, Text } from 'qwik-ionicons';

import { useTranslate, inlineTranslate as it, Speak, useSpeakContext } from 'qwik-speak';

const formats = [
  '&#$1$2$3$4$5$6$f$c',
  '&x&$1&$2&$3&$4&$5&$6$f$c',
];

const presets = {
  'SimplyMC': ['#00FFE0', '#EB00FF'],
  'Rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  'Skyline': ['#1488CC', '#2B32B2'],
  'Mango': ['#FFE259', '#FFA751'],
  'Vice City': ['#3494E6', '#EC6EAD'],
  'Dawn': ['#F3904F', '#3B4371'],
  'Rose': ['#F4C4F3', '#FC67FA'],
  'Firewatch': ['#CB2D3E', '#EF473A'],
};

const types = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];

export const setCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  delete json.frames;
  delete json.frame;

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function(pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    const existingCookie = cookie[key];
    if (existingCookie === json[key]) return;
    document.cookie = `${key}=${encodeURIComponent(json[key])}; path=/`;
  });
});

export const getCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  delete json.frames;
  delete json.frame;
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function(pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    if (!cookie[key]) return;
    let existingCookie: string | string[] = decodeURIComponent(cookie[key]);
    if (key == 'colors' && existingCookie) existingCookie = existingCookie.split(',');
    json[key] = existingCookie;
  });
  return JSON.stringify(json);
});

export default component$(() => {
  const ctx = useSpeakContext();
  const t = useTranslate();

  const store: any = useStore({
    colors: [],
    name: 'logo',
    text: 'SimplyMC',
    type: 1,
    speed: 50,
    format: '&#$1$2$3$4$5$6$f$c',
    formatchar: '&',
    customFormat: false,
    outputFormat: '%name%:\n  change-interval: %speed%\n  texts:\n%output%',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alerts: [],
    frames: [],
    frame: 0,
    length: 1,
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

  useVisibleTask$(() => {
    getCookie(JSON.stringify(store)).then((userstore: any) => {
      const parsedUserStore = JSON.parse(userstore);
      for (const key of Object.keys(parsedUserStore)) {
        const value = parsedUserStore[key];
        if (key == 'colors') store[key] = value;
        store[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
      if (store.colors.length == 0) store.colors = ['#00FFE0', '#EB00FF'];
    });

    let speed = store.speed;

    let frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);

    function setFrame() {
      if (!store.frames[0]) return;
      if (speed != store.speed) {
        clearInterval(frameInterval);
        speed = store.speed;
        frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);
      }
      store.frame = store.frame + 1 >= store.frames.length ? 0 : store.frame + 1;
    }
  });

  useVisibleTask$(({ track }) => {
    Object.keys(store).forEach((key: any) => {
      if (key == 'frames' || key == 'frame' || key == 'alerts') return;
      if (key == 'colors') track(() => store.colors.length);
      else track(() => store[key]);
    });
    const { frames } = getAnimFrames(store);
    if (store.type == 1) {
      store.frames = frames.reverse();
    }
    else if (store.type == 3) {
      const frames2 = frames.slice();
      store.frames = frames.reverse().concat(frames2);
    }
    else {
      store.frames = frames;
    }
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-68px)]">
      <Speak assets={['animtab', 'color']}>
        <div class="my-10 min-h-[60px] w-full">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('animtab.title@@Animated TAB')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-12">
            {t('animtab.subtitle@@TAB plugin gradient animation creator')}
          </h2>

          <OutputField value={AnimationOutput(store)}>
            <h1 class="font-bold text-xl sm:text-3xl mb-2">
              {t('color.output@@Output')}
            </h1>
            <span class="text-sm sm:text-base pb-4">
              {t('color.outputSubtitle@@This is what you put in the chat. Click on it to copy.')}
            </span>
          </OutputField>

          <h1 class={`text-4xl sm:text-6xl my-6 break-all max-w-7xl -space-x-[1px] font${store.bold ? '-bold' : ''}${store.italic ? '-italic' : ''}`}>
            {(() => {
              const text = store.text ? store.text : 'SimplyMC';

              if (!store.frames[0]) return;
              const colors = store.frames[store.frame];
              if (!colors) return;

              return text.split('').map((char: string, i: number) => (
                <span key={`char${i}`} style={`color: #${colors[i] ?? colors[i - 1] ?? colors[0]};`} class={`font${store.underline ? '-underline' : ''}${store.strikethrough ? '-strikethrough' : ''}`}>
                  {char}
                </span>
              ));
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
                document.getElementById('inputs')!.classList.add('hidden');
                document.getElementById('formatting')!.classList.remove('hidden');
              }}>
                <Text width="24" class="fill-white" />
              </Button>
            </div>
          </div>

          <div class="grid sm:grid-cols-4 gap-2">
            <div class="sm:pr-4 hidden sm:flex flex-col gap-3 relative" id="colors">
              <NumberInput id="colorsinput" onIncrement$={() => { if (store.colors.length < store.text.length) { store.colors.push(getRandomColor()); setCookie(JSON.stringify(store)); } }} onDecrement$={() => { if (store.colors.length > 2) { store.colors.pop(); setCookie(JSON.stringify(store)); } }}>
                {t('color.colorAmount@@Color Amount')} - {store.colors.length}
              </NumberInput>
              <NumberInput id="length" step={1} min={1} onIncrement$={() => { store.length++; setCookie(JSON.stringify(store)); }} onDecrement$={() => { if (store.length > 1) store.length--; setCookie(JSON.stringify(store)); }}>
                {t('animtab.length@@Gradient Length')} - {store.length * store.text.length}
              </NumberInput>
              <div class="flex flex-col gap-2 overflow-auto sm:max-h-[500px]">
                {store.colors.map((color: string, i: number) => {
                  return (
                    <ColorInput
                      key={`color${i + 1}`}
                      id={`color${i + 1}`}
                      value={color}
                      onInput$={(newColor: string) => {
                        store.colors[i] = newColor;
                        setCookie(JSON.stringify(store));
                      }}
                    >
                      <button
                        onClick$={() => {
                          handleSwap(i, i - 1);
                        }}
                        class={'pe-2'}
                      >
                    ↑
                      </button>
                      <button
                        onClick$={() => {
                          handleSwap(i, i + 1);
                        }}
                        class={'pe-4'}
                      >
                    ↓
                      </button>
                      {t('color.hexColor@@Hex Color')} {i + 1}
                    </ColorInput>
                  );
                })}
              </div>
            </div>
            <div class="sm:col-span-3">
              <div class="flex sm:flex flex-col gap-3" id="inputs">
                <TextInput id="nameinput" value={store.name} placeholder="name" onInput$={(event: any) => { store.name = event.target!.value; setCookie(JSON.stringify(store)); }}>
                  {t('animtab.animationName@@Animation Name')}
                </TextInput>

                <TextInput id="textinput" value={store.text} placeholder="SimplyMC" onInput$={(event: any) => { store.text = event.target!.value; setCookie(JSON.stringify(store)); }}>
                  {t('color.inputText@@Input Text')}
                </TextInput>

                <div class="grid sm:grid-cols-2 sm:gap-2">
                  <NumberInput id="speed" input value={store.speed} extraClass="w-full" step={50} min={50} onInput$={(event: any) => { store.speed = Number(event.target!.value); setCookie(JSON.stringify(store)); }} onIncrement$={() => { store.speed = Number(store.speed) + 50; setCookie(JSON.stringify(store)); }} onDecrement$={() => { store.speed = Number(store.speed) - 50; setCookie(JSON.stringify(store)); }}>
                    {t('animtab.speed@@Speed')}
                  </NumberInput>

                  <SelectInput id="type" label={it('animtab.outputType@@Output Type', ctx)} value={store.type} onChange$={(event: any) => { store.type = event.target!.value; setCookie(JSON.stringify(store)); }}>
                    {types.map((type: any) => (
                      <option key={type.name} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </SelectInput>

                  <SelectInput id="format" label={it('color.colorFormat@@Color Format', ctx)} value={store.format} onChange$={
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
                        {format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '')}
                      </option>
                    ))}
                    <option value={'custom'}>
                      {store.customFormat ? store.format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '') : 'Custom'}
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

                <SelectInput id="preset" label={it('color.colorPreset@@Color Preset', ctx)} onChange$={
                  (event: any) => {
                    store.colors = [];
                    setTimeout(() => {
                      store.colors = presets[event.target!.value as keyof typeof presets];
                      setCookie(JSON.stringify(store));
                    }, 1);
                  }
                }>
                  {Object.keys(presets).map((preset: any) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </SelectInput>

                <TextInput big id="formatInput" value={store.outputFormat} placeholder="SimplyMC" onInput$={(event: any) => { store.outputFormat = event.target!.value; setCookie(JSON.stringify(store)); }}>
                  {t('animtab.outputFormat@@Output Format')}
                </TextInput>

                <label>
                  {t('color.presets@@Presets')}
                </label>
                <div class="flex gap-2 my-2">
                  <Button onClick$={() => {
                    navigator.clipboard.writeText(JSON.stringify({ version: presetVersion, ...store, alerts: undefined, frames: undefined, frame: undefined }));
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
                  <RawTextInput name="import" placeholder={it('color.import@@Import (Paste here)', ctx)} onInput$={(event: any) => {
                    let json: any;
                    try {
                      json = JSON.parse(event.target!.value);
                    } catch (error){
                      const alert = {
                        class: 'text-red-500',
                        translate: 'color.invalidPreset',
                        text: 'INVALID PRESET!\nIf this is a old preset, please update it using the <a class="text-blue-500" href="/PresetTools">Preset Tools</a> page, If not please report to the <a class="text-blue-500" href="https://discord.simplymc.art/">Developers</a>.',
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
                  <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={it(`${alert.translate}@@${alert.text}`, ctx)} />
                ))}
              </div>
              <div class="sm:mt-6 mb-4 space-y-4 hidden sm:block" id="formatting">
                <Toggle id="bold" checked={store.bold} onChange$={(event: any) => { store.bold = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('color.bold@@Bold')} - {store.formatchar + 'l'}
                </Toggle>
                <Toggle id="strikethrough" checked={store.strikethrough} onChange$={(event: any) => { store.strikethrough = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('color.strikethrough@@Strikethrough')} - {store.formatchar + 'm'}
                </Toggle>
                <Toggle id="underline" checked={store.underline} onChange$={(event: any) => { store.underline = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('color.underline@@Underline')} - {store.formatchar + 'n'}
                </Toggle>
                <Toggle id="italic" checked={store.italic} onChange$={(event: any) => { store.italic = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('color.italic@@Italic')} - {store.formatchar + 'o'}
                </Toggle>
              </div>
            </div>
          </div>
        </div>
      </Speak>
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
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
