import { $, component$, isBrowser, useContext, useContextProvider, useSignal } from '@builder.io/qwik';
import { Save, Link as LinkIcon, Copy, Globe } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { getPresets, loadPreset, rgbPreset } from '~/util/rgb/presets';

import { openItemsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import { renderPreview, rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useSession } from '~/routes/plugin@auth';
import { setUserData } from '~/util/dataUtils';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import Accordion from '../Elements/Accordion';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const loc = useLocation();
  const session = useSession();

  const loadPresetJSON = $(async (presetJSON: string) => {
    const notification = new Notification()
      .setTitle(await t$('rgb.presets.imported.title@@Successfully imported preset!'))
      .setDescription(await t$('rgb.presets.imported.description@@The preset has been imported successfully.'))
      .setBgColor('lum-bg-green/50');
    let json: rgbPreset | undefined;
    try {
      const preset = loadPreset(presetJSON);
      json = {
        ...preset,
      };
    } catch (err) {
      notification.setTitle(await t$('rgb.presets.invalid.title@@Invalid Preset'))
        .setDescription(`Error: ${err}\n${await t$('rgb.presets.invalid.description@@Please report this to the Discord server with the preset you tried to import.')}`)
        .setBgColor('lum-bg-red/50')
        .setButtons([{
          text: 'Discord',
          href: 'https://discord.gg/9vUZ9MREVz',
        }])
        .setPersist(true);
      notifications.push(notification);
    }
    if (!json) return;
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach(key => {
      if (rgbStore[key] === undefined) return;
      if (key == 'text') return (rgbStore as any)[key] = json[key] ?? rgbStore[key];
      (rgbStore as any)[key] = json[key] ?? combinedDefaults[key];
    });
    notifications.push(notification);
  });

  const privatePresets = useSignal(session.value?.user?.privatePresets ?? []);
  useContextProvider(privatePresetsContext, privatePresets);

  const savedPresets = useSignal(session.value?.user?.savedPresets ?? []);
  useContextProvider(savedPresetsContext, savedPresets);

  const openItemsStore = useContext(openItemsContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="flex flex-col">
        <div class="flex gap-1">
          <Accordion onClick$={() => {
            // If privatePresets is empty, load presets from localStorage
            if (privatePresets.value.length != 0 || savedPresets.value.length != 0) return;

            try {
              const localStoragePresets = getPresets();
              privatePresets.value = privatePresets.value.concat(localStoragePresets);
            } catch (err) {
              const notification = new Notification()
                .setTitle('Error loading saved presets')
                .setDescription(`Error: ${err}`)
                .setBgColor('lum-bg-red/50')
                .setPersist(true);
              notifications.push(notification);
            }
          }}
          sectionName="saved-presets"
          class={{ 'flex-1': true }}
          >
            {t('rgb.presets.saved.presets@@Saved Presets')}
          </Accordion>
          <button class={{
            'lum-btn': true,
          }} id="save" onClick$={async () => {
            const preset: rgbPreset = { ...rgbStore };
            (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
              if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key])) delete preset[key];
            });
            if (!privatePresets.value.find(p => JSON.stringify(p) === JSON.stringify(preset))) {
              privatePresets.value.push(preset);
            }
            if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
            await setUserData({ privatePresets: privatePresets.value });
            const notification = new Notification()
              .setTitle(await t$('rgb.presets.imported.title@@Successfully imported preset!'))
              .setDescription(session.value ? await t$('rgb.presets.saved.description@@Successfully saved preset!')
                : await t$('rgb.presets.saved.warning@@Please login to save presets permanently.'))
              .setBgColor(session.value ? 'lum-bg-green/50' : 'lum-bg-orange/50');
            notifications.push(notification);
          }}>
            <Save size={20} /> {t('rgb.presets.save@@Save')}
          </button>
        </div>
        <div class={{
          'flex flex-col transition-all gap-1 flex-1 lum-bg-lum-input-bg rounded-lum': true,
          'max-h-0 opacity-0 scale-98 pointer-events-none': !openItemsStore.items.includes('saved-presets'),
          'max-h-screen opacity-100 my-1 p-1': openItemsStore.items.includes('saved-presets'),
        }}>
          {privatePresets.value.length === 0 && savedPresets.value.length === 0 && (
            <p class="rounded-lum p-2 text-center">
              {t('rgb.presets.nopresets@@No presets saved yet!')}
            </p>
          )}
          {privatePresets.value.concat(savedPresets.value.map((preset) => ({
            text: preset.name ?? rgbStore.text,
            ...preset.preset,
          }))).map((preset, i) => <button key={i} class={{
            'lum-btn lum-bg-transparent rounded-lum-1 gap-0 w-full break-all font-mc tracking-tight': true,
            'font-mc-bold': preset.bold,
            'font-mc-italic': preset.italic,
            'font-mc-bold-italic': preset.bold && preset.italic,
            [`${preset.format?.class}`]: preset.format?.class,
          }} onClick$={() => loadPresetJSON(JSON.stringify(preset))}>
            {renderPreview({ ...rgbDefaults, text: rgbStore.text, ...preset }, 1)}
          </button>)}
        </div>
      </div>
      <Link class={{
        'lum-btn border-blue hover:border-blue': true,
      }} href="/resources/rgb/presets" id="findmorepresets">
        <Globe size={20} /> {t('rgb.presets.find@@Find more presets')}
      </Link>
      <div class="flex flex-col gap-1">
        <label for="import">
          {t('rgb.presets.import@@Import')}
          <span class="text-lum-text-secondary"> - {t('rgb.presets.importSubtitle@@Load a JSON preset')}</span>
        </label>
        <input class="lum-input" id="import" name="import" placeholder={`${t('rgb.presets.import@@Import')} - ${t('rgb.presets.pasteHere@@Paste here')}`}
          onInput$={async (e, el) => loadPresetJSON(el.value)}/>
      </div>
      <div class="flex flex-wrap gap-1 mt-1">
        <button class={{
          'lum-btn flex-1': true,
        }} id="copy" onClick$={async () => {
          const preset: rgbPreset = { ...rgbStore };
          (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
            if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key])) delete preset[key];
          });
          const notification = new Notification()
            .setTitle(await t$('rgb.copied@@Copied to clipboard!'))
            .setDescription(await t$('rgb.presets.copied@@Successfully copied preset to clipboard!'))
            .setBgColor('lum-bg-green/50');
          navigator.clipboard.writeText(JSON.stringify(preset)).catch(async (err) => {
            notification.setTitle(await t$('rgb.copyFailed@@Failed to copy to clipboard!'))
              .setDescription('Error: ' + err)
              .setBgColor('lum-bg-red/50')
              .setPersist(true);
          });
          notifications.push(notification);
        }}>
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>
        <button class={{
          'lum-btn flex-1': true,
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
          const notification = new Notification()
            .setTitle(await t$('rgb.presets.url.title@@URL Updated!'))
            .setDescription(await t$('rgb.presets.url.description@@Successfully exported preset to url! (Check the URL bar)'))
            .setBgColor('lum-bg-green/50');
          notifications.push(notification);
        }}>
          <LinkIcon size={20} /> {t('rgb.presets.url.get@@Get Url')}
        </button>
      </div>
    </div>
  );
});