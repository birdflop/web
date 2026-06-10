import { $, component$, isBrowser, useContext, useContextProvider, useSignal, useTask$ } from '@builder.io/qwik';
import { Save, Link as LinkIcon, Copy, Globe, Trash } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { getPresets, loadPreset, rgbPreset } from '~/util/rgb/presets';

import { openItemsContext } from '~/routes/layout';
import { Notification, NotificationContext } from '~/util/Notification';
import { renderPreview, rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useSession } from '~/routes/plugin@auth';
import { setUserData, unsavePreset } from '~/util/dataUtils';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import Accordion from '../Elements/Accordion';
import { discordLink } from '../Elements/Nav';
import { SelectList } from '../Elements/SelectList';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const importedPresetTitle = t('rgb.presets.imported.title@@Successfully imported preset!');
  const importedPresetDescription = t('rgb.presets.imported.description@@The preset has been imported successfully.');
  const invalidPresetTitle = t('rgb.presets.invalid.title@@Invalid Preset');
  const invalidPresetDescription = t('rgb.presets.invalid.description@@Please report this to the Discord server with the preset you tried to import.');
  const savedPresetTitle = t('rgb.presets.saved.title@@Preset Saved!');
  const savedPresetDescription = t('rgb.presets.saved.description@@The preset has been saved successfully.');
  const savedPresetWarning = t('rgb.presets.saved.warning@@Please login to save presets permanently.');
  const presetCopiedTitle = t('rgb.presets.copied.title@@Preset Copied!');
  const presetCopiedDescription = t('rgb.presets.copied.description@@Successfully copied preset to clipboard!');
  const presetUrlTitle = t('rgb.presets.url.title@@URL Updated!');
  const presetUrlDescription = t('rgb.presets.url.description@@Successfully exported preset to url! (Check the URL bar)');
  const copyFailedTitle = t('rgb.copyFailed@@Failed to copy to clipboard!');

  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);
  const loc = useLocation();
  const session = useSession();

  const loadPresetJSON = $((presetJSON: string) => {
    const notification = new Notification()
      .setTitle(importedPresetTitle)
      .setDescription(importedPresetDescription)
      .setBgColor('lum-grad-bg-green/50');
    let json: rgbPreset | undefined;
    try {
      const preset = loadPreset(presetJSON);
      json = {
        ...preset,
      };
    } catch (err) {
      notification.setTitle(invalidPresetTitle)
        .setDescription(`Error: ${err}\n${invalidPresetDescription}`)
        .setBgColor('lum-grad-bg-red/50')
        .setButtons([{
          text: 'Discord',
          href: discordLink,
          umamiEvent: 'discord-link',
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

  useTask$(({ track }) => {
    track(() => openItemsStore.items);
    if (!openItemsStore.items.includes('saved-presets')) return;

    // If privatePresets is empty, load presets from localStorage
    if (privatePresets.value.length != 0 || savedPresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error loading saved presets')
        .setDescription(`Error: ${err}`)
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true);
      notifications.push(notification.toJSON());
    }
  });

  return (
    <div class={{
      'flex flex-col gap-1 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="presets">
      <div class="flex gap-1">
        <Accordion
          sectionName="saved-presets"
          class={{ 'flex-1 rounded-r-sm': true }}
        >
          {t('rgb.presets.saved.presets@@Saved Presets')}
        </Accordion>
        <button class={{
          'lum-btn rounded-l-sm': true,
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
            .setTitle(savedPresetTitle)
            .setDescription(session.value ? savedPresetDescription : savedPresetWarning)
            .setBgColor(session.value ? 'lum-grad-bg-green/50' : 'lum-grad-bg-orange/50');
          notifications.push(notification);
        }}>
          <Save size={20} /> {t('rgb.presets.save@@Save')}
        </button>
      </div>

      {/* todo: make this look better, publish preset function */}
      <SelectList class={{
        'transition-all': true,
        'p-0! max-h-0! opacity-0 pointer-events-none -mt-1': !openItemsStore.items.includes('saved-presets'),
        'opacity-100 p-1': openItemsStore.items.includes('saved-presets'),
      }}>
        {privatePresets.value.length && <p q:slot="extra-buttons" class="text-lum-text-secondary border-b border-lum-border/10 my-1 px-2 pb-2">
          {t('rgb.presets.personalPresets@@Personal Presets')}
        </p>}
        {privatePresets.value.map((preset, i) => <div q:slot="extra-buttons" key={i} class={{
          'lum-btn lum-bg-transparent p-0 rounded-lum-1 gap-0 w-full break-all font-mc tracking-tight': true,
          'font-mc-bold': preset.defaultFormatting?.bold,
          'font-mc-italic': preset.defaultFormatting?.italic,
          'font-mc-bold-italic': preset.defaultFormatting?.bold && preset.defaultFormatting?.italic,
          [`${preset.colorFormat?.class}`]: preset.colorFormat?.class,
        }}>
          <button class="p-1.5 pl-3 flex-1 text-left" onClick$={() => loadPresetJSON(JSON.stringify(preset))}>
            {renderPreview({ ...rgbDefaults, text: rgbStore.text, ...preset }, 1)}
          </button>
          <button class="lum-btn lum-bg-transparent hover:lum-bg-transparent hover:text-red-500 p-1.5 mr-1.5 rounded-lum-1 cursor-pointer" onClick$={async () => {
            privatePresets.value = privatePresets.value.filter((p) => p !== preset);
            await setUserData({
              privatePresets: privatePresets.value,
            });
            if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
          }}>
            <Trash size={20} />
          </button>
        </div>)}

        {savedPresets.value.length && <p q:slot="extra-buttons" class="text-lum-text-secondary border-b border-lum-border/10 my-1 px-2 pb-2">
          {t('rgb.presets.savedPresets@@Saved Presets')}
        </p>}
        {savedPresets.value.map((Preset, i) => <div q:slot="extra-buttons" key={i} class={{
          'lum-btn lum-bg-transparent p-0 rounded-lum-1 gap-0 w-full break-all font-mc tracking-tight': true,
          'font-mc-bold': Preset.preset.defaultFormatting?.bold,
          'font-mc-italic': Preset.preset.defaultFormatting?.italic,
          'font-mc-bold-italic': Preset.preset.defaultFormatting?.bold && Preset.preset.defaultFormatting?.italic,
          [`${Preset.preset.colorFormat?.class}`]: Preset.preset.colorFormat?.class,
        }}>
          <button class="p-1.5 pl-3 flex-1 text-left" onClick$={() => loadPresetJSON(JSON.stringify(Preset.preset))}>
            {renderPreview({ ...rgbDefaults, text: Preset.name, ...Preset.preset }, 1)}
          </button>
          <button class="lum-btn lum-bg-transparent hover:lum-bg-transparent hover:text-red-500 p-1.5 mr-1.5 rounded-lum-1 cursor-pointer" onClick$={async () => {
            savedPresets.value = savedPresets.value.filter((p) => p.id !== Preset.id);
            const result = await unsavePreset(Preset.id);
            if (result.success) Preset.saves = (Preset.saves || 0) - 1;
          }}>
            <Trash size={20} />
          </button>
        </div>)}

      </SelectList>

      <Link class={{
        'lum-btn border-blue hover:border-blue': true,
      }} href="/resources/rgb/presets" id="findmorepresets">
        <Globe size={20} /> {t('rgb.presets.find@@Find more presets')}
      </Link>

      <label for="import">
        {t('rgb.presets.import@@Import')}
        <span class="text-lum-text-secondary"> - {t('rgb.presets.importSubtitle@@Load a JSON preset')}</span>
      </label>

      <input class="lum-input" id="import" name="import" placeholder={`${t('rgb.presets.import@@Import')} - ${t('rgb.presets.pasteHere@@Paste here')}`}
        onInput$={async (e, el) => loadPresetJSON(el.value)}/>

      <div class="flex flex-wrap gap-1">
        <button class={{
          'lum-btn rounded-r-sm flex-1': true,
        }} id="copy" onClick$={() => {
          const preset: rgbPreset = { ...rgbStore };
          (Object.keys(preset) as Array<keyof typeof combinedDefaults>).forEach(key => {
            if (key != 'version' && JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key])) delete preset[key];
          });
          const notification = new Notification()
            .setTitle(presetCopiedTitle)
            .setDescription(presetCopiedDescription)
            .setBgColor('lum-grad-bg-green/50');
          navigator.clipboard.writeText(JSON.stringify(preset)).catch((err) => {
            notification.setTitle(copyFailedTitle)
              .setDescription('Error: ' + err)
              .setBgColor('lum-grad-bg-red/50')
              .setPersist(true);
          });
          notifications.push(notification);
        }}>
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>

        <button class={{
          'lum-btn rounded-l-sm flex-1': true,
        }} id="createurl" onClick$={() => {
          const base_url = `${loc.url.protocol}//${loc.url.host}${loc.url.pathname}`;
          const url = new URL(base_url);
          const params: rgbPreset = { ...rgbStore };
          (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
            if (key == 'defaultFormatting' || key == 'colors' || key == 'shadowColors') {
              value = JSON.stringify(value);
              if (value === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) return;
            }
            if (value === combinedDefaults[key]) return;
            url.searchParams.set(key, String(value));
          });
          window.history.pushState({}, '', url.href);
          const notification = new Notification()
            .setTitle(presetUrlTitle)
            .setDescription(presetUrlDescription)
            .setBgColor('lum-grad-bg-green/50');
          notifications.push(notification);
        }}>
          <LinkIcon size={20} /> {t('rgb.presets.url.get@@Get Url')}
        </button>
      </div>
    </div>
  );
});