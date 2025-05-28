import { component$, isBrowser, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { publishedPreset } from '~/util/rgb/presets';
import { Box, Copy, Save, Trash } from 'lucide-icons-qwik';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { savedPresetStoreContext } from '~/routes/resources/rgb/presets';
import { setUserData } from '~/util/dataUtils';
import { renderPreview } from '~/routes/resources/rgb';

export default component$(({ presetInfo }: {
  presetInfo: publishedPreset;
}) => {
  const t = inlineTranslate();
  let savedPresetStore = useContext(savedPresetStoreContext);

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  return (
    <div class="lum-card p-7 lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out" key={`preset-${presetInfo.name}-${presetInfo.author}`}>
      <div class="flex gap-4 items-center">
        <div class="flex flex-col gap-2">
          <p class="text-gray-400 text-sm">
            {presetInfo.author}
          </p>
          <p class={{
            'text-2xl sm:text-3xl break-all max-w-7xl font-mc tracking-tight': true,
            'font-mc-bold': presetInfo.preset.bold,
            'font-mc-italic': presetInfo.preset.italic,
            'font-mc-bold-italic': presetInfo.preset.bold && presetInfo.preset.italic,
            [`${presetInfo.preset.format?.class}`]: presetInfo.preset.format?.class,
          }}>
            {renderPreview({
              ...rgbDefaults,
              ...presetInfo.preset,
              text: presetInfo.name,
            }, 3)}
          </p>
        </div>
      </div>
      <div class="hidden sm:flex gap-2 mt-2">
        <button class="lum-btn text-sm" onClick$ ={async () => {
          const existingPreset = savedPresetStore.find((savedPreset) => {
            return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
          });
          if (existingPreset) savedPresetStore = savedPresetStore.filter((p) => p !== existingPreset);
          else savedPresetStore.push(presetInfo.preset);
          if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(savedPresetStore));
          await setUserData({ savedPresets: savedPresetStore });
        }}>
          {savedPresetStore.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset)) ? <>
            <Trash size={20} /> {t('rgb.presets.remove@@Remove')}
          </> : <>
            <Save size={20} /> {t('rgb.presets.save@@Save')}
          </>}
        </button>
        <button class="lum-btn text-sm" onClick$ ={async () => {
          await navigator.clipboard.writeText(JSON.stringify(presetInfo.preset));
        }}>
          <Copy size={20} /> {t('rgb.presets.copy@@Copy')}
        </button>
        <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
          class={{ 'hidden sm:flex px-3 text-sm': true }}>
          <div q:slot="dropdown" class="flex items-center gap-3">
            <Box size={20} /> {t('rgb.presets.use@@Use')}
          </div>
          <a q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" href={`/resources/rgb?${searchParams.toString()}`}>
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </a>
          <a q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" href={`/resources/animtab?${searchParams.toString()}`}>
            {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </a>
        </SelectMenuRaw>
      </div>
    </div>
  );
});