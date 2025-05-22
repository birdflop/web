import { component$, Slot, useStyles$ } from '@builder.io/qwik';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import styles from './docs.css?inline';
import { DocsSidebar } from '~/components/docs/SideBar';
import { Breadcrumbs } from '~/components/docs/Breadcrumbs';
import Contributors from '~/components/docs/Contributors';
import { OnThisPage } from '~/components/docs/ThisPage';

type MDX = {
  title: string;
  contributors?: string[];
  created_at?: string;
  updated_at?: string;
};

export type MarkdownItems = Record<string, MDX>;

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
  useStyles$(styles);
  const markdownItems = useMarkdownItems();
  const { url } = useLocation();
  const currentPath = url.pathname;
  const currentItem = Object.entries(markdownItems.value).find(([k]) => {
    return currentPath == k;
  });
  const title = currentItem ? currentItem[1].title : 'Docs';
  return (
    <div class="flex gap-12 xl:gap-20 items-stretch content-container lg:pl-0 xl:pr-0 docs min-h-dvh">
      <DocsSidebar />
      <main class="contents">
        <div class="docs-container w-full mt-40 sm:mt-24">
          <Breadcrumbs />
          <article class="px-4">
            <h1 class="font-bold text-center border-b border-gray-700 pb-4">
              {title}
            </h1>
            <Slot />
            <Contributors />
          </article>
        </div>
        <OnThisPage />
      </main>
    </div>
  );
});