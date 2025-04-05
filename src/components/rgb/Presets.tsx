import { $, component$, isBrowser, useContext } from '@builder.io/qwik';
import { Download, Globe, Link, Save, Share } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { Dropdown } from '@luminescent/ui-qwik';
import { defaults, loadPreset, presets as presetlist } from '../util/PresetUtils';

import { setCookies, sortColors } from '../util/SharedUtils';
import { Gradient } from '../util/HexUtils';
import { convertToHex, convertToRGB, hexToHSL } from '../util/RGBUtils';
import { NotificationContext } from '~/routes/layout';
import { presetStoreContext, rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const presetStore = useContext(presetStoreContext);

  const loadPresetJSON = $(async (presetJSON: string) => {
    const id = Math.random().toString(36).substring(2, 15);
    const notification = {
      id,
      title: await t$('color.importedPreset@@Successfully imported preset!'),
      description: await t$('color.importedPresetDescription@@The preset has been imported successfully.'),
      bgColor: 'lum-bg-green-900/50',
    };
    let json: Partial<typeof defaults> | undefined;
    try {
      const preset = loadPreset(presetJSON);
      json = {
        ...preset,
      };
    } catch (err) {
      notification.title = await t$('color.invalidPreset@@Invalid Preset');
      notification.description = `Error: ${err}\nPlease report this to the <a class="text-blue-400 hover:underline" href="https://discord.gg/9vUZ9MREVz">Developers</a> with the preset you tried to import.`;
      notification.bgColor = 'lum-bg-red-900/50';
      notifications.push(notification);
    }
    if (!json) return;
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach(key => {
      if (rgbStore[key] === undefined) return;
      (rgbStore as any)[key] = json[key] ?? defaults[key];
    });
    notifications.push(notification);
    setTimeout(() => {
      notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
    }, 2000);
  });

  return (
    <div class={{
      'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="flex flex-col gap-2">
        <Dropdown id="saved-presets" class={{ 'w-full': true }}
          onChange$={async (event, el) => loadPresetJSON(el.value)}
          values={
            presetStore.savedPresets.map((preset) => ({
              name: <span class={{
                'break-all font-mc tracking-tight': true,
              }}>
                {(() => {
                  if (!preset.name) preset.name = 'Untitled';

                  const colors = sortColors(preset.colors ?? presetlist[0].colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
                  if (colors.length < 2) return preset.name;

                  const gradient = new Gradient(colors, Math.ceil(preset.name.length / (preset.colorlength || 1)));

                  let hex = '';
                  const segments = [];
                  let index = 0;
                  const textArray = Array.from(preset.name);
                  while (index < textArray.length) {
                    segments.push(textArray.slice(index, index + (preset.colorlength ?? 1)).join(''));
                    index += preset.colorlength ?? 1;
                  }
                  return segments.map((segment, i) => {
                    const rgb = gradient.next();
                    hex = convertToHex(rgb);
                    const shadow = hexToHSL(hex);
                    if (shadow.l > 50) shadow.s = shadow.s * 0.2;
                    shadow.l = Math.round(shadow.l * 0.2);
                    return <span key={`char${i}`} style={{
                      color: `#${hex};`,
                      textShadow: `1px 1px 0 hsl(${shadow.h}deg ${shadow.s}% ${shadow.l}%);`,
                    }} class={{
                      'underline': preset.underline,
                      'strikethrough': preset.strikethrough,
                      'underline-strikethrough': preset.underline && preset.strikethrough,
                    }}>
                      {segment.replace(/ /g, '\u00A0')}
                    </span>;
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
          <button class="lum-btn" id="save" onClick$={async () => {
            const preset: Partial<typeof defaults> = {
              ...rgbStore,
              name: rgbStore.text,
            };
            (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
            });
            if (presetStore.savedPresets.find(p => JSON.stringify(p) === JSON.stringify(preset))) return;
            presetStore.savedPresets.push(preset);
            if (isBrowser) setCookies('presets', presetStore);
            const id = Math.random().toString(36).substring(2, 15);
            notifications.push({
              id,
              title: await t$('color.savedPresetTitle@@Preset Saved!'),
              description: await t$('color.savedPreset@@Successfully saved preset!'),
              bgColor: 'lum-bg-green-900/50',
            });
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <Save size={20} /> {t('color.save@@Save')}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <label for="import">
            {t('color.import@@Import')}
            <span class="text-gray-500"> - {t('color.importSubtitle@@Load a JSON preset')}</span>
          </label>
          <input class="lum-input" id="import" name="import" placeholder={t('color.import@@Import (Paste here)')}
            onInput$={async (e, el) => loadPresetJSON(el.value)}/>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button class="lum-btn lum-pad-sm" id="export" onClick$={async () => {
            const preset: Partial<typeof defaults> = { ...rgbStore };
            (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
            });
            const id = Math.random().toString(36).substring(2, 15);
            const notification = {
              id,
              title: await t$('color.copied@@Copied to clipboard!'),
              description: await t$('color.exportedPreset@@Successfully exported preset to clipboard!'),
              bgColor: 'lum-bg-green-900/50',
            };
            navigator.clipboard.writeText(JSON.stringify(preset)).catch(async (err) => {
              notification.title = await t$('color.copyFailed@@Failed to copy to clipboard!');
              notification.description = err;
              notification.bgColor = 'lum-bg-red-900/50';
            });
            notifications.push(notification);
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <Share size={24} /> {t('color.export@@Export')}
          </button>
          <button class="lum-btn lum-pad-sm" id="createurl" onClick$={async () => {
            const base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
            const url = new URL(base_url);
            const params: Partial<typeof defaults> = { ...rgbStore };
            (Object.entries(params) as Array<[keyof typeof defaults, any]>).forEach(([key, value]) => {
              if (key == 'format' || key == 'colors') {
                value = JSON.stringify(value);
                if (value === JSON.stringify(defaults[key as keyof typeof defaults])) return;
              }
              if (value === defaults[key as keyof typeof defaults]) return;
              url.searchParams.set(key, String(value));
            });
            window.history.pushState({}, '', url.href);
            const id = Math.random().toString(36).substring(2, 15);
            notifications.push({
              id,
              title: await t$('color.exportedPresetUrlTitle@@URL Updated!'),
              description: await t$('color.exportedPresetUrl@@Successfully exported preset to url! Check the URL bar!'),
              bgColor: 'lum-bg-green-900/50',
            });
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <Link size={24} /> {t('color.url@@Get URL')}
          </button>
        </div>
      </div>
    </div>
  );
});