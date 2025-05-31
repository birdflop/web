import { component$, isBrowser, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { Github, MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
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
    <Link href={presetInfo.id ? `/resources/rgb/presets/${presetInfo.id}` : '#'} {...props}
      class="lum-card p-5 lum-bg-gray-800/30 hover:lum-bg-gray-800/70 w-full transition duration-1000 hover:duration-75 ease-out"
      key={`preset-${presetInfo.name}-${presetInfo.author}`}
      prefetch={false}>
      <div class="flex">
        <p class={{
          'flex flex-1 items-center gap-2': true,
          'text-green-300/80!': !presetInfo.user && presetInfo.author == 'Saved by you',
          'text-blue-300/80!': !presetInfo.user && presetInfo.author != 'Saved by you',
          'text-orange-300/80!': !!presetInfo.user,
        }}>
          { presetInfo.user && <button preventdefault:click onClick$={async (e) => {
            e.stopPropagation();
            await nav(`/profile/${presetInfo.user?.id}`);
          }} class="lum-btn lum-bg-transparent p-1 -ml-1 cursor-pointer font-semibold">
            {presetInfo.user.image && presetInfo.user.name && (
              <img src={presetInfo.user.image} alt={presetInfo.user.name}
                width={24} height={24} class="w-6 h-6 rounded-full!" />
            )}
            {presetInfo.user.name}
          </button>
          }
          { presetInfo.author && !presetInfo.user && <>
            {presetInfo.author == 'RGBirdflop' &&
              <LogoBirdflop size={20} fillGradient={['#54daf4', '#545eb6']} />
            }
            {presetInfo.author == 'Luminescent' &&
              <LogoLuminescent size={20} class="text-luminescent-300" />
            }
            {presetInfo.author.includes('GitHub') &&
              <Github size={20} />
            }
            {presetInfo.author == 'Saved by you' &&
              <Save size={20} />
            }
            {presetInfo.author}
          </>}
        </p>
        <p class="text-xs">
          {presetInfo.createdAt && new Date(presetInfo.createdAt)
            .toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
        </p>
      </div>

      <div class="flex h-full">
        <div class="flex-1">
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

          <p class="text-gray-400 text-sm pt-2">
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
            await setUserData({ privatePresets: savedPresets.value });
          }}>
            {savedPresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset))
              ? <Trash size={20} class="text-red-300" /> : <Save size={20} class="text-green-300" />}
          </button>
        </div>
      </div>
    </Link>
  );
});