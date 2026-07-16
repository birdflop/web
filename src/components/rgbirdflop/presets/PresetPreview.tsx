import {
  component$,
  Fragment,
  isBrowser,
  Signal,
  useContext,
  useSignal,
} from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { combinedDefaults, rgbDefaults } from '@birdflop/rgbirdflop';
import Loader2 from 'lucide-icons-qwik/icons/Loader2';
import MousePointer2 from 'lucide-icons-qwik/icons/MousePointer2';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Save from 'lucide-icons-qwik/icons/Save';
import Send from 'lucide-icons-qwik/icons/Send';
import Trash from 'lucide-icons-qwik/icons/Trash';
import { Birdflop, Luminescent } from '@luminescent/icons-qwik';
import { Dropdown } from '@luminescent/ui-qwik';
import {
  deletePreset,
  savePreset,
  setUserData,
  unsavePreset,
} from '~/util/dataUtils';
import {
  privatePresetsContext,
  savedPresetsContext,
} from '~/routes/resources/rgb/presets';
import { Link, LinkProps } from '@qwik.dev/router';
import { rgbPreset } from '~/util/rgb/presets';
import { PresetPartial } from '~/util/db';
import { useIsAdmin } from '~/routes/layout';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';
import RgbPreview from '../RgbPreview';
const fallbackpfp = '/branding/icon.png';

interface PresetPreviewProps extends LinkProps {
  Preset: PresetPartial;
  defaults?: rgbPreset;
  publishRefs?: {
    modalRef: Signal<HTMLDialogElement | undefined>;
    selectedPreset: Signal<rgbPreset | null>;
  };
}

export default component$<PresetPreviewProps>(
  ({ Preset, defaults, publishRefs, ...props }) => {
    const t = inlineTranslate();
    const privatePresets = useContext(privatePresetsContext);
    const savedPresets = useContext(savedPresetsContext);
    const isLoading = useSignal(false);
    const isAdmin = useIsAdmin().value;

    const searchParams = new URLSearchParams();
    const params = { ...Preset.preset };
    (
      Object.entries(params) as Array<[keyof typeof combinedDefaults, unknown]>
    ).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null)
        value = JSON.stringify(value);
      searchParams.set(key, String(value));
    });

    const existingPreset =
      savedPresets.value.find((savedPreset) => {
        return savedPreset.id === Preset.id;
      })?.preset ||
      privatePresets.value.find((savedPreset) => {
        return JSON.stringify(savedPreset) === JSON.stringify(Preset.preset);
      });

    return (
      <div
        class="lum-card lum-bg gap-0 border-none p-0 transition duration-1000 ease-out hover:duration-75"
        style={{
          '--bg-color':
            (Preset.preset.colors ?? rgbDefaults?.colors)?.[0]?.hex + '10',
          '--lum-border-radius': '1rem',
          background: `linear-gradient(to bottom right, ${(
            Preset.preset.colors ?? defaults?.colors
          )
            ?.map((color) => `${color.hex}10 ${color.pos}%`)
            .join(', ')})`,
        }}
      >
        {Preset.author && (
          <div class="lum-btn-p-1 lum-bg-bg/50 rounded-lum-1 m-1 flex items-center">
            <div
              class={{
                'flex flex-1 items-center gap-2': true,
                'text-lum-accent/80!': !Preset.user,
              }}
            >
              {Preset.user && (
                <Link
                  href={`/profile/${Preset.user?.id}`}
                  class="lum-btn lum-bg-transparent rounded-lum-2 lum-btn-p-1 -ml-1 cursor-pointer gap-2 font-semibold"
                >
                  {Preset.user.image && Preset.user.name && (
                    <object
                      data={Preset.user.image}
                      class="normal h-6 w-6 rounded-full! text-white"
                    >
                      <img
                        src={fallbackpfp}
                        alt={Preset.user.name}
                        width="100"
                        height="100"
                      />
                    </object>
                  )}
                  {Preset.user.name}
                </Link>
              )}
              {Preset.author && !Preset.user && (
                <>
                  {Preset.author == 'RGBirdflop' && (
                    <Birdflop size={20} fillGradient={['#54daf4', '#545eb6']} />
                  )}
                  {Preset.author == 'Luminescent' && (
                    <Luminescent size={20} class="text-luminescent-300" />
                  )}
                  {Preset.author.includes('GitHub') && (
                    <span class="fill-current">
                      <SiGithub size={20} />
                    </span>
                  )}
                  {Preset.author}
                </>
              )}
            </div>
            <p class="text-xs">
              {Preset.createdAt &&
                new Date(Preset.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
            </p>
          </div>
        )}
        <Link
          href={Preset.id ? `/resources/rgb/presets/${Preset.id}` : '#'}
          {...props}
          class="group flex w-full flex-1 flex-col justify-center p-4 text-white! no-underline!"
          key={`preset-${Preset.name}-${Preset.author}`}
          prefetch={false}
        >
          <p
            class={{
              'font-mc max-w-7xl text-2xl tracking-tight break-all sm:text-3xl': true,
              'font-mc-bold':
                Preset.preset.baseFormatting?.bold ||
                defaults?.baseFormatting?.bold,
              'font-mc-italic':
                Preset.preset.baseFormatting?.italic ||
                defaults?.baseFormatting?.italic,
              'font-mc-bold-italic':
                (Preset.preset.baseFormatting?.bold &&
                  Preset.preset.baseFormatting?.italic) ||
                (defaults?.baseFormatting?.bold &&
                  defaults?.baseFormatting?.italic),
              [`${Preset.preset.colorFormat?.class || defaults?.colorFormat?.class}`]:
                Preset.preset.colorFormat?.class ||
                defaults?.colorFormat?.class,
            }}
          >
            <RgbPreview
              rgbStore={{
                ...rgbDefaults,
                ...defaults,
                ...Preset.preset,
                text: Preset.name,
              }}
              shadowLength={3}
            />
          </p>

          {Preset.description && (
            <p class="text-lum-text-secondary pt-2 text-sm">
              {Preset.description}
            </p>
          )}

          {Preset.preset.text && (
            <p class="pt-2 text-sm text-yellow-400/80!">
              This preset will change your current input to "
              {Preset.preset.text}"
            </p>
          )}
          {Preset.pending && (
            <p class="pt-2 text-sm text-red-400/80!">
              {t(
                'rgb.presets.pending@@This preset is pending review and may not be available to other users yet.'
              )}
            </p>
          )}
        </Link>
        <div class="lum-bg-bg/50 rounded-lum-1 m-1 flex items-center gap-1 p-1">
          {Preset.preset.gradientType && (
            <div class="lum-bg-blue lum-btn-p-1 rounded-lum-2 my-1 ml-1 text-xs">
              {Preset.preset.gradientType}
            </div>
          )}
          <div class="my-1 ml-2 flex gap-1">
            {Preset.preset.colors &&
              Preset.preset.colors.length > 0 &&
              Preset.preset.colors.map((color, index) => (
                <span
                  key={index}
                  class="rounded-lum-3 lum-bg p-1.5"
                  style={{ '--bg-color': color.hex }}
                />
              ))}
          </div>
          <div class="flex-1" />
          <button
            class="lum-btn lum-bg-transparent rounded-lum-2 lum-btn-p-1 text-sm"
            disabled={isLoading.value}
            onClick$={async () => {
              isLoading.value = true;

              if (existingPreset) {
                privatePresets.value = privatePresets.value.filter(
                  (p) => p !== existingPreset
                );
                if (Preset.id) {
                  savedPresets.value = savedPresets.value.filter(
                    (p) => p.id !== Preset.id
                  );
                  const result = await unsavePreset(Preset.id);
                  if (result.success) Preset.saves = (Preset.saves || 0) - 1;
                } else {
                  await setUserData({
                    privatePresets: privatePresets.value,
                  });
                }
              } else {
                privatePresets.value = [...privatePresets.value, Preset.preset];
                if (Preset.id) {
                  savedPresets.value = [...savedPresets.value, Preset];
                  const result = await savePreset(Preset.id);
                  if (result.success) Preset.saves = (Preset.saves || 0) + 1;
                } else {
                  await setUserData({
                    privatePresets: privatePresets.value,
                  });
                }
              }

              if (isBrowser)
                localStorage.setItem(
                  'privatePresets',
                  JSON.stringify(privatePresets.value)
                );
              isLoading.value = false;
            }}
          >
            {!isLoading.value && Preset.saves}
            {isLoading.value && <Loader2 size={12} class="animate-spin" />}
            {privatePresets.value.find(
              (savedPreset) =>
                JSON.stringify(savedPreset) === JSON.stringify(Preset.preset)
            ) ||
            savedPresets.value.find(
              (savedPreset) => savedPreset.id === Preset.id
            ) ? (
              <span class="flex gap-3 text-red-300">
                <Trash size={20} />
              </span>
            ) : (
              <span class="flex gap-3 text-green-300">
                <Save size={20} />
              </span>
            )}
          </button>

          <Dropdown
            id={`use-${Preset.name}-${Preset.author}`}
            hover
            class="lum-bg-transparent rounded-lum-2 lum-btn-p-1 hidden gap-1 text-sm text-orange-300 sm:flex"
          >
            <Fragment q:slot="dropdown">
              <MousePointer2 size={20} />
            </Fragment>
            <Link
              href={`/resources/rgb?${searchParams.toString()}`}
              class="lum-btn lum-bg-transparent rounded-lum-1 w-full"
            >
              <Palette size={20} />{' '}
              {t('nav.resources.hexGradient.title@@RGBirdflop')}
            </Link>
            <Link
              href={`/resources/animtab?${searchParams.toString()}`}
              class="lum-btn lum-bg-transparent rounded-lum-1 w-full"
            >
              <Rainbow size={20} />{' '}
              {t('nav.resources.animatedTAB.title@@Animated TAB')}
            </Link>
          </Dropdown>

          {publishRefs && (
            <button
              class="lum-btn lum-grad-bg-green/50 hover:lum-bg-green rounded-lum-2 lum-btn-p-1 text-sm"
              onClick$={() => {
                publishRefs.modalRef.value?.showModal();
                publishRefs.selectedPreset.value = JSON.stringify(
                  Preset.preset
                );
              }}
            >
              <Send size={20} />{' '}
              {t('rgb.presets.publish@@Publish your own preset')}
            </button>
          )}

          {isAdmin && Preset.pending && (
            <button
              class="lum-btn lum-grad-bg-red/50 hover:lum-bg-red rounded-lum-2 lum-btn-p-1 text-sm"
              onClick$={async () => {
                if (Preset.id) await deletePreset(Preset.id);
                window.location.reload();
              }}
            >
              <Trash size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }
);
