import { $, component$, PropsOf, QRL, Slot, useContext } from '@qwik.dev/core';
import { Dropdown, getClassObject } from '@luminescent/ui-qwik';
import { openItemsContext } from '~/routes/layout';

export const loadOpenItems = $(() => {
  try {
    const savedState = localStorage.getItem('openItems');
    if (savedState) return JSON.parse(savedState) as string[];
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
  pcOnly?: boolean;
  onClick$?: QRL<() => void>;
}

export default component$(
  ({
    sectionName,
    pcOnly,
    class: className,
    onClick$,
    ...props
  }: AccordionProps) => {
    const openItems = useContext(openItemsContext);

    return (
      <Dropdown
        class={{
          'lum-bg-transparent active:scale-100!': true,
          'hidden sm:flex': !!pcOnly,
          ...getClassObject(className),
        }}
        opened={openItems.value.includes(sectionName)}
        {...props}
        onClick$={async () => {
          await onClick$?.();
          openItems.value = await toggleAccordion(sectionName, openItems.value);
        }}
      >
        <span class="flex items-center gap-2">
          <Slot />
        </span>
      </Dropdown>
    );
  }
);
