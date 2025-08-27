import { component$, isBrowser, Signal, useContext, useSignal } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '~/util/rgb/presets/defaults';
import { Github, MousePointer2, Palette, Rainbow, Save, Send, Trash } from 'lucide-icons-qwik';
import { LogoBirdflop, LogoLuminescent, SelectMenuRaw } from '@luminescent/ui-qwik';
import { savePreset, setUserData, unsavePreset } from '~/util/dataUtils';
import { renderPreview } from '~/routes/resources/rgb';
import { privatePresetsContext, savedPresetsContext } from '~/routes/resources/rgb/presets';
import { Link, LinkProps } from '@builder.io/qwik-city';
import { rgbPreset } from '~/util/rgb/presets';
import { PresetPartial } from '~/util/db';

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

  return <div class="lum-card lum-bg-lum-input-bg/20 p-0 gap-0">
    { Preset.author &&
      <div class="flex p-1 pr-4 items-center bg-lum-card-bg rounded-lum rounded-b-0">
        <p class={{
          'flex flex-1 items-center gap-2': true,
          'text-blue-300/80!': !Preset.user,
          'text-orange-300/80!': !!Preset.user,
        }}>
          { Preset.user && <Link href={`/profile/${Preset.user?.id}`} class="lum-btn lum-bg-transparent rounded-lum-1 lum-btn-p-1 gap-2 cursor-pointer font-semibold">
            {Preset.user.image && Preset.user.name && (
              <img src={Preset.user.image} alt={Preset.user.name}
                width={24} height={24} class="w-6 h-6 rounded-full!" />
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
        </p>
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
      class="flex-1 flex flex-col justify-center text-white! no-underline! p-4 border-y border-y-lum-border/10 hover:bg-lum-input-bg/70 w-full transition duration-1000 hover:duration-75 ease-out"
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
        <p class="text-sm text-yellow-400/80!">
          This preset will change your current input to "{Preset.preset.text}"
        </p>
      }
    </Link>
    <div class="flex gap-1 items-center p-1 bg-lum-card-bg rounded-lum rounded-b-0">
      <div class="flex-1 flex gap-1 pl-2">
        { Preset.preset.colors && Preset.preset.colors.length > 0 &&
          Preset.preset.colors.map((color, index) => (
            <span key={index} class="p-2 rounded-lum-2"
              style={{ backgroundColor: color.hex }} />
          ))
        }
      </div>
      <SelectMenuRaw id={`use-${Preset.name}-${Preset.author}`} hover customDropdown
        class={{ 'hidden sm:flex text-sm lum-bg-transparent rounded-lum-1 gap-1 text-orange-300': true }}>
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
      <button class="lum-btn text-sm lum-bg-transparent rounded-lum-1" disabled={loading.value} onClick$={async () => {
        loading.value = true;

        if (existingPreset) {
          privatePresets.value = privatePresets.value.filter((p) => p !== existingPreset);
          if (Preset.id) {
            savedPresets.value = savedPresets.value.filter((p) => p.id !== Preset.id);
            await unsavePreset(Preset.id);
            if (Preset.saveCount !== undefined) Preset.saveCount--;
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
            if (Preset.saveCount !== undefined) Preset.saveCount++;
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
        {!loading.value && Preset.saveCount}
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
      {publishRefs && <button class="lum-btn text-sm lum-bg-green/50 hover:lum-bg-green rounded-lum-1" onClick$={() => {
        publishRefs.modalRef.value?.showModal();
        publishRefs.selectedPreset.value = JSON.stringify(Preset.preset);
      }}>
        <Send size={20} /> Publish
      </button>}
    </div>
  </div>;
});