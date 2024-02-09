import { component$ } from '@builder.io/qwik';

export default component$(({ extraClass }: any) => {
  return (
    <svg viewBox="0 0 24 24" class={extraClass} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  );
});