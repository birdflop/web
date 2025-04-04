import { component$, isBrowser, useSignal } from '@builder.io/qwik';
import { Download, Globe, Link, Save, Share, X } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';
import { Dropdown } from '@luminescent/ui-qwik';
import { defaults, loadPreset, presets as presetlist } from '../util/PresetUtils';

import { setCookies, sortColors } from '../util/SharedUtils';
import { Gradient } from '../util/HexUtils';
import { convertToHex, convertToRGB } from '../util/RGBUtils';

export default component$(({ store, presetstore, tmpstore, hidden }: {
  store: typeof rgbDefaults;
  presetstore: {
    savedPresets: Partial<typeof defaults>[];
  };
  tmpstore: {
    threshold: number,
    sectionsOpened: string[],
    alerts: {
      class: string,
      text: string,
    }[],
  };
  hidden: boolean;
}) => {
  const modalRef = useSignal<HTMLDialogElement>();
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();

  return (
    <div class={{
      'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
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
          <a class="lum-btn" href="/resources/rgb/presets">
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
  );
});