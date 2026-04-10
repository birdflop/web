import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { Loader2 } from 'lucide-icons-qwik';
import { generateHead } from '~/root';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.open('https://bit.ly/acornmc1');
    window.open('https://bit.ly/acornmc2');
    window.open('https://bit.ly/acornmc3');
    window.open('https://bit.ly/acornmc6');
  });

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-20">
      <h1  class="font-extrabold text-5xl my-6">
        AcornMC Vote
      </h1>
      <p>
        Opening Links
      </p>
      <Loader2 class="animate-spin" />
    </section>
  );
});

export const head = generateHead({
  title: 'AcornMC Vote',
  description: 'Vote for AcornMC!',
});