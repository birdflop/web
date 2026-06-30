import { $, component$, useContext } from '@builder.io/qwik';
import { Bold, Eraser, Italic, Strikethrough, Underline, Wand2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { selectionContext } from './Input';
import { FormatSegment, Formatting } from '@birdflop/rgbirdflop';

export default component$(() => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const selection = useContext(selectionContext);
  type FormatKey = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'obfuscate';

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
    const keys: FormatKey[] = ['bold', 'italic', 'underline', 'strikethrough', 'obfuscate'];
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

    for (const k of keys) {
      if (intervals.length === 0) {
        result[k] = defaultFmt[k];
      } else {
        result[k] = intervals.every((iv) => iv[k]);
      }
    }

    return result;
  };

  const formatting = computeSelectionFormatting();

  const toggleFlag = $((flag: FormatKey) => {
    const keys: FormatKey[] = ['bold', 'italic', 'underline', 'strikethrough', 'obfuscate'];

    if (!selection.value) {
      // No selection -> toggle global default formatting
      rgbStore.baseFormatting[flag] = !rgbStore.baseFormatting[flag];
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
        fmt[flag] = !fmt[flag];
      }

      // if resulting formatting equals default, skip (no segment)
      const defaultNorm = rgbStore.baseFormatting;
      const isDefault = keys.every((k) => fmt[k] === defaultNorm[k]);
      if (!isDefault) {
        newSegments.push({ ...fmt, start: a, end: b });
      }
    }

    // Merge adjacent segments with identical formatting
    const merged = [];
    for (const seg of newSegments.sort((x: any, y: any) => x.start - y.start)) {
      const last = merged[merged.length - 1];
      if (last && last.end === seg.start && keys.every((k) => last[k] === seg[k])) {
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
      };
      rgbStore.formatting = [];
      return;
    }

    const { start, end } = selection.value;
    const keys: FormatKey[] = ['bold', 'italic', 'underline', 'strikethrough', 'obfuscate'];

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
        for (const k of keys) {
          fmt[k] = false;
        }
      }

      const defaultNorm = rgbStore.baseFormatting;
      const isDefault = keys.every((k) => fmt[k] === defaultNorm[k]);
      if (!isDefault) {
        newSegments.push({ ...fmt, start: a, end: b });
      }
    }

    const merged = [];
    for (const seg of newSegments.sort((x: any, y: any) => x.start - y.start)) {
      const last = merged[merged.length - 1];
      if (last && last.end === seg.start && keys.every((k) => last[k] === seg[k])) {
        last.end = seg.end;
      } else {
        merged.push({ ...seg });
      }
    }

    rgbStore.formatting = merged;
  });

  return (
    <div class={{
      'lum-card p-1 flex-row gap-1 items-center justify-evenly transition-colors duration-200': true,
      '*:lum-btn *:lum-bg-transparent *:p-2 *:group *:rounded-lum-1': true,
      'lum-bg-blue/20': !!selection.value,
    }}
    id="formatting">
      <button type="button" id="bold"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.bold,
        }}
        aria-pressed={formatting.bold} title={t('rgb.formatting.bold@@Bold')}
        onClick$={() => toggleFlag('bold')}
      >
        <Bold size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.bold@@Bold')}{getFormatLabel('bold')}
        </span>
      </button>
      <button type="button" id="italic"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.italic,
        }}
        aria-pressed={formatting.italic} title={t('rgb.formatting.italic@@Italic')}
        onClick$={() => toggleFlag('italic')}>
        <Italic size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.italic@@Italic')}{getFormatLabel('italic')}
        </span>
      </button>
      <button type="button" id="underline"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.underline,
        }}
        aria-pressed={formatting.underline} title={t('rgb.formatting.underline@@Underline')}
        onClick$={() => toggleFlag('underline')}>
        <Underline size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.underline@@Underline')}{getFormatLabel('underline')}
        </span>
      </button>
      <button type="button" id="strikethrough"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.strikethrough,
        }}
        aria-pressed={formatting.strikethrough} title={t('rgb.formatting.strikethrough@@Strikethrough')}
        onClick$={() => toggleFlag('strikethrough')}>
        <Strikethrough size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.strikethrough@@Strikethrough')}{getFormatLabel('strikethrough')}
        </span>
      </button>
      <button type="button" id="obfuscate"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.obfuscate,
        }}
        aria-pressed={formatting.obfuscate} title={t('rgb.formatting.obfuscate@@Obfuscate')}
        onClick$={() => toggleFlag('obfuscate')}>
        <Wand2 size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.obfuscate@@Obfuscate')}{getFormatLabel('obfuscate')}
        </span>
      </button>
      <button type="button" id="clear"
        title={t('rgb.formatting.clear@@Clear Formatting')}
        onClick$={clearFormatting}>
        <Eraser size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.clear@@Clear Formatting')}
        </span>
      </button>
    </div>
  );
});