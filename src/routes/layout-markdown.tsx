import { component$, Slot } from '@builder.io/qwik';
import { OnThisPage } from '~/components/docs/ThisPage';

import Layout from './layout';

// Re-export route loaders used by Layout component
export * from './layout';

export default component$(() => {
  return (
    <Layout>
      <div class="flex min-h-dvh items-stretch gap-12 lg:pl-0 xl:gap-20 xl:pr-0">
        <main class="contents">
          <div class="mt-48 ml-auto w-full max-w-5xl min-w-4 sm:mt-30">
            <article class="markdown px-4">
              <Slot />
            </article>
          </div>
        </main>
        <OnThisPage readOnly />
      </div>
    </Layout>
  );
});
