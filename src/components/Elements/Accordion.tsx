import { $, component$, PropsOf, Slot, useContext } from '@builder.io/qwik';
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

interface AccordionProps extends PropsOf<'button'> {
  sectionName: string;
  alwaysOpen?: boolean;
  class?: { [key: string]: boolean; }
}

export default component$(({ sectionName, alwaysOpen, class: className, ...props }: AccordionProps) => {
  const openItemsStore = useContext(openItemsContext);

  return (
    <button class={{
      'lum-btn lum-btn-p-2 lum-bg-lum-input-bg/30': true,
      'sm:lum-bg-transparent sm:hover:bg-transparent': alwaysOpen,
      ...className,
    }} onClick$={async () => openItemsStore.items = await toggleAccordion(sectionName, openItemsStore.items)} { ...props }>
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