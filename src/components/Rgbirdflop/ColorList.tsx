import {
  $,
  component$,
  PropFunction,
  Slot,
  useContext,
  useOnDocument,
  useSignal,
} from '@builder.io/qwik';
import { ColorPicker, NumberInput, SelectMenuRaw } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import {
  swapItems,
  sortColors,
  getBrightness,
  getRandomColor,
  hexToRGB,
  rgbToHex,
  invertRgbColor,
  GradientType,
  GRADIENT_TYPES,
  ColorStop,
} from '@birdflop/rgbirdflop';
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Combine,
  Copy,
  Dices,
  Eclipse,
  Eye,
  Palette,
  Shuffle,
  Trash,
} from 'lucide-icons-qwik';
import { rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflop';
import { getColors } from './ColorMap';

const hexRegex = /^#?[0-9A-F]{0,8}$/i;
const hexRegexNoOpacity = /^#?[0-9A-F]{0,6}$/i;

type ColorListProps = {
  hidden?: boolean;
  id?: string;
  colors?: ColorStop[];
  gradientType?: GradientType;
  textLength?: number;
  onColorsChange$?: PropFunction<(colors: ColorStop[]) => void>;
  onGradientTypeChange$?: PropFunction<(gradientType: GradientType) => void>;
  hideHeader?: boolean;
};

export default component$<ColorListProps>((props) => {
  const {
    hidden,
    id = 'text',
    hideHeader = false,
  } = props;
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colorsKey = id == 'text' ? 'colors' : 'shadowColors';
  const showAllGradients = useContext(showAllGradientsContext);

  const resolvedColors = props.colors ?? getColors(rgbStore, id);
  const resolvedGradientType = props.gradientType ?? rgbStore.gradientType;
  const resolvedTextLength = props.textLength ?? rgbStore.text.length;

  const colors = resolvedColors;

  const setColors = $(async (newColors: ColorStop[]) => {
    if (props.onColorsChange$) {
      await props.onColorsChange$(newColors);
    } else {
      rgbStore[colorsKey] = newColors;
    }
  });

  useOnDocument(
    'click',
    $((e) => {
      if (
        e.target instanceof HTMLElement &&
          !e.target.closest(`#colorlist${id}-color-popup`) &&
          !e.target.closest(`#colorlistcolors${id}`)
      ) {
        opened.value = -1;
      }
    }),
  );

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-200 sm:pointer-events-auto sm:h-auto sm:opacity-100': true,
        'pointer-events-none h-0 opacity-0': hidden,
        'pointer-events-auto opacity-100': !hidden,
      }}
      id={'colorlist' + id}
    >
      {!hideHeader && (
        <div class="flex items-center gap-1 py-2 font-semibold">
          <span class="flex items-center gap-2 flex-1">
            <Palette />
            {t('rgb.colors.title@@Colors')}
          </span>
          <SelectMenuRaw
            title={t('rgb.colors.gradientType@@Gradient Type')}
            id="gradientType"
            value={resolvedGradientType}
            class={{ 'lum-btn-p-1 text-sm rounded-r-sm': true }}
            onChange$={async (e, el) => {
              const value = el.value as GradientType;
              if (props.onGradientTypeChange$) {
                await props.onGradientTypeChange$(value);
              } else {
                rgbStore.gradientType = value;
              }
            }}
            values={GRADIENT_TYPES.map((type) => ({
              name: type,
              value: type,
            }))}
          />
          <button
            q:slot="extra-buttons"
            class={{
              'lum-btn p-1 transition-colors rounded-l-sm': true,
              'text-lum-primary': showAllGradients.value,
              'text-lum-text-secondary': !showAllGradients.value,
            }}
            onClick$={() =>
              (showAllGradients.value = !showAllGradients.value)
            }
            title={
              showAllGradients.value
                ? 'Show only selected gradient'
                : 'Show all gradients'
            }
          >
            <Eye size={20} />
          </button>
        </div>
      )}

      <Slot />
      {/*
      {rgbStore.colorFormat.color != 'MiniMessage' && id == 'text' && (
        <NumberInput
          input
          disabled
          id="colorLength"
          min={1}
          max={resolvedTextLength / colors.length}
          value={rgbStore.colorLength}
          class={{ 'w-full opacity-100!': true }}
          onIncrement$={() => rgbStore.colorLength++}
          onDecrement$={() => rgbStore.colorLength--}
        >
          {t('rgb.colors.charsPer@@Characters per color')}
        </NumberInput>
      )}
      */}
      <NumberInput
        input
        id={`colorlist${id}-amount`}
        min={1}
        max={resolvedTextLength}
        value={colors.length}
        class={{ 'w-full': true }}
        onChange$={(e, el) => {
          let colorAmount = Number(el.value);
          if (colorAmount > resolvedTextLength)
            colorAmount = resolvedTextLength;
          const newColors = [];
          for (let i = 0; i < colorAmount; i++) {
            if (colors[i]) newColors.push(colors[i]);
            else newColors.push({ hex: getRandomColor() });
          }
          const mappedColors = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
          void setColors(mappedColors);
        }}
        onIncrement$={() => {
          const newColors = [
            ...colors,
            {
              hex: getRandomColor(),
            },
          ];
          const mappedColors = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
          void setColors(mappedColors);
        }}
        onDecrement$={() => {
          const newColors = colors.slice(0);
          newColors.pop();
          const mappedColors = newColors.map((color, i) => ({
            hex: color.hex,
            pos: Math.round((100 / (newColors.length - 1)) * i * 1000) / 1000,
          }));
          void setColors(mappedColors);
        }}
      >
        {t('rgb.colors.amount@@Color Amount')}
      </NumberInput>
      <div class="flex gap-1 *:w-full">
        <button
          class={{
            'lum-btn justify-center rounded-r-sm p-1': true,
          }}
          onClick$={() => {
            const newColors = colors.map((color) => ({
              hex: getRandomColor(),
              pos: color.pos,
            }));
            void setColors(newColors);
          }}
          title={t('rgb.colors.randomize@@Randomize')}
        >
          <Dices size={20} />
        </button>
        {id == 'shadow' && (
          <button
            class={{
              'lum-btn justify-center rounded-l-sm p-1': true,
            }}
            onClick$={() => {
              void setColors(rgbStore.colors);
            }}
            title={t('rgb.colors.copyFromText@@Copy from text colors')}
          >
            <Combine size={20} />
          </button>
        )}
        <button
          class={{
            'lum-btn justify-center rounded-l-sm p-1': true,
          }}
          disabled={colors.length >= resolvedTextLength}
          onClick$={() => {
            const newColors = [...colors, ...colors];
            void setColors(newColors);
          }}
          title={t('rgb.colors.duplicate@@Duplicate')}
        >
          <Copy size={20} />
        </button>
        <button
          class={{
            'lum-btn justify-center rounded-sm p-1': true,
          }}
          onClick$={() => {
            const newColors = colors
              .slice()
              .reverse()
              .map((color) => ({ hex: color.hex, pos: 100 - color.pos }));
            void setColors(newColors);
          }}
          title={t('rgb.colors.reverse@@Reverse')}
        >
          <ArrowRightLeft size={20} />
        </button>
        <button
          class={{
            'lum-btn justify-center rounded-sm p-1': true,
          }}
          disabled={colors.length < 3}
          onClick$={() => {
            const shuffledColors = colors
              .slice(0)
              .sort(() => Math.random() - 0.5);
            const newColors = shuffledColors.map((color, i) => ({
              hex: color.hex,
              pos: colors[i].pos,
            }));
            void setColors(newColors);
          }}
          title={t('rgb.colors.shuffle@@Shuffle')}
        >
          <Shuffle size={20} />
        </button>
        <button
          class={{
            'lum-btn justify-center rounded-l-sm p-1': true,
          }}
          onClick$={() => {
            const newColors = colors.map((color) => {
              const invertedHex = rgbToHex(
                invertRgbColor(hexToRGB(color.hex)),
              );
              return { ...color, hex: `#${invertedHex}` };
            });
            void setColors(newColors);
          }}
          title={t('rgb.colors.invert@@Invert')}
        >
          <Eclipse size={20} />
        </button>
        {/*
        {!rgbStore.disperse && (
          <button
            class="lum-btn justify-center rounded-l-sm p-1"
            disabled={
              !colors.find((color, i) => {
                return (
                  color.pos !=
                    Math.round((100 / (colors.length - 1)) * i * 1000) / 1000
                );
              })
            }
            onClick$={() => {
              void setColors(disperseColors(colors));
            }}
            title={t('rgb.colors.disperse.title@@Disperse')}
          >
            <MoveHorizontal size={20} />
          </button>
        )}
        */}
      </div>
      <div class="relative flex flex-col gap-2" id={`colorlistcolors${id}`}>
        {colors.map((color, i) => (
          <div
            key={`${i}/${colors.length}`}
            id={`colorlist${id}-color-${i + 1}`}
            class="relative flex gap-1"
          >
            <div class="flex flex-col gap-1">
              <button
                class="lum-btn rounded-b-sm p-1"
                onClick$={() =>
                  void setColors(swapItems(colors, i, i - 1))
                }
              >
                <ChevronUp size={20} />
              </button>
              <button
                class="lum-btn rounded-t-sm p-1"
                onClick$={() =>
                  void setColors(swapItems(colors, i, i + 1))
                }
              >
                <ChevronDown size={20} />
              </button>
            </div>
            <div class="flex flex-col justify-end">
              <label for={`colorlist${id}-color-${i + 1}-input`}>
                {t('rgb.colors.color@@Color')} {i + 1}
              </label>
              <input
                key={`colorlist${id}-color-${i + 1}`}
                id={`colorlist${id}-color-${i + 1}-input`}
                class={{
                  'text-gray-400 hover:text-gray-400':
                      getBrightness(hexToRGB(color.hex)) < 126,
                  'text-gray-700 hover:text-gray-700':
                      getBrightness(hexToRGB(color.hex)) > 126,
                  'lum-input lum-btn-p-1 lum-grad-bg w-full rounded-r-sm': true,
                }}
                style={`--bg-color: ${color.hex};`}
                value={color.hex}
                onInput$={(e, el) => {
                  let hex = el.value.trim();
                  if (!hex.startsWith('#')) hex = '#' + hex;
                  // lightly check if valid hex color
                  const validRegex = id == 'shadow' ? hexRegex : hexRegexNoOpacity;
                  if (!validRegex.test(hex)) {
                    el.value = color.hex;
                    return;
                  }
                  // update the color
                  const newColors = colors.slice(0);
                  newColors[i].hex = hex;
                  void setColors(sortColors(newColors));

                  // set the color picker's value and trigger input to update color picker
                  if (opened.value != i) return;
                  const picker = document.getElementById(
                    `colorlist${id}-color-picker`,
                  )!;
                  picker.dataset.value = el.value;
                  picker.dispatchEvent(new Event('input'));
                }}
                onFocus$={() => {
                  // set opened value
                  if (opened.value == i) return (opened.value = -1);
                  else opened.value = i;

                  const picker = document.getElementById(
                    `colorlist${id}-color-picker`,
                  )!;
                  const popup = document.getElementById(
                    `colorlist${id}-color-popup`,
                  );
                  if (!picker || !popup) return;

                  // set the position of the popup relative to the list of colors
                  const colorContainer = document.getElementById(
                    `colorlist${id}-color-${i + 1}`,
                  )!;
                  popup.style.top = `${colorContainer.offsetTop + colorContainer.offsetHeight + 8}px`;

                  // set the color picker's value and trigger input to update color picker
                  picker.dataset.value = color.hex;
                  picker.dispatchEvent(new Event('input'));
                }}
              />
            </div>
            <div class="flex flex-col justify-end">
              <button
                class="lum-btn lum-grad-bg-red hover:lum-bg-red rounded-l-sm p-1.5"
                onClick$={() => {
                  const newColors = colors.slice(0);
                  newColors.splice(i, 1);
                  void setColors(newColors);
                }}
              >
                <Trash size={20} />
              </button>
            </div>
          </div>
        ))}
        <div
          id={`colorlist${id}-color-popup`}
          stoppropagation:mousedown
          stoppropagation:click
          class={{
            flex: opened.value > -1,
            hidden: opened.value < 0,
            'absolute z-10 flex-col gap-2 motion-safe:transition-all': true,
            'animate-in fade-in slide-in-from-top-2': true,
          }}
          style={{
            '--lum-border-radius': '1rem',
          }}
        >
          <ColorPicker
            id={`colorlist${id}-color-picker`}
            value={colors[opened.value]?.hex}
            onInput$={(newColor) => {
              const newColors = colors.slice(0);
              newColors[opened.value].hex = newColor;
              void setColors(sortColors(newColors));
            }}
            showInput={false}
            horizontal
            opacity={id == 'shadow'}
          />
          <div class="lum-card flex flex-col justify-evenly gap-1 p-2">
            <NumberInput
              input
              id={`colorlist${id}-color-pos`}
              min={0}
              max={100}
              value={Math.round(colors[opened.value]?.pos)}
              onChange$={(e, el) => {
                const newColors = colors.slice(0);
                let newPos = Number(el.value);
                if (newPos < 0) newPos = 0;
                if (newPos > 100) newPos = 100;
                newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                void setColors(sortColors(newColors));
              }}
              onIncrement$={() => {
                const newColors = colors.slice(0);
                let newPos = newColors[opened.value].pos + 1;
                if (newPos > 100) newPos = 100;
                newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                void setColors(sortColors(newColors));
              }}
              onDecrement$={() => {
                const newColors = colors.slice(0);
                let newPos = newColors[opened.value].pos - 1;
                if (newPos < 0) newPos = 0;
                newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                void setColors(sortColors(newColors));
              }}
            >
              {t('rgb.colors.position@@Position')} (%)
            </NumberInput>
          </div>
        </div>
      </div>
    </div>
  );
},
);
