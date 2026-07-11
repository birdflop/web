import { component$, PropFunction, PropsOf } from '@builder.io/qwik';
import { ButtonContainer, ButtonContainerProps } from './ButtonContainer';
import { Plus, X } from 'lucide-icons-qwik';

type Value = { name: string; value: string };
interface TabsProps extends Omit<ButtonContainerProps, 'onClick$'> {
  onPlus$?: PropFunction<PropsOf<'button'>['onClick$']>;
  onClick$?: PropFunction<(value: Value) => void>;
  onDelete$?: PropFunction<(value: Value) => void>;
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
          '*:lum-btn-p-1 items-stretch justify-start overflow-x-scroll *:flex-none': true,
          ...classList,
        }}
      >
        {values?.map((tab) => (
          <div
            key={tab.value}
            class={{
              'p-0!': true,
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
  },
);
