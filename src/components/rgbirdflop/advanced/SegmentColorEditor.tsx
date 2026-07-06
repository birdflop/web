import {
  $,
  component$,
  useComputed$,
  useContext,
  useOnDocument,
  useSignal,
} from '@builder.io/qwik';
import { ColorPicker, SelectMenuRaw } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import {
  getRandomColor,
  rgbColorDefaultsWithColorMode,
  type ColorStop,
  type GradientType,
  GRADIENT_TYPES,
} from '@birdflop/rgbirdflop';
import { Ban, Droplet, Eye, Palette } from 'lucide-icons-qwik';
import {
  applyStyleToRange,
  styleAtChar,
  type SegmentType,
  rgbSegmentsContext,
} from './rgbSegments';
import {
  restoreSelection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import { showAllGradientsContext } from '../RGBirdflop';
import ColorList from '../ColorList';

function ensureGradientColors(colors: ColorStop[]): ColorStop[] {
  if (colors.length >= 2) return colors.map((c) => ({ ...c }));
  const base = colors.length === 1 ? colors[0].hex : '#54daf4';
  return [
    { hex: base, pos: 0 },
    { hex: getRandomColor(), pos: 100 },
  ];
}

export default component$(
  ({ hidden, id = 'text' }: { hidden?: boolean; id?: string }) => {
    const t = inlineTranslate();
    const rgbSegments = useContext(rgbSegmentsContext);
    const selection = useContext(selectionContext);
    const showAllGradients = useContext(showAllGradientsContext);
    const opened = useSignal(-1);

    const hasSelection = useComputed$(
      () => !!selection.value && selection.value.end > selection.value.start,
    );

    const current = useComputed$<SegmentType>(() => {
      if (!selection.value) return rgbColorDefaultsWithColorMode;
      return (
        styleAtChar(rgbSegments.value, selection.value.start) ??
        rgbColorDefaultsWithColorMode
      );
    });

    useOnDocument(
      'click',
      $((e) => {
        if (
          e.target instanceof HTMLElement &&
          !e.target.closest('#adv-color-popup') &&
          !e.target.closest('#adv-color-list')
        ) {
          opened.value = -1;
        }
      }),
    );

    // Writes a uniform color config over the whole selection (formatting flags untouched).
    // The payload is plain serializable data, computed once by the caller.
    const writeConfig = $((partial: Partial<SegmentType>) => {
      if (!selection.value) return;
      const { start, end } = selection.value;
      if (end <= start) return;
      const base =
        styleAtChar(rgbSegments.value, start) ?? rgbColorDefaultsWithColorMode;
      const colorMode = partial.colorMode ?? base.colorMode;
      const colors = (partial.colors ?? base.colors).map((c) => ({ ...c }));
      const gradientType = partial.gradientType ?? base.gradientType;
      const colorLength = partial.colorLength ?? base.colorLength;
      rgbSegments.value = applyStyleToRange(
        rgbSegments.value,
        start,
        end,
        (s) => {
          s.colorMode = colorMode;
          s.colors = colors.map((c) => ({ ...c }));
          s.gradientType = gradientType;
          s.colorLength = colorLength;
        },
      );
      void restoreSelection(start, end);
    });

    // The Style panel only renders this when there's a selection; bail out otherwise.
    if (!hasSelection.value) return null;

    const mode = current.value.colorMode;
    const colors = current.value.colors;

    return (
      <div
        class={{
          'flex flex-col gap-2 transition-all duration-200 sm:pointer-events-auto sm:h-auto sm:opacity-100': true,
          'pointer-events-none h-0 opacity-0': hidden,
          'pointer-events-auto opacity-100': !hidden,
        }}
        id={'colorlist' + id}
      >
        <div class="flex items-center gap-1 py-2 font-semibold">
          <span class="flex flex-1 items-center gap-2">
            <Palette />
            {t('rgb.colors.title@@Colors')}
          </span>
          <SelectMenuRaw
            title={t('rgb.colors.gradientType@@Gradient Type')}
            id="gradientType"
            value={current.value.gradientType}
            class={{ 'lum-btn-p-1 rounded-r-sm text-sm': true }}
            onChange$={(e, el) => {
              const value = el.value as GradientType;
              void writeConfig({ gradientType: value });
            }}
            values={GRADIENT_TYPES.map((type) => ({
              name: type,
              value: type,
            }))}
          />
          <button
            q:slot="extra-buttons"
            class={{
              'lum-btn rounded-l-sm p-1 transition-colors': true,
              'text-lum-primary': showAllGradients.value,
              'text-lum-text-secondary': !showAllGradients.value,
            }}
            onClick$={() => (showAllGradients.value = !showAllGradients.value)}
            title={
              showAllGradients.value
                ? 'Show only selected gradient'
                : 'Show all gradients'
            }
          >
            <Eye size={20} />
          </button>
        </div>
        {/* Color mode switch */}
        <div class="flex gap-1 *:flex-1">
          <button
            class={{
              'lum-btn justify-center gap-2 rounded-sm p-2': true,
              'lum-grad-bg-lum-accent!': mode === 'gradient',
            }}
            onClick$={() =>
              writeConfig({
                colorMode: 'gradient',
                colors: ensureGradientColors(current.value.colors),
              })
            }
          >
            <Palette size={18} /> {t('rgb.advanced.mode.gradient@@Gradient')}
          </button>
          <button
            class={{
              'lum-btn justify-center gap-2 rounded-sm p-2': true,
              'lum-grad-bg-lum-accent!': mode === 'solid',
            }}
            onClick$={() =>
              writeConfig({
                colorMode: 'solid',
                colors: [
                  {
                    hex: current.value.colors[0]?.hex ?? getRandomColor(),
                    pos: 0,
                  },
                ],
              })
            }
          >
            <Droplet size={18} /> {t('rgb.advanced.mode.solid@@Solid')}
          </button>
          <button
            class={{
              'lum-btn justify-center gap-2 rounded-sm p-2': true,
              'lum-grad-bg-lum-accent!': mode === 'none',
            }}
            onClick$={() => writeConfig({ colorMode: 'none' })}
          >
            <Ban size={18} /> {t('rgb.advanced.mode.none@@Uncolored')}
          </button>
        </div>

        {mode === 'none' && (
          <p class="text-lum-text-secondary px-1 text-xs">
            {t(
              'rgb.advanced.mode.noneDescription@@These characters keep Minecraft\'s default color (only formatting is applied).',
            )}
          </p>
        )}

        {mode === 'solid' && (
          <div class="p-2">
            <ColorPicker
              id="adv-solid-picker"
              value={colors[0]?.hex ?? '#ffffff'}
              onInput$={(newColor) =>
                writeConfig({ colors: [{ hex: newColor, pos: 0 }] })
              }
              horizontal
            />
          </div>
        )}

        {mode === 'gradient' && (
          <ColorList
            id={id}
            colors={current.value.colors}
            gradientType={current.value.gradientType}
            textLength={
              selection.value ? selection.value.end - selection.value.start : 1
            }
            onColorsChange$={$(async (newColors) => {
              await writeConfig({ colors: newColors });
            })}
            onGradientTypeChange$={$(async (newGradientType) => {
              await writeConfig({ gradientType: newGradientType });
            })}
            hideHeader
          />
        )}
      </div>
    );
  },
);
