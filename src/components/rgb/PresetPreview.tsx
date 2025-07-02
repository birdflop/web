import { component$, isBrowser, useContext, useSignal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { Github, MousePointer2, Palette, Rainbow, Save, Trash } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
import { setUserData } from '~/util/dataUtils';
import { renderPreview } from '~/routes/resources/rgb';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import { Link, LinkProps, useNavigate } from '@builder.io/qwik-city';
import { presetInfo, publishedPreset, rgbPreset } from '~/util/rgb/presets';

interface PresetPreviewProps extends Omit<LinkProps, 'class'> {
  presetInfo: presetInfo | publishedPreset;
  class?: { [key: string]: boolean };
  defaults?: rgbPreset;
}

export default component$<PresetPreviewProps>(({ presetInfo, defaults, ...props }) => {
  const t = inlineTranslate();
  const privatePresets = useContext(privatePresetsContext);
  const savedPresets = useContext(savedPresetsContext);
  const nav = useNavigate();
  const loading = useSignal(false);

  const searchParams = new URLSearchParams();
  const params = { ...presetInfo.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  const existingPreset = savedPresets.value.find((savedPreset) => {
    return savedPreset.id === presetInfo.id;
  })?.preset
  || privatePresets.value.find((savedPreset) => {
    return JSON.stringify(savedPreset) === JSON.stringify(presetInfo.preset);
  });

  return (
    <Link href={presetInfo.id ? `/resources/rgb/presets/${presetInfo.id}` : '#'} {...props}
      class="lum-card p-5 lum-bg-lum-input-bg/30 hover:lum-bg-lum-input-bg/70 w-full transition duration-1000 hover:duration-75 ease-out"
      key={`preset-${presetInfo.name}-${presetInfo.author}`}
      prefetch={false}>
      { presetInfo.author &&
        <div class="flex">
          <p class={{
            'flex flex-1 items-center gap-2': true,
            'text-blue-300/80!': !presetInfo.user,
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
                <LogoBirdflop size={20} fillGradient={['#f77272', '#fab775', '#ffff6e', '#7dfa7d', '#7a7aff', '#bb77ed', '#ca3eed']} />
              }
              {presetInfo.author == 'Luminescent' &&
                <LogoLuminescent size={20} class="text-luminescent-300" />
              }
              {presetInfo.author.includes('GitHub') &&
                <Github size={20} />
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
      }

      <div class="flex h-full">
        <div class="flex-1">
          <p class={{
            'text-2xl sm:text-3xl break-all max-w-7xl font-mc tracking-tight': true,
            'font-mc-bold': presetInfo.preset.bold || defaults?.bold,
            'font-mc-italic': presetInfo.preset.italic || defaults?.italic,
            'font-mc-bold-italic': (presetInfo.preset.bold && presetInfo.preset.italic) || (defaults?.bold && defaults?.italic),
            [`${presetInfo.preset.format?.class || defaults?.format?.class}`]: presetInfo.preset.format?.class || defaults?.format?.class,
          }}>
            {renderPreview({
              ...rgbDefaults,
              ...defaults || {},
              ...presetInfo.preset,
              text: presetInfo.name,
            }, 3)}
          </p>

          { presetInfo.description &&
            <p class="text-lum-text-secondary text-sm pt-2">
              {presetInfo.description}
            </p>
          }

          { presetInfo.preset.text &&
            <p class="text-sm text-red-400/50!">
              This preset will overwrite your text to "{presetInfo.preset.text}"
            </p>
          }

          { presetInfo.preset.colors && presetInfo.preset.colors.length > 0 &&
            <div class="flex gap-1 mt-2">
              {presetInfo.preset.colors.map((color, index) => (
                <span key={index} class="p-2 rounded-lum-2"
                  style={{ backgroundColor: color.hex }} />
              ))}
            </div>
          }
        </div>
        <div class="flex gap-1 items-end">
          <SelectMenuRaw id={`use-${presetInfo.name}-${presetInfo.author}`} hover customDropdown
            class={{ 'hidden sm:flex p-2 text-sm lum-bg-transparent gap-1 text-orange-300': true }}>
            <div q:slot="dropdown" class="flex items-center gap-3">
              <MousePointer2 size={20} />
            </div>
            <button q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1" preventdefault:click onClick$={async (e) => {
              e.stopPropagation();
              await nav(`/resources/rgb?${searchParams.toString()}`);
            }}>
              <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
            </button>
            <button q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1" preventdefault:click onClick$={async (e) => {
              e.stopPropagation();
              await nav(`/resources/animtab?${searchParams.toString()}`);
            }}>
              <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
            </button>
          </SelectMenuRaw>
          <button class="lum-btn text-sm lum-bg-transparent p-2" disabled={loading.value} preventdefault:click onClick$={async (e) => {
            e.stopPropagation();
            loading.value = true;

            if (existingPreset) {
              privatePresets.value = privatePresets.value.filter((p) => p !== existingPreset);
              if (presetInfo.id) {
                savedPresets.value = savedPresets.value.filter((p) => p.id !== presetInfo.id);
                await setUserData({
                  savedPresets: {
                    disconnect: { id: presetInfo.id },
                  },
                });
              }
            }
            else {
              privatePresets.value = [...privatePresets.value, presetInfo.preset];
              if (presetInfo.id) {
                savedPresets.value = [...savedPresets.value, presetInfo as publishedPreset];
                await setUserData({
                  savedPresets: {
                    connect: {
                      id: presetInfo.id,
                    },
                  },
                });
              }
            }

            if (!presetInfo.id) {
              await setUserData({
                privatePresets: privatePresets.value,
              });
            }
            if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
            loading.value = false;
          }}>
            {!loading.value && presetInfo.savedBy?.length}
            {loading.value && <div class="lum-loading w-5 h-5" />}
            {!loading.value && (existingPreset
              ? <Trash size={20} class="text-red-300" /> : <Save size={20} class="text-green-300" />)}
          </button>
        </div>
      </div>
    </Link>
  );
});