import { $, component$, useComputed$, useContext, useOnDocument, useSignal } from '@builder.io/qwik';
import { ColorPicker, NumberInput, SelectMenu } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import {
  ColorGradient,
  GRADIENT_TYPES,
  getBrightness,
  getRGBColorStop,
  getRandomColor,
  hexToRGB,
  rgbToHex,
  sortColors,
  type ColorStop,
  type GradientType,
} from '@birdflop/rgbirdflop';
import { ArrowRightLeft, Ban, ChevronDown, ChevronUp, Dices, Droplet, Palette, Plus, Trash } from 'lucide-icons-qwik';
import { applyStyleToRange, defaultStyle, styleAtChar, type CharStyle } from './model';
import { restoreSelection } from './dom';
import { advancedStoreContext } from '~/routes/resources/rgb/beta/index';
import { selectionContext } from '~/components/Rgbirdflop/Input';

function gradientCSS(colors: ColorStop[], gradientType: string, samples = 20): string {
  if (colors.length < 2) return colors[0]?.hex ?? 'transparent';
  if (gradientType === 'rgb') {
    return `linear-gradient(to right, ${sortColors(colors)
      .map((c) => `${c.hex} ${c.pos}%`)
      .join(', ')})`;
  }
  const gradient = new ColorGradient(sortColors(colors).map(getRGBColorStop), samples, gradientType as GradientType);
  const stops: string[] = [];
  for (let i = 0; i < samples; i++) {
    stops.push(`#${rgbToHex(gradient.next())} ${((i / (samples - 1)) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

function ensureGradientColors(colors: ColorStop[]): ColorStop[] {
  if (colors.length >= 2) return colors.map((c) => ({ ...c }));
  const base = colors.length === 1 ? colors[0].hex : '#54daf4';
  return [
    { hex: base, pos: 0 },
    { hex: getRandomColor(), pos: 100 },
  ];
}

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);
  const selection = useContext(selectionContext);
  const opened = useSignal(-1);

  const hasSelection = useComputed$(() => !!selection.value && selection.value.end > selection.value.start);

  const current = useComputed$<CharStyle>(() => {
    if (!selection.value) return defaultStyle();
    return styleAtChar(store.segments, selection.value.start) ?? defaultStyle();
  });

  useOnDocument('click', $((e) => {
    if (e.target instanceof HTMLElement
      && !e.target.closest('#adv-color-popup')
      && !e.target.closest('#adv-color-list')) {
      opened.value = -1;
    }
  }));

  // Writes a uniform color config over the whole selection (formatting flags untouched).
  // The payload is plain serializable data, computed once by the caller.
  const writeConfig = $((partial: Partial<CharStyle>) => {
    if (!selection.value) return;
    const { start, end } = selection.value;
    if (end <= start) return;
    const base = styleAtChar(store.segments, start) ?? defaultStyle();
    const colorMode = partial.colorMode ?? base.colorMode;
    const colors = (partial.colors ?? base.colors).map((c) => ({ ...c }));
    const gradientType = partial.gradientType ?? base.gradientType;
    const colorlength = partial.colorlength ?? base.colorlength;
    store.segments = applyStyleToRange(store.segments, start, end, (s) => {
      s.colorMode = colorMode;
      s.colors = colors.map((c) => ({ ...c }));
      s.gradientType = gradientType;
      s.colorlength = colorlength;
    });
    void restoreSelection(start, end);
  });

  // The Style panel only renders this when there's a selection; bail out otherwise.
  if (!hasSelection.value) return null;

  const mode = current.value.colorMode;
  const colors = current.value.colors;
  const selLength = selection.value ? (selection.value.end - selection.value.start) : 0;

  return (
    <div class="flex flex-col gap-2">
      {/* Color mode switch */}
      <div class="flex gap-1 *:flex-1">
        <button class={{ 'lum-btn p-2 rounded-sm justify-center gap-2': true, 'lum-grad-bg-lum-accent!': mode === 'gradient' }}
          onClick$={() => writeConfig({ colorMode: 'gradient', colors: ensureGradientColors(current.value.colors) })}>
          <Palette size={18} /> {t('rgb.beta.mode.gradient@@Gradient')}
        </button>
        <button class={{ 'lum-btn p-2 rounded-sm justify-center gap-2': true, 'lum-grad-bg-lum-accent!': mode === 'solid' }}
          onClick$={() => writeConfig({ colorMode: 'solid', colors: [{ hex: current.value.colors[0]?.hex ?? getRandomColor(), pos: 0 }] })}>
          <Droplet size={18} /> {t('rgb.beta.mode.solid@@Solid')}
        </button>
        <button class={{ 'lum-btn p-2 rounded-sm justify-center gap-2': true, 'lum-grad-bg-lum-accent!': mode === 'none' }}
          onClick$={() => writeConfig({ colorMode: 'none' })}>
          <Ban size={18} /> {t('rgb.beta.mode.none@@Uncolored')}
        </button>
      </div>

      {mode === 'none' &&
        <p class="text-xs text-lum-text-secondary px-1">
          {t('rgb.beta.mode.noneDescription@@These characters keep Minecraft\'s default color (only formatting is applied).')}
        </p>
      }

      {mode === 'solid' &&
        <div class="p-2">
          <ColorPicker
            id="adv-solid-picker"
            value={colors[0]?.hex ?? '#ffffff'}
            onInput$={(newColor) => writeConfig({ colors: [{ hex: newColor, pos: 0 }] })}
            horizontal
          />
        </div>
      }

      {mode === 'gradient' && <>
        <div class="flex flex-col md:grid grid-cols-2 gap-2">
          <SelectMenu id="adv-gradientType" value={current.value.gradientType}
            class={{ 'w-full': true }}
            onChange$={(e, el) => writeConfig({ gradientType: el.value as GradientType })}
            values={GRADIENT_TYPES.map((type) => ({ name: type, value: type }))}>
            {t('rgb.colors.gradientType@@Gradient Type')}
          </SelectMenu>
          <NumberInput input id="adv-colorlength"
            min={1} max={Math.max(1, selLength)}
            value={current.value.colorlength}
            class={{ 'w-full': true }}
            onChange$={(e, el) => { let v = Number(el.value); if (v < 1) v = 1; void writeConfig({ colorlength: v }); }}
            onIncrement$={() => writeConfig({ colorlength: Math.min(Math.max(1, selLength), current.value.colorlength + 1) })}
            onDecrement$={() => writeConfig({ colorlength: Math.max(1, current.value.colorlength - 1) })}>
            {t('rgb.colors.charsPer@@Characters per color')}
          </NumberInput>
        </div>

        {/* Gradient bar */}
        <div class="w-full h-2 rounded-full" style={`background: ${gradientCSS(colors, current.value.gradientType)};`} />

        {/* Tools */}
        <div class="flex gap-1 *:w-full">
          <button class="lum-btn p-1 rounded-sm justify-center" title={t('rgb.colors.randomize@@Randomize')}
            onClick$={() => writeConfig({ colors: current.value.colors.map((c) => ({ hex: getRandomColor(), pos: c.pos })) })}>
            <Dices size={20} />
          </button>
          <button class="lum-btn p-1 rounded-sm justify-center" title={t('rgb.colors.reverse@@Reverse')}
            onClick$={() => writeConfig({ colors: sortColors(current.value.colors).reverse().map((c) => ({ hex: c.hex, pos: 100 - c.pos })) })}>
            <ArrowRightLeft size={20} />
          </button>
          <button class="lum-btn p-1 rounded-sm justify-center" disabled={colors.length >= selLength}
            title={t('rgb.beta.addColor@@Add color')}
            onClick$={() => {
              const next = [...current.value.colors, { hex: getRandomColor(), pos: 100 }];
              void writeConfig({ colors: next.map((c, i) => ({ hex: c.hex, pos: Math.round((100 / (next.length - 1)) * i * 1000) / 1000 })) });
            }}>
            <Plus size={20} />
          </button>
        </div>

        {/* Stops list */}
        <div class="flex flex-col gap-2 relative" id="adv-color-list">
          {sortColors(colors).map((color, i) => (
            <div key={`${i}/${colors.length}`} class="flex relative gap-1">
              <div class="flex flex-col gap-1">
                <button class="lum-btn p-1 rounded-b-sm" disabled={i === 0}
                  onClick$={() => {
                    const sorted = sortColors(current.value.colors);
                    const tmp = sorted[i].pos; sorted[i].pos = sorted[i - 1].pos; sorted[i - 1].pos = tmp;
                    void writeConfig({ colors: sorted });
                  }}>
                  <ChevronUp size={20} />
                </button>
                <button class="lum-btn p-1 rounded-t-sm" disabled={i >= colors.length - 1}
                  onClick$={() => {
                    const sorted = sortColors(current.value.colors);
                    const tmp = sorted[i].pos; sorted[i].pos = sorted[i + 1].pos; sorted[i + 1].pos = tmp;
                    void writeConfig({ colors: sorted });
                  }}>
                  <ChevronDown size={20} />
                </button>
              </div>
              <div class="flex flex-col justify-end flex-1">
                <label>{t('rgb.colors.color@@Color')} {i + 1}</label>
                <input
                  class={{
                    'text-gray-400 hover:text-gray-400': getBrightness(hexToRGB(color.hex)) < 126,
                    'text-gray-700 hover:text-gray-700': getBrightness(hexToRGB(color.hex)) > 126,
                    'lum-input w-full lum-btn-p-1 rounded-r-sm lum-grad-bg': true,
                  }}
                  style={`--bg-color: ${color.hex};`}
                  value={color.hex}
                  onFocus$={() => { opened.value = opened.value === i ? -1 : i; }}
                  onInput$={(e, el) => {
                    const hex = el.value;
                    const sorted = sortColors(current.value.colors);
                    if (sorted[i]) sorted[i].hex = hex;
                    void writeConfig({ colors: sorted });
                  }}
                />
              </div>
              <div class="flex flex-col justify-end">
                <NumberInput input id={`adv-pos-${i}`} class={{ 'w-24': true }}
                  min={0} max={100} value={Math.round(color.pos)}
                  onChange$={(e, el) => {
                    let p = Number(el.value); if (p < 0) p = 0; if (p > 100) p = 100;
                    const sorted = sortColors(current.value.colors);
                    if (sorted[i]) sorted[i].pos = Math.round(p * 1000) / 1000;
                    void writeConfig({ colors: sorted });
                  }}
                  onIncrement$={() => {
                    const sorted = sortColors(current.value.colors);
                    if (sorted[i]) sorted[i].pos = Math.min(100, sorted[i].pos + 1);
                    void writeConfig({ colors: sorted });
                  }}
                  onDecrement$={() => {
                    const sorted = sortColors(current.value.colors);
                    if (sorted[i]) sorted[i].pos = Math.max(0, sorted[i].pos - 1);
                    void writeConfig({ colors: sorted });
                  }}>
                  %
                </NumberInput>
              </div>
              <div class="flex flex-col justify-end">
                <button class="lum-btn p-1.5 lum-grad-bg-red hover:lum-bg-red rounded-l-sm" disabled={colors.length <= 2}
                  onClick$={() => {
                    const sorted = sortColors(current.value.colors);
                    sorted.splice(i, 1);
                    void writeConfig({ colors: sorted });
                  }}>
                  <Trash size={20} />
                </button>
              </div>
              {opened.value === i &&
                <div id="adv-color-popup" stoppropagation:mousedown
                  stoppropagation:click
                  class="flex flex-col gap-2 absolute top-full left-0 z-10 mt-1 animate-in fade-in slide-in-from-top-2"
                  style={{ '--lum-border-radius': '1rem' }}>
                  <ColorPicker id={`adv-stop-picker-${i}`} value={color.hex}
                    onInput$={(newColor) => {
                      const sorted = sortColors(current.value.colors);
                      if (sorted[i]) sorted[i].hex = newColor;
                      void writeConfig({ colors: sorted });
                    }}
                    showInput={false} horizontal />
                </div>
              }
            </div>
          ))}
        </div>
      </>}
    </div>
  );
});
