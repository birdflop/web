import { component$ } from '@qwik.dev/core';
import { Link, useLocation } from '@qwik.dev/router';
import { createBreadcrumbs } from '~/components/docs/SideBar';
import { buildMenu } from '~/util/docs';
import { useMarkdownItems } from '~/routes/docs/layout';
import ChevronRight from 'lucide-icons-qwik/icons/ChevronRight';
import Home from 'lucide-icons-qwik/icons/Home';

export const Breadcrumbs = component$(() => {
  const { url } = useLocation();
  const markdownItems = useMarkdownItems();

  const menuItems = buildMenu(markdownItems.value);
  const menu = {
    text: 'Root',
    href: '/docs/',
    items: menuItems,
  };

  const breadcrumbs = createBreadcrumbs(menu, url.pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      class="lum-card lum-btn-p-2 fixed top-31 z-20 mb-6 w-full flex-row items-center gap-1 rounded-none text-sm backdrop-blur-lg sm:top-20 sm:w-auto sm:rounded-full sm:border sm:p-2"
      aria-label="Breadcrumb"
    >
      <a href="/docs/" class="lum-btn lum-bg-transparent rounded-full p-1">
        <Home size={19} />
      </a>

      {breadcrumbs.map((crumb, index) => (
        <div class="flex items-center gap-1" key={index}>
          <ChevronRight class="h-4 w-4 text-gray-400" />
          <Link
            href={crumb.href}
            class={{
              'lum-btn lum-btn-p-1 rounded-full text-sm': true,
              'lum-bg-transparent': index < breadcrumbs.length - 1,
              'lum-grad-bg-blue/30': index === breadcrumbs.length - 1,
            }}
          >
            {crumb.text}
          </Link>
        </div>
      ))}
    </nav>
  );
});
