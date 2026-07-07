import { component$, useContext, QRL } from '@builder.io/qwik';
import { ContentMenu, Link } from '@builder.io/qwik-city';
import { MarkdownItems } from '~/routes/docs/layout';
import Accordion from '../Elements/Accordion';
import { openItemsContext } from '~/routes/layout';

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
          class="group absolute top-1/2 -left-2.5 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500"
          title={`Updated on ${formattedDate}`}
        >
          <span class="absolute top-0 left-4 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
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
    markdownItems: MarkdownItems;
    onClick$?: QRL<() => void>;
    level?: number;
  }) => {
    const { items, pathname, markdownItems, onClick$ } = props;
    const level = props.level || 0;

    const openItems = useContext(openItemsContext);

    const isActiveOrParent = (item: ContentMenu): boolean => {
      if (item.href === pathname) return true;
      if (item.items)
        return item.items.some((subItem) => isActiveOrParent(subItem));
      return false;
    };

    return (
      <div
        class={{
          'pl-0': level === 0,
          'ml-1 border-l border-gray-200/20 pl-3': level > 0,
        }}
      >
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <div key={i} class="mb-2">
              {item.items ? (
                <div class="mb-1">
                  <Accordion
                    sectionName={item.text || `docs-item-${i}`}
                    class={{
                      'lum-bg-transparent w-full': true,
                      'lum-btn-p-1! rounded-lum-1 text-sm': level > 0,
                      'text-indigo-500': isActiveOrParent(item),
                    }}
                  >
                    {item.text}
                  </Accordion>
                  <div
                    class={{
                      'overflow-hidden transition-all duration-200': true,
                      'max-h-0 scale-98 opacity-0': !openItems.value.includes(
                        item.text || `docs-item-${i}`,
                      ),
                      'mt-1 max-h-screen opacity-100': openItems.value.includes(
                        item.text || `docs-item-${i}`,
                      ),
                      'pl-1': level > 0,
                    }}
                  >
                    {item.items && item.items.length > 0 && (
                      <MenuItems
                        items={item.items}
                        pathname={pathname}
                        markdownItems={markdownItems}
                        onClick$={onClick$}
                        level={level + 1}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  class={{
                    'lum-btn lum-bg-transparent': true,
                    'lum-btn-p-1 rounded-lum-1 text-sm': level > 0,
                    'text-indigo-500!': item.href === pathname,
                  }}
                  onMouseOver$={(
                    evt,
                    target: HTMLAnchorElement & { __prefetchLink: number },
                  ) => {
                    const canHover =
                      window.matchMedia('(hover: hover)').matches;
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
                  }}
                  onClick$={onClick$}
                >
                  {item.href && renderUpdated(item.href, markdownItems)}
                  <span class="flex-1">{item.text}</span>
                  {item.href === pathname && (
                    <span class="m-1 h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </Link>
              )}
            </div>
          ))
        ) : (
          <div class="px-3 py-2 text-sm text-gray-500">No items available</div>
        )}
      </div>
    );
  },
);
