import { $, component$, isBrowser, useContext, useStore } from '@builder.io/qwik';
import { Download, Globe, Save, Share, Link as LinkIcon } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { Dropdown } from '@luminescent/ui-qwik';
import { defaults, loadPreset } from '~/util/PresetUtils';

import { setUserData, sortColors } from '~/util/SharedUtils';
import { Gradient } from '~/util/HexUtils';
import { convertToHex, convertToRGB, hexToHSL } from '~/util/RGBUtils';
import { NotificationContext } from '~/routes/layout';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useSession } from '~/routes/plugin@auth';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const loc = useLocation();
  const session = useSession();

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

  const presetStore = useStore([] as Partial<typeof defaults>[]);

  return (
    <div class={{
      'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="flex flex-col gap-2"
        onClick$={async () => {
          if (presetStore.length != 0) return;
          let savedPresets = localStorage.getItem('savedPresets');
          try {
            if (!savedPresets) {
              // presets possibly stored in cookies
              const cookie: { [key: string]: string; } = {};
              document.cookie.split(/\s*;\s*/).forEach(function (pair) {
                const pairsplit = pair.split(/\s*=\s*/);
                cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
              });
              if (!cookie['presets']) return;
              const cookieSavedPresets = decodeURIComponent(cookie['presets']);
              savedPresets = JSON.parse(cookieSavedPresets)?.savedPresets;
              if (!savedPresets) return;
              // remove cookie
              document.cookie = 'presets=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              // save to localStorage
              localStorage.setItem('savedPresets', cookieSavedPresets);
            }
            const parsed = JSON.parse(savedPresets);
            presetStore.push(...parsed);
          } catch (err) {
            console.error('Error parsing saved presets', err);
          }
        }}>
        <Dropdown id="saved-presets" class={{ 'w-full': true }}
          onChange$={async (event, el) => loadPresetJSON(el.value)}
          values={
            presetStore.map((preset) => ({
              name: <span class={{
                'break-all font-mc tracking-tight': true,
              }}>
                {(() => {
                  if (!preset.text) preset.text = 'Birdflop';
                  const colors = sortColors(preset.colors ?? defaults.colors).map((color) => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
                  if (colors.length < 2) return preset.text;

                  const gradient = new Gradient(colors, Math.ceil(preset.text.length / (preset.colorlength || 1)));

                  let hex = '';
                  const segments = [];
                  let index = 0;
                  const textArray = Array.from(preset.text);
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
          <Link q:slot="extra-buttons" class="lum-btn" href="/resources/rgb/presets">
            <Globe size={20} /> Browse
          </Link>
          {t('color.savedPresets@@Saved Presets')}
        </Dropdown>
        <div class="grid grid-cols-2 gap-2">
          <Link class="lum-btn" href="/resources/rgb/presets">
            <Globe size={20} /> Browse
          </Link>
          <button class="lum-btn" id="save" onClick$={async () => {
            const preset: Partial<typeof defaults> = { ...rgbStore };
            (Object.keys(preset) as Array<keyof typeof defaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete preset[key];
            });
            if (!presetStore.find(p => JSON.stringify(p) === JSON.stringify(preset))) {
              presetStore.push(preset);
            }
            if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(presetStore));
            setUserData({ savedPresets: presetStore });
            const id = Math.random().toString(36).substring(2, 15);
            notifications.push({
              id,
              title: await t$('color.savedPresetTitle@@Preset Saved!'),
              description: session.value ? await t$('color.savedPreset@@Successfully saved preset!')
                : await t$('color.savedPresetWarn@@Please login to save presets permanently.'),
              bgColor: session.value ? 'lum-bg-orange-900/50' : 'lum-bg-orange-900/50',
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
            const base_url = `${loc.url.protocol}//${loc.url.host}${loc.url.pathname}`;
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
            <LinkIcon size={24} /> {t('color.url@@Get URL')}
          </button>
        </div>
      </div>
    </div>
  );
});