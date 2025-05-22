import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { OnThisPage } from '~/components/docs/ThisPage';
import { MarkdownItems, MDX } from '../docs/layout';

export const useMarkdownItems = routeLoader$(async () => {
  const rawData = await Promise.all(
    Object.entries(import.meta.glob<{ frontmatter?: MDX }>('/src/routes/docs/**/*.{md,mdx}')).map(
      async ([k, v]) => {
        return [
          k
            .replace('/src/routes', '')
            .replace('index.mdx', '')
            .replace('index.md', ''),
          await v(),
        ] as const;
      },
    ),
  );

  const markdownItems: MarkdownItems = {};
  rawData.map(([k, v]) => {
    if (v.frontmatter) {
      markdownItems[k] = {
        title: v.frontmatter.title,
        contributors: v.frontmatter.contributors,
        created_at: v.frontmatter.created_at,
        updated_at: v.frontmatter.updated_at,
      };
    }
  });
  return markdownItems;
});

export default component$(() => {
  return (
    <div class="flex gap-12 xl:gap-20 items-stretch lg:pl-0 xl:pr-0 min-h-dvh">
      <main class="contents ">
        <div class="w-full mt-48 sm:mt-30 min-w-4 max-w-5xl ml-auto">
          <article class="px-4 md">
            <Slot />
          </article>
        </div>
      </main>
      <OnThisPage readOnly />
    </div>
  );
});