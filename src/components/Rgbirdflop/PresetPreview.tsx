import { component$, isBrowser, Signal, useContext, useSignal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import { ChevronDown, ChevronUp, Github, MousePointer2, Palette, Rainbow, Save, Send, Trash } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
import { savePreset, setUserData, unsavePreset } from '~/util/dataUtils';
import { renderPreview } from '~/components/Rgbirdflop/RGBirdflop';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import { Link, LinkProps } from '@builder.io/qwik-city';
import { rgbPreset } from '~/util/rgb/presets';
import { PresetPartial } from '~/util/db';
const fallbackpfp = '/branding/icon.png';

interface PresetPreviewProps extends Omit<LinkProps, 'class'> {
  Preset: PresetPartial;
  class?: { [key: string]: boolean };
  defaults?: rgbPreset;
  publishRefs?: {
    modalRef: Signal<HTMLDialogElement | undefined>;
    selectedPreset: Signal<string | undefined>;
  };
}

export default component$<PresetPreviewProps>(({ Preset, defaults, publishRefs, ...props }) => {
  const t = inlineTranslate();
  const privatePresets = useContext(privatePresetsContext);
  const savedPresets = useContext(savedPresetsContext);
  const loading = useSignal(false);

  const searchParams = new URLSearchParams();
  const params = { ...Preset.preset };
  (Object.entries(params) as Array<[keyof typeof combinedDefaults, any]>).forEach(([key, value]) => {
    if (key == 'format' || key == 'colors' || key == 'shadowcolors') value = JSON.stringify(value);
    searchParams.set(key, String(value));
  });

  const existingPreset = savedPresets.value.find((savedPreset) => {
    return savedPreset.id === Preset.id;
  })?.preset
  || privatePresets.value.find((savedPreset) => {
    return JSON.stringify(savedPreset) === JSON.stringify(Preset.preset);
  });

  return <div class="lum-card p-0 gap-0 lum-bg transition duration-1000 hover:duration-75 ease-out border-none"
    style={{
      '--bg-color': (Preset.preset.colors ?? rgbDefaults?.colors)?.[0]?.hex + '10',
      '--lum-border-radius': '1rem',
      background: `linear-gradient(to bottom right, ${
        (Preset.preset.colors ?? defaults?.colors)
          ?.map((color) => `${color.hex}10 ${color.pos}%`).join(', ')
      })`,
    }}>
    { Preset.author &&
      <div class="flex lum-btn-p-1 items-center lum-bg-bg/50 rounded-lum-1 m-1 border-none">
        <div class={{
          'flex flex-1 items-center gap-2': true,
          'text-blue-300/80!': !Preset.user,
        }}>
          { Preset.user && <Link href={`/profile/${Preset.user?.id}`} class="lum-btn lum-bg-transparent rounded-lum-2 lum-btn-p-1 gap-2 cursor-pointer font-semibold -ml-1">
            {Preset.user.image && Preset.user.name && (
              <object data={Preset.user.image} class="w-6 h-6 rounded-full! text-white normal">
                <img src={fallbackpfp} alt={Preset.user.name} width="100" height="100" />
              </object>
            )}
            {Preset.user.name}
          </Link>
          }
          { Preset.author && !Preset.user && <>
            {Preset.author == 'RGBirdflop' &&
              <LogoBirdflop size={20} fillGradient={['#54daf4', '#545eb6']} />
            }
            {Preset.author == 'Luminescent' &&
              <LogoLuminescent size={20} class="text-luminescent-300" />
            }
            {Preset.author.includes('GitHub') &&
              <Github size={20} />
            }
            {Preset.author}
          </>}
        </div>
        <p class="text-xs">
          {Preset.createdAt && new Date(Preset.createdAt)
            .toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
        </p>
      </div>
    }
    <Link href={Preset.id ? `/resources/rgb/presets/${Preset.id}` : '#'} {...props}
      class="flex-1 flex flex-col justify-center text-white! no-underline! p-4 group w-full"
      key={`preset-${Preset.name}-${Preset.author}`}
      prefetch={false}>
      <p class={{
        'text-2xl sm:text-3xl break-all max-w-7xl font-mc tracking-tight': true,
        'font-mc-bold': Preset.preset.bold || defaults?.bold,
        'font-mc-italic': Preset.preset.italic || defaults?.italic,
        'font-mc-bold-italic': (Preset.preset.bold && Preset.preset.italic) || (defaults?.bold && defaults?.italic),
        [`${Preset.preset.format?.class || defaults?.format?.class}`]: Preset.preset.format?.class || defaults?.format?.class,
      }}>
        {renderPreview({
          ...rgbDefaults,
          ...defaults || {},
          ...Preset.preset,
          text: Preset.name,
        }, 3)}
      </p>

      { Preset.description &&
        <p class="text-lum-text-secondary text-sm pt-2">
          {Preset.description}
        </p>
      }

      { Preset.preset.text &&
        <p class="text-sm text-yellow-400/80! pt-2">
          This preset will change your current input to "{Preset.preset.text}"
        </p>
      }
      { Preset.pending &&
        <p class="text-sm text-red-400/80! pt-2">
          {t('rgb.presets.pending@@This preset is pending review and may not be available to other users yet.')}
        </p>
      }
    </Link>
    <div class="flex p-1 items-center lum-bg-bg/50 rounded-lum-1 m-1 gap-1">
      { Preset.preset.gradientType && <div class="lum-bg-blue lum-btn-p-1 rounded-lum-2 text-xs my-1 ml-1">
        {Preset.preset.gradientType}
      </div> }
      <div class="flex gap-1 my-1 ml-1">
        { Preset.preset.colors && Preset.preset.colors.length > 0 &&
          Preset.preset.colors.map((color, index) => (
            <span key={index} class="p-2 rounded-lum-3 lum-bg"
              style={{ '--bg-color': color.hex }} />
          ))
        }
      </div>
      <div class="flex-1" />
      <button class="lum-btn text-sm lum-bg-transparent rounded-lum-2 lum-btn-p-1" disabled={loading.value} onClick$={async () => {
        loading.value = true;

        if (existingPreset) {
          privatePresets.value = privatePresets.value.filter((p) => p !== existingPreset);
          if (Preset.id) {
            savedPresets.value = savedPresets.value.filter((p) => p.id !== Preset.id);
            await unsavePreset(Preset.id);
          }
          else {
            await setUserData({
              privatePresets: privatePresets.value,
            });
          }
        }
        else {
          privatePresets.value = [...privatePresets.value, Preset.preset];
          if (Preset.id) {
            savedPresets.value = [...savedPresets.value, Preset];
            await savePreset(Preset.id);
          }
          else {
            await setUserData({
              privatePresets: privatePresets.value,
            });
          }
        }

        if (isBrowser) localStorage.setItem('privatePresets', JSON.stringify(privatePresets.value));
        loading.value = false;
      }}>
        {!loading.value && Preset.saves}
        {loading.value && <div class="lum-loading w-3 h-3" />}
        {privatePresets.value.find((savedPreset) => JSON.stringify(savedPreset) === JSON.stringify(Preset.preset))
          || savedPresets.value.find((savedPreset) => savedPreset.id === Preset.id)
          ? <span class="text-red-300 flex gap-3">
            <Trash size={20} />
          </span>
          : <span class="text-green-300 flex gap-3">
            <Save size={20}  />
          </span>}
      </button>

      <button class="lum-btn text-sm lum-bg-transparent rounded-lum-2 lum-btn-p-1" disabled={loading.value} onClick$={() => {
        loading.value = true;
        loading.value = false;
      }}>
        {!loading.value && Preset.likes}
        {loading.value && <div class="lum-loading w-3 h-3" />}
        <ChevronUp size={20} class="text-green-300" />
      </button>

      <button class="lum-btn text-sm lum-bg-transparent rounded-lum-2 lum-btn-p-1" disabled={loading.value} onClick$={() => {
        loading.value = true;
        loading.value = false;
      }}>
        {!loading.value && Preset.dislikes}
        {loading.value && <div class="lum-loading w-3 h-3" />}
        <ChevronDown size={20} class="text-red-300" />
      </button>

      <SelectMenuRaw id={`use-${Preset.name}-${Preset.author}`} hover customDropdown
        class={{ 'hidden sm:flex text-sm lum-bg-transparent rounded-lum-2 gap-1 text-orange-300 lum-btn-p-1': true }}>
        <div q:slot="dropdown" class="flex items-center gap-3">
          <MousePointer2 size={20} />
        </div>
        <Link href={`/resources/rgb?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1">
          <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </Link>
        <Link href={`/resources/animtab?${searchParams.toString()}`} q:slot='extra-buttons' class="lum-btn w-full lum-bg-transparent rounded-lum-1">
          <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </Link>
      </SelectMenuRaw>

      {publishRefs && <button class="lum-btn text-sm lum-bg-green/50 hover:lum-bg-green rounded-lum-2 lum-btn-p-1" onClick$={() => {
        publishRefs.modalRef.value?.showModal();
        publishRefs.selectedPreset.value = JSON.stringify(Preset.preset);
      }}>
        <Send size={20} /> {t('rgb.presets.publish@@Publish your own preset')}
      </button>}
    </div>
  </div>;
});