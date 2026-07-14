import { component$, QRL, PropsOf } from '@qwik.dev/core';
import { ButtonContainer } from './ButtonContainer';
import Plus from 'lucide-icons-qwik/icons/Plus';
import X from 'lucide-icons-qwik/icons/X';
import { getClassObject } from '@luminescent/ui-qwik';

type Value = { name: string; value: string };
interface TabsProps extends Omit<PropsOf<'div'>, 'onClick$'> {
  onPlus$?: PropsOf<'button'>['onClick$'];
  onClick$?: QRL<(value: Value) => void>;
  onDelete$?: QRL<(value: Value) => void>;
  values?: Value[];
  value?: Value;
}

export const Tabs = component$<TabsProps>(
  ({
    class: classList,
    onPlus$,
    values,
    value,
    onClick$,
    onDelete$,
    ...props
  }) => {
    return (
      <ButtonContainer
        {...props}
        class={{
          'items-stretch justify-start overflow-x-scroll *:flex-none [&>button]:flex-none': true,
          ...getClassObject(classList),
        }}
      >
        {values?.map((tab) => (
          <div
            key={tab.value}
            class={{
              'flex p-0!': true,
              'lum-grad-bg-lum-accent!': value?.value === tab.value,
            }}
          >
            <button class="lum-btn-p-1 pr-0" onClick$={() => onClick$?.(tab)}>
              {tab.name}
            </button>
            <button
              class="lum-btn lum-bg-transparent hover:lum-bg-red rounded-lum-2 m-1 p-0.5"
              title={`Delete ${tab.name}`}
              onClick$={async () => {
                if (confirm(`Are you sure you want to delete ${tab.name}?`)) {
                  await onDelete$?.(tab);
                }
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <button onClick$={onPlus$} title="Add new tab">
          <Plus size={16} />
        </button>
      </ButtonContainer>
    );
  }
);
