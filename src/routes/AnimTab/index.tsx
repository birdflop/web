import { component$, useVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead, server$ } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput, { RawTextInput } from '~/components/elements/TextInput';
import SelectInput from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import ColorInput from '~/components/elements/ColorInput';
import Button from '~/components/elements/Button';

import { presetVersion } from '~/components/util/PresetUtils';
import OutputField from '~/components/elements/OutputField';
import { getAnimFrames, getRandomColor } from '~/components/util/RGBUtils';
import { AnimationOutput } from '~/components/util/RGBUtils';

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

export const setCookie = server$(function (store) {
  const json = JSON.parse(store);
  delete json.alerts;
  delete json.frames;
  delete json.frame;
  Object.keys(json).forEach(key => {
    const existingCookie = this.cookie.get(key);
    if (existingCookie === json[key]) return;
    this.cookie.set(key, encodeURIComponent(json[key]));
  });
});

export const getCookie = server$(function (store) {
  const json = JSON.parse(store);
  delete json.alerts;
  delete json.frames;
  delete json.frame;
  Object.keys(json).forEach(key => {
    const existingCookie: any = this.cookie.get(key);

    if (key == 'colors' && existingCookie) existingCookie.value = existingCookie?.value.split(',');
    json[key] = existingCookie?.value || json[key];
  });
  return JSON.stringify(json);
});

export default component$(() => {
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
  }, { deep: true });

  useVisibleTask$(() => {
    store.colors = ['#00FFE0', '#EB00FF'];

    getCookie(JSON.stringify(store)).then((userstore: any) => {
      userstore = JSON.parse(userstore);
      Object.keys(userstore).forEach((key: any) => {
        if (userstore[key]) store[key] = userstore[key];
      });
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
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js"></script>
      <div class="mt-10 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-4xl mb-2">
          Animated TAB
        </h1>
        <h2 class="text-gray-50 text-xl mb-12">
          TAB plugin gradient animation creator
        </h2>

        <OutputField value={AnimationOutput(store)}>
          <h1 class="font-bold text-3xl mb-2">
            Output
          </h1>
          This is what you put in the chat. Click on it to copy.
        </OutputField>

        <h1 class={`text-6xl my-6 break-all max-w-7xl -space-x-[1px] font${store.bold ? '-bold' : ''}${store.italic ? '-italic' : ''}`}>
          {(() => {
            const text = store.text ? store.text : 'SimplyMC';

            if (!store.frames[0]) return;
            const colors = store.frames[store.frame];
            if (!colors) return;

            let i = -1;
            return text.split('').map((char: string) => {
              if (char != ' ' && i + 1 < colors.length) i++;
              return <span style={`color: #${colors[i]};`} class={`font${store.underline ? '-underline' : ''}${store.strikethrough ? '-strikethrough' : ''}`}>{char}</span>;
            });
          })()}
        </h1>

        <div class="grid sm:grid-cols-4 gap-2">
          <div class="sm:pr-4">
            <NumberInput id="colors" onIncrement$={() => { if (store.colors.length < store.text.length) { store.colors.push(getRandomColor()); setCookie(JSON.stringify(store)); } }} onDecrement$={() => { if (store.colors.length > 2) { store.colors.pop(); setCookie(JSON.stringify(store)); } }}>
              {store.colors.length} Colors
            </NumberInput>
            <div class="overflow-auto max-h-32 sm:max-h-[500px] mt-3">
              {store.colors.map((color: string, i: number) => {
                return <>
                  <ColorInput id={`color${i + 1}`} value={color} jscolorData={{ palette: store.colors }} onInput$={(event: any) => { store.colors[i] = event.target!.value; setCookie(JSON.stringify(store)); }}>
                    Hex Color {i + 1}
                  </ColorInput>
                </>;
              })}
            </div>
          </div>
          <div class="sm:col-span-3">
            <TextInput id="nameinput" value={store.name} placeholder="name" onInput$={(event: any) => { store.name = event.target!.value; setCookie(JSON.stringify(store)); }}>
              Animation Name
            </TextInput>

            <TextInput id="textinput" value={store.text} placeholder="SimplyMC" onInput$={(event: any) => { store.text = event.target!.value; setCookie(JSON.stringify(store)); }}>
              Animation Text
            </TextInput>

            <NumberInput id="speed" input value={store.speed} step={50} min={50} onInput$={(event: any) => { store.speed = Number(event.target!.value); setCookie(JSON.stringify(store)); }} onIncrement$={() => { store.speed = Number(store.speed) + 50; setCookie(JSON.stringify(store)); }} onDecrement$={() => { store.speed = Number(store.speed) - 50; setCookie(JSON.stringify(store)); }}>
              Speed
            </NumberInput>

            <div class="grid sm:grid-cols-2 gap-2">
              <SelectInput id="type" label="Output Type" value={store.type} onChange$={(event: any) => { store.type = event.target!.value; setCookie(JSON.stringify(store)); }}>
                {
                  types.map((type: any) => {
                    return <option value={type.value}>{type.name}</option>;
                  })
                }
              </SelectInput>
            </div>

            <div class="grid sm:grid-cols-2 gap-2">
              <SelectInput id="format" label="Color Format" value={store.format} onChange$={
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
                {
                  formats.map((format: any) => {
                    return <option value={format}>{format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '')}</option>;
                  })
                }
                <option value={'custom'}>
                  {store.customFormat ? store.format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '') : 'Custom'}
                </option>
              </SelectInput>
              <TextInput id="formatchar" value={store.formatchar} placeholder="&" onInput$={(event: any) => { store.formatchar = event.target!.value; setCookie(JSON.stringify(store)); }}>
                Format Character
              </TextInput>
            </div>

            <TextInput big id="formatInput" value={store.outputFormat} placeholder="SimplyMC" onInput$={(event: any) => { store.outputFormat = event.target!.value; setCookie(JSON.stringify(store)); }}>
              Output Format
            </TextInput>

            {
              store.customFormat && <>
                <TextInput id="format" value={store.format} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format = event.target!.value; setCookie(JSON.stringify(store)); }} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4">
                  Custom Format
                </TextInput>
                <div class="pb-4">
                  <p>Placeholders:</p>
                  <p>$1 - (R)RGGBB</p>
                  <p>$2 - R(R)GGBB</p>
                  <p>$3 - RR(G)GBB</p>
                  <p>$4 - RRG(G)BB</p>
                  <p>$5 - RRGG(B)B</p>
                  <p>$6 - RRGGB(B)</p>
                  <p>$f - Formatting</p>
                  <p>$c - Character</p>
                </div>
              </>
            }

            <label>
              Presets
            </label>
            <div class="flex gap-2 my-2">
              <Button.Button onClick$={() => {
                navigator.clipboard.writeText(JSON.stringify({ version: presetVersion, ...store, alerts: undefined, frames: undefined, frame: undefined }));
                const alert = {
                  class: 'text-green-500',
                  text: 'Successfully exported preset to clipboard!',
                };
                store.alerts.push(alert);
                setTimeout(() => {
                  store.alerts.splice(store.alerts.indexOf(alert), 1);
                }, 2000);
              }}>
                Export
              </Button.Button>
              <RawTextInput name="import" placeholder="Import (Paste here)" onInput$={(event: any) => {
                let json: any;
                try {
                  json = JSON.parse(event.target!.value);
                } catch (error){
                  const alert = {
                    class: 'text-red-500',
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
                  text: 'Successfully imported preset!',
                };
                store.alerts.push(alert);
                setTimeout(() => {
                  store.alerts.splice(store.alerts.indexOf(alert), 1);
                }, 2000);
              }} />
            </div>
            {
              store.alerts.map((alert: any) => {
                return <p class={alert.class} dangerouslySetInnerHTML={alert.text}/>;
              })
            }
            <div class="mt-6 mb-4 space-y-4">
              <Toggle id="bold" checked={store.bold} onChange$={(event: any) => { store.bold = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                Bold - {store.formatchar + 'l'}
              </Toggle>
              <Toggle id="strikethrough" checked={store.strikethrough} onChange$={(event: any) => { store.strikethrough = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                Strikethrough - {store.formatchar + 'm'}
              </Toggle>
              <Toggle id="underline" checked={store.underline} onChange$={(event: any) => { store.underline = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                Underline - {store.formatchar + 'n'}
              </Toggle>
              <Toggle id="italic" checked={store.italic} onChange$={(event: any) => { store.italic = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                Italic - {store.formatchar + 'o'}
              </Toggle>
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
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};