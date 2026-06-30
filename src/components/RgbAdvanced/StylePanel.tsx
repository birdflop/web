import { $, component$, useComputed$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { MousePointerClick, Palette, Type } from 'lucide-icons-qwik';
import { combinedText } from './model';
import { restoreSelection } from './dom';
import SegmentColorEditor from './SegmentColorEditor';
import AdvancedFormatting from './AdvancedFormatting';
import SegmentInspector from './SegmentInspector';
import { advancedStoreContext } from '~/routes/resources/rgb/beta/index';
import { selectionContext } from '~/components/Rgbirdflop/Input';

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);
  const selection = useContext(selectionContext);

  const hasSel = useComputed$(() => !!selection.value && selection.value.end > selection.value.start);
  const selText = useComputed$(() => {
    if (!selection.value) return '';
    const txt = combinedText(store.segments).slice(selection.value.start, selection.value.end);
    return txt.length > 24 ? txt.slice(0, 24) + '…' : txt;
  });

  const selectAll = $(() => {
    const len = combinedText(store.segments).length;
    if (!len) return;
    selection.value = { start: 0, end: len, segmentIndex: 0 };
    void restoreSelection(0, len);
  });

  return (
    <div class="flex flex-col gap-4">
      {/* Contextual header: what you're styling + select-all shortcut */}
      <div class="flex items-center justify-between gap-3 flex-wrap">
        {hasSel.value
          ? <p class="flex items-center gap-2 flex-wrap min-w-0">
            <span class="text-lum-text-secondary text-sm">{t('rgb.beta.styling@@Styling')}</span>
            <span class="font-mc lum-grad-bg-lum-input-bg rounded-lum-1 px-2 py-0.5 max-w-50 truncate">
              {selText.value.replace(/ /g, '␣') || '␣'}
            </span>
          </p>
          : <p class="flex items-center gap-2 text-lum-text-secondary text-sm">
            <MousePointerClick size={18} class="shrink-0" />
            {t('rgb.beta.highlightHint@@Highlight letters in the box above to color & format just that part.')}
          </p>
        }
        <button class="lum-btn lum-grad-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg rounded-lum p-2 text-sm shrink-0"
          onClick$={selectAll}>
          {t('rgb.beta.selectAll@@Select all')}
        </button>
      </div>

      {hasSel.value && <>
        <div class="flex flex-col gap-2">
          <h4 class="flex items-center gap-2 text-xs font-bold text-lum-text-secondary uppercase tracking-wider">
            <Palette size={15} /> {t('rgb.beta.color@@Color')}
          </h4>
          <SegmentColorEditor />
        </div>
      </>}
    </div>
  );
});

export const FormattingPanel = component$(() => {
  const t = inlineTranslate();
  const selection = useContext(selectionContext);

  const hasSel = useComputed$(() => !!selection.value && selection.value.end > selection.value.start);

  return (
    <div class="flex flex-col gap-4">
      {hasSel.value && (
        <div class="flex flex-col gap-2">
          <h4 class="flex items-center gap-2 text-xs font-bold text-lum-text-secondary uppercase tracking-wider">
            <Type size={15} /> {t('rgb.beta.formatting@@Formatting')}
          </h4>
          <AdvancedFormatting />
        </div>
      )}

      <SegmentInspector />
    </div>
  );
});
