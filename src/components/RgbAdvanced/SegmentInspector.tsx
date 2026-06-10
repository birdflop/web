import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { sortColors } from '@birdflop/rgbirdflop';
import { ChevronLeft, ChevronRight, Layers, Trash } from 'lucide-icons-qwik';
import { advancedStoreContext, selectionContext } from './context';
import { deleteSegment, segmentRange, swapSegments, type AdvancedSegment } from './model';
import { restoreSelection } from './dom';

function swatchStyle(seg: AdvancedSegment): string {
  if (seg.colorMode === 'none' || seg.colors.length === 0) {
    return 'repeating-linear-gradient(45deg, #888 0 4px, #555 4px 8px)';
  }
  if (seg.colorMode === 'solid') return seg.colors[0].hex;
  return `linear-gradient(to right, ${sortColors(seg.colors).map((c) => `${c.hex} ${c.pos}%`).join(', ')})`;
}

const BADGES: { flag: keyof AdvancedSegment; label: string }[] = [
  { flag: 'bold', label: 'B' },
  { flag: 'italic', label: 'I' },
  { flag: 'underline', label: 'U' },
  { flag: 'strikethrough', label: 'S' },
  { flag: 'obfuscate', label: 'K' },
];

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);
  const selection = useContext(selectionContext);

  // Only one part means nothing meaningful to manage yet — keep the UI uncluttered.
  if (store.segments.length <= 1) return null;

  return (
    <div class="flex flex-col gap-2 border-t border-lum-border/10 pt-4">
      <h4 class="flex items-center gap-2 text-xs font-bold text-lum-text-secondary uppercase tracking-wider">
        <Layers size={15} /> {t('rgb.beta.parts@@Styled parts')}
        <span class="font-normal normal-case tracking-normal text-xs lowercase">
          {t('rgb.beta.partsHint@@— click one to edit it')}
        </span>
      </h4>
      <div class="flex flex-wrap gap-2">
        {store.segments.map((seg, i) => {
          const range = segmentRange(store.segments, i);
          const active = selection.value.start === range.start && selection.value.end === range.end;
          return (
            <div key={`part-${i}`} class={{
              'flex items-center rounded-lum-1 border transition-colors overflow-hidden': true,
              'border-lum-accent lum-grad-bg-lum-accent/15': active,
              'border-lum-border/20 hover:border-lum-border/40': !active,
            }}>
              <button class="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 min-w-0"
                title={t('rgb.beta.selectSegment@@Click to edit this part')}
                onClick$={() => {
                  selection.value = { start: range.start, end: range.end, segmentIndex: i };
                  void restoreSelection(range.start, range.end);
                }}>
                <span class="w-4 h-4 rounded-sm shrink-0 border border-lum-border/20" style={`background: ${swatchStyle(seg)};`} />
                <span class="font-mc truncate max-w-32">
                  {seg.text.trim() === '' ? '␣'.repeat(Math.min(seg.text.length, 4)) : seg.text}
                </span>
                <span class="flex gap-0.5 shrink-0">
                  {BADGES.filter((b) => seg[b.flag]).map((b) => (
                    <span key={b.label} class="text-[9px] font-bold text-lum-text-secondary">{b.label}</span>
                  ))}
                </span>
              </button>
              {active &&
                <div class="flex items-center gap-0.5 pr-1 border-l border-lum-border/20 pl-1">
                  <button class="lum-btn p-1 rounded-sm" disabled={i === 0} title={t('rgb.beta.moveLeft@@Move left')}
                    onClick$={() => { store.segments = swapSegments(store.segments, i, i - 1); }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button class="lum-btn p-1 rounded-sm" disabled={i >= store.segments.length - 1} title={t('rgb.beta.moveRight@@Move right')}
                    onClick$={() => { store.segments = swapSegments(store.segments, i, i + 1); }}>
                    <ChevronRight size={14} />
                  </button>
                  <button class="lum-btn p-1 rounded-sm hover:lum-bg-red" title={t('rgb.beta.deleteSegment@@Delete this part')}
                    onClick$={() => { store.segments = deleteSegment(store.segments, i); }}>
                    <Trash size={14} />
                  </button>
                </div>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
});
