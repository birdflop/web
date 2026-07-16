import {
  $,
  component$,
  Slot,
  useContext,
  useOnDocument,
  useSignal,
  QRL,
} from '@qwik.dev/core';
import {
  ColorPicker,
  Dropdown,
  Label,
  NumberInput,
  SelectMenu,
} from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { ShowAllGradientsButton } from './ShowAllGradientsButton';
import {
  sortColors,
  getBrightness,
  getRandomColor,
  hexToRGB,
  rgbToHex,
  invertRgbColor,
  GradientType,
  GRADIENT_TYPES,
  ColorStop,
  disperseColors,
} from '@birdflop/rgbirdflop';

import ArrowRightLeft from 'lucide-icons-qwik/icons/ArrowRightLeft';
import Combine from 'lucide-icons-qwik/icons/Combine';
import Copy from 'lucide-icons-qwik/icons/Copy';
import Dices from 'lucide-icons-qwik/icons/Dices';
import Eclipse from 'lucide-icons-qwik/icons/Eclipse';
import GripVertical from 'lucide-icons-qwik/icons/GripVertical';
import MoveHorizontal from 'lucide-icons-qwik/icons/MoveHorizontal';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Shuffle from 'lucide-icons-qwik/icons/Shuffle';
import Trash from 'lucide-icons-qwik/icons/Trash';

import {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/rgbirdflop/RGBirdflop';
import { getColors } from './ColorMap';
import { ButtonContainer } from '../Elements/ButtonContainer';

const hexRegex = /^#?[0-9A-F]{0,8}$/i;
const hexRegexNoOpacity = /^#?[0-9A-F]{0,6}$/i;

const moveItem = (array: ColorStop[], fromIndex: number, toIndex: number) => {
  const arr = array.map((c) => ({ ...c }));
  const positions = arr.map((item) => item.pos);
  const [movedItem] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, movedItem);
  for (let i = 0; i < arr.length; i++) {
    arr[i].pos = positions[i];
  }
  return arr;
};

type ColorListProps = {
  hidden?: boolean;
  id?: string;
  colors?: ColorStop[];
  gradientType?: GradientType;
  textLength?: number;
  onColorsChange$?: QRL<(colors: ColorStop[]) => void>;
  onGradientTypeChange$?: QRL<(gradientType: GradientType) => void>;
};

export default component$<ColorListProps>((props) => {
  const { hidden, id = 'text' } = props;
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const opened = useSignal(-1);
  const colorsKey = id == 'text' ? 'colors' : 'shadowColors';
  const showAllGradients = useContext(showAllGradientsContext);

  const colors = props.colors ?? getColors(rgbStore, id);
  const resolvedGradientType = props.gradientType ?? rgbStore.gradientType;
  const resolvedTextLength = props.textLength ?? rgbStore.text.length;

  const setColors = $(async (newColors: ColorStop[]) => {
    if (props.onColorsChange$) {
      await props.onColorsChange$(newColors);
    } else {
      rgbStore[colorsKey] = newColors;
    }
  });

  const draggedIndex = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);

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
    })
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
      <div class="flex items-center gap-2">
        <h3 class="flex flex-1 items-center gap-2 font-semibold">
          <Palette /> {t('rgb.colors.title@@Colors')}
        </h3>

        <NumberInput
          input
          id={`colorlist${id}-amount`}
          min={1}
          max={resolvedTextLength}
          value={colors.length}
          btnProps={{ class: 'p-1!' }}
          class={{ 'lum-input-p-1 w-full text-sm': true }}
          onInput$={(e, el) => {
            let colorAmount = Number(el.value);
            if (colorAmount > resolvedTextLength)
              colorAmount = resolvedTextLength;
            const currentColors = props.colors ?? getColors(rgbStore, id);
            const newColors = [];
            for (let i = 0; i < colorAmount; i++) {
              if (currentColors[i]) newColors.push(currentColors[i]);
              else
                newColors.push({
                  hex: getRandomColor(),
                  pos: 0, // will be filled in by disperseColors
                });
            }
            void setColors(disperseColors(newColors));
          }}
          onIncrement$={() => {
            const currentColors = props.colors ?? getColors(rgbStore, id);
            const newColors = [
              ...currentColors,
              {
                hex: getRandomColor(),
                pos: 0, // will be filled in by disperseColors
              },
            ];
            void setColors(disperseColors(newColors));
          }}
          onDecrement$={() => {
            const currentColors = props.colors ?? getColors(rgbStore, id);
            const newColors = currentColors.slice(0);
            newColors.pop();
            void setColors(disperseColors(newColors));
          }}
        />
      </div>

      <Slot />

      <ButtonContainer class="[&>button]:justify-center [&>button]:p-1!">
        <button
          onClick$={() => {
            const currentColors = props.colors ?? getColors(rgbStore, id);
            const newColors = currentColors.map((color) => ({
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
            onClick$={() => {
              void setColors(rgbStore.colors);
            }}
            title={t('rgb.colors.copyFromText@@Copy from text colors')}
          >
            <Combine size={20} />
          </button>
        )}
        <button
          disabled={colors.length < 3}
          onClick$={() => {
            const currentColors = props.colors ?? getColors(rgbStore, id);
            const shuffledColors = currentColors
              .slice(0)
              .sort(() => Math.random() - 0.5);
            const newColors = shuffledColors.map((color, i) => ({
              hex: color.hex,
              pos: currentColors[i].pos,
            }));
            void setColors(newColors);
          }}
          title={t('rgb.colors.shuffle@@Shuffle')}
        >
          <Shuffle size={20} />
        </button>
        <button
          class={{
            'lum-bg-lum-accent!': rgbStore.disperse,
          }}
          onClick$={() => (rgbStore.disperse = !rgbStore.disperse)}
          title={t('rgb.colors.disperse.title@@Disperse')}
        >
          <MoveHorizontal size={20} />
        </button>
        <Dropdown
          id="moreColorOptions"
          align="right"
          class="rounded-lum-1 lum-bg-transparent justify-center! gap-0! p-1.5"
        >
          <button
            class="lum-btn lum-btn-p-2 lum-bg-transparent rounded-lum-1 text-sm"
            onClick$={() => {
              const currentColors = props.colors ?? getColors(rgbStore, id);
              const newColors = currentColors.map((color) => {
                const invertedHex = rgbToHex(
                  invertRgbColor(hexToRGB(color.hex))
                );
                return { ...color, hex: `#${invertedHex}` };
              });
              void setColors(newColors);
            }}
          >
            <Eclipse size={20} />
            {t('rgb.colors.invert@@Invert')}
          </button>
          <button
            class="lum-btn lum-btn-p-2 lum-bg-transparent rounded-lum-1 text-sm"
            onClick$={() => {
              const currentColors = props.colors ?? getColors(rgbStore, id);
              const newColors = currentColors
                .slice()
                .reverse()
                .map((color) => ({ hex: color.hex, pos: 100 - color.pos }));
              void setColors(newColors);
            }}
          >
            <ArrowRightLeft size={20} />
            {t('rgb.colors.reverse@@Reverse')}
          </button>
          <button
            class="lum-btn lum-btn-p-2 lum-bg-transparent rounded-lum-1 text-sm"
            disabled={colors.length >= resolvedTextLength}
            onClick$={() => {
              const currentColors = props.colors ?? getColors(rgbStore, id);
              const newColors = [...currentColors, ...currentColors];
              void setColors(newColors);
            }}
          >
            <Copy size={20} />
            {t('rgb.colors.duplicate@@Duplicate')}
          </button>
        </Dropdown>
        <div class="flex">
          <SelectMenu
            title={t('rgb.colors.gradientType@@Gradient Type')}
            id="gradientType"
            value={resolvedGradientType}
            class="lum-btn-p-1 rounded-lum-1 rounded-r-none text-sm"
            btnProps={{ class: 'lum-btn-p-1' }}
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
          <ShowAllGradientsButton showAllGradients={showAllGradients} />
        </div>
      </ButtonContainer>

      <div class="relative flex flex-col" id={`colorlistcolors${id}`}>
        {colors.map((color, i) => (
          <div
            key={`${i}/${colors.length}`}
            id={`colorlist${id}-color-${i + 1}`}
            class={{
              'relative flex items-center gap-1 py-1 transition-all duration-200': true,
              'scale-[0.98] opacity-40': draggedIndex.value === i,
              '*:pointer-events-none': draggedIndex.value !== null,
            }}
            onDragOver$={(e) => {
              e.preventDefault();
            }}
            onDragEnter$={() => {
              dragOverIndex.value = i;
            }}
            onDragLeave$={() => {
              if (dragOverIndex.value === i) {
                dragOverIndex.value = null;
              }
            }}
            onDrop$={() => {
              if (draggedIndex.value === null || draggedIndex.value === i)
                return;
              const currentColors = props.colors ?? getColors(rgbStore, id);
              const newColors = moveItem(currentColors, draggedIndex.value, i);
              void setColors(newColors);
              draggedIndex.value = null;
              dragOverIndex.value = null;
            }}
          >
            {dragOverIndex.value === i &&
              draggedIndex.value !== null &&
              draggedIndex.value >= i && (
                <div class="bg-lum-accent pointer-events-none absolute -top-0.5 right-0 left-0 z-10 h-0.75 rounded-full shadow-[0_0_8px_var(--color-lum-accent)]">
                  <div class="bg-lum-accent absolute -top-1 -left-1 h-2.75 w-2.75 rounded-full shadow-[0_0_10px_var(--color-lum-accent)]" />
                </div>
              )}
            {dragOverIndex.value === i &&
              draggedIndex.value !== null &&
              draggedIndex.value < i && (
                <div class="bg-lum-accent pointer-events-none absolute right-0 -bottom-0.5 left-0 z-10 h-0.75 rounded-full shadow-[0_0_8px_var(--color-lum-accent)]">
                  <div class="bg-lum-accent absolute -top-1 -left-1 h-2.75 w-2.75 rounded-full shadow-[0_0_10px_var(--color-lum-accent)]" />
                </div>
              )}
            <label
              for={`colorlist${id}-color-${i + 1}-input`}
              class="text-lum-text-secondary w-6 text-center font-mono"
            >
              {i + 1}
            </label>
            <button
              type="button"
              class="lum-btn cursor-grab rounded-r-sm p-1.5 active:cursor-grabbing"
              draggable
              onDragStart$={(e) => {
                draggedIndex.value = i;
                const row = document.getElementById(
                  `colorlist${id}-color-${i + 1}`
                );
                if (row && e.dataTransfer) {
                  e.dataTransfer.setDragImage(row, 20, 20);
                }
              }}
              onDragEnd$={() => {
                draggedIndex.value = null;
                dragOverIndex.value = null;
              }}
            >
              <GripVertical size={20} />
            </button>
            <input
              key={`colorlist${id}-color-${i + 1}`}
              id={`colorlist${id}-color-${i + 1}-input`}
              class={{
                'text-gray-400 hover:text-gray-400':
                  getBrightness(hexToRGB(color.hex)) < 126,
                'text-gray-700 hover:text-gray-700':
                  getBrightness(hexToRGB(color.hex)) > 126,
                'lum-input lum-btn-p-1 lum-grad-bg min-w-20 flex-1 rounded-sm font-mono': true,
              }}
              style={`--bg-color: ${color.hex};`}
              value={color.hex}
              onInput$={(e, el) => {
                let hex = el.value.trim();
                if (!hex.startsWith('#')) hex = '#' + hex;
                // lightly check if valid hex color
                const validRegex =
                  id == 'shadow' ? hexRegex : hexRegexNoOpacity;
                if (!validRegex.test(hex)) {
                  el.value = color.hex;
                  return;
                }
                // update the color
                const currentColors = props.colors ?? getColors(rgbStore, id);
                const newColors = currentColors.slice(0);
                newColors[i].hex = hex;
                void setColors(sortColors(newColors));

                // set the color picker's value and trigger input to update color picker
                if (opened.value != i) return;
                const picker = document.getElementById(
                  `colorlist${id}-color-picker`
                )!;
                picker.dataset.value = el.value;
                picker.dispatchEvent(new Event('input'));
              }}
              onFocus$={() => {
                // set opened value
                if (opened.value == i) return (opened.value = -1);
                else opened.value = i;

                const picker = document.getElementById(
                  `colorlist${id}-color-picker`
                )!;
                const popup = document.getElementById(
                  `colorlist${id}-color-popup`
                );
                if (!picker || !popup) return;

                // set the position of the popup relative to the list of colors
                const colorContainer = document.getElementById(
                  `colorlist${id}-color-${i + 1}`
                )!;
                popup.style.setProperty(
                  '--popup-top',
                  `${colorContainer.offsetTop}px`
                );

                // set the color picker's value and trigger input to update color picker
                picker.dataset.value = color.hex;
                picker.dispatchEvent(new Event('input'));
              }}
            />
            <button
              class="lum-btn lum-grad-bg-red hover:lum-bg-red rounded-l-sm p-1.5"
              onClick$={() => {
                const currentColors = props.colors ?? getColors(rgbStore, id);
                const newColors = currentColors.slice(0);
                newColors.splice(i, 1);
                void setColors(newColors);
              }}
            >
              <Trash size={20} />
            </button>
          </div>
        ))}
        <div
          id={`colorlist${id}-color-popup`}
          stoppropagation:mousedown
          stoppropagation:click
          class={{
            flex: opened.value > -1,
            hidden: opened.value < 0,
            'absolute top-[calc(var(--popup-top)+2.4rem)] left-15 z-10 flex-col gap-2 motion-safe:transition-all sm:top-(--popup-top) sm:left-full': true,
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
              const currentColors = props.colors ?? getColors(rgbStore, id);
              const newColors = currentColors.slice(0);
              newColors[opened.value].hex = newColor;
              void setColors(sortColors(newColors));
            }}
            showInput={false}
            horizontal
            opacity={id == 'shadow'}
          />
          <div class="lum-card flex flex-col justify-evenly gap-1 p-2">
            <Label
              for={`colorlist${id}-color-pos`}
              label={`${t('rgb.colors.position@@Position')} (%)`}
            >
              <MoveHorizontal size={16} q:slot="before-label" />
              <NumberInput
                input
                id={`colorlist${id}-color-pos`}
                min={0}
                max={100}
                value={Math.round(colors[opened.value]?.pos)}
                onInput$={(e, el) => {
                  const currentColors = props.colors ?? getColors(rgbStore, id);
                  const newColors = currentColors.slice(0);
                  let newPos = Number(el.value);
                  if (newPos < 0) newPos = 0;
                  if (newPos > 100) newPos = 100;
                  newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                  void setColors(sortColors(newColors));
                }}
                onIncrement$={() => {
                  const currentColors = props.colors ?? getColors(rgbStore, id);
                  const newColors = currentColors.slice(0);
                  let newPos = newColors[opened.value].pos + 1;
                  if (newPos > 100) newPos = 100;
                  newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                  void setColors(sortColors(newColors));
                }}
                onDecrement$={() => {
                  const currentColors = props.colors ?? getColors(rgbStore, id);
                  const newColors = currentColors.slice(0);
                  let newPos = newColors[opened.value].pos - 1;
                  if (newPos < 0) newPos = 0;
                  newColors[opened.value].pos =
                    Math.round(newPos * 1000) / 1000;
                  void setColors(sortColors(newColors));
                }}
              />
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
});
