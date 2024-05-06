import { $, component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { presetVersion, presets } from '~/components/util/PresetUtils';
import { AnimationOutput, getAnimFrames, getRandomColor } from '~/components/util/RGBUtils';

import { ChevronDown, ChevronUp, ColorFillOutline, SettingsOutline, Text } from 'qwik-ionicons';

import { Button, ColorInput, Header, NumberInput, Dropdown, TextArea, TextInput, Toggle } from '@luminescent/ui';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';

const formats = [
  '&#$1$2$3$4$5$6$f$c',
  '&x&$1&$2&$3&$4&$5&$6$f$c',
];

const types = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];

const defaults = {
  colors: presets.birdflop,
  name: 'logo',
  text: 'birdflop',
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
  length: 1,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, Object.keys(defaults), url.searchParams) as typeof defaults;
});

export default component$(() => {
  useSpeak({ assets: ['animpreview', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...defaults,
    ...cookies,
    alerts: [] as {
      class: string,
      text: string,
    }[],
    frames: [] as (string | null)[][],
    frame: 0,
  }, { deep: true });

  const handleSwap = $((currentIndex: number, newIndex: number) => {
    // check if the index is out of bounds
    const colorsLength = store.colors.length;
    if (newIndex < 0) {
      newIndex = colorsLength - 1;
    } else if (newIndex >= colorsLength) {
      newIndex = 0;
    }

    const currentColor = `${store.colors[currentIndex]}`;
    store.colors[currentIndex] = store.colors[newIndex];
    store.colors[newIndex] = currentColor;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
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

  useTask$(({ track }) => {
    isBrowser && setCookies(store);
    Object.keys(store).forEach((key: any) => {
      if (key == 'frames' || key == 'frame' || key == 'alerts') return;
      else track(() => store[key as keyof typeof store]);
    });
    const { frames } = getAnimFrames({ ...store, text: store.text != '' ? store.text : 'birdflop' });
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
    <section class="flex mx-auto max-w-6xl px-6 items-center justify-center min-h-[calc(100svh)] pt-[72px]">
      <div class="my-10 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('animtab.title@@Animated TAB')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-6">
          {t('animtab.subtitle@@TAB plugin gradient animation creator')}
        </h2>

        <TextArea output id="anim-tab-output" value={AnimationOutput(store)}>
          <Header subheader={t('color.outputSubtitle@@Copy-paste this for RGB text!')}>
            {t('color.output@@Output')}
          </Header>
        </TextArea>

        <h1 class={{
          'text-4xl sm:text-6xl my-6 break-all max-w-7xl -space-x-[1px] font-mc': true,
          'font-mc-bold': store.bold,
          'font-mc-italic': store.italic,
          'font-mc-bold-italic': store.bold && store.italic,
        }}>
          {(() => {
            const text = store.text != '' ? store.text : 'birdflop';

            if (!store.frames[0]) return;
            const colors = store.frames[store.frame];
            if (!colors) return;

            return text.split('').map((char: string, i: number) => (
              <span key={`char${i}`} style={`color: #${colors[i] ?? colors[i - 1] ?? colors[0]};`} class={{
                'underline': store.underline,
                'strikethrough': store.strikethrough,
                'underline-strikethrough': store.underline && store.strikethrough,
              }}>
                {char}
              </span>
            ));
          })()}
        </h1>

        <div id="mobile-navbuttons" class="my-4 sm:hidden">
          <div class="flex gap-2">
            <Button square aria-label="Colors" onClick$={() => {
              document.getElementById('colors')!.classList.replace('hidden', 'flex');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.replace('flex', 'hidden');
            }}>
              <ColorFillOutline width="24" />
            </Button>
            <Button square aria-label="Inputs" onClick$={() => {
              document.getElementById('colors')!.classList.replace('flex', 'hidden');
              document.getElementById('inputs')!.classList.replace('hidden', 'flex');
              document.getElementById('formatting')!.classList.replace('flex', 'hidden');
            }}>
              <SettingsOutline width="24" />
            </Button>
            <Button square aria-label="Formatting" onClick$={() => {
              document.getElementById('colors')!.classList.replace('flex', 'hidden');
              document.getElementById('inputs')!.classList.replace('flex', 'hidden');
              document.getElementById('formatting')!.classList.replace('hidden', 'flex');
            }}>
              <Text width="24" class="fill-white" />
            </Button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="hidden sm:flex flex-col gap-3 relative" id="colors">
            <Dropdown id="color-preset" class={{ 'w-full': true }} onChange$={
              (event: any) => {
                if (event.target!.value == 'custom') return;
                store.colors = presets[event.target!.value as keyof typeof presets];
              }
            } values={[
              ...Object.keys(presets).map(preset => ({ name: preset, value: preset })),
              { name: t('color.custom@@Custom'), value: 'custom' },
            ]} value={Object.keys(presets).find((preset: any) => presets[preset as keyof typeof presets].toString() == store.colors.toString()) ?? 'custom'}>
              {t('color.colorPreset@@Color Preset')}
            </Dropdown>
            <NumberInput input min={2} value={store.colors.length} id="colorsinput" class={{ 'w-full': true }}
              onChange$={(event: any) => {
                if (event.target!.value < 2) event.target!.value = 2;
                const newColors = [];
                for (let i = 0; i < event.target!.value; i++) {
                  if (store.colors[i]) newColors.push(store.colors[i]);
                  else newColors.push(getRandomColor());
                }
                store.colors = newColors;
              }}
              onIncrement$={() => {
                store.colors.push(getRandomColor());
              }}
              onDecrement$={() => {
                store.colors.pop();
              }}
            >
              {t('color.colorAmount@@Color Amount')}
            </NumberInput>
            <NumberInput id="length" input disabled value={store.length * store.text.length} min={store.text.length} class={{ 'w-full': true }}
              onIncrement$={() => {
                store.length++;
              }}
              onDecrement$={() => {
                if (store.length > 1) store.length--;
              }}
            >
              {t('animtab.length@@Gradient Length')}
            </NumberInput>
            <div class="flex flex-col gap-2 overflow-auto sm:h-[500px]">
              {store.colors.map((color: string, i: number) => {
                return <div key={`color${i + 1}`} class="flex items-end">
                  <ColorInput
                    id={`color${i + 1}`}
                    value={color}
                    onInput$={(newColor: string) => {
                      store.colors[i] = newColor;
                    }}
                    class={{ 'w-full': true }}
                    presetColors={store.colors}
                  >
                    {t('color.hexColor@@Hex Color')} {i + 1}
                  </ColorInput>
                  <div class="bg-gray-800 flex ml-2 rounded-md border border-gray-700">
                    <Button square onClick$={() => handleSwap(i, i - 1)} class={{ 'border-0': true }}>
                      <ChevronUp width="20" />
                    </Button>
                    <div class="bg-gray-700 w-px" />
                    <Button square onClick$={() => handleSwap(i, i + 1)} class={{ 'border-0': true }}>
                      <ChevronDown width="20" />
                    </Button>
                  </div>
                </div>;
              })}
            </div>
          </div>
          <div class="md:col-span-2 lg:col-span-3">
            <div class="flex flex-col gap-3" id="inputs">
              <TextInput id="nameinput" value={store.name} placeholder="name" onInput$={(event: any) => { store.name = event.target!.value; }}>
                {t('animtab.animationName@@Animation Name')}
              </TextInput>

              <TextInput id="textinput" value={store.text} placeholder="birdflop" onInput$={(event: any) => { store.text = event.target!.value; }}>
                {t('color.inputText@@Input Text')}
              </TextInput>

              <div class="flex flex-col md:grid grid-cols-2 gap-2">
                <NumberInput id="speed" input value={store.speed} class={{ 'w-full': true }} step={50} min={50}
                  onInput$={(event: any) => {
                    store.speed = Number(event.target!.value);
                  }}
                  onIncrement$={() => {
                    store.speed = Number(store.speed) + 50;
                  }}
                  onDecrement$={() => {
                    store.speed = Number(store.speed) - 50;
                  }}>
                  {t('animtab.speed@@Speed')}
                </NumberInput>

                <Dropdown id="type" class={{ 'w-full': true }} onChange$={(event: any) => { store.type = event.target!.value; }}
                  values={types.map((type: any) => ({ name: type.name, value: type.value }))}
                  value={store.type}>
                  {t('animtab.outputType@@Output Type')}
                </Dropdown>

                <Dropdown id="format" class={{ 'w-full': true }} value={store.customFormat ? 'custom' : store.format} onChange$={
                  (event: any) => {
                    if (event.target!.value == 'custom') {
                      store.customFormat = true;
                    }
                    else {
                      store.customFormat = false;
                      store.format = event.target!.value;
                    }
                  }
                } values={[
                  ...formats.map(format => ({
                    name: format
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.formatchar + 'l' : ''}${store.italic ? store.formatchar + 'o' : ''}${store.underline ? store.formatchar + 'n' : ''}${store.strikethrough ? store.formatchar + 'm' : ''}`)
                      .replace('$c', ''),
                    value: format,
                  })),
                  {
                    name: store.customFormat ? store.format
                      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
                      .replace('$f', `${store.bold ? store.formatchar + 'l' : ''}${store.italic ? store.formatchar + 'o' : ''}${store.underline ? store.formatchar + 'n' : ''}${store.strikethrough ? store.formatchar + 'm' : ''}`)
                      .replace('$c', '')
                      : t('color.custom@@Custom'),
                    value: 'custom',
                  },
                ]}>
                  {t('color.colorFormat@@Color Format')}
                </Dropdown>
                <TextInput id="formatchar" value={store.formatchar} placeholder="&" onInput$={(event: any) => { store.formatchar = event.target!.value; }}>
                  {t('color.formatCharacter@@Format Character')}
                </TextInput>
              </div>

              {
                store.customFormat && <>
                  <TextInput id="customformat" value={store.format} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format = event.target!.value; }}>
                    {t('color.customFormat@@Custom Format')}
                  </TextInput>
                  <div class="pb-4 font-mono">
                    <p>{t('color.placeholders@@Placeholders:')}</p>
                    <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
                    <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
                    <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
                    <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
                    <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
                    <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
                    <p>$f = {t('color.formatting@@Formatting')}</p>
                    <p>$c = {t('color.character@@Character')}</p>
                  </div>
                </>
              }

              <TextArea id="formatInput" value={store.outputFormat} placeholder="birdflop" onInput$={(event: any) => { store.outputFormat = event.target!.value; }}>
                {t('animtab.outputFormat@@Output Format')}
              </TextArea>

              <div class="flex flex-col sm:flex-row sm:items-end gap-2">
                <TextInput id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (event: any) => {
                  let json: any;
                  try {
                    json = JSON.parse(event.target!.value);
                  } catch (error) {
                    const alert = {
                      class: 'text-red-500',
                      text: 'color.invalidPreset@@INVALID PRESET!\nIf this is an old preset, please update it using the <a class="text-blue-400 hover:underline" href="/PresetTools">Preset Tools</a> page, If not please report to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a>.',
                    };
                    store.alerts.push(alert);
                    return setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 5000);
                  }
                  Object.keys(json).forEach(key => {
                    if ((store as any)[key] === undefined) return;
                    (store as any)[key] = json[key];
                  });
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.importedPreset@@Successfully imported preset!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.presets@@Presets')}
                </TextInput>
                <Button id="export" size="sm" onClick$={() => {
                  navigator.clipboard.writeText(JSON.stringify({ version: presetVersion, ...store, alerts: undefined }));
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.exportedPreset@@Successfully exported preset to clipboard!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.export@@Export')}
                </Button>
                <Button id="createurl" size="sm" onClick$={() => {
                  const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                  const url = new URL(base_url);
                  const params = { ...store, alerts: undefined };
                  Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.set(key, String(value));
                  });
                  window.history.pushState({}, '', url.href);
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.exportedPresetUrl@@Successfully exported preset to url!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.url@@Export As URL')}
                </Button>
              </div>
              {store.alerts.map((alert: any, i: number) => (
                <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
              ))}
            </div>
            <div class="sm:mt-6 mb-4 hidden sm:flex flex-col gap-4" id="formatting">
              <Toggle id="bold" checked={store.bold}
                onChange$={(event: any) => { store.bold = event.target!.checked; }}
                label={`${t('color.bold@@Bold')} - ${store.formatchar}l`} />
              <Toggle id="italic" checked={store.italic}
                onChange$={(event: any) => { store.italic = event.target!.checked; }}
                label={`${t('color.italic@@Italic')} - ${store.formatchar}o`} />
              <Toggle id="underline" checked={store.underline}
                onChange$={(event: any) => { store.underline = event.target!.checked; }}
                label={`${t('color.underline@@Underline')} - ${store.formatchar}n`} />
              <Toggle id="strikethrough" checked={store.strikethrough}
                onChange$={(event: any) => { store.strikethrough = event.target!.checked; }}
                label={`${t('color.strikethrough@@Strikethrough')} - ${store.formatchar + 'm'}`} />
            </div>
          </div>
        </div>
      </div>
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
};
