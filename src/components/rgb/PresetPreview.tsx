import { component$, isBrowser, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { setUserData } from '~/util/dataUtils';
import { renderPreview } from '~/routes/resources/rgb';
import { savedPresetsContext } from '~/routes/resources/rgb/presets';
import { Link, LinkProps, useNavigate } from '@builder.io/qwik-city';
import { publishedPreset } from '~/util/rgb/presets';

interface PresetPreviewProps extends Omit<LinkProps, 'class'> {
  presetInfo: publishedPreset;
  class?: { [key: string]: boolean };
}

export default component$<PresetPreviewProps>(({ presetInfo, ...props }) => {
  const t = inlineTranslate();
  const savedPresets = useContext(savedPresetsContext);
  const nav = useNavigate();

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  return (
    <Link href={`/resources/rgb/presets/${presetInfo.id}`} {...props} class="lum-card flex-row lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out" key={`preset-${presetInfo.name}-${presetInfo.author}`}>
      <div class="flex flex-1 flex-col gap-2">
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
      <div class="flex gap-1 items-end">
        <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
          class={{ 'hidden sm:flex p-2 text-sm lum-bg-transparent gap-1 text-orange-300': true }}>
          <div q:slot="dropdown" class="flex items-center gap-3">
            <MousePointer2 size={20} />
          </div>
          <button q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" preventdefault:click onClick$={async (e) => {
            e.stopPropagation();
            await nav(`/resources/rgb?${searchParams.toString()}`);
          }}>
            <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </button>
          <button q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent" preventdefault:click onClick$={async (e) => {
            e.stopPropagation();
            await nav(`/resources/animtab?${searchParams.toString()}`);
          }}>
            <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </button>
        </SelectMenuRaw>
        <button class="lum-btn text-sm lum-bg-transparent p-2" preventdefault:click onClick$={async (e) => {
          e.stopPropagation();
          const existingPreset = savedPresets.value.find((savedPreset) => {
            return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
          });
          if (existingPreset) savedPresets.value = savedPresets.value.filter((p) => p !== existingPreset);
          else savedPresets.value = [...savedPresets.value, presetInfo.preset];
          if (isBrowser) localStorage.setItem('savedPresets', JSON.stringify(savedPresets.value));
          await setUserData({ savedPresets: savedPresets.value });
        }}>
          {savedPresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset))
            ? <Trash size={20} class="text-red-300" /> : <Save size={20} class="text-green-300" />}
        </button>
      </div>
    </Link>
  );
});