import { $, component$, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, loadPreset, presets, types, v3formats } from '~/components/util/PresetUtils';
import { AnimationOutput, convertToRGB, getAnimFrames, getBrightness, getRandomColor } from '~/components/util/RGBUtils';

import { Add, Remove, SettingsOutline, Text, TrashOutline } from 'qwik-ionicons';

import { Button, Header, NumberInput, Dropdown, TextArea, TextInput, Toggle, ColorPicker } from '@luminescent/ui';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';

const animTABDefaults = {
  version: defaults.version,
  colors: defaults.colors,
  name: defaults.name,
  text: defaults.text,
  type: defaults.type,
  speed: defaults.speed,
  length: defaults.length,
  prefixsuffix: defaults.prefixsuffix,
  trimspaces: defaults.trimspaces,
  bold: defaults.bold,
  italic: defaults.italic,
  underline: defaults.underline,
  strikethrough: defaults.strikethrough,
};

const unsupportedDefaults = {
  format: defaults.format,
  customFormat: defaults.customFormat,
  outputFormat: defaults.outputFormat,
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, Object.keys(animTABDefaults), url.searchParams) as typeof animTABDefaults;
});

export default component$(() => {
  useSpeak({ assets: ['animtab', 'color'] });
  const t = inlineTranslate();

  const cookies = useCookies().value;
  const store = useStore({
    ...animTABDefaults,
    ...unsupportedDefaults,
    ...cookies,
    opened: -1,
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

    const newColors = [...store.colors];
    const currentColor = `${newColors[currentIndex].hex}`;
    newColors[currentIndex].hex = newColors[newIndex].hex;
    newColors[newIndex].hex = currentColor;
    store.colors = newColors;
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
    <section class="flex mx-auto max-w-5xl px-6 justify-center min-h-svh pt-[72px] scale-for-mac">
      <div class="my-10 w-full">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('animtab.title@@Animated TAB')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-6">
          {t('animtab.subtitle@@TAB plugin gradient animation creator')}
        </h2>

        <TextArea output id="output" value={AnimationOutput(store)}>
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
                {char == ' ' ? '\u00A0' : char}
              </span>
            ));
          })()}
        </h1>

        <div class="flex gap-2 my-4 items-center">
          <Button square disabled={store.colors.length < 3} transparent aria-label="Remove Color" onClick$={() => {
            const newColors = [...store.colors];
            newColors.pop();
            store.colors = newColors;
          }}>
            <Remove width="24" />
          </Button>
          <div class="w-full h-3 rounded-full items-center relative" id="colormap" style={`background: linear-gradient(to right, ${store.colors.map(c => c.hex).join(', ')});`}>
            {store.colors.map((color, i) => <div class="absolute -mt-1 -ml-3" key={i} onMouseDown$={() => {
              const abortController = new AbortController();
              const colormap = document.getElementById('colormap')!;
              document.addEventListener('mousemove', (e) => {
                const rect = colormap.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const index = Math.round((store.colors.length - 1) * (x / width));
                if (index != i) {
                  handleSwap(i, index);
                  abortController.abort();
                }
              }, { signal: abortController.signal });
              document.addEventListener('mouseup', () => {
                abortController.abort();
              }, { signal: abortController.signal });
            }} style={{
              left: `${(100 / (store.colors.length - 1)) * i}%`,
            }}>
              <button key={`color${i + 1}`} id={`color${i + 1}`}
                class={{
                  'transition-transform w-5 h-5 hover:scale-125 rounded-full shadow-md border': true,
                  'border-white': getBrightness(convertToRGB(color.hex)) < 126,
                  'border-black': getBrightness(convertToRGB(color.hex)) > 126,
                }}
                style={`background: ${color.hex};`}
                onFocus$={() => {
                  const abortController = new AbortController();
                  document.addEventListener('click', (e) => {
                    if (e.target instanceof HTMLElement && !e.target.closest(`#color${i + 1}`) && !e.target.closest(`#color${i + 1}-picker`)) {
                      if (store.opened == i) store.opened = -1;
                      abortController.abort();
                    }
                  }, { signal: abortController.signal });
                  store.opened = i;
                }}
              />
              <div onMouseDown$={(e) => e.stopPropagation()}>
                <ColorPicker
                  id={`color${i + 1}`}
                  value={color.hex}
                  class={{
                    'motion-safe:transition-all absolute top-full mt-2 gap-1 z-[1000]': true,
                    'opacity-0 scale-95 pointer-events-none': store.opened != i,
                    'left-0': i < store.colors.length / 2,
                    'right-0': i >= store.colors.length / 2,
                  }}
                  onInput$={newColor => {
                    const newColors = [...store.colors];
                    newColors[i].hex = newColor;
                    store.colors = newColors;
                  }}
                  horizontal
                />
                {store.colors.length > 2 &&
                  <Button
                    class={{
                      'motion-safe:transition-all absolute top-full mt-2 gap-1 z-[1000]': true,
                      'opacity-0 scale-95 pointer-events-none': store.opened != i,
                      'left-0': i < store.colors.length / 2,
                      'right-0': i >= store.colors.length / 2,
                    }}
                    square size='sm' color="red" onClick$={() => {
                      const newColors = [...store.colors];
                      newColors.splice(i, 1);
                      store.colors = newColors;
                    }
                    }>
                    <TrashOutline width="20" />
                  </Button>
                }
              </div>
            </div>,
            )}
          </div>
          <Button square disabled={store.colors.length > store.text.length} transparent aria-label="Add Color" onClick$={() => {
            const newColors = [...store.colors, { hex: getRandomColor(), pos: Math.floor(Math.random() * 100) }];
            store.colors = newColors;
          }}>
            <Add width="24" class="fill-white" />
          </Button>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-3 md:col-span-2" id="inputs">
            <h1 class="hidden sm:flex text-2xl font-bold text-gray-50 gap-4 items-center justify-center">
              <SettingsOutline width="32" />
              {t('color.inputs@@Inputs')}
            </h1>

            <div class="flex flex-col md:grid grid-cols-2 gap-2">
              <TextInput id="input" value={store.text} placeholder="birdflop" onInput$={(event: any) => { store.text = event.target!.value; }}>
                {t('color.inputText@@Input Text')}
              </TextInput>

              <Dropdown id="type" class={{ 'w-full': true }} onChange$={(event: any) => { store.type = event.target!.value; }}
                values={types.map((type: any) => ({ name: type.name, value: type.value }))}
                value={store.type}>
                {t('animtab.outputType@@Output Type')}
              </Dropdown>
            </div>

            <div class="flex flex-col md:grid grid-cols-3 gap-2">
              <TextInput id="nameinput" value={store.name} placeholder="name" onInput$={(event: any) => { store.name = event.target!.value; }}>
                {t('animtab.animationName@@Animation Name')}
              </TextInput>
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
              <TextInput id="prefixsuffix" value={store.prefixsuffix} placeholder={'welcome to $t'} onInput$={(event: any) => { store.prefixsuffix = event.target!.value; }}>
                Prefix/Suffix
              </TextInput>
            </div>

            <div class="grid md:grid-cols-3 gap-2">
              <div class="flex flex-col gap-2">
                <TextInput id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (event: any) => {
                  let json: any;
                  try {
                    const preset = await loadPreset(event.target!.value);
                      event.target!.value = JSON.stringify(preset);
                      navigator.clipboard.writeText(JSON.stringify(preset));
                      json = { ...animTABDefaults, ...preset };
                  } catch (error) {
                    const alert = {
                      class: 'text-red-500',
                      text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
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
                <div class="flex gap-2">
                  <Button id="export" size="sm" onClick$={() => {
                    const preset: any = { ...store };
                    delete preset.alerts;
                    Object.keys(preset).forEach(key => {
                      if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(animTABDefaults[key as keyof typeof animTABDefaults])) delete preset[key];
                    });
                    navigator.clipboard.writeText(JSON.stringify(preset));
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
                    const params: any = { ...store };
                    delete params.alerts;
                    Object.entries(params).forEach(([key, value]: any) => {
                      if (key == 'colors') {
                        value = value.join(',');
                        if (value === animTABDefaults.colors.join(',')) return;
                      }
                      if (key == 'format') {
                        value = JSON.stringify(value);
                        if (value === JSON.stringify(animTABDefaults[key as keyof typeof animTABDefaults])) return;
                      }
                      else if (value === animTABDefaults[key as keyof typeof animTABDefaults]) return;
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
              </div>
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
              <TextInput id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(event: any) => { store.prefixsuffix = event.target!.value; }}>
                  Prefix/Suffix
              </TextInput>
            </div>
            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(event: any) => { store.trimspaces = event.target!.checked; }}
              label={<p class="flex flex-col"><span>Trim color codes from spaces</span><span class="text-sm">Turn this off if you're using empty underlines / strikethroughs</span></p>} />
            <Toggle id="advanced" checked={store.customFormat}
              onChange$={(event: any) => { store.customFormat = event.target!.checked; }}
              label={<p class="flex flex-col"><span>Show advanced settings</span><span class="text-sm">These settings are hidden, only use them if you're trying to use this tool for a different plugin or know what you're doing.</span></p>} />
            {store.alerts.map((alert: any, i: number) => (
              <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
            ))}
            {
              store.customFormat && <>
                <Dropdown id="format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)} class={{ 'w-full': true }} onChange$={
                  (event: any) => {
                    if (event.target!.value == 'custom') {
                      store.customFormat = true;
                    }
                    else {
                      store.customFormat = false;
                      store.format = JSON.parse(event.target!.value);
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
                    <TextInput id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format.color = event.target!.value; }}>
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
                        <TextInput id="format-char" value={store.format.char} placeholder="&" onInput$={(event: any) => { store.format.char = event.target!.value; }}>
                          {t('color.format.character@@Format Character')}
                        </TextInput>
                    }
                    {!store.format.char &&
                        <>
                          <TextInput id="format-bold" value={store.format.bold} placeholder="<bold>$t</bold>" onInput$={(event: any) => { store.format.bold = event.target!.value; }}>
                            Bold
                          </TextInput>
                          <TextInput id="format-italic" value={store.format.italic} placeholder="<italic>$t</italic>" onInput$={(event: any) => { store.format.italic = event.target!.value; }}>
                            Italic
                          </TextInput>
                          <TextInput id="format-underline" value={store.format.underline} placeholder="<underline>$t</underline>" onInput$={(event: any) => { store.format.underline = event.target!.value; }}>
                            Underline
                          </TextInput>
                          <TextInput id="format-strikethrough" value={store.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(event: any) => { store.format.strikethrough = event.target!.value; }}>
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
              onChange$={(event: any) => { store.bold = event.target!.checked; }}
              label={`${t('color.bold@@Bold')} - ${store.format.char ? `${store.format.char}l` : store.format.bold?.replace('$t', '')}`} />
            <Toggle id="italic" checked={store.italic}
              onChange$={(event: any) => { store.italic = event.target!.checked; }}
              label={`${t('color.italic@@Italic')} - ${store.format.char ? `${store.format.char}o` : store.format.italic?.replace('$t', '')}`} />
            <Toggle id="underline" checked={store.underline}
              onChange$={(event: any) => { store.underline = event.target!.checked; }}
              label={`${t('color.underline@@Underline')} - ${store.format.char ? `${store.format.char}n` : store.format.underline?.replace('$t', '')}`} />
            <Toggle id="strikethrough" checked={store.strikethrough}
              onChange$={(event: any) => { store.strikethrough = event.target!.checked; }}
              label={`${t('color.strikethrough@@Strikethrough')} - ${store.format.char ? `${store.format.char}m` : store.format.strikethrough?.replace('$t', '')}`} />

            {store.customFormat &&
              <TextArea id="formatInput" value={store.outputFormat} placeholder="birdflop" onInput$={(event: any) => { store.outputFormat = event.target!.value; }}>
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
