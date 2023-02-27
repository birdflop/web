import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="text-center justify-center">
        <div class="mt-10 space-y-3 min-h-[60px]">
          <h1 class="font-bold tracking-tight text-purple-100 text-4xl mb-12 ease-in-out">
            404: Page not found
          </h1>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'A Minecraft Multitool',
  meta: [
    {
      name: 'description',
      content: 'A Minecraft multitool for you'
    },
    {
      name: 'og:description',
      content: 'A Minecraft multitool for you'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}