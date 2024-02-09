import { component$ } from '@builder.io/qwik';

export default component$(({ extraClass }: any) => {
  return (
    <svg xml:space="preserve" class={extraClass} fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1.5" clip-rule="evenodd" viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path fill="none" stroke="currentColor" stroke-width="2" d="m12 18 6 2 3-17L2 14l6 2"></path>
      <path stroke="currentColor" stroke-width="2" d="m9 21-1-5 4 2-3 3Z"></path>
      <path fill="currentColor" d="m12 18-4-2 10-9-6 11Z"></path>
    </svg>

  );
});