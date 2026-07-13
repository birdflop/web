import { $, component$, useOnDocument, useSignal } from '@qwik.dev/core';
import { useContent, useLocation, useDocumentHead } from '@qwik.dev/router';
import AlertCircle from 'lucide-icons-qwik/icons/AlertCircle';
import Edit from 'lucide-icons-qwik/icons/Edit';
import Clock from 'lucide-icons-qwik/icons/Clock';
import User from 'lucide-icons-qwik/icons/User';

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

export const OnThisPage = component$(({ readOnly }: { readOnly?: boolean }) => {
  const { headings } = useContent();
  const contentHeadings = headings?.filter((h) => h.level <= 3) || [];
  const { frontmatter, meta } = useDocumentHead();
  const created = formatDate(frontmatter.date_created);
  const updated = formatDate(frontmatter.last_updated);
  const author = meta.find((m) => m.name === 'author')?.content || 'Unknown';
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
          { rootMargin: '0% 0% -80% 0%' }
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
      })
    );

    return activeId;
  };

  const activeId = useActiveItem(contentHeadings.map((h) => h.id));

  return (
    <aside class="lum-card sticky top-0 z-40 hidden h-dvh w-1/4 rounded-none border-r-0 bg-transparent px-0 pt-14 pb-0 sm:flex sm:border-y-0 sm:px-6 sm:pt-20">
      {contentHeadings.length > 0 ? (
        <>
          <h6 class="border-b border-b-gray-700 py-3">On this page</h6>
          <div class="relative flex flex-col gap-2 overflow-y-scroll">
            {contentHeadings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                class={{
                  'lum-btn lum-bg-transparent text-left text-ellipsis whitespace-normal': true,
                  'text-indigo-500!': activeId.value === h.id,
                  'text-xl font-bold': h.level == 1,
                  'text-lg font-medium': h.level == 2,
                  'text-base font-normal': h.level == 3,
                  'lum-btn-p-1': true,
                }}
              >
                {h.text}
              </a>
            ))}
          </div>
        </>
      ) : null}

      {!readOnly && (
        <>
          <h6 class="border-b border-b-gray-700 py-3">More</h6>
          <div class="flex flex-col gap-2">
            <a
              class="lum-btn lum-bg-transparent text-ellipsis"
              href={editUrl}
              rel="noopener"
              target="_blank"
            >
              <Edit size={20} />
              <span>Edit this Page</span>
            </a>
            <a
              class="lum-btn lum-bg-transparent text-ellipsis"
              href="https://github.com/birdflop/web/issues/new/choose"
              rel="noopener"
              target="_blank"
            >
              <AlertCircle size={20} />
              <span>Create an issue</span>
            </a>
            <div class="lum-btn lum-bg-transparent hover:lum-bg-transparent text-lum-text-secondary text-ellipsis">
              <User size={20} />
              <span>Created by: {author}</span>
            </div>
            <div class="lum-btn lum-bg-transparent hover:lum-bg-transparent text-lum-text-secondary text-left text-ellipsis">
              <Clock size={20} />
              <span>
                Created:
                <br />
                {created}
              </span>
            </div>
          </div>
        </>
      )}
      {updated !== 'Unknown' && updated !== created && (
        <div class="lum-btn lum-bg-transparent hover:lum-bg-transparent text-lum-text-secondary text-left text-ellipsis">
          <Clock size={20} />
          <span>
            Last Updated:
            <br />
            {updated}
          </span>
        </div>
      )}
    </aside>
  );
});
