import { component$, isBrowser, PropsOf, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { Box, Ellipsis, Save, Trash } from 'lucide-icons-qwik';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { setUserData } from '~/util/dataUtils';
import { renderPreview } from '~/routes/resources/rgb';
import { savedPresetsContext } from '~/routes/resources/rgb/presets';
import { Link } from '@builder.io/qwik-city';
import { publishedPreset } from '~/util/rgb/presets';

interface PresetPreviewProps extends Omit<PropsOf<'div'>, 'class'> {
  presetInfo: publishedPreset;
  class?: { [key: string]: boolean };
}

export default component$<PresetPreviewProps>(({ presetInfo, ...props }) => {
  const t = inlineTranslate();
  const savedPresets = useContext(savedPresetsContext);

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  return (
    <div {...props} class="lum-card p-7 lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out" key={`preset-${presetInfo.name}-${presetInfo.author}`}>
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
          <p class="text-gray-400 text-sm">
            {presetInfo.description}
          </p>
        </div>
      </div>
      <div class="hidden sm:flex gap-2 mt-2">
        <button class="lum-btn text-sm" onClick$ ={async () => {
          const existingPreset = savedPresets.value.find((savedPreset) => {
            return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
          });
          if (existingPreset) savedPresets.value = savedPresets.value.filter((p) => p !== existingPreset);
          else savedPresets.value = [...savedPresets.value, presetInfo.preset];
          if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(savedPresets.value));
          await setUserData({ savedPresets: savedPresets.value });
        }}>
          {savedPresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset)) ? <>
            <Trash size={20} /> {t('rgb.presets.remove@@Remove')}
          </> : <>
            <Save size={20} /> {t('rgb.presets.save@@Save')}
          </>}
        </button>
        <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
          class={{ 'hidden sm:flex px-3 text-sm': true }}>
          <div q:slot="dropdown" class="flex items-center gap-3">
            <Box size={20} /> {t('rgb.presets.use@@Use')}
          </div>
          <Link q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" href={`/resources/rgb?${searchParams.toString()}`}>
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </Link>
          <Link q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" href={`/resources/animtab?${searchParams.toString()}`}>
            {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </Link>
        </SelectMenuRaw>
        <Link class="lum-btn text-sm" href={`/resources/rgb/presets/${presetInfo.id}`}>
          <Ellipsis size={20} />
          {t('rgb.presets.showDetails@@Show Details')}
        </Link>
      </div>
    </div>
  );
});