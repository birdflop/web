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
    <aside
      class={{
        'hidden sm:flex max-w-100 sticky h-dvh lum-card bg-transparent rounded-none border-r-0 sm:border-y-0 top-0 z-[40] pt-14 sm:pt-20 px-0 sm:px-6 pb-0': true,
      }}
    >
      {contentHeadings.length > 0 ? (
        <>
          <h6 class="font-semibold py-3 text-lg border-b border-b-gray-700">On this page</h6>
          <div class="flex flex-col gap-2">
            {contentHeadings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                class={{
                  'lum-btn text-ellipsis lum-bg-transparent': true,
                  'text-blue-400': activeId.value === h.id,
                }}
              >
                {h.text}
              </a>
            ))}
          </div>
        </>
      ) : null}

      <h6 class="font-semibold py-3 text-lg border-b border-b-gray-700">More</h6>
      <div class="flex flex-col gap-2">
        <a
          class={'lum-btn text-ellipsis lum-bg-transparent'}
          href={editUrl}
          rel="noopener"
          target="_blank"
        >
          <Edit size={20} />
          <span>Edit this Page</span>
        </a>
        <a
          class={'lum-btn text-ellipsis lum-bg-transparent'}
          href='https://github.com/birdflop/web/issues/new/choose'
          rel="noopener"
          target="_blank"
        >
          <AlertCircle size={20} />
          <span>Create an issue</span>
        </a>
        <div
          class={'lum-btn text-ellipsis lum-bg-transparent hover:lum-bg-transparent text-gray-500'}
        >
          <Clock size={20} />
          <span>Created: {created}</span>
        </div>
        {updated !== 'Unknown' && updated !== created && (
          <div
            class={'lum-btn text-ellipsis lum-bg-transparent hover:lum-bg-transparent text-gray-500'}
          >
            <Clock size={20} />
            <span>Last updated: {updated}</span>
          </div>
        )}
      </div>
    </aside>
  );
});