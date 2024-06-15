import { $, component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, loadPreset, presets, types, v3formats } from '~/components/util/PresetUtils';
import { AnimationOutput, convertToRGB, getAnimFrames, getBrightness, getRandomColor } from '~/components/util/RGBUtils';

import { Add, BarChartOutline, ChevronDown, ChevronUp, ColorFillOutline, DiceOutline, SettingsOutline, Text, TrashOutline } from 'qwik-ionicons';

import { Button, Header, NumberInput, Dropdown, TextArea, TextInput, Toggle, ColorPicker } from '@luminescent/ui';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { rgbDefaults } from '../rgb';

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
  if (!rgbCookies.customFormat) {
    delete rgbCookies.format;
    delete animtabCookies.outputFormat;
  }
  return {
    animtab: animtabCookies,
    rgb: rgbCookies,
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

  const animtabstore = useStore({
    ...animTABDefaults,
    ...cookies.animtab,
  }, { deep: true });

  const tmpstore: {
    opened: {
      id: number,
      type: number,
    },
    alerts: {
      class: string,
      text: string,
    }[],
    frames: (string | null)[][],
    frame: number,
  } = useStore({
    opened: {
      id: -1,
      type: 0,
    },
    alerts: [],
    frames: [],
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

    const newColors = [...store.colors];
    const currentPos = Number(`${store.colors[currentIndex].pos}`);
    newColors[currentIndex].pos = newColors[newIndex].pos;
    newColors[newIndex].pos = currentPos;
    store.colors = sortColors(newColors);
  });

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
    const { frames } = getAnimFrames({ ...store, ...animtabstore, text: store.text != '' ? store.text : 'birdflop' });
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
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px] scale-for-mac">
      <div class="my-10 w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('animtab.title@@Animated TAB')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-6">
          {t('animtab.subtitle@@TAB plugin gradient animation creator')}
        </h2>

        <TextArea class={{ 'font-mono text-sm text-nowrap': true }} output id="output" value={AnimationOutput({ ...store, ...animtabstore })}>
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

            if (!tmpstore.frames[0]) return;
            const colors = tmpstore.frames[tmpstore.frame];
            if (!colors) return;

            return text.split('').map((char: string, i: number) => (
              <span key={`char${i}`} style={`color: #${colors[i] ?? colors[i - 1] ?? colors[0]};`} class={{
                'underline': store.underline,
                'strikethrough': store.strikethrough,
                'underline-strikethrough': store.underline && store.strikethrough,
              }}>
                {char == ' ' ? '\u00A0' : char}
              </span>
            ));
          })()}
        </h1>

        <div class="w-full h-3 my-6 rounded-full items-center relative" id="colormap"
          style={`background: linear-gradient(to right, ${sortColors(store.colors).map(color => `${color.hex} ${color.pos}%`).join(', ')});`}
          onMouseDown$={(e, el) => {
            if (e.target != el) return;
            const rect = el.getBoundingClientRect();
            const pos = (((e.clientX - rect.left) / rect.width) * store.text.length) / store.text.length * 100;
            if (store.colors.find(c => c.pos == pos)) return;
            const newColors = store.colors.slice(0);
            newColors.push({ hex: getRandomColor(), pos });
            store.colors = sortColors(newColors);
          }}
          onMouseEnter$={(e, el) => {
            const abortController = new AbortController();
            el.addEventListener('mousemove', e => {
              const addbutton = document.getElementById('add-button')!;
              if (e.target != el) {
                addbutton.classList.add('opacity-0');
                return;
              }
              const rect = el.getBoundingClientRect();
              const pos = (((e.clientX - rect.left) / rect.width) * store.text.length) / store.text.length * 100;
              if (store.colors.find(c => c.pos == pos)) return;
              addbutton.classList.remove('opacity-0');
              addbutton.style.left = `${pos}%`;
            }, { signal: abortController.signal });
            el.addEventListener('mouseleave', () => {
              const addbutton = document.getElementById('add-button')!;
              addbutton.classList.add('opacity-0');
              abortController.abort();
            }, { signal: abortController.signal });
          }}
        >
          <div id="add-button" class={{
            'absolute -mt-1 -ml-3 w-5 h-5 rounded-md border border-gray-700 bg-gray-800 opacity-0 pointer-events-none': true,
          }}>
            <Add width="19" />
          </div>
          {store.colors.map((color, i) => <div class="absolute -mt-1 -ml-3" key={i}
            onMouseDown$={(e, el) => {
              const abortController = new AbortController();
              const colormap = document.getElementById('colormap')!;
              const rect = colormap.getBoundingClientRect();
              document.addEventListener('mousemove', e => {
                tmpstore.opened.id = -1;
                el.classList.add('-mt-2', 'scale-125', 'z-[1000]');
                el.style.filter = 'drop-shadow(0 0 10px rgb(31 41 55))';
                let pos = (((e.clientX - rect.left) / rect.width) * store.text.length) / store.text.length * 100;
                if (pos < 0) pos = 0;
                if (pos > 100) pos = 100;
                if (store.colors.find(c => c.pos == pos)) return;
                const newColors = store.colors.slice(0);
                newColors[i].pos = pos;
                store.colors = newColors;
              }, { signal: abortController.signal });
              document.addEventListener('mouseup', () => {
                el.classList.remove('-mt-2', 'scale-125', 'z-[1000]');
                el.style.filter = '';
                abortController.abort();
                store.colors = sortColors(store.colors);
              }, { signal: abortController.signal });
            }} style={{
              left: `${color.pos}%`,
            }}
            preventdefault:mousedown
          >
            <div key={`colormap-color-${i + 1}`} id={`colormap-color-${i + 1}`}
              class={{
                'transition-transform w-5 h-5 hover:scale-125 rounded-md shadow-md border': true,
                'border-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                'border-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
              }}
              style={`background: ${color.hex};`}
              onMouseUp$={() => {
                const picker = document.getElementById(`colormap-color-${i + 1}-picker`)!;
                picker.dataset.value = color.hex;
                picker.dispatchEvent(new Event('input'));
                const opened = tmpstore.opened;
                if (opened.id == i && opened.type == 0) return tmpstore.opened.id = -1;
                else tmpstore.opened = { id: i, type: 0 };
                const abortController = new AbortController();
                document.addEventListener('click', (e) => {
                  if (e.target instanceof HTMLElement && !e.target.closest(`#colormap-color-${i + 1}`) && !e.target.closest(`#colormap-color-${i + 1}-popup`)) {
                    tmpstore.opened.id = -1;
                    abortController.abort();
                  }
                }, { signal: abortController.signal });
              }}
            />
            <div id={`colormap-color-${i + 1}-popup`} stoppropagation:mousedown class="hidden sm:flex">
              <div class={{
                'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2': true,
                'opacity-0 scale-95 pointer-events-none': tmpstore.opened.id != i || tmpstore.opened.type != 0,
                'left-0 items-start': color.pos < 50,
                'right-0 items-end': color.pos >= 50,
              }}>
                {store.colors.length > 2 &&
                  <Button class={{ 'backdrop-blur-md': true }} square size='sm' color="red" onClick$={() => {
                    const newColors = store.colors.slice(0);
                    newColors.splice(i, 1);
                    store.colors = sortColors(newColors);
                  }}>
                    <TrashOutline width="20" />
                  </Button>
                }
                <ColorPicker
                  id={`colormap-color-${i + 1}-picker`}
                  value={color.hex}
                  onInput$={newColor => {
                    const newColors = store.colors.slice(0);
                    newColors[i].hex = newColor;
                    store.colors = sortColors(newColors);
                  }}
                  horizontal
                />
              </div>
            </div>
          </div>,
          )}
        </div>

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

        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div class="hidden sm:flex flex-col gap-3 relative" id="colors">
            <h1 class="hidden sm:flex text-2xl font-bold text-gray-50 gap-4 items-center justify-center">
              <ColorFillOutline width="32" />
              {t('color.colors@@Colors')}
            </h1>
            <Dropdown id="color-preset" class={{ 'w-full': true }} onChange$={
              (event, el) => {
                if (el.value == 'custom') return;
                store.colors = presets[el.value as keyof typeof presets];
              }
            } values={[
              ...Object.keys(presets).map(preset => ({ name: preset, value: preset })),
              { name: t('color.custom@@Custom'), value: 'custom' },
            ]} value={(Object.keys(presets) as Array<keyof typeof presets>).find((preset) => presets[preset].toString() == store.colors.toString()) ?? 'custom'}>
              {t('color.colorPreset@@Color Preset')}
            </Dropdown>
            <NumberInput input min={2} max={store.text.length} value={store.colors.length} id="colorsinput" class={{ 'w-full': true }}
              onChange$={(e, el) => {
                let colorAmount = Number(el.value);
                if (colorAmount < 2) return;
                if (colorAmount > store.text.length) return colorAmount = store.text.length;
                const newColors = [];
                for (let i = 0; i < colorAmount; i++) {
                  if (store.colors[i]) newColors.push(store.colors[i]);
                  else newColors.push({ hex: getRandomColor(), pos: 100 });
                }
                store.colors = newColors;
              }}
              onIncrement$={() => {
                const newColors = [...store.colors, {
                  hex: getRandomColor(),
                }];
                store.colors = newColors.map((color, i) => ({
                  hex: color.hex,
                  pos: (100 / (newColors.length - 1)) * i,
                }));
              }}
              onDecrement$={() => {
                const newColors = store.colors.slice(0);
                newColors.pop();
                store.colors = newColors.map((color, i) => ({
                  hex: color.hex,
                  pos: (100 / (newColors.length - 1)) * i,
                }));
              }}
            >
              {t('color.colorAmount@@Color Amount')}
            </NumberInput>
            <NumberInput id="length" input disabled value={animtabstore.length * store.text.length} min={store.text.length} class={{ 'w-full': true }}
              onIncrement$={() => {
                animtabstore.length++;
              }}
              onDecrement$={() => {
                if (animtabstore.length > 1) animtabstore.length--;
              }}
            >
              {t('animtab.length@@Gradient Length')}
            </NumberInput>
            <div class="flex gap-2">
              <Button size='sm' square onClick$={() => {
                const newColors = store.colors.slice(0).map(color => ({ hex: getRandomColor(), pos: color.pos }));
                store.colors = newColors;
              }}>
                <DiceOutline width={20} />
              </Button>
              <Button size='sm' disabled={store.colors.find((color, i) => color.pos != (100 / (store.colors.length - 1)) * i) ? false : true} class={{
                'w-full': true,
              }} onClick$={() => {
                const newColors = store.colors.slice(0).map((color, i) => ({ hex: color.hex, pos: (100 / (store.colors.length - 1)) * i }));
                store.colors = newColors;
              }}>
                <BarChartOutline width={20} /> Disperse
              </Button>
            </div>
            <div class="flex flex-col gap-2">
              {store.colors.map((color, i) => <div key={i} class="flex relative gap-2">
                <div class="bg-gray-800 flex flex-col rounded-md border border-gray-700">
                  <Button size="sm" square transparent onClick$={() => handleSwap(i, i - 1)} class={{ 'border-0': true }}>
                    <ChevronUp width="20" />
                  </Button>
                  <Button size="sm" square transparent onClick$={() => handleSwap(i, i + 1)} class={{ 'border-0': true }}>
                    <ChevronDown width="20" />
                  </Button>
                </div>
                <TextInput key={`colorlist-color-${i + 1}`} id={`colorlist-color-${i + 1}`}
                  class={{
                    'text-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                    'text-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
                    'w-full': true,
                  }}
                  style={`background: ${color.hex};`}
                  value={color.hex}
                  onMouseUp$={() => {
                    const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                    picker.dataset.value = color.hex;
                    picker.dispatchEvent(new Event('input'));
                    if (tmpstore.opened.id == i && tmpstore.opened.type == 1) return tmpstore.opened.id = -1;
                    else tmpstore.opened = { id: i, type: 1 };
                    const abortController = new AbortController();
                    document.addEventListener('click', (e) => {
                      if (e.target instanceof HTMLElement && !e.target.closest(`#colorlist-color-${i + 1}`) && !e.target.closest(`#colorlist-color-${i + 1}-popup`)) {
                        tmpstore.opened.id = -1;
                        abortController.abort();
                      }
                    }, { signal: abortController.signal });
                  }}
                >
                  {t('color.hexColor@@Hex Color')} {i + 1}
                </TextInput>
                <Button class={{ 'backdrop-blur-md': true }} square size="sm" disabled={store.colors.length <= 2} color="red" onClick$={() => {
                  const newColors = store.colors.slice(0);
                  newColors.splice(i, 1);
                  store.colors = newColors;
                }}>
                  <TrashOutline width="20" />
                </Button>
                <div
                  id={`colorlist-color-${i + 1}-popup`} stoppropagation:mousedown class={{
                    'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
                    'opacity-0 scale-95 pointer-events-none': tmpstore.opened.id != i || tmpstore.opened.type != 1,
                  }}>
                  <ColorPicker
                    id={`colorlist-color-${i + 1}-picker`}
                    value={color.hex}
                    onInput$={newColor => {
                      const newColors = store.colors.slice(0);
                      newColors[i].hex = newColor;
                      store.colors = sortColors(newColors);
                    }}
                    showInput={false}
                  />
                </div>
              </div>,
              )}
            </div>
          </div>

          <div class="flex flex-col gap-3 md:col-span-2" id="inputs">
            <h1 class="hidden sm:flex text-2xl font-bold text-gray-50 gap-4 items-center justify-center">
              <SettingsOutline width="32" />
              {t('color.inputs@@Inputs')}
            </h1>

            <TextInput id="input" value={store.text} placeholder="birdflop" onInput$={(e, el) => { store.text = el.value; }}>
              {t('color.inputText@@Input Text')}
            </TextInput>

            <div class="flex flex-col md:grid grid-cols-2 gap-2">
              <TextInput id="nameinput" value={animtabstore.name} placeholder="name" onInput$={(e, el) => { animtabstore.name = el.value; }}>
                {t('animtab.animationName@@Animation Name')}
              </TextInput>
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
              <TextInput id="prefixsuffix" value={store.prefixsuffix} placeholder={'welcome to $t'} onInput$={(e, el) => { store.prefixsuffix = el.value; }}>
                Prefix/Suffix
              </TextInput>
            </div>

            <div class="flex flex-col gap-2">
              <TextInput id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (e, el) => {
                let json: Partial<typeof defaults> = {};
                try {
                  const preset = loadPreset(el.value);
                  el.value = JSON.stringify(preset);
                  navigator.clipboard.writeText(JSON.stringify(preset));
                  json = {
                    ...preset,
                  };
                } catch (error) {
                  const alert = {
                    class: 'text-red-500',
                    text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                  };
                  tmpstore.alerts.push(alert);
                  return setTimeout(() => {
                    tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                  }, 5000);
                }
                (Object.keys(store) as Array<keyof typeof store>).forEach(key => {
                  if (store[key] === undefined) return;
                  (store as any)[key] = json[key] ?? defaults[key];
                });
                (Object.keys(animtabstore) as Array<keyof typeof animtabstore>).forEach(key => {
                  if (animtabstore[key] === undefined) return;
                  (animtabstore as any)[key] = json[key] ?? defaults[key];
                });
                const alert = {
                  class: 'text-green-500',
                  text: 'color.importedPreset@@Successfully imported preset!',
                };
                tmpstore.alerts.push(alert);
                setTimeout(() => {
                  tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                }, 2000);
              }}>
                {t('color.presets@@Presets')}
              </TextInput>
              <div class="flex gap-2">
                <Button id="export" size="sm" onClick$={() => {
                  const preset: Partial<typeof defaults> = { ...store, ...animtabstore };
                  (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
                    if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
                  });
                  navigator.clipboard.writeText(JSON.stringify(preset));
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.exportedPreset@@Successfully exported preset to clipboard!',
                  };
                  tmpstore.alerts.push(alert);
                  setTimeout(() => {
                    tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.export@@Export')}
                </Button>
                <Button id="createurl" size="sm" onClick$={() => {
                  const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                  const url = new URL(base_url);
                  const params: Partial<typeof defaults> = { ...store, ...animtabstore };
                  (Object.entries(params) as Array<[keyof typeof defaults, any]>).forEach(([key, value]) => {
                    if (key == 'format' || key == 'colors') {
                      value = JSON.stringify(value);
                      if (value === JSON.stringify(defaults[key as keyof typeof defaults])) return;
                    }
                    if (value === defaults[key as keyof typeof defaults]) return;
                    url.searchParams.set(key, String(value));
                  });
                  window.history.pushState({}, '', url.href);
                  const alert = {
                    class: 'text-green-500',
                    text: 'color.exportedPresetUrl@@Successfully exported preset to url!',
                  };
                  tmpstore.alerts.push(alert);
                  setTimeout(() => {
                    tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                  {t('color.url@@Export As URL')}
                </Button>
              </div>
            </div>
            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(e, el) => { store.trimspaces = el.checked; }}
              label={<p class="flex flex-col"><span>Trim color codes from spaces</span><span class="text-sm">Turn this off if you're using empty underlines / strikethroughs</span></p>} />
            <Toggle id="advanced" checked={store.customFormat}
              onChange$={(e, el) => { store.customFormat = el.checked; }}
              label={<p class="flex flex-col"><span>Show advanced settings</span><span class="text-sm">These settings are hidden, only use them if you're trying to use this tool for a different plugin or know what you're doing.</span></p>} />
            {tmpstore.alerts.map((alert, i) => (
              <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
            ))}
            {
              store.customFormat && <>
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
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <TextInput id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { store.format.color = el.value; }}>
                      {t('color.customFormat@@Custom Format')}
                    </TextInput>
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
                  <div class="flex flex-col gap-2">
                    {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) &&
                        <TextInput id="format-char" value={store.format.char} placeholder="&" onInput$={(e, el) => { store.format.char = el.value; }}>
                          {t('color.format.character@@Format Character')}
                        </TextInput>
                    }
                    {!store.format.char &&
                        <>
                          <TextInput id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(e, el) => { store.format.bold = el.value; }}>
                            Bold
                          </TextInput>
                          <TextInput id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(e, el) => { store.format.italic = el.value; }}>
                            Italic
                          </TextInput>
                          <TextInput id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(e, el) => { store.format.underline = el.value; }}>
                            Underline
                          </TextInput>
                          <TextInput id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(e, el) => { store.format.strikethrough = el.value; }}>
                            Strikethrough
                          </TextInput>
                          <div class="py-3 font-mono">
                            <p>{t('color.placeholders@@Placeholders:')}</p>
                            <p>$t = Output Text</p>
                          </div>
                        </>
                    }
                  </div>
                </div>
              </>
            }
          </div>

          <div class="mb-4 hidden sm:flex flex-col gap-3" id="formatting">
            <h1 class="hidden sm:flex text-2xl font-bold fill-current text-gray-50 gap-4 items-center justify-center">
              <Text width="32" />
              {t('color.colors@@Formatting')}
            </h1>
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

            {store.customFormat &&
              <TextArea id="formatInput" class={{ 'font-mono': true }} value={animtabstore.outputFormat} placeholder="birdflop" onInput$={(e, el) => { animtabstore.outputFormat = el.value; }}>
                {t('animtab.outputFormat@@Output Format')}
              </TextArea>
            }
          </div>
        </div>
        <div class="text-sm mt-8">
          RGBirdflop (RGB Birdflop) is a free and open-source Minecraft RGB gradient creator that generates hex formatted text. RGB Birdflop is a public resource developed by Birdflop, a 501(c)(3) nonprofit providing affordable and accessible hosting and public resources. If you would like to support our mission, please <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U">click here</a> to make a charitable donation, 100% tax-deductible in the US.
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
