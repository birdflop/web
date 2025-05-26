import { component$, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { ContentMenu, Link } from '@builder.io/qwik-city';
import { MarkdownItems } from '~/routes/docs/layout';
import { ChevronRight } from 'lucide-icons-qwik';

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

export const MenuItems = component$(
  (props: {
    items?: ContentMenu[];
    pathname: string;
    allOpen?: boolean;
    markdownItems: MarkdownItems;
    onClick$?: any;
    level?: number;
  }) => {
    const { items, pathname, allOpen, markdownItems, onClick$ } = props;
    const level = props.level || 0;

    const menuId = items && items.length > 0 ? `menu-${items[0].text}` : 'menu-root';

    const store = useStore({
      openItems: [] as string[],
    });

    const isActiveOrParent = (item: ContentMenu): boolean => {
      if (item.href === pathname) {
        return true;
      }

      if (item.items) {
        return item.items.some(subItem => isActiveOrParent(subItem));
      }

      return false;
    };

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

    const saveOpenItems = $((items: string[]) => {
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
          const newOpenItems: string[] = [];

          items.forEach((item, index) => {
            if (
              item.items?.some((subItem) => pathname === subItem.href) ||
              pathname.startsWith(item.href || '')
            ) {
              newOpenItems.push(item.href ?? `${index}`);
            }
          });

          store.openItems = newOpenItems;
          await saveOpenItems(newOpenItems);
        }
      }).catch((err) => {
        console.error('Error loading open items:', err);
      });
    });

    const toggleAccordion = $(async (index: string) => {
      const newOpenItems = [...store.openItems];
      const indexPosition = newOpenItems.indexOf(index);

      if (indexPosition >= 0) {
        newOpenItems.splice(indexPosition, 1);
      } else {
        newOpenItems.push(index);
      }

      store.openItems = newOpenItems;

      await saveOpenItems(newOpenItems);
    }); return (
      <div class={{
        'pl-0': level === 0,
        'pl-3 ml-1 border-l border-gray-200/20': level > 0,
      }}>
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <div key={i} class="mb-2">
              {item.items ? (<div class="mb-1">
                <button
                  onClick$={() => toggleAccordion(item.href || `${i}`)}
                  class={{
                    'w-full justify-between lum-btn lum-bg-transparent': true,
                    'font-medium': level === 0,
                    'text-sm lum-btn-p-1': level > 0,
                  }}
                  aria-expanded={store.openItems.includes(item.href || `${i}`)}
                >
                  <span class={{
                    'font-medium flex items-center': true,
                    'text-blue-400': isActiveOrParent(item),
                  }}>
                    {item.text}
                  </span>
                  <span class={{
                    'transform transition-transform duration-200': true,
                    'rotate-90': store.openItems.includes(item.href || `${i}`),
                  }}>
                    <ChevronRight size={16} class={{
                      'text-gray-400': !isActiveOrParent(item),
                      'text-blue-400': isActiveOrParent(item),
                    }} />
                  </span>
                </button>
                <div class={{
                  'transition-all duration-200 overflow-hidden': true,
                  'max-h-0 opacity-0 scale-98': !store.openItems.includes(item.href || `${i}`),
                  'max-h-screen opacity-100 mt-1': store.openItems.includes(item.href || `${i}`),
                  'pl-1': level > 0,
                }}>
                  {item.items && item.items.length > 0 && (
                    <MenuItems
                      items={item.items}
                      pathname={pathname}
                      allOpen={false}
                      markdownItems={markdownItems}
                      onClick$={onClick$}
                      level={level + 1}
                    />
                  )}
                </div>
              </div>
              ) : (<Link
                href={item.href}
                class={{
                  'lum-btn lum-bg-transparent': true,
                  'text-sm lum-btn-p-1': level > 0,
                  'text-blue-400': item.href === pathname,
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
                {item.href && renderUpdated(item.href, markdownItems)}
                <span class="flex-1">{item.text}</span>
                {item.href === pathname && (
                  <span class="w-2 h-2 m-1 rounded-full bg-blue-500" />
                )}
              </Link>
              )}
            </div>
          ))
        ) : (
          <li class="text-gray-500 py-2 px-3 text-sm">No items available</li>
        )}
      </div>
    );
  },
);