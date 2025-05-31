import { $, component$, isBrowser, useContext, useContextProvider, useSignal, type Signal } from '@builder.io/qwik';
import { Download, Globe, Save, Link as LinkIcon, Copy } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { SelectMenu } from '@luminescent/ui-qwik';
import { loadPreset, rgbPreset } from '~/util/rgb/presets';

import { NotificationContext } from '~/routes/layout';
import { renderPreview, rgbStoreContext } from '~/routes/resources/rgb';
import { Link, useLocation } from '@builder.io/qwik-city';
import type { BirdflopSession } from '~/routes/plugin@auth';
import { useSession } from '~/routes/plugin@auth';
import { setUserData } from '~/util/dataUtils';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { savedPresetsContext } from '~/routes/resources/rgb/presets';
import { migratePresetsFromCookies } from '~/util/rgb/presets/migrate';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const loc = useLocation();
  const session = useSession() as Readonly<Signal<BirdflopSession>>;

  const loadPresetJSON = $(async (presetJSON: string) => {
    const id = Math.random().toString(36).substring(2, 15);
    const notification = {
      id,
      title: await t$('rgb.presets.imported.title@@Successfully imported preset!'),
      description: await t$('rgb.presets.imported.description@@The preset has been imported successfully.'),
      bgColor: 'lum-bg-green-900/50',
    };
    let json: rgbPreset | undefined;
    try {
      const preset = loadPreset(presetJSON);
      json = {
        ...preset,
      };
    } catch (err) {
      notification.title = await t$('rgb.presets.invalid.title@@Invalid Preset');
      notification.description = `Error: ${err}\n${await t$('rgb.presets.invalid.description@@Please report this to https://discord.gg/9vUZ9MREVz with the preset you tried to import.')}`;
      notification.bgColor = 'lum-bg-red-900/50';
      notifications.push(notification);
    }
    if (!json) return;
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach(key => {
      if (rgbStore[key] === undefined) return;
      (rgbStore as any)[key] = json[key] ?? combinedDefaults[key];
    });
    notifications.push(notification);
    setTimeout(() => {
      notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
    }, 2000);
  });

  const savedPresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  return (
    <div class={{
      'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="flex flex-col gap-2"
        onClick$={() => {
          if (savedPresets.value.length != 0) return;
          let newSavedPresets: rgbPreset[] = [];
          try {
            // try to get presets from localStorage
            const localStoragePresets = localStorage.getItem('savedPresets');
            // if localStorage is empty, try to get presets from cookies
            if (!localStoragePresets) migratePresetsFromCookies(newSavedPresets);
            else {
              const localStoragePresetsParsed = JSON.parse(localStoragePresets) as rgbPreset[];
              newSavedPresets = newSavedPresets.concat(localStoragePresetsParsed);
            }
            savedPresets.value = savedPresets.value.concat(newSavedPresets);
          } catch (err) {
            const id = Math.random().toString(36).substring(2, 15);
            const notification = {
              id,
              title: 'Error parsing saved presets',
              description: `Error: ${err}`,
              bgColor: 'lum-bg-red-900/50',
            };
            notifications.push(notification);
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }
        }}>
        <SelectMenu id="saved-presets" class={{ 'w-full': true }} customDropdown
          onChange$={async (event, el) => loadPresetJSON(el.value)}
          values={savedPresets.value.length == 0 ? undefined :
            savedPresets.value.map((preset) => ({
              name: <span class={{
                'break-all font-mc tracking-tight': true,
                'font-mc-bold': preset.bold,
                'font-mc-italic': preset.italic,
                'font-mc-bold-italic': preset.bold && preset.italic,
                [`${preset.format?.class}`]: preset.format?.class,
              }}>
                {renderPreview({ ...rgbDefaults, ...preset }, 1)}
              </span>,
              value: JSON.stringify(preset),
            }))
          }>
          <span q:slot="dropdown" class="flex gap-3 flex-1">
            <Download size={20} /> {t('rgb.presets.load@@Load saved preset')}
          </span>
          <Link q:slot="extra-buttons" class="lum-btn lum-bg-transparent" href="/resources/rgb/presets">
            <Globe size={20} /> {t('rgb.presets.browse@@Browse')}
          </Link>
          {t('rgb.presets.saved.presets@@Saved Presets')}
        </SelectMenu>
        <div class="grid grid-cols-2 gap-2">
          <Link class="lum-btn" href="/resources/rgb/presets">
            <Globe size={20} /> {t('rgb.presets.browse@@Browse')}
          </Link>
          <button class="lum-btn" id="save" onClick$={async () => {
            const preset: rgbPreset = { ...rgbStore };
            if (preset.syncshadow) delete preset.shadowcolors;
            (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) delete preset[key];
            });
            if (!savedPresets.value.find(p => JSON.stringify(p) === JSON.stringify(preset))) {
              savedPresets.value.push(preset);
            }
            if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(savedPresets.value));
            await setUserData({ privatePresets: savedPresets.value });
            const id = Math.random().toString(36).substring(2, 15);
            notifications.push({
              id,
              title: await t$('rgb.presets.saved.title@@Preset Saved!'),
              description: session.value ? await t$('rgb.presets.saved.description@@Successfully saved preset!')
                : await t$('rgb.presets.saved.warning@@Please login to save presets permanently.'),
              bgColor: session.value ? 'lum-bg-green-900/50' : 'lum-bg-orange-900/50',
            });
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <Save size={20} /> {t('rgb.presets.save@@Save')}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <label for="import">
            {t('rgb.presets.import@@Import')}
            <span class="text-gray-500"> - {t('rgb.presets.importSubtitle@@Load a JSON preset')}</span>
          </label>
          <input class="lum-input" id="import" name="import" placeholder={`${t('rgb.presets.import@@Import')} - ${t('rgb.presets.pasteHere@@Paste here')}`}
            onInput$={async (e, el) => loadPresetJSON(el.value)}/>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button class="lum-btn" id="export" onClick$={async () => {
            const preset: rgbPreset = { ...rgbStore };
            if (preset.syncshadow) delete preset.shadowcolors;
            (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) delete preset[key];
            });
            const id = Math.random().toString(36).substring(2, 15);
            const notification = {
              id,
              title: await t$('rgb.copied@@Copied to clipboard!'),
              description: await t$('rgb.presets.copied@@Successfully copied preset to clipboard!'),
              bgColor: 'lum-bg-green-900/50',
            };
            navigator.clipboard.writeText(JSON.stringify(preset)).catch(async (err) => {
              notification.title = await t$('rgb.copyFailed@@Failed to copy to clipboard!');
              notification.description = err;
              notification.bgColor = 'lum-bg-red-900/50';
            });
            notifications.push(notification);
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
          </button>
          <button class="lum-btn" id="createurl" onClick$={async () => {
            const base_url = `${loc.url.protocol}//${loc.url.host}${loc.url.pathname}`;
            const url = new URL(base_url);
            const params: rgbPreset = { ...rgbStore };
            (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
              if (key == 'format' || key == 'colors' || key == 'shadowcolors') {
                value = JSON.stringify(value);
                if (value === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) return;
              }
              if (value === combinedDefaults[key]) return;
              url.searchParams.set(key, String(value));
            });
            window.history.pushState({}, '', url.href);
            const id = Math.random().toString(36).substring(2, 15);
            notifications.push({
              id,
              title: await t$('rgb.presets.url.title@@URL Updated!'),
              description: await t$('rgb.presets.url.description@@Successfully exported preset to url! (Check the URL bar)'),
              bgColor: 'lum-bg-green-900/50',
            });
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }}>
            <LinkIcon size={20} /> {t('rgb.presets.url.get@@Get Url')}
          </button>
        </div>
      </div>
    </div>
  );
});