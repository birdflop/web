import { component$, Slot } from '@qwik.dev/core';
import { routeLoader$, useLocation } from '@qwik.dev/router';
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

export const menuItemPriority: {
  [key: string]: number;
} = {
  Overview: 1,
  Panel: 2,
  Games: 3,
  'Non Profit': 4,
  'Open Source': 5,
  Rgbirdflop: 6,
};

export const getMarkdownItems = async () => {
  const rawData = await Promise.all(
    Object.entries(
      import.meta.glob<{ frontmatter?: MDX }>('/src/routes/docs/**/*.{md,mdx}')
    ).map(async ([k, v]) => {
      return [
        k
          .replace('/src/routes', '')
          .replace('index.mdx', '')
          .replace('index.md', ''),
        await v(),
      ] as const;
    })
  );

  const markdownItems: MarkdownItems = {};
  rawData.forEach(([k, v]) => {
    // skip marksdown cheatsheet and extras
    if (k.includes('extras')) return;
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
};

export const useMarkdownItems = routeLoader$(() => getMarkdownItems());

export default component$(() => {
  const markdownItems = useMarkdownItems();
  const { url } = useLocation();
  const currentPath = url.pathname;
  const currentItem = Object.entries(markdownItems.value).find(([k]) => {
    return currentPath == k;
  });
  const title = currentItem ? currentItem[1].title : 'Docs';
  return (
    <div class="flex min-h-dvh items-stretch gap-12 lg:pl-0 xl:gap-20 xl:pr-0">
      <DocsSidebar />
      <main class="markdown contents">
        <div class="mt-48 w-full min-w-48 sm:mt-30">
          <Breadcrumbs />
          <article class="px-4">
            <h1 class="border-b border-gray-700 pb-4 text-center font-bold">
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
