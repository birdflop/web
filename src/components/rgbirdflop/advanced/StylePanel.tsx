import { $, component$, useComputed$, useContext } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import MousePointerClick from 'lucide-icons-qwik/icons/MousePointerClick';
import Palette from 'lucide-icons-qwik/icons/Palette';
import { combinedText, rgbSegmentsContext } from './rgbSegments';
import SegmentColorEditor from './SegmentColorEditor';
import { selectionContext } from '~/components/rgbirdflop/Input';

export default component$(() => {
  const t = inlineTranslate();
  const rgbSegments = useContext(rgbSegmentsContext);
  const selection = useContext(selectionContext);

  const hasSel = useComputed$(
    () => !!selection.value && selection.value.end > selection.value.start
  );
  const selText = useComputed$(() => {
    if (!selection.value) return '';
    const txt = combinedText(rgbSegments.value).slice(
      selection.value.start,
      selection.value.end
    );
    return txt.length > 24 ? txt.slice(0, 24) + '…' : txt;
  });

  const selectAll = $(() => {
    const len = combinedText(rgbSegments.value).length;
    if (!len) return;
    selection.value = { start: 0, end: len, segmentIndex: 0 };
  });

  return (
    <div class="flex flex-col gap-4">
      {/* Contextual header: what you're styling + select-all shortcut */}
      <div class="flex flex-wrap items-center justify-between gap-3">
        {hasSel.value ? (
          <p class="flex min-w-0 flex-wrap items-center gap-2">
            <span class="text-lum-text-secondary text-sm">
              {t('rgb.advanced.styling@@Styling')}
            </span>
            <span class="font-mc lum-grad-bg-lum-input-bg rounded-lum-1 max-w-50 truncate px-2 py-0.5">
              {selText.value.replace(/ /g, '␣') || '␣'}
            </span>
          </p>
        ) : (
          <p class="text-lum-text-secondary flex items-center gap-2 text-sm">
            <MousePointerClick size={18} class="shrink-0" />
            {t(
              'rgb.advanced.highlightHint@@Highlight letters in the box above to color & format just that part.'
            )}
          </p>
        )}
        <button
          class="lum-btn lum-grad-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg rounded-lum shrink-0 p-2 text-sm"
          onClick$={selectAll}
        >
          {t('rgb.advanced.selectAll@@Select all')}
        </button>
      </div>

      {hasSel.value && (
        <>
          <div class="flex flex-col gap-2">
            <h4 class="text-lum-text-secondary flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Palette size={15} />
              {t('rgb.colors.color@@Color')}
            </h4>
            <SegmentColorEditor />
          </div>
        </>
      )}
    </div>
  );
});
