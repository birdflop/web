import { component$, Slot, useContext } from '@builder.io/qwik';
import { ChevronDown } from 'lucide-icons-qwik';
import { OpenSectionsContext } from '~/routes/layout';

export default component$(({ sectionName, alwaysOpen }: {
  sectionName: string;
  alwaysOpen?: boolean;
}) => {
  const openSections = useContext(OpenSectionsContext);

  return (
    <button class={{
      'lum-btn lum-btn-p-2 lum-bg-gray-800/30': true,
      'sm:bg-transparent sm:rounded-none sm:border-x-0 sm:border-t-0': alwaysOpen,
      'sm:hover:bg-transparent sm:hover:border-x-0 sm:hover:border-t-0': alwaysOpen,
    }} onClick$={() => {
      if (openSections.indexOf(sectionName) == -1) openSections.push(sectionName);
      else openSections.splice(openSections.indexOf(sectionName), 1);
    }}>
      <h6 class="my-0! flex-1 flex items-center gap-3">
        <Slot />
      </h6>
      <div class={{
        'transition-transform duration-200': true,
        'sm:hidden': alwaysOpen,
        'rotate-180': openSections.indexOf(sectionName) != -1,
      }}>
        <ChevronDown size={20} />
      </div>
    </button>
  );
});