import { component$, useComputed$, useContext } from '@builder.io/qwik';
import { Bold, Italic, Strikethrough, Underline, Wand2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { selectionFlags, toggleFormat, type FormatFlag } from './model';
import { restoreSelection } from './dom';

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);
  const selection = useContext(selectionContext);

  const flags = useComputed$(() =>
    selectionFlags(store.segments, selection.value.start, selection.value.end),
  );

  const buttons: { flag: FormatFlag; label: string; icon: typeof Bold }[] = [
    { flag: 'bold', label: t('rgb.formatting.bold@@Bold'), icon: Bold },
    { flag: 'italic', label: t('rgb.formatting.italic@@Italic'), icon: Italic },
    { flag: 'underline', label: t('rgb.formatting.underline@@Underline'), icon: Underline },
    { flag: 'strikethrough', label: t('rgb.formatting.strikethrough@@Strikethrough'), icon: Strikethrough },
    { flag: 'obfuscate', label: t('rgb.formatting.obfuscate@@Obfuscate'), icon: Wand2 },
  ];

  return (
    <div class="flex flex-wrap gap-1.5">
      {buttons.map(({ flag, label, icon: Icon }) => (
        <button key={flag} type="button" aria-pressed={flags.value[flag]} title={label}
          class={{
            'lum-btn rounded-lum-1 px-3 py-2 gap-2 text-sm': true,
            'lum-grad-bg-lum-accent!': flags.value[flag],
            'lum-bg-lum-input-bg hover:lum-bg-lum-card-bg': !flags.value[flag],
          }}
          onClick$={() => {
            const { start, end } = selection.value;
            if (end <= start) return;
            store.segments = toggleFormat(store.segments, start, end, flag);
            void restoreSelection(start, end);
          }}>
          <Icon size={16} />
          <span class="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
});
