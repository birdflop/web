import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { sortColors } from '@birdflop/rgbirdflop';
import { ChevronLeft, ChevronRight, Trash } from 'lucide-icons-qwik';
import { deleteSegment, segmentRange, swapSegments, type SegmentType } from './model';
import { restoreSelection } from './dom';
import { rgbSegmentsContext } from '~/routes/resources/rgb/beta/index';
import { selectionContext } from '~/components/Rgbirdflop/Input';

function swatchStyle(seg: SegmentType): string {
  if (seg.colorMode === 'none' || seg.colors.length === 0) {
    return 'repeating-linear-gradient(45deg, #888 0 4px, #555 4px 8px)';
  }
  if (seg.colorMode === 'solid') return seg.colors[0].hex;
  const stops = sortColors(seg.colors).map((c) => c.hex + ' ' + c.pos + '%').join(', ');
  return 'linear-gradient(to right, ' + stops + ')';
}

export default component$(() => {
  const t = inlineTranslate();
  const rgbSegments = useContext(rgbSegmentsContext);
  const selection = useContext(selectionContext);

  // Only one part means nothing meaningful to manage yet — keep the UI uncluttered.
  if (rgbSegments.value.length <= 1) return null;

  return (
    <div class="flex flex-col gap-2 border-t border-lum-border/10 pt-4">
      <div class="flex flex-wrap gap-2">
        {rgbSegments.value.map((seg, i) => {
          const range = segmentRange(rgbSegments.value, i);
          const active = selection.value ? (selection.value.start === range.start && selection.value.end === range.end) : false;
          return (
            <div key={`part-${i}`} class={{
              'flex items-center rounded-lum-1 border transition-colors overflow-hidden': true,
              'border-lum-accent lum-grad-bg-lum-accent/15': active,
              'border-lum-border/20 hover:border-lum-border/40': !active,
            }}>
              <button class="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 min-w-0"
                title={t('rgb.advanced.selectSegment@@Click to edit this part')}
                onClick$={() => {
                  selection.value = { start: range.start, end: range.end, segmentIndex: i };
                  void restoreSelection(range.start, range.end);
                }}>
                <span class="w-4 h-4 rounded-sm shrink-0 border border-lum-border/20" style={`background: ${swatchStyle(seg)};`} />
                <span class="font-mc truncate max-w-32">
                  {seg.text.trim() === '' ? '␣'.repeat(Math.min(seg.text.length, 4)) : seg.text}
                </span>
              </button>
              {active &&
                <div class="flex items-center gap-0.5 pr-1 border-l border-lum-border/20 pl-1">
                  <button class="lum-btn p-1 rounded-sm" disabled={i === 0} title={t('rgb.advanced.moveLeft@@Move left')}
                    onClick$={() => { rgbSegments.value = swapSegments(rgbSegments.value, i, i - 1); }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button class="lum-btn p-1 rounded-sm" disabled={i >= rgbSegments.value.length - 1} title={t('rgb.advanced.moveRight@@Move right')}
                    onClick$={() => { rgbSegments.value = swapSegments(rgbSegments.value, i, i + 1); }}>
                    <ChevronRight size={14} />
                  </button>
                  <button class="lum-btn p-1 rounded-sm hover:lum-bg-red" title={t('rgb.advanced.deleteSegment@@Delete this part')}
                    onClick$={() => { rgbSegments.value = deleteSegment(rgbSegments.value, i); }}>
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
