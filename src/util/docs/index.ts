import { type ContentMenu } from '@qwik.dev/router';
import { menuItemPriority, type MarkdownItems } from '~/routes/docs/layout';

function capitalizeWords(string: string) {
  return string
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function buildMenu(markdownItems: MarkdownItems): ContentMenu[] {
  const paths = Object.keys(markdownItems).sort((a, b) => a.length - b.length);

  const pathsByDir = new Map<string, string[]>();

  paths.forEach((path) => {
    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length < 2) {
      return;
    }

    parts.shift();

    const parentPath =
      parts.length > 1
        ? `/docs/${parts.slice(0, parts.length - 1).join('/')}/`
        : '/docs/';

    if (!pathsByDir.has(parentPath)) {
      pathsByDir.set(parentPath, []);
    }

    const paths = pathsByDir.get(parentPath);
    if (paths) {
      paths.push(path);
    }
  });

  const dirWithSubdirs = new Set<string>();

  pathsByDir.forEach((dirPaths) => {
    dirPaths.forEach((path) => {
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

  paths.forEach((path) => {
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

      let existingItem = currentItems!.find((item) => {
        return item.href === currentPath;
      });

      if (!existingItem) {
        let displayText;

        if (isLastPart) {
          const hasSubdirs = dirWithSubdirs.has(currentPath);

          if (hasSubdirs) {
            displayText =
              markdownItems[path]?.title || capitalizeWords(currentPart);
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

  paths.forEach((path) => {
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
          ? item.title || capitalizeWords(categoryName)
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

  result.sort((a, b) => {
    const aPriority = menuItemPriority[a.text || ''] || 100;
    const bPriority = menuItemPriority[b.text || ''] || 100;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return (a.text || '').localeCompare(b.text || '');
  });

  return result;
}
