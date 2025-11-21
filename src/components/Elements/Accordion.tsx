import { $, component$, PropsOf, Slot, useContext } from '@builder.io/qwik';
import { Dropdown } from '@luminescent/ui-qwik';
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
    <Dropdown class={{
      'cursor-pointer': !alwaysOpen,
      'sm:lum-bg-transparent sm:hover:lum-bg-transparent focus:scale-100': !!alwaysOpen,
      ...className,
    }} opened={openItemsStore.items.includes(sectionName) && !alwaysOpen}
    onClick$={async () => openItemsStore.items = await toggleAccordion(sectionName, openItemsStore.items)} { ...props }>
      <div class="flex items-center gap-2">
        <Slot />
      </div>
    </Dropdown>
  );
});