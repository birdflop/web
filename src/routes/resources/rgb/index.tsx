import { $, component$, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Gradient } from '~/components/util/HexUtils';
import { defaults, loadPreset, v3formats, presets as presetlist } from '~/components/util/PresetUtils';
import { convertToHex, convertToRGB, generateOutput, getBrightness, getRandomColor, getSignificantPoints, hexToHSL } from '~/components/util/RGBUtils';

import { Dropdown, Toggle, NumberInput, ColorPicker } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies, setCookies, sortColors } from '~/components/util/SharedUtils';
import { isBrowser } from '@builder.io/qwik/build';
import { ChevronDown, ChevronUp, Clipboard, Dices, Download, Globe, Link, Ellipsis, Palette, Plus, Save, Settings, Share, Sparkles, Terminal, Trash, Type, X } from 'lucide-icons-qwik';
import MCBackground from '~/components/images/MCBackground.png?jsx';

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
    opened: {
      id: number,
      type: number,
    },
    sectionsOpened: string[],
    alerts: {
      class: string,
      text: string,
    }[],
  } = useStore({
    threshold: 50,
    opened: {
      id: -1,
      type: 0,
    },
    sectionsOpened: [],
    previewStyle: 'default',
    alerts: [] as {
      class: string,
      text: string,
    }[],
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

  const disperseColors = $(() => {
    const newColors = store.colors.slice(0).map((color, i) => ({ hex: color.hex, pos: (100 / (store.colors.length - 1)) * i }));
    store.colors = newColors;
  });

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

  const modalRef = useSignal<HTMLDialogElement>();

  useTask$(({ track }) => {
    if (isBrowser) setCookies('rgb', store);
    if (store.disperse) disperseColors();
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

        <label for="input" class="flex flex-col items-start flex-1 mt-2 mb-3 ">
          <div class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-2">
            <Terminal size={26} />
            {t('color.inputText@@Input Text')}
            <span class="text-gray-400 text-sm font-normal">
              {t('color.inputTextSubtitle@@Type here to generate a gradient!')}
            </span>
          </div>
          {store.previewStyle == 'chat' &&
            <div class={{
              'relative lum-bg-gray-800/50 rounded-lg': true,
              'break-all font-mc': true,
              'font-mc-bold': store.bold,
              'font-mc-italic': store.italic,
              'font-mc-bold-italic': store.bold && store.italic,
            }}>
              <MCBackground class="overflow-hidden rounded-md" id="bg" alt="background" />
              <div class="absolute bottom-25 w-[75%] bg-black/50 min-h-8 px-2 py-0.5 text-2xl max-h-64 break-words"
                style={{ textShadow: '2px 2px 0 #373737' }}>
                <p>{'<RGBirdflop> Type here!'}</p>
                <p>{(() => {
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
                </p>
                <textarea class="absolute bottom-0 lum-input pl-0 pr-1.5 py-0 rounded-none lum-pad-md resize-none w-[calc(100%-0.5rem)] h-[calc(100%-2rem)] whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:outline-1 hover:outline-gray-400/50" id="input"
                  value={store.text} spellcheck={false} onInput$={(e, el) => { store.text = el.value; }}/>
              </div>
              <p class="absolute bottom-1 left-1 w-[calc(100%-0.5rem)] bg-black/50 h-8 px-1 py-0.5 text-2xl whitespace-nowrap overflow-auto"
                style={{ textShadow: '2px 2px 0 #373737' }}>
                {generateOutput(store.text, store.colors, store.format, store.prefixsuffix, store.trimspaces, store.colorlength, store.bold, store.italic, store.underline, store.strikethrough)}
              </p>
            </div>
          }
          {store.previewStyle == 'default' &&
            <div class={{
              'relative w-full': true,
              'text-3xl md:text-4xl xl:text-5xl break-all font-mc': true,
              'font-mc-bold': store.bold,
              'font-mc-italic': store.italic,
              'font-mc-bold-italic': store.bold && store.italic,
            }}>
              <p class="lum-bg-gray-800/50 rounded-lg lum-pad-md w-full h-full pointer-events-none whitespace-pre-wrap!">
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
                        textShadow: `4px 4px 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
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
              </p>
              <textarea class="absolute top-0 lum-input lum-pad-md resize-none w-full h-full whitespace-pre-wrap! caret-white text-transparent lum-bg-transparent hover:text-transparent hover:lum-bg-transparent hover:backdrop-brightness-150" id="input"
                value={store.text} spellcheck={false} onInput$={(e, el) => { store.text = el.value; }}/>
            </div>
          }
        </label>

        <div class={{
          'w-full h-2 mb-5 rounded-full items-center relative': true,
          'hidden': store.disperse,
        }} id="colormap"
        style={`background: linear-gradient(to right, ${sortColors(store.colors).map(color => `${color.hex} ${color.pos}%`).join(', ')});`}
        onMouseDown$={(e, el) => {
          if (e.target != el) return;
          const rect = el.getBoundingClientRect();
          const pos = ((e.clientX - rect.left) / rect.width) * 100;
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
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
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
            'absolute -mt-1.5 -ml-3 w-5 h-5 rounded-full border border-gray-700 bg-gray-800 opacity-0 pointer-events-none': true,
          }}>
            <Plus size={19} />
          </div>
          {store.colors.map((color, i) => <div class="absolute -mt-1 -ml-3" key={`${i}/${store.colors.length}`}
            onMouseDown$={(e, el) => {
              const abortController = new AbortController();
              const colormap = document.getElementById('colormap')!;
              const rect = colormap.getBoundingClientRect();
              document.addEventListener('mousemove', e => {
                tmpstore.opened.id = -1;
                el.classList.add('-mt-2', 'scale-125', 'z-[1000]');
                el.style.filter = 'drop-shadow(0 0 10px rgb(31 41 55))';
                let pos = ((e.clientX - rect.left) / rect.width) * 100;
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
                'transition-transform w-5 h-5 -mt-0.5 hover:scale-125 rounded-full shadow-md border': true,
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
                  <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" onClick$={() => {
                    const newColors = store.colors.slice(0);
                    newColors.splice(i, 1);
                    store.colors = sortColors(newColors);
                  }}>
                    <Trash size={20} />
                  </button>
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
            <div class={{
              'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
              'h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('colors') == -1,
              'opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('colors') != -1,
            }} id="colors">
              {store.format.color != 'MiniMessage' &&
                <NumberInput input disabled min={1} max={store.text.length / store.colors.length} value={store.colorlength} id="colorlength" class={{ 'w-full !opacity-100': true }}
                  onIncrement$={() => {
                    store.colorlength++;
                  }}
                  onDecrement$={() => {
                    store.colorlength--;
                  }}
                >
                  {t('color.colorLength@@Characters per color')}
                </NumberInput>
              }
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
              <div class="flex gap-2">
                <button class={{
                  'lum-btn lum-pad-equal-xs': true,
                  'w-full': store.disperse,
                }} onClick$={() => {
                  const newColors = store.colors.map(color => ({ hex: getRandomColor(), pos: color.pos }));
                  store.colors = newColors;
                }}>
                  <Dices size={24} /> {store.disperse && <span>Randomize</span>}
                </button>
                {!store.disperse &&
                  <button class="lum-btn lum-pad-xs w-full" disabled={store.colors.find((color, i) => color.pos != (100 / (store.colors.length - 1)) * i) ? false : true} onClick$={() => {
                    disperseColors();
                  }}>
                    <Ellipsis size={24} /> Disperse
                  </button>
                }
              </div>
              <div class="flex flex-col gap-2">
                {store.colors.map((color, i) => <div key={`${i}/${store.colors.length}`} class="flex relative gap-2">
                  <div class="flex flex-col rounded-md">
                    <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => handleSwap(i, i - 1)}>
                      <ChevronUp size={24} />
                    </button>
                    <button class="lum-btn lum-pad-equal-xs border-t-transparent rounded-t-none" onClick$={() => handleSwap(i, i + 1)}>
                      <ChevronDown size={24} />
                    </button>
                  </div>
                  <div class="flex flex-col justify-end gap-1">
                    <label for={`colorlist-color-${i + 1}`}>{t('color.color@@Color')} {i + 1}</label>
                    <input key={`colorlist-color-${i + 1}-${color.hex}`} id={`colorlist-color-${i + 1}`}
                      class={{
                        'text-gray-400 hover:text-gray-400': getBrightness(convertToRGB(color.hex)) < 126,
                        'text-gray-700 hover:text-gray-700': getBrightness(convertToRGB(color.hex)) > 126,
                        'lum-input w-full lum-pad-xs hover:': true,
                      }}
                      style={`background: ${color.hex};`}
                      value={color.hex}
                      onInput$={(e, el) => {
                        const picker = document.getElementById(`colorlist-color-${i + 1}-picker`)!;
                        picker.dataset.value = el.value;
                        picker.dispatchEvent(new Event('input'));
                      }}
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
                    />
                  </div>
                  <div class="flex flex-col justify-end">
                    <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" disabled={store.colors.length <= 2} onClick$={() => {
                      const newColors = store.colors.slice(0);
                      newColors.splice(i, 1);
                      store.colors = newColors;
                    }}>
                      <Trash size={20} />
                    </button>
                  </div>
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

            <div class={{
              'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
              'max-h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('output') == -1,
              'max-h-[250px] opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('output') != -1,
            }} id="output">
              <label for="output" class="text-gray-500">
                {t('color.outputSubtitle@@Copy-paste this for RGB text!')}
              </label>
              <textarea id="output" readOnly
                class={{
                  'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
                }}
                value={generateOutput(store.text, store.colors, store.format, store.prefixsuffix, store.trimspaces, store.colorlength, store.bold, store.italic, store.underline, store.strikethrough)}
                onClick$={(e, el) => {
                  let alert = {
                    class: 'text-green-500',
                    text: 'color.copied@@Copied to clipboard!',
                  };
                  navigator.clipboard.writeText(el.value).catch(() => {
                    alert = {
                      class: 'text-red-500',
                      text: 'color.copied@@Failed to copy to clipboard!',
                    };
                  });
                  tmpstore.alerts.push(alert);
                  setTimeout(() => {
                    tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
                  }, 2000);
                }}
              />
              {tmpstore.alerts.map((alert, i) => (
                <p key={`alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
              ))}
              <Dropdown id="previewstyle" value={store.previewStyle} class={{ 'w-full': true }} onChange$={
                (e, el) => {
                  store.previewStyle = el.value;
                }
              } values={[
                {
                  name: t('color.previewstyle.default@@Default'),
                  value: 'default',
                },
                {
                  name: t('color.previewstyle.chat@@Minecraft Chat'),
                  value: 'chat',
                },
              ]}>
                {t('color.previewStyle@@Preview Style')}
              </Dropdown>
            </div>

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
            <div class={{
              'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
              'max-h-0 opacity-0 pointer-events-none': tmpstore.sectionsOpened.indexOf('presets') == -1,
              'max-h-[250px] opacity-100 pointer-events-auto': tmpstore.sectionsOpened.indexOf('presets') != -1,
            }} id="presets">
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
                  <Download size={20} /> Load saved preset
                </span>}>
                  {t('color.savedPresets@@Saved Presets')}
                </Dropdown>
                <div class="grid grid-cols-2 gap-2">
                  <a class="lum-btn" href="presets">
                    <Globe size={20} /> Browse
                  </a>
                  <button class="lum-btn" id="save" onClick$={() => {
                    modalRef.value?.showModal();
                  }}>
                    <Save size={20} /> {t('color.save@@Save')}
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
                          <X size={20} /> {t('color.cancel@@Cancel')}
                        </button>
                        <button class="lum-btn lum-bg-green-900 hover:lum-bg-green-800" id="save" onClick$={() => {
                          const presetnameinput = document.getElementById('presetname') as HTMLInputElement;
                          const preset: Partial<typeof defaults> = {
                            ...store,
                            name: presetnameinput.value ?? 'Untitled',
                          };
                          (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
                            if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
                          });
                          if (presetstore.savedPresets.find(p => JSON.stringify(p) === JSON.stringify(preset))) return;
                          presetstore.savedPresets.push(preset);
                          if (isBrowser) setCookies('presets', presetstore);
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
                          <Save size={20} /> {t('color.save@@Save')}
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
                    <span class="text-gray-500"> - {t('color.importSubtitle@@Load a JSON preset')}</span>
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
                    const preset: Partial<typeof defaults> = { ...store };
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
                    <Share size={24} /> {t('color.export@@Export')}
                  </button>
                  <button class="lum-btn lum-pad-sm" id="createurl" onClick$={() => {
                    const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                    const url = new URL(base_url);
                    const params: Partial<typeof defaults> = { ...store };
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
                    <Link size={24} /> {t('color.url@@Get URL')}
                  </button>
                </div>
              </div>
            </div>
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