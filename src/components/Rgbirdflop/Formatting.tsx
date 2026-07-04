import { $, component$, useContext, useSignal } from '@builder.io/qwik';
import { Bold, Eraser, Italic, Strikethrough, Underline, Wand2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from './RGBirdflop';
import { Selection, selectionContext } from './Input';
import { SelectMenuRaw } from '@luminescent/ui-qwik';
import { FormatSegment, Formatting, ALL_FORMATTING_KEYS, FONT_LABELS, FormatKey, FormattingBooleanKey } from '@birdflop/rgbirdflop';

export default component$(() => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const selection = useContext(selectionContext, useSignal<Selection>());

  const getFormatLabel = (FormatKey: FormatKey) => {
    if (rgbStore.colorFormat.char) {
      const formatMap = { bold: 'l', italic: 'o', underline: 'n', strikethrough: 'm', obfuscate: 'k' };
      return ` - ${rgbStore.colorFormat.char}${formatMap[FormatKey]}`;
    }

    const formatValue = rgbStore.colorFormat[FormatKey];
    if (formatValue) {
      return ` - ${formatValue.replace('$t', '')}`;
    }

    return '';
  };

  const computeSelectionFormatting = () => {
    if (!selection.value) return rgbStore.baseFormatting;

    const { start, end } = selection.value;
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
      if (a >= b) continue;
      if (b <= start || a >= end) continue; // outside selection

      const covering = rgbStore.formatting.find((s) => s.start <= a && s.end >= b);
      const fmt = covering ? { ...rgbStore.baseFormatting, ...covering } : { ...rgbStore.baseFormatting };
      intervals.push(fmt);
    }

    const result: Formatting = {};
    const defaultFmt = rgbStore.baseFormatting;

    for (const k of ALL_FORMATTING_KEYS) {
      if (intervals.length === 0) {
        (result as any)[k] = defaultFmt[k];
      } else {
        (result as any)[k] = intervals.every((iv) => iv[k]);
      }
    }

    if (intervals.length === 0) {
      result.font = defaultFmt.font;
    } else {
      const firstFont = intervals[0].font;
      const allSame = intervals.every((iv) => iv.font === firstFont);
      result.font = allSame ? firstFont : undefined;
    }

    return result;
  };

  const formatting = computeSelectionFormatting();

  const toggleFlag = $((flag: FormattingBooleanKey) => {
    if (!selection.value) {
      // No selection -> toggle global default formatting
      (rgbStore.baseFormatting as any)[flag] = !(rgbStore.baseFormatting as any)[flag];
      return;
    }

    // Selection exists -> apply toggle to the selected range, splitting/merging as needed
    const { start, end } = selection.value;

    // Collect all boundaries
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

      // find a segment that fully covers [a,b)
      const covering = rgbStore.formatting.find((s) => s.start <= a && s.end >= b);
      const fmt = covering ? { ...rgbStore.baseFormatting, ...covering } : { ...rgbStore.baseFormatting };

      // if this interval is inside selection, toggle the flag
      if (a < end && b > start) {
        (fmt as any)[flag] = !(fmt as any)[flag];
      }

      // if resulting formatting equals default, skip (no segment)
      const defaultNorm = rgbStore.baseFormatting;
      const isDefault = ALL_FORMATTING_KEYS.every((k) => fmt[k] === defaultNorm[k]) && fmt.font === defaultNorm.font;
      if (!isDefault) {
        newSegments.push({ ...fmt, start: a, end: b });
      }
    }

    // Merge adjacent segments with identical formatting
    const merged = [];
    for (const seg of newSegments.sort((x: any, y: any) => x.start - y.start)) {
      const last = merged[merged.length - 1];
      if (last && last.end === seg.start && ALL_FORMATTING_KEYS.every((k) => last[k] === seg[k]) && last.font === seg.font) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    }

    rgbStore.formatting = merged;
  });

  const setFont = $((fontVal: string | undefined) => {
    if (!selection.value) {
      rgbStore.baseFormatting.font = fontVal;
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

      const covering = rgbStore.formatting.find((s) => s.start <= a && s.end >= b);
      const fmt = covering ? { ...rgbStore.baseFormatting, ...covering } : { ...rgbStore.baseFormatting };

      if (a < end && b > start) {
        fmt.font = fontVal;
      }

      const defaultNorm = rgbStore.baseFormatting;
      const isDefault = ALL_FORMATTING_KEYS.every((k) => fmt[k] === defaultNorm[k]) && fmt.font === defaultNorm.font;
      if (!isDefault) {
        newSegments.push({ ...fmt, start: a, end: b });
      }
    }

    const merged = [];
    for (const seg of newSegments.sort((x: any, y: any) => x.start - y.start)) {
      const last = merged[merged.length - 1];
      if (last && last.end === seg.start && ALL_FORMATTING_KEYS.every((k) => last[k] === seg[k]) && last.font === seg.font) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    }

    rgbStore.formatting = merged;
  });

  const clearFormatting = $(() => {
    if (!selection.value) {
      rgbStore.baseFormatting = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        obfuscate: false,
        font: undefined,
      };
      rgbStore.formatting = [];
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

      const covering = rgbStore.formatting.find((s) => s.start <= a && s.end >= b);
      const fmt = covering ? { ...rgbStore.baseFormatting, ...covering } : { ...rgbStore.baseFormatting };

      if (a < end && b > start) {
        for (const k of ALL_FORMATTING_KEYS) {
          (fmt as any)[k] = false;
        }
        fmt.font = undefined;
      }

      const defaultNorm = rgbStore.baseFormatting;
      const isDefault = ALL_FORMATTING_KEYS.every((k) => fmt[k] === defaultNorm[k]) && fmt.font === defaultNorm.font;
      if (!isDefault) {
        newSegments.push({ ...fmt, start: a, end: b });
      }
    }

    const merged = [];
    for (const seg of newSegments.sort((x: any, y: any) => x.start - y.start)) {
      const last = merged[merged.length - 1];
      if (last && last.end === seg.start && ALL_FORMATTING_KEYS.every((k) => last[k] === seg[k]) && last.font === seg.font) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    }

    rgbStore.formatting = merged;
  });

  const formattingButtons: { key: FormatKey; label: string; icon: typeof Bold }[] = [
    { key: 'bold', label: t('rgb.formatting.bold@@Bold'), icon: Bold },
    { key: 'italic', label: t('rgb.formatting.italic@@Italic'), icon: Italic },
    { key: 'underline', label: t('rgb.formatting.underline@@Underline'), icon: Underline },
    { key: 'strikethrough', label: t('rgb.formatting.strikethrough@@Strikethrough'), icon: Strikethrough },
    { key: 'obfuscate', label: t('rgb.formatting.obfuscate@@Obfuscate'), icon: Wand2 },
  ];

  return <>
    <div class={{
      'lum-card p-1 flex-row gap-1 items-center justify-evenly transition-colors duration-200': true,
      'lum-bg-blue/20': !!selection.value,
    }}
    id="font">
      <SelectMenuRaw
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
    </div>
    <div class={{
      'lum-card p-1 flex-row gap-1 items-center justify-evenly transition-colors duration-200': true,
      '*:lum-btn *:lum-bg-transparent *:p-2 *:group *:rounded-lum-1': true,
      'lum-bg-blue/20': !!selection.value,
    }}
    id="formatting">
      {formattingButtons.map(({ key, label, icon: Icon }) => (
        <button key={key} type="button" aria-pressed={formatting[key]} title={label}
          class={{
            'lum-grad-bg-lum-accent/100!': formatting[key],
          }}
          onClick$={() => toggleFlag(key)}
        >
          <Icon size={16} />
          <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
            {label} {getFormatLabel(key)}
          </span>
        </button>
      ))}
    </div>
    <div class={{
      'lum-card p-1 flex-row gap-1 items-center justify-evenly transition-colors duration-200': true,
      '*:lum-btn *:lum-bg-transparent *:p-2 *:group *:rounded-lum-1': true,
    }} id="clear-formatting">
      <button type="button" id="clear"
        title={t('rgb.formatting.clear@@Clear Formatting')}
        onClick$={clearFormatting}>
        <Eraser size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.clear@@Clear Formatting')}
        </span>
      </button>
    </div>
  </>;
});