import { component$, useStore, $, useVisibleTask$ } from '@qwik.dev/core';
import { type ContentMenu, useLocation } from '@qwik.dev/router';
import { useMarkdownItems } from '~/routes/docs/layout';
import { buildMenu } from '~/util/docs';
import { MenuItems } from './Menuitems';
import Book from 'lucide-icons-qwik/icons/Book';
import Menu from 'lucide-icons-qwik/icons/Menu';
import Search from 'lucide-icons-qwik/icons/Search';

export const DocsSidebar = component$(() => {
  const store = useStore({
    sideMenuOpen: false,
    scrollPosition: 0,
    menuItems: [] as ContentMenu[],
  });

  const { url } = useLocation();
  const markdownItems = useMarkdownItems();

  const saveScrollPosition = $(() => {
    try {
      const scrollTop = document.getElementById('docs-sidebar')?.scrollTop || 0;
      sessionStorage.setItem('docs-sidebar', String(scrollTop));
      store.scrollPosition = scrollTop;
    } catch (err) {
      console.error('Error saving sidebar scroll position:', err);
    }
  });

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (markdownItems.value && Object.keys(markdownItems.value).length > 0) {
      store.menuItems = buildMenu(markdownItems.value);
    } else {
      console.log('No markdown items available to build menu');
    }

    try {
      const val = sessionStorage.getItem('docs-sidebar');
      const savedScroll = !val || /null|NaN/.test(val) ? 0 : +val;
      const el = document.getElementById('docs-sidebar');
      if (el) {
        el.scrollTop = savedScroll;
        el.classList.remove('invisible');
        store.scrollPosition = savedScroll;
      }

      const handleResize = () => {
        if (window.innerWidth >= 1024 && store.sideMenuOpen) {
          store.sideMenuOpen = false;
          document.body.classList.remove('overflow-hidden');
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (err) {
      console.error('Error loading sidebar scroll position:', err);
    }
  });

  return (
    <aside class="lum-card fixed top-0 z-40 w-full rounded-none border-l-0 px-0 pt-14 pb-0 backdrop-blur-lg lg:sticky lg:h-dvh lg:w-100 lg:border-y-0 lg:px-6 lg:pt-20">
      <nav id="docs-sidebar" class="invisible relative min-h-full">
        <div class="flex items-center gap-3 border-b border-gray-700 px-2 py-3">
          <Book class="ml-2 lg:ml-0" />
          <h5 class="flex flex-1">Documentation</h5>

          <button
            class="lum-btn lum-bg-transparent p-2 lg:hidden"
            onClick$={() => {
              store.sideMenuOpen = !store.sideMenuOpen;
              const abortController = new AbortController();
              document.addEventListener(
                'click',
                (e) => {
                  if (
                    !e
                      .composedPath()
                      .includes(document.querySelector('aside')!) ||
                    e.target instanceof HTMLAnchorElement
                  ) {
                    store.sideMenuOpen = false;
                    abortController.abort();
                  }
                },
                { signal: abortController.signal }
              );
            }}
            aria-label="Toggle Menu"
          >
            <Menu />
          </button>
        </div>

        <div
          class={{
            'mx-4 my-4 flex-col gap-3 lg:mx-0': true,
            'hidden lg:flex': !store.sideMenuOpen,
            flex: store.sideMenuOpen,
          }}
        >
          <div class="flex items-center gap-3">
            <Search size={24} />
            <input
              type="text"
              placeholder="Search docs..."
              class="lum-input lum-btn-p-1 w-full"
            />
          </div>

          {store.menuItems.length > 0 ? (
            <MenuItems
              items={store.menuItems}
              pathname={url.pathname}
              markdownItems={markdownItems.value}
              onClick$={saveScrollPosition}
            />
          ) : (
            <div class="py-4 text-center">
              <p>No documentation found</p>
              <p class="mt-2 text-sm">
                Add markdown files to your docs directory
              </p>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
});

export function createBreadcrumbs(
  menu: ContentMenu | undefined,
  pathname: string
) {
  if (!menu?.items) return [];

  function findPath(
    items: ContentMenu[],
    path: ContentMenu[] = []
  ): ContentMenu[] | null {
    for (const item of items) {
      if (item.href === pathname) {
        return [...path, item];
      }

      if (item.items?.length) {
        const result = findPath(item.items, [...path, item]);

        if (result) return result;
      }
    }

    return null;
  }

  const result = findPath(menu.items);
  return result || [];
}
