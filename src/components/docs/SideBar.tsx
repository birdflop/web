import { component$, useOnDocument, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { type ContentMenu, useLocation } from '@builder.io/qwik-city';
import { useMarkdownItems, type MarkdownItems } from '~/routes/docs/layout';
import { MenuItems } from './Menuitems';
import { Menu, Search, X } from 'lucide-icons-qwik';

function capitalizeWords(string: string) {
  return string
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const buildMenuFromMarkdownItems = (markdownItems: MarkdownItems): ContentMenu[] => {
  const paths = Object.keys(markdownItems).sort((a, b) => a.length - b.length);
  console.log('Paths:', paths);

  const pathsByDir = new Map<string, string[]>();

  paths.forEach(path => {
    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length < 2) {
      return;
    };

    parts.shift();

    const parentPath = parts.length > 1
      ? `/docs/${parts.slice(0, parts.length - 1).join('/')}/`
      : '/docs/';

    if (!pathsByDir.has(parentPath)) {
      pathsByDir.set(parentPath, []);
    }

    pathsByDir.get(parentPath)!.push(path);
  });

  const dirWithSubdirs = new Set<string>();

  pathsByDir.forEach((dirPaths) => {
    dirPaths.forEach(path => {
      const cleanPath = path.endsWith('/') ? path : `${path}/`;
      const parts = cleanPath.split('/').filter(Boolean);

      if (parts.length > 2) {
        const parentDir = `/docs/${parts[1]}/`;
        dirWithSubdirs.add(parentDir);
      }
    });
  });

  type MutableMenuItem = {
    text: string;
    href?: string;
    items?: MutableMenuItem[];
  };

  const categories = new Map<string, MutableMenuItem>();

  paths.forEach(path => {
    if (!path) return;

    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length < 2) return;

    const categoryName = parts[1];

    if (!categories.has(categoryName)) {
      categories.set(categoryName, {
        text: capitalizeWords(categoryName),
        items: [],
      });
    }

    const category = categories.get(categoryName)!;

    if (parts.length === 2) {
      return;
    }

    let currentItems = category.items;
    let currentPath = `/docs/${categoryName}/`;

    for (let i = 2; i < parts.length; i++) {
      const currentPart = parts[i];
      if (!currentPart) continue;

      currentPath += `${currentPart}/`;
      const isLastPart = i === parts.length - 1;

      let existingItem = currentItems!.find(item => {
        return item.href === currentPath;
      });

      if (!existingItem) {
        let displayText;

        if (isLastPart) {
          const hasSubdirs = dirWithSubdirs.has(currentPath);

          if (hasSubdirs) {
            displayText = markdownItems[path]?.title || capitalizeWords(currentPart);
          } else {
            displayText = capitalizeWords(currentPart);
          }
        } else {
          displayText = capitalizeWords(currentPart);
        }

        const newItem: MutableMenuItem = {
          text: displayText,
          href: currentPath,
        };

        if (!isLastPart) {
          newItem.items = [];
        }

        currentItems!.push(newItem);
        existingItem = newItem;
      } else if (!isLastPart && !existingItem.items) {
        existingItem.items = [];
      }

      if (!isLastPart) {
        currentItems = existingItem.items!;
      }
    }
  });

  paths.forEach(path => {
    if (!path) return;

    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length === 2) {
      const categoryName = parts[1];
      const item = markdownItems[path];
      const category = categories.get(categoryName);

      if (category) {
        const hasSubdirs = dirWithSubdirs.has(`/docs/${categoryName}/`);

        const displayText = hasSubdirs
          ? (item.title || capitalizeWords(categoryName))
          : capitalizeWords(categoryName);

        category.items!.unshift({
          text: displayText,
          href: cleanPath,
        });
      }
    }
  });
  function toContentMenu(item: MutableMenuItem): ContentMenu {
    return {
      text: item.text,
      href: item.href,
      items: item.items ? item.items.map(toContentMenu) : undefined,
    };
  }

  const result: ContentMenu[] = Array.from(categories.values())
    .sort((a, b) => (a.text || '').localeCompare(b.text || ''))
    .map(toContentMenu);

  const indexTitle = markdownItems['/docs/']?.title || 'Overview';
  result.unshift({
    text: indexTitle,
    href: '/docs/',
    items: undefined,
  });

  return result;
};

export const DocsSidebar = component$((props: { allOpen?: boolean }) => {
  const store = useStore({
    sideMenuOpen: false,
    scrollPosition: 0,
    menuItems: [] as ContentMenu[],
  });

  const { url } = useLocation();
  const markdownItems = useMarkdownItems();
  const allOpen = props.allOpen || false;

  const saveScrollPosition = $(() => {
    try {
      const scrollTop = document.getElementById('docs-sidebar')?.scrollTop || 0;
      sessionStorage.setItem('docs-sidebar', String(scrollTop));
      store.scrollPosition = scrollTop;
    } catch (err) {
      console.error('Error saving sidebar scroll position:', err);
    }
  });

  const toggleMenu = $(() => {
    store.sideMenuOpen = !store.sideMenuOpen;

    if (store.sideMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (markdownItems.value && Object.keys(markdownItems.value).length > 0) {
      store.menuItems = buildMenuFromMarkdownItems(markdownItems.value);
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

  useOnDocument(
    'DOMContentLoaded',
    $(() => {
      console.log('Document loaded');
      if (markdownItems.value && Object.keys(markdownItems.value).length > 0) {
        store.menuItems = buildMenuFromMarkdownItems(markdownItems.value);
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
    }));

  return (
    <>
      <button
        aria-label="Toggle navigation menu"
        class="lum-btn fixed top-4 left-4 z-50 lg:hidden p-2"
        onClick$={toggleMenu}
        type="button"
      >
        {store.sideMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        class={{
          'fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden': true,
          'opacity-100': store.sideMenuOpen,
          'opacity-0 pointer-events-none': !store.sideMenuOpen,
        }}
        onClick$={toggleMenu}
      />

      <aside
        class={{
          'h-dvh w-120 overflow-y-auto lum-card px-4 rounded-none border-l-0 border-y-0 sticky top-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:static shadow-lg lg:shadow-none': true,
          'transform translate-x-0': store.sideMenuOpen,
          'transform -translate-x-full lg:translate-x-0': !store.sideMenuOpen,
        }}
      >
        <nav id="docs-sidebar" class="invisible min-h-full relative">
          <div class="sticky top-0 py-2 z-10 flex items-center justify-between border-b border-gray-700 mb-4">
            <h3 class="font-bold text-lg">Documentation</h3>
            <button
              class="lg:hidden lum-btn lum-bg-transparent p-1"
              onClick$={toggleMenu}
              type="button"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div class="flex gap-2 items-center mb-4">
            <Search size={24} class="text-gray-400" />
            <input
              type="text"
              placeholder="Search docs..."
              class="w-full lum-input"
            />
          </div>

          {store.menuItems.length > 0 ? (
            <MenuItems
              items={store.menuItems}
              pathname={url.pathname}
              allOpen={allOpen}
              markdownItems={markdownItems.value}
              onClick$={saveScrollPosition}
            />
          ) : (
            <div class="py-4 text-center">
              <p>No documentation found</p>
              <p class="mt-2 text-sm">Add markdown files to your docs directory</p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
});

export function createBreadcrumbs(menu: ContentMenu | undefined, pathname: string) {
  if (!menu?.items) return [];

  function findPath(items: ContentMenu[], path: ContentMenu[] = []): ContentMenu[] | null {
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
