import { $ } from '@builder.io/qwik';

export const ADVANCED_INPUT_ID = 'advanced-input';

/** Re-applies the textarea selection after a store mutation (Qwik may reset the caret). */
export const restoreSelection = $((start: number, end: number) => {
  const el = document.getElementById(ADVANCED_INPUT_ID) as HTMLTextAreaElement | null;
  if (!el) return;
  requestAnimationFrame(() => {
    try {
      el.focus();
      el.setSelectionRange(start, end);
    } catch {
      /* noop */
    }
  });
});
