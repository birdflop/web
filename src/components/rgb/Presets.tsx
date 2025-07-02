import { $, component$, isBrowser, useContext, useContextProvider, useSignal, type Signal } from '@builder.io/qwik';
import { Download, Globe, Save, Link as LinkIcon, Copy } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { SelectMenu } from '@luminescent/ui-qwik';
import { getPresets, loadPreset, rgbPreset } from '~/util/rgb/presets';

import { NotificationContext } from '~/routes/layout';
import { renderPreview, rgbStoreContext } from '~/routes/resources/rgb';
import { Link, useLocation } from '@builder.io/qwik-city';
import type { BirdflopSession } from '~/routes/plugin@auth';
import { useSession } from '~/routes/plugin@auth';
import { setUserData } from '~/util/dataUtils';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';

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
      bgColor: 'lum-bg-green/50',
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
      notification.bgColor = 'lum-bg-red/50';
      notifications.push(notification);
    }
    if (!json) return;
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach(key => {
      if (rgbStore[key] === undefined) return;
      if (key == 'text') return (rgbStore as any)[key] = json[key] ?? rgbStore[key];
      (rgbStore as any)[key] = json[key] ?? combinedDefaults[key];
    });
    notifications.push(notification);
    setTimeout(() => {
      notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
    }, 2000);
  });

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  return (
    <div class={{
      'grid sm:grid-cols-2 gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mt-1">
        <Link class={{
          'lum-btn flex-1': true,
          'lg:rounded-r-sm': true,
        }} href="/resources/rgb/presets">
          <Globe size={20} /> {t('rgb.presets.browse@@Browse')}
        </Link>
        <button class={{
          'lum-btn flex-1': true,
          'lg:rounded-sm': true,
        }} id="save" onClick$={async () => {
          const preset: rgbPreset = { ...rgbStore };
          if (preset.syncshadow) delete preset.shadowcolors;
          (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
            if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) delete preset[key];
          });
          if (!privatePresets.value.find(p => JSON.stringify(p) === JSON.stringify(preset))) {
            privatePresets.value.push(preset);
          }
          if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
          await setUserData({ privatePresets: privatePresets.value });
          const id = Math.random().toString(36).substring(2, 15);
          notifications.push({
            id,
            title: await t$('rgb.presets.saved.title@@Preset Saved!'),
            description: session.value ? await t$('rgb.presets.saved.description@@Successfully saved preset!')
              : await t$('rgb.presets.saved.warning@@Please login to save presets permanently.'),
            bgColor: session.value ? 'lum-bg-green/50' : 'lum-bg-orange/50',
          });
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 2000);
        }}>
          <Save size={20} /> {t('rgb.presets.save@@Save')}
        </button>
        <button class={{
          'lum-btn flex-1': true,
          'lg:rounded-sm': true,
        }} id="copy" onClick$={async () => {
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
            bgColor: 'lum-bg-green/50',
          };
          navigator.clipboard.writeText(JSON.stringify(preset)).catch(async (err) => {
            notification.title = await t$('rgb.copyFailed@@Failed to copy to clipboard!');
            notification.description = err;
            notification.bgColor = 'lum-bg-red/50';
          });
          notifications.push(notification);
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 2000);
        }}>
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>
        <button class={{
          'lum-btn flex-1': true,
          'lg:rounded-l-sm': true,
        }} id="createurl" onClick$={async () => {
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
            bgColor: 'lum-bg-green/50',
          });
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 2000);
        }}>
          <LinkIcon size={20} /> {t('rgb.presets.url.get@@Get Url')}
        </button>
      </div>
      <div class="flex flex-col gap-2"
        onClick$={() => {
          // If privatePresets is empty, load presets from localStorage
          if (privatePresets.value.length != 0 || savedPresets.value.length != 0) return;

          try {
            const localStoragePresets = getPresets();
            privatePresets.value = privatePresets.value.concat(localStoragePresets);
          } catch (err) {
            const id = Math.random().toString(36).substring(2, 15);
            const notification = {
              id,
              title: 'Error parsing saved presets',
              description: `Error: ${err}`,
              bgColor: 'lum-bg-red/50',
            };
            notifications.push(notification);
            setTimeout(() => {
              notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
            }, 2000);
          }
        }}>
        <SelectMenu id="saved-presets" class={{ 'w-full': true }} customDropdown
          onChange$={async (event, el) => loadPresetJSON(el.value)}
          values={privatePresets.value.map((preset) => ({
            name: <span class={{
              'break-all font-mc tracking-tight': true,
              'font-mc-bold': preset.bold,
              'font-mc-italic': preset.italic,
              'font-mc-bold-italic': preset.bold && preset.italic,
              [`${preset.format?.class}`]: preset.format?.class,
            }}>
              {renderPreview({ ...rgbDefaults, text: rgbStore.text, ...preset }, 1)}
            </span>,
            value: JSON.stringify(preset),
          })).concat(savedPresets.value.map((preset) => ({
            name: <span class={{
              'break-all font-mc tracking-tight': true,
              'font-mc-bold': preset.preset.bold,
              'font-mc-italic': preset.preset.italic,
              'font-mc-bold-italic': preset.preset.bold && preset.preset.italic,
              [`${preset.preset.format?.class}`]: preset.preset.format?.class,
            }}>
              {renderPreview({ ...rgbDefaults, text: preset.name ?? rgbStore.text, ...preset.preset }, 1)}
            </span>,
            value: JSON.stringify(preset.preset),
          })))}>
          <span q:slot="dropdown" class="flex gap-3 flex-1">
            <Download size={20} /> {t('rgb.presets.load@@Load saved preset')}
          </span>
          <Link q:slot="extra-buttons" class="lum-btn lum-bg-transparent rounded-lum-1" href="/resources/rgb/presets">
            <Globe size={20} /> {t('rgb.presets.browse@@Browse')}
          </Link>
          {t('rgb.presets.saved.presets@@Saved Presets')}
        </SelectMenu>
      </div>
      <div class="flex flex-col gap-1 mb-1">
        <label for="import">
          {t('rgb.presets.import@@Import')}
          <span class="text-lum-text-secondary"> - {t('rgb.presets.importSubtitle@@Load a JSON preset')}</span>
        </label>
        <input class="lum-input" id="import" name="import" placeholder={`${t('rgb.presets.import@@Import')} - ${t('rgb.presets.pasteHere@@Paste here')}`}
          onInput$={async (e, el) => loadPresetJSON(el.value)}/>
      </div>
    </div>
  );
});