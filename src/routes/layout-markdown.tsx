import { component$, Slot } from '@builder.io/qwik';
import { OnThisPage } from '~/components/docs/ThisPage';

import Layout from './layout';

export default component$(() => {
  return (
    <Layout>
      <div class="flex gap-12 xl:gap-20 items-stretch lg:pl-0 xl:pr-0 min-h-dvh">
        <main class="contents">
          <div class="w-full mt-48 sm:mt-30 min-w-4 max-w-5xl ml-auto">
            <article class="px-4 markdown">
              <Slot />
            </article>
          </div>
        </main>
        <OnThisPage readOnly />
      </div>
    </Layout>
  );
});