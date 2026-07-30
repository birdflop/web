import {
  $,
  component$,
  isBrowser,
  useContext,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';
import { Link, useLocation } from '@qwik.dev/router';

import Braces from 'lucide-icons-qwik/icons/Braces';
import Save from 'lucide-icons-qwik/icons/Save';
import LinkIcon from 'lucide-icons-qwik/icons/Link';
import Copy from 'lucide-icons-qwik/icons/Copy';
import Globe from 'lucide-icons-qwik/icons/Globe';
import Trash from 'lucide-icons-qwik/icons/Trash';
import ExternalLink from 'lucide-icons-qwik/icons/ExternalLink';

import { inlineTranslate } from 'qwik-speak';
import { getPresets, loadPreset, rgbPreset } from '~/util/rgb/presets';
import { Notification, NotificationContext } from '~/util/Notification';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { discordLink } from '~/components/Elements/Nav';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { useSession } from '~/routes/plugin@auth';
import { setUserData, unsavePreset } from '~/util/dataUtils';
import { PublicPreset } from '~/util/db';
import {
  privatePresetsContext,
  savedPresetsContext,
} from '~/routes/resources/rgb/presets';
import RgbPreview from '../RgbPreview';
import { Label } from '@luminescent/ui-qwik';
import { getFormattingClasses } from '../preview';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const importedPresetTitle = t(
    'rgb.presets.imported.title@@Successfully imported preset!'
  );
  const importedPresetDescription = t(
    'rgb.presets.imported.description@@The preset has been imported successfully.'
  );
  const invalidPresetTitle = t('rgb.presets.invalid.title@@Invalid Preset');
  const invalidPresetDescription = t(
    'rgb.presets.invalid.description@@Please report this to the Discord server with the preset you tried to import.'
  );
  const savedPresetTitle = t('rgb.presets.saved.title@@Preset Saved!');
  const savedPresetDescription = t(
    'rgb.presets.saved.description@@The preset has been saved successfully.'
  );
  const savedPresetWarning = t(
    'rgb.presets.saved.warning@@Please login to save presets permanently.'
  );
  const presetCopiedTitle = t('rgb.presets.copied.title@@Preset Copied!');
  const presetCopiedDescription = t(
    'rgb.presets.copied.description@@Successfully copied preset to clipboard!'
  );
  const presetUrlTitle = t('rgb.presets.url.title@@URL Updated!');
  const presetUrlDescription = t(
    'rgb.presets.url.description@@Successfully exported preset to url! (Check the URL bar)'
  );
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
      notification
        .setTitle(invalidPresetTitle)
        .setDescription(
          `Error: ${err instanceof Error ? err.message : String(err)}\n${invalidPresetDescription}`
        )
        .setBgColor('lum-grad-bg-red/50')
        .setButtons([
          {
            text: 'Discord',
            href: discordLink,
            umamiEvent: 'discord-link',
          },
        ])
        .setPersist(true);
      notifications.push(notification.toJSON());
    }
    if (!json) return;
    (Object.keys(rgbStore) as Array<keyof typeof rgbStore>).forEach((key) => {
      if (rgbStore[key] === undefined) return;
      if (key == 'text') return (rgbStore[key] = json[key] ?? rgbStore[key]);
      (rgbStore as Record<keyof typeof combinedDefaults, unknown>)[key] =
        json[key] ?? combinedDefaults[key];
    });
    notifications.push(notification.toJSON());
  });

  const privatePresets = useSignal<rgbPreset[]>(
    session.value?.user?.privatePresets ?? []
  );
  useContextProvider(privatePresetsContext, privatePresets);

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // If privatePresets is empty, load presets from localStorage
    if (privatePresets.value.length != 0) return;

    try {
      const localStoragePresets = getPresets();
      privatePresets.value = privatePresets.value.concat(localStoragePresets);
    } catch (err) {
      const notification = new Notification()
        .setTitle('Error loading saved presets')
        .setDescription(
          `Error: ${err instanceof Error ? err.message : String(err)}`
        )
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true);
      notifications.push(notification.toJSON());
    }
  });

  const savedPresets = useSignal<PublicPreset[]>(
    session.value?.user?.savedPresets ?? []
  );
  useContextProvider(savedPresetsContext, savedPresets);

  return (
    <div
      class={{
        'flex flex-col gap-2 sm:pointer-events-auto sm:h-auto sm:opacity-100': true,
        'pointer-events-none h-0 opacity-0': hidden,
        'pointer-events-auto opacity-100': !hidden,
      }}
      id="presets"
    >
      <div class="flex items-center gap-2">
        <h3 class="flex flex-1 items-center gap-2 font-semibold">
          <Save />
          {t('rgb.presets.title@@Presets')}
        </h3>
        <button
          class="lum-btn lum-btn-p-1 text-sm"
          id="save"
          onClick$={async () => {
            const preset: rgbPreset = { ...rgbStore };
            (
              Object.keys(preset) as Array<keyof typeof combinedDefaults>
            ).forEach((key) => {
              if (
                key != 'version' &&
                JSON.stringify(preset[key]) ===
                  JSON.stringify(combinedDefaults[key])
              )
                delete preset[key];
            });
            if (
              !privatePresets.value.find(
                (p) => JSON.stringify(p) === JSON.stringify(preset)
              )
            ) {
              privatePresets.value.push(preset);
            }
            if (isBrowser)
              localStorage.setItem(
                'privatePresets',
                JSON.stringify(privatePresets.value)
              );
            await setUserData({ privatePresets: privatePresets.value });

            const notification = new Notification()
              .setTitle(savedPresetTitle)
              .setDescription(
                session.value ? savedPresetDescription : savedPresetWarning
              )
              .setBgColor(
                session.value ? 'lum-grad-bg-green/50' : 'lum-grad-bg-orange/50'
              );
            notifications.push(notification.toJSON());
          }}
        >
          <Save size={20} /> {t('rgb.presets.save@@Save')}
        </button>
        <Link
          class="lum-btn lum-btn-p-1 border-blue hover:border-blue text-sm"
          href="/resources/rgb/presets"
          id="findmorepresets"
        >
          <Globe size={20} /> {t('rgb.presets.browse@@Browse')}
        </Link>
      </div>

      <div class="lum-card max-h-64 gap-1 overflow-auto p-1">
        {!!privatePresets.value.length && (
          <p class="text-lum-text-secondary border-lum-border/10 my-1 border-b px-2 pb-2">
            {t('rgb.presets.personalPresets@@Personal Presets')}
          </p>
        )}
        {privatePresets.value.map((preset, i) => (
          <div
            key={i}
            class={{
              'lum-btn lum-bg-transparent rounded-lum-1 w-full gap-0 p-0 break-all': true,
              ...getFormattingClasses(
                preset.baseFormatting,
                preset.colorFormat?.class
              ),
            }}
          >
            <button
              class="flex-1 p-1.5 pl-3 text-left"
              onClick$={() => loadPresetJSON(JSON.stringify(preset))}
            >
              <RgbPreview
                rgbStore={{ ...rgbDefaults, text: rgbStore.text, ...preset }}
                shadowLength={1}
              />
            </button>
            <button
              class="lum-btn lum-bg-transparent hover:lum-bg-transparent rounded-lum-1 text-lum-text-secondary mr-1.5 cursor-pointer p-1.5 hover:text-red-500"
              onClick$={async () => {
                privatePresets.value = privatePresets.value.filter(
                  (p) => p !== preset
                );
                await setUserData({
                  privatePresets: privatePresets.value,
                });
                if (isBrowser)
                  localStorage.setItem(
                    'privatePresets',
                    JSON.stringify(privatePresets.value)
                  );
              }}
            >
              <Trash size={16} />
            </button>
          </div>
        ))}

        {!!savedPresets.value.length && (
          <p class="text-lum-text-secondary border-lum-border/10 my-1 border-b px-2 pb-2">
            {t('rgb.presets.savedPresets@@Saved Presets')}
          </p>
        )}
        {savedPresets.value.map((Preset, i) => (
          <div
            key={i}
            class={{
              'lum-btn lum-bg-transparent rounded-lum-1 w-full gap-0 p-0 break-all': true,
              ...getFormattingClasses(
                Preset.preset.baseFormatting,
                Preset.preset.colorFormat?.class
              ),
            }}
          >
            <button
              class="flex-1 p-1.5 pl-3 text-left"
              onClick$={() => loadPresetJSON(JSON.stringify(Preset.preset))}
            >
              <RgbPreview
                rgbStore={{
                  ...rgbDefaults,
                  text: Preset.name,
                  ...Preset.preset,
                }}
                shadowLength={1}
              />
            </button>
            <a
              href={`presets/${Preset.id}`}
              target="_blank"
              rel="noopener noreferrer"
              class="lum-btn lum-bg-transparent hover:lum-bg-transparent rounded-lum-1 text-lum-text-secondary! cursor-pointer p-1.5"
            >
              <ExternalLink size={16} />
            </a>
            <button
              class="lum-btn lum-bg-transparent hover:lum-bg-transparent rounded-lum-1 text-lum-text-secondary cursor-pointer p-1.5 hover:text-red-500"
              onClick$={async () => {
                savedPresets.value = savedPresets.value.filter(
                  (p) => p.id !== Preset.id
                );
                const result = await unsavePreset(Preset.id);
                if (result.success) Preset.saves = (Preset.saves || 0) - 1;
              }}
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>

      <Label for="import" label={t('rgb.presets.import@@Import')}>
        <Braces size={16} q:slot="before-label" />
        <input
          class="lum-input w-full"
          id="import"
          name="import"
          placeholder={`${t('rgb.presets.importJSON@@Paste a JSON preset here')}`}
          onInput$={async (e, el) => loadPresetJSON(el.value)}
        />
      </Label>

      <div class="flex flex-wrap gap-1">
        <button
          class="lum-btn flex-1 rounded-r-sm"
          id="copy"
          onClick$={() => {
            const preset: rgbPreset = { ...rgbStore };
            (
              Object.keys(preset) as Array<keyof typeof combinedDefaults>
            ).forEach((key) => {
              if (
                key != 'version' &&
                JSON.stringify(preset[key]) ===
                  JSON.stringify(combinedDefaults[key])
              )
                delete preset[key];
            });
            const notification = new Notification()
              .setTitle(presetCopiedTitle)
              .setDescription(presetCopiedDescription)
              .setBgColor('lum-grad-bg-green/50');
            navigator.clipboard
              .writeText(JSON.stringify(preset))
              .catch((err) => {
                notification
                  .setTitle(copyFailedTitle)
                  .setDescription('Error: ' + err)
                  .setBgColor('lum-grad-bg-red/50')
                  .setPersist(true);
              });
            notifications.push(notification.toJSON());
          }}
        >
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>

        <button
          class="lum-btn flex-1 rounded-l-sm"
          id="createurl"
          onClick$={() => {
            const base_url = `${loc.url.protocol}//${loc.url.host}${loc.url.pathname}`;
            const url = new URL(base_url);
            const params: rgbPreset = { ...rgbStore };
            (
              Object.entries(params) as Array<
                [keyof typeof combinedDefaults, unknown]
              >
            ).forEach(([key, value]) => {
              const defaultValue = combinedDefaults[key];
              if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
                if (value === JSON.stringify(defaultValue)) return;
              }
              if (value === defaultValue) return;
              url.searchParams.set(key, String(value));
            });
            window.history.pushState({}, '', url.href);
            const notification = new Notification()
              .setTitle(presetUrlTitle)
              .setDescription(presetUrlDescription)
              .setBgColor('lum-grad-bg-green/50');
            notifications.push(notification.toJSON());
          }}
        >
          <LinkIcon size={20} /> {t('rgb.presets.url.get@@Get Url')}
        </button>
      </div>
    </div>
  );
});
