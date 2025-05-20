import { $, component$, useOnDocument, useSignal } from '@builder.io/qwik';
import { useContent, useLocation, useDocumentHead } from '@builder.io/qwik-city';
import { AlertCircle, Edit, Clock } from 'lucide-icons-qwik';

const makeEditPageUrl = (url: string): string => {
  const segments = url.split('/').filter((part) => part !== '');
  if (segments[0] !== 'docs') {
    return url;
  }

  return segments.join('/');
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Unknown';

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
};

export const OnThisPage = component$(() => {
  const { headings } = useContent();
  const contentHeadings = headings?.filter((h) => h.level <= 3) || [];
  const { frontmatter } = useDocumentHead<{ date_created?: string, last_updated?: string }>();
  const created = formatDate(frontmatter.date_created);
  const updated = formatDate(frontmatter.last_updated);
  const { url } = useLocation();

  const githubEditRoute = makeEditPageUrl(url.pathname);

  const editUrl = `https://github.com/birdflop/web/edit/main/src/routes/${githubEditRoute}/index.mdx`;

  const useActiveItem = (itemIds: string[]) => {
    const activeId = useSignal<string | null>(null);
    useOnDocument(
      'scroll',
      $(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                activeId.value = entry.target.id;
              }
            });
          },
          { rootMargin: '0% 0% -80% 0%' },
        );

        itemIds.forEach((id) => {
          const element = document.getElementById(id);
          if (element) {
            observer.observe(element);
          }
        });

        return () => {
          itemIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
              observer.unobserve(element);
            }
          });
        };
      }),
    );

    return activeId;
  };

  const activeId = useActiveItem(contentHeadings.map((h) => h.id));

  return (
    <aside class="py-8 pt-10 sticky top-0 w-80 text-sm overflow-y-auto hidden xl:block">
      {contentHeadings.length > 0 ? (
        <>
          <h6 class="font-bold text-center pb-3 uppercase text-lg">On This Page</h6>
          <ul class="px-2 font-medium text-[var(--interactive-text-color)]">
            {contentHeadings.map((h) => (
              <li
                key={h.id}
                class="rounded-lg"
              >
                {activeId.value === h.id ? (
                  <span class="block px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {h.text}
                  </span>
                ) : (
                  <a
                    href={`#${h.id}`}
                    class={`${h.level > 2 ? 'ml-0' : ''} block px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis`}
                  >
                    {h.text}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h6 class="font-bold text-center pb-3 uppercase">More</h6>
      <ul class="px-2 font-medium text-[var(--interactive-text-color)]">
        <li
          key='more-items-on-this-page-edit'
          class="rounded-lg"
        >
          <a
            class="inline-flex gap-x-2 px-3 py-2 items-center"
            href={editUrl}
            rel="noopener"
            target="_blank"
          >
            <Edit size={20} />
            <span>Edit this Page</span>
          </a>
        </li>
        <li
          key='more-items-on-this-page-issue'
          class="rounded-lg"
        >
          <a
            class="inline-flex gap-x-2 px-3 py-2 items-center"
            href='https://github.com/birdflop/web/issues/new/choose'
            rel="noopener"
            target="_blank"
          >
            <AlertCircle size={20} />
            <span>Create an issue</span>
          </a>
        </li>
        <li
          key='more-items-on-this-page-created'
          class="rounded-lg"
        >
          <div
            class="inline-flex gap-x-2 px-3 py-2 items-center"
          >
            <Clock size={20} />
            <span>Created: {created}</span>
          </div>
        </li>
        {updated !== 'Unknown' && (
          <li
            key='more-items-on-this-page-updated'
            class="rounded-lg"
          >
            <div
              class="inline-flex gap-x-2 px-3 py-2 items-center"
            >
              <Clock size={20} />
              <span>Last updated: {updated}</span>
            </div>
          </li>
        )}
      </ul>
    </aside>
  );
});