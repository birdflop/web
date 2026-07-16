import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import Bold from 'lucide-icons-qwik/icons/Bold';
import Eraser from 'lucide-icons-qwik/icons/Eraser';
import Italic from 'lucide-icons-qwik/icons/Italic';
import Strikethrough from 'lucide-icons-qwik/icons/Strikethrough';
import Underline from 'lucide-icons-qwik/icons/Underline';
import Wand2 from 'lucide-icons-qwik/icons/Wand2';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import {
  restoreSelection,
  Selection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import { SelectMenu } from '@luminescent/ui-qwik';
import {
  FormatSegment,
  Formatting,
  FORMAT_KEYS,
  FONT_LABELS,
  type FormatKey,
} from '@birdflop/rgbirdflop';
import {
  combinedText,
  rgbSegmentsContext,
} from '~/components/rgbirdflop/advanced/rgbSegments';
import { ButtonContainer } from '../Elements/ButtonContainer';

export default component$(() => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const selection = useContext(selectionContext, useSignal<Selection>());
  const rgbSegments = useContext(rgbSegmentsContext, null);

  const getFormatLabel = (FormatKey: FormatKey) => {
    if (rgbStore.colorFormat.char) {
      const formatMap = {
        bold: 'l',
        italic: 'o',
        underline: 'n',
        strikethrough: 'm',
        obfuscate: 'k',
      };
      return ` - ${rgbStore.colorFormat.char}${formatMap[FormatKey]}`;
    }

    const formatValue = rgbStore.colorFormat[FormatKey];
    if (formatValue) {
      return ` - ${formatValue.replace('$t', '')}`;
    }

    return '';
  };

  const getIntervalsInRange = (start: number, end: number) => {
    const boundaries = new Set([start, end]);
    for (const s of rgbStore.formatting) {
      boundaries.add(s.start);
      boundaries.add(s.end);
    }
    const points = Array.from(boundaries).sort((a, b) => a - b);

    const intervals: (FormatSegment | Formatting)[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      if (a >= b || b <= start || a >= end) continue;

      const covering = rgbStore.formatting.find(
        (s) => s.start <= a && s.end >= b
      );
      intervals.push(
        covering
          ? { ...rgbStore.baseFormatting, ...covering }
          : { ...rgbStore.baseFormatting }
      );
    }
    return intervals;
  };

  const updateSelectionFormatting = $(
    (
      transform: (fmt: Formatting) => void,
      clearAllIfEntire: boolean = false
    ) => {
      const textLength = rgbSegments?.value
        ? combinedText(rgbSegments.value).length
        : rgbStore.text.length;

      const isEntireSelected =
        selection.value &&
        selection.value.start === 0 &&
        selection.value.end === textLength;

      if (!selection.value || isEntireSelected) {
        transform(rgbStore.baseFormatting);
        if (clearAllIfEntire) {
          rgbStore.formatting = [];
        }
        if (selection.value) {
          void restoreSelection(selection.value.start, selection.value.end);
        }
        return;
      }

      const { start, end } = selection.value;

      const boundaries = new Set([start, end]);
      for (const s of rgbStore.formatting) {
        boundaries.add(s.start);
        boundaries.add(s.end);
      }
      const points = Array.from(boundaries).sort((a, b) => a - b);

      const newSegments = [];
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (a >= b) continue;

        const covering = rgbStore.formatting.find(
          (s) => s.start <= a && s.end >= b
        );
        const fmt = covering
          ? { ...rgbStore.baseFormatting, ...covering }
          : { ...rgbStore.baseFormatting };

        if (a < end && b > start) {
          transform(fmt);
        }

        const defaultNorm = rgbStore.baseFormatting;
        const isDefault =
          FORMAT_KEYS.every((k) => fmt[k] === defaultNorm[k]) &&
          fmt.font === defaultNorm.font;
        if (!isDefault) {
          newSegments.push({ ...fmt, start: a, end: b });
        }
      }

      const merged: any[] = [];
      for (const seg of newSegments.sort(
        (x: any, y: any) => x.start - y.start
      )) {
        const last = merged[merged.length - 1];
        if (
          last &&
          last.end === seg.start &&
          FORMAT_KEYS.every((k) => last[k] === seg[k]) &&
          last.font === seg.font
        ) {
          last.end = seg.end;
        } else {
          merged.push({ ...seg });
        }
      }

      rgbStore.formatting = merged;
      void restoreSelection(start, end);
    }
  );

  const computeSelectionFormatting = () => {
    const textLength = rgbSegments?.value
      ? combinedText(rgbSegments.value).length
      : rgbStore.text.length;

    const isEntireSelected =
      selection.value &&
      selection.value.start === 0 &&
      selection.value.end === textLength;

    if (!selection.value || isEntireSelected) return rgbStore.baseFormatting;

    const { start, end } = selection.value;
    const intervals = getIntervalsInRange(start, end);

    const result: Formatting = {};
    const defaultFmt = rgbStore.baseFormatting;

    for (const k of FORMAT_KEYS) {
      result[k] =
        intervals.length === 0 ? defaultFmt[k] : intervals.every((iv) => iv[k]);
    }

    const firstFont = intervals[0]?.font;
    result.font = intervals.every((iv) => iv.font === firstFont)
      ? firstFont
      : undefined;

    return result;
  };

  const formatting = computeSelectionFormatting();

  const textLength = rgbSegments?.value
    ? combinedText(rgbSegments.value).length
    : rgbStore.text.length;

  const isSelectionActive =
    selection.value &&
    (selection.value.start !== 0 || selection.value.end !== textLength);

  const toggleFlag = $((flag: FormatKey) => {
    void updateSelectionFormatting((fmt) => {
      fmt[flag] = !fmt[flag];
    });
  });

  const setFont = $((fontVal: string | undefined) => {
    void updateSelectionFormatting((fmt) => {
      fmt.font = fontVal;
    });
  });

  const clearFormatting = $(() => {
    void updateSelectionFormatting((fmt) => {
      for (const k of FORMAT_KEYS) {
        fmt[k] = false;
      }
      fmt.font = undefined;
    }, true);
  });

  const formattingButtons: {
    key: FormatKey;
    label: string;
    icon: typeof Bold;
  }[] = [
    { key: 'bold', label: t('rgb.formatting.bold@@Bold'), icon: Bold },
    { key: 'italic', label: t('rgb.formatting.italic@@Italic'), icon: Italic },
    {
      key: 'underline',
      label: t('rgb.formatting.underline@@Underline'),
      icon: Underline,
    },
    {
      key: 'strikethrough',
      label: t('rgb.formatting.strikethrough@@Strikethrough'),
      icon: Strikethrough,
    },
    {
      key: 'obfuscate',
      label: t('rgb.formatting.obfuscate@@Obfuscate'),
      icon: Wand2,
    },
  ];

  return (
    <div class="flex" id="formatting-container">
      <ButtonContainer
        class={{
          'rounded-r-none *:h-full *:justify-center': true,
          'lum-bg-blue/20': !!isSelectionActive,
        }}
        id="formatting"
      >
        <SelectMenu
          class={{
            'lum-btn-p-1 rounded-lum-1 lum-bg-transparent h-full text-sm': true,
            'lum-bg-blue/20': !!isSelectionActive,
          }}
          panelProps={{
            class: 'lum-bg-lum-card-bg',
          }}
          btnProps={{
            class: 'lum-btn-p-1',
          }}
          id="font-select"
          value={formatting.font || 'default'}
          onChange$={(e, el) => {
            const val = el.value === 'default' ? undefined : el.value;
            void setFont(val);
          }}
          values={Object.entries(FONT_LABELS).map(([key, label]) => ({
            name: label,
            value: key,
          }))}
        />
      </ButtonContainer>
      <ButtonContainer
        class={{
          'rounded-none *:justify-center *:p-2': true,
          'lum-bg-blue/20': !!isSelectionActive,
        }}
        id="formatting"
      >
        {formattingButtons.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={formatting[key]}
            title={label}
            class={{
              'lum-grad-bg-lum-accent/100!': formatting[key],
            }}
            onClick$={() => toggleFlag(key)}
          >
            <Icon size={16} />
            <span class="lum-card/100 lum-btn-p-1 absolute top-[-105%] left-1/2 z-50 -translate-x-1/2 scale-75 whitespace-nowrap opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
              {label} {getFormatLabel(key)}
            </span>
          </button>
        ))}
      </ButtonContainer>
      <ButtonContainer
        class={{
          'rounded-l-none *:justify-center *:p-2': true,
          'lum-bg-blue/20': !!isSelectionActive,
        }}
        id="clear-formatting"
      >
        <button
          type="button"
          id="clear"
          title={t('rgb.formatting.clear@@Clear Formatting')}
          onClick$={clearFormatting}
        >
          <Eraser size={16} />
          <span class="lum-card/100 lum-btn-p-1 absolute top-[-105%] left-1/2 z-50 -translate-x-1/2 scale-75 whitespace-nowrap opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            {t('rgb.formatting.clear@@Clear Formatting')}
          </span>
        </button>
      </ButtonContainer>
    </div>
  );
});
