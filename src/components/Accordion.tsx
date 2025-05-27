import { $, component$, Slot, useContext } from '@builder.io/qwik';
import { ChevronRight } from 'lucide-icons-qwik';
import { openItemsContext } from '~/routes/layout';

export const loadOpenItems = $(() => {
  try {
    const savedState = localStorage.getItem('openItems');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (err) {
    console.error('Error loading menu state:', err);
  }
  return [];
});

export const saveOpenItems = $((items: string[]) => {
  try {
    localStorage.setItem('openItems', JSON.stringify(items));
  } catch (err) {
    console.error('Error saving menu state:', err);
  }
});

export const toggleAccordion = $(async (index: string, openItems: string[]) => {
  const newOpenItems = [...openItems];
  const indexPosition = newOpenItems.indexOf(index);

  if (indexPosition >= 0) newOpenItems.splice(indexPosition, 1);
  else newOpenItems.push(index);

  await saveOpenItems(newOpenItems);

  return newOpenItems;
});

export default component$(({ sectionName, alwaysOpen, class: className }: {
  sectionName: string;
  alwaysOpen?: boolean;
  class?: { [key: string]: boolean; }
}) => {
  const openItemsStore = useContext(openItemsContext);

  return (
    <button class={{
      'lum-btn lum-btn-p-2 lum-bg-gray-800/30 rounded-md': true,
      'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': alwaysOpen,
      'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': alwaysOpen,
      ...className,
    }} onClick$={async () => openItemsStore.items = await toggleAccordion(sectionName, openItemsStore.items)}>
      <span class="font-medium flex-1 flex items-center gap-3">
        <Slot />
      </span>
      <div class={{
        'transition-transform duration-200': true,
        'sm:hidden': alwaysOpen,
        'rotate-90': openItemsStore.items.includes(sectionName),
      }}>
        <ChevronRight size={20} />
      </div>
    </button>
  );
});