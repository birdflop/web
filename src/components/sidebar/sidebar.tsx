import { component$, useOnDocument, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { type ContentMenu, useLocation, Link } from '@builder.io/qwik-city';
import { useMarkdownItems } from '~/routes/docs/layout';

type MDX = {
  title: string;
  contributors?: string[];
  created_at?: string;
  updated_at?: string;
};

type MarkdownItems = Record<string, MDX>;

export const CloseIcon = component$(() => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    class="text-gray-700"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
));

export const MenuIcon = component$(() => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    class="text-gray-700"
  >
    <path
      d="M3 12h18M3 6h18M3 18h18"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
));

export const ChevronIcon = component$(() => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    class="text-gray-500 transform transition-transform duration-200"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
));

const DAYS = 24 * 60 * 60 * 1000;

const renderUpdated = (itemHref: string, markdownItems: MarkdownItems) => {
  const updatedAt = markdownItems[itemHref]?.updated_at;

  if (updatedAt) {
    const updateDate = new Date(updatedAt);
    const isUpdated = updateDate.getTime() + 14 * DAYS > new Date().getTime();

    if (isUpdated) {
      const formattedDate = updateDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return (
        <div
          class="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 group"
          title={`Updated on ${formattedDate}`}
        >
          <span class="absolute left-4 top-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
            Updated on {formattedDate}
          </span>
        </div>
      );
    }
  }

  return null;
};

const buildMenuFromMarkdownItems = (markdownItems: MarkdownItems): ContentMenu[] => {

  const categories = new Map<string, ContentMenu>();

  Object.entries(markdownItems).forEach(([path, item]) => {
    if (!path) return;

    const cleanPath = path.endsWith('/') ? path : `${path}/`;

    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length < 2) return;

    const categoryName = parts[1];

    const pageName = parts.length > 2 ? parts[2] : categoryName;

    const displayName = item.title || capitalizeWords(pageName);

    if (!categories.has(categoryName)) {
      categories.set(categoryName, {
        text: capitalizeWords(categoryName),
        items: [],
      });
    }

    const category = categories.get(categoryName);
    if (category && category.items) {
      category.items.push({
        text: displayName,
        href: cleanPath,
      });
    }
  });

  return Array.from(categories.values())
    .sort((a, b) => (a.text || '').localeCompare(b.text || ''));
};

function capitalizeWords(string: string) {
  return string
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

  useOnDocument(
    'DOMContentLoaded',
    $(() => {

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
      {/* Mobile menu toggle button - only visible on smaller screens */}
      <button
        aria-label="Toggle navigation menu"
        class="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md flex items-center justify-center"
        onClick$={toggleMenu}
        type="button"
      >
        {store.sideMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay that appears behind the menu on mobile */}
      <div
        class={{
          'fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden': true,
          'opacity-100': store.sideMenuOpen,
          'opacity-0 pointer-events-none': !store.sideMenuOpen,
        }}
        onClick$={toggleMenu}
      />

      {/* Sidebar container */}
      <aside
        class={{
          'w-[280px] min-h-full overflow-y-auto border-r border-gray-200 lg:block fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:static shadow-lg lg:shadow-none text-gray-200': true,
          'transform translate-x-0': store.sideMenuOpen,
          'transform -translate-x-full lg:translate-x-0': !store.sideMenuOpen,
        }}
      >
        {/* Sidebar content */}
        <nav id="docs-sidebar" class="invisible min-h-full py-16 lg:py-4 px-6 lg:px-4 relative">
          <div class="sticky top-0 pt-2 pb-4 z-10 border-b border-gray-100 mb-4 flex items-center justify-between">
            <h3 class="font-bold text-lg">Documentation</h3>
            <button
              class="lg:hidden bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-gray-100"
              onClick$={toggleMenu}
              type="button"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Search box placeholder - you can implement actual search functionality */}
          <div class="relative mb-6">
            <input
              type="text"
              placeholder="Search documentation..."
              class="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg
              class="absolute right-3 top-2.5 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          {/* Menu items */}
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

export const MenuItems = component$(
  (props: {
    items?: ContentMenu[];
    pathname: string;
    allOpen?: boolean;
    markdownItems: MarkdownItems;
    onClick$?: any;
  }) => {
    const { items, pathname, allOpen, markdownItems, onClick$ } = props;

    const menuId = items && items.length > 0 ? `menu-${items[0].text}` : 'menu-root';

    const store = useStore({
      openItems: [] as number[],
    });

    const loadOpenItems = $(() => {
      try {
        const savedState = localStorage.getItem(`docs-${menuId}-open`);
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (err) {
        console.error('Error loading menu state:', err);
      }
      return [];
    });

    const saveOpenItems = $((items: number[]) => {
      try {
        localStorage.setItem(`docs-${menuId}-open`, JSON.stringify(items));
      } catch (err) {
        console.error('Error saving menu state:', err);
      }
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => pathname);
      track(() => allOpen);
      track(() => items);

      loadOpenItems().then(async (savedOpenItems) => {
        if (savedOpenItems && savedOpenItems.length > 0) {
          store.openItems = savedOpenItems;
        } else if (allOpen && items && items.length > 0) {
          const newOpenItems = [] as number[];

          items.forEach((item, index) => {
            if (
              item.items?.some((subItem) => pathname === subItem.href) ||
              pathname.startsWith(item.href || '')
            ) {
              newOpenItems.push(index);
            }
          });

          store.openItems = newOpenItems;
          await saveOpenItems(newOpenItems);
        }
      }).catch((err) => {
        console.error('Error loading open items:', err);
      });
    });

    const toggleAccordion = $(async (index: number) => {
      const newOpenItems = [...store.openItems];
      const indexPosition = newOpenItems.indexOf(index);

      if (indexPosition >= 0) {
        newOpenItems.splice(indexPosition, 1);
      } else {
        newOpenItems.push(index);
      }

      store.openItems = newOpenItems;

      await saveOpenItems(newOpenItems);
    });

    return (
      <ul class="space-y-1 list-none pl-0 m-0">
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <li key={i} class="mb-2">
              {item.items ? (
                <div class="mb-1">
                  <button
                    onClick$={() => toggleAccordion(i)}
                    class="w-full text-left flex items-center justify-between lum-btn"
                    aria-expanded={store.openItems.includes(i)}
                  >
                    <span class="font-medium">{item.text}</span>
                    <span class={{
                      'transform transition-transform duration-200': true,
                      'rotate-180': store.openItems.includes(i),
                    }}>
                      <ChevronIcon />
                    </span>
                  </button>

                  <div class={{
                    'transition-all duration-200 overflow-hidden': true,
                    'max-h-0 opacity-0': !store.openItems.includes(i),
                    'max-h-screen opacity-100 mt-1': store.openItems.includes(i),
                  }}>
                    {item.items && item.items.length > 0 && (
                      <MenuItems
                        items={item.items}
                        pathname={pathname}
                        allOpen={false}
                        markdownItems={markdownItems}
                        onClick$={onClick$}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  class={{
                    'lum-btn': true,
                  }}
                  onMouseOver$={$((evt: any, target: HTMLAnchorElement & { __prefetchLink: number }) => {
                    const canHover = window.matchMedia('(hover: hover)').matches;
                    if (!canHover) return;

                    if (!target?.href) return;

                    const fiveMinutesInMs = 5 * 60 * 1000;
                    const now = Date.now();
                    const timeGap = now - (target.__prefetchLink || 0);
                    if (timeGap < fiveMinutesInMs) return;

                    const prefetchLink = document.createElement('link');
                    prefetchLink.href = target.href;
                    prefetchLink.rel = 'prefetch';
                    document.head.appendChild(prefetchLink);

                    target.__prefetchLink = now;
                  })}
                  onClick$={onClick$}
                >
                  <div class="w-full relative flex items-center">
                    {item.href && renderUpdated(item.href, markdownItems)}
                    <span>{item.text}</span>
                    {pathname === item.href && (
                      <span class="absolute right-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                </Link>
              )}
            </li>
          ))
        ) : (
          <li class="text-gray-500 py-2 px-3 text-sm">No items available</li>
        )}
      </ul>
    );
  },
);

export function createBreadcrumbs(menu: ContentMenu | undefined, pathname: string) {
  if (menu?.items) {
    for (const breadcrumbA of menu.items) {
      if (breadcrumbA.href === pathname) {
        return [breadcrumbA];
      }

      if (breadcrumbA.items) {
        for (const breadcrumbB of breadcrumbA.items) {
          if (breadcrumbB.href === pathname) {
            return [breadcrumbA, breadcrumbB];
          }

          if (breadcrumbB.items) {
            for (const breadcrumbC of breadcrumbB.items) {
              if (breadcrumbC.href === pathname) {
                return [breadcrumbA, breadcrumbB, breadcrumbC];
              }
            }
          }
        }
      }
    }
  }

  return [];
}