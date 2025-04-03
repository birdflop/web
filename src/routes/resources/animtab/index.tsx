import { component$, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { defaults, loadPreset, types, v3formats, presets as presetlist } from '~/components/util/PresetUtils';
import { AnimationOutput, convertToHex, convertToRGB, getAnimFrames, hexToHSL } from '~/components/util/RGBUtils';

import { Dropdown, Toggle, NumberInput } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { rgbDefaults } from '../rgb';
import { Gradient } from '~/components/util/HexUtils';
import Input from '~/components/rgb/Input';
import ColorMap from '~/components/rgb/ColorMap';
import ColorList from '~/components/rgb/ColorList';
import { ChevronDown, Clipboard, Palette } from 'lucide-icons-qwik';
import Output from '~/components/rgb/Output';

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

  const modalRef = useSignal<HTMLDialogElement>();

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
              <div class="flex flex-col gap-1">
                <label for="prefixsuffix">
                  {t('color.prefixsuffix@@Prefix/Suffix')}
                </label>
                <input class="lum-input" id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(e, el) => { store.prefixsuffix = el.value; }}/>
              </div>
            </div>
            {
              settingStore.advanced && <>
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
                  <div class="flex flex-col gap-2">
                    {(store.format.char != undefined && !store.format.bold && !store.format.italic && !store.format.underline && !store.format.strikethrough) && <div class="flex flex-col gap-1">
                      <label for="format-char">
                        {t('color.format.character@@Format Character')}
                      </label>
                      <input class="lum-input" id="format-char" value={store.format.char} placeholder="&" onInput$={(e, el) => { store.format.char = el.value; }}/>
                    </div>}
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
                </div>
              </>
            }
            <div class="flex flex-col gap-2 mt-4">
              <h1 class="hidden sm:flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center justify-center">
                {t('color.presets@@Presets')}
              </h1>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-2">
                  <Dropdown id="saved-presets" class={{ 'w-full': true }} onChange$={
                    (event, el) => {
                      let json: Partial<typeof defaults> = {};
                      try {
                        const preset = loadPreset(el.value);
                        navigator.clipboard.writeText(JSON.stringify(preset));
                        json = {
                          ...preset,
                        };
                      } catch (err) {
                        const alert = {
                          class: 'text-red-500',
                          text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                        };
                        const errtext = {
                          class: 'text-red-300',
                          text: `${err}`,
                        };
                        tmpstore.alerts.push(alert, errtext);
                        return setTimeout(() => {
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(errtext), 1);
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
                    }
                  } values={
                    presetstore.savedPresets.map((preset) => ({
                      name: <span class={{
                        'break-all font-mc tracking-tight': true,
                      }}>
                        {(() => {
                          const colors = sortColors(preset.colors ?? presetlist[0].colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
                          if (colors.length < 2) return preset.name;

                          const gradient = new Gradient(colors, Math.ceil((preset.name ?? 'Untitled').length));

                          let hex = '';
                          const segments = [...(preset.name ?? 'Untitled').matchAll(new RegExp('.{1,1}', 'g'))];
                          return segments.map((segment, i) => {
                            hex = convertToHex(gradient.next());
                            return (
                              <span key={`segment-${i}`} style={`color: #${hex};`}>
                                {segment[0].replace(/ /g, '\u00A0')}
                              </span>
                            );
                          });
                        })()}
                      </span>,
                      value: JSON.stringify(preset),
                    }))
                  } display={<span class="flex gap-3 flex-1">
                    Load saved preset
                  </span>}>
                    {t('color.savedPresets@@Saved Presets')}
                  </Dropdown>
                  <div class="grid grid-cols-2 gap-2">
                    <a class="lum-btn" href="/resources/rgb/presets">
                      Browse
                    </a>
                    <button class="lum-btn" id="save" onClick$={() => {
                      modalRef.value?.showModal();
                    }}>
                      {t('color.save@@Save')}
                    </button>
                    <dialog ref={modalRef} class="lum-bg-gray-800/20 lum-pad-equal-2xl shadow-lg backdrop-blur-xl rounded-lg relative max-w-lg w-full transform transition-transform duration-300 ease-out">
                      <div class="flex flex-col gap-3">
                        <h3 class="text-gray-50 text-xl font-semibold mb-4">
                          {t('color.savePreset@@Save Preset')}
                        </h3>

                        <input class="lum-input" id="presetname" placeholder={t('color.presetName@@Preset Name')} />

                        <div class="flex gap-2 justify-end">
                          <button class="lum-btn" onClick$={() => {
                            modalRef.value?.close();
                          }}>
                            {t('color.cancel@@Cancel')}
                          </button>
                          <button class="lum-btn lum-bg-green-900 hover:lum-bg-green-800" id="save" onClick$={() => {
                            const presetnameinput = document.getElementById('presetname') as HTMLInputElement;
                            const preset: Partial<typeof defaults> = {
                              ...store,
                              ...animtabstore,
                              name: presetnameinput.value ?? 'Untitled',
                            };
                            (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
                              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
                            });
                            if (presetstore.savedPresets.find(p => JSON.stringify(p) === JSON.stringify(preset))) return;
                            presetstore.savedPresets.push(preset);
                            setCookies('presets', presetstore);
                            modalRef.value?.close();
                            const alert = {
                              class: 'text-green-500',
                              text: 'color.savedPreset@@Successfully saved preset!',
                            };
                            tmpstore.alerts.push(alert);
                            setTimeout(() => {
                              tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                            }, 2000);
                          }}>
                            {t('color.save@@Save')}
                          </button>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-1">
                    <label for="import">
                      {t('color.import@@Import')}
                    </label>
                    <input class="lum-input" id="import" name="import" placeholder={t('color.import@@Import (Paste here)')} onInput$={async (e, el) => {
                      let json: Partial<typeof defaults> = {};
                      try {
                        const preset = loadPreset(el.value);
                        el.value = JSON.stringify(preset);
                        navigator.clipboard.writeText(JSON.stringify(preset));
                        json = {
                          ...preset,
                        };
                      } catch (err) {
                        const alert = {
                          class: 'text-red-500',
                          text: 'color.invalidPreset@@INVALID PRESET! Please report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.',
                        };
                        const errtext = {
                          class: 'text-red-300',
                          text: `${err}`,
                        };
                        tmpstore.alerts.push(alert, errtext);
                        return setTimeout(() => {
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                          tmpstore.alerts.splice(tmpstore.alerts.indexOf(errtext), 1);
                        }, 5000);
                      }
                      (Object.keys(store) as Array<keyof typeof store>).forEach(key => {
                        if (store[key] === undefined) return;
                        (store as any)[key] = json[key] ?? defaults[key];
                      });
                      const alert = {
                        class: 'text-green-500',
                        text: 'color.importedPreset@@Successfully imported preset!',
                      };
                      tmpstore.alerts.push(alert);
                      setTimeout(() => {
                        tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                      }, 2000);
                    }}/>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <button class="lum-btn lum-pad-sm" id="export" onClick$={() => {
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
                    </button>
                    <button class="lum-btn lum-pad-sm" id="createurl" onClick$={() => {
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
                      {t('color.url@@Get URL')}
                    </button>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-2">
              </div>
              {tmpstore.alerts.map((alert, i) => (
                <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
              ))}
            </div>
          </div>

          <div class="flex flex-col gap-2" id="formatting">
            <h1 class="hidden sm:flex text-lg md:text-xl xl:text-2xl font-semibold fill-current text-gray-50 gap-3 items-center justify-center mb-7">
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

            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(e, el) => { store.trimspaces = el.checked; }}
              label={<p class="flex flex-col"><span>Trim colors from spaces</span><span class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</span></p>} />
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
