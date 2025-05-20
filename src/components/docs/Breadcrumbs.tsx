import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { createBreadcrumbs, buildMenuFromMarkdownItems } from '~/components/docs/SideBar';
import { useMarkdownItems } from '~/routes/docs/layout';
import { ChevronRight, Home } from 'lucide-icons-qwik';

export const Breadcrumbs = component$(() => {
  const { url } = useLocation();
  const markdownItems = useMarkdownItems();

  const menuItems = buildMenuFromMarkdownItems(markdownItems.value);
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
    <nav class="flex text-sm py-3 px-4 mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <a href="/docs/" class="text-gray-500 hover:text-blue-600">
            <Home class="w-4 h-4 text-gray-400" />
          </a>
        </li>

        {breadcrumbs.map((crumb, index) => (
          <li key={index}>
            <div class="flex items-center">
              <ChevronRight class="w-4 h-4 text-gray-400" />
              {index < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  class="hover:text-blue-600 ml-1 md:ml-2"
                >
                  {crumb.text}
                </Link>
              ) : (
                <span class="bg-blue-400/30 rounded-lg px-2 ml-1 md:ml-2 font-medium">
                  {crumb.text}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
});
