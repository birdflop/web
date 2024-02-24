import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useAuthSession } from '~/routes/plugin@auth';

export default component$(() => {

  const session = useAuthSession();

  if (session.value?.user) {
    return (
      <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]">
        <div class="text-center justify-center">
          <div id="noise" class="flex relative justify-center align-center">
            <div class="mt-10 space-y-3 min-h-[60px]">
              <h1 class="text-gray-100 text-6xl font-bold mb-6 fade-in animation-delay-100">
                session
              </h1>
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]">
        <div class="text-center justify-center">
          <div id="noise" class="flex relative justify-center align-center">
            <div class="mt-10 space-y-3 min-h-[60px]">
              <h1 class="text-gray-100 text-6xl font-bold mb-6 fade-in animation-delay-100">
                no session
              </h1>
            </div>
          </div>
        </div>
      </section>
    );
  }
});

export const head: DocumentHead = {
  title: 'Minecraft Hosting & Resources',
  meta: [
    {
      name: 'description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
