import { component$, PropFunction, PropsOf } from '@builder.io/qwik';
import { ButtonContainer, ButtonContainerProps } from './ButtonContainer';
import { Plus, X } from 'lucide-icons-qwik';

interface TabsProps extends Omit<ButtonContainerProps, 'onClick$'> {
  onPlus$?: PropFunction<PropsOf<'button'>['onClick$']>;
  onClick$?: PropFunction<(value: string) => void>;
  onDelete$?: PropFunction<(value: string) => void>;
  values?: string[];
  value?: string;
}

export const Tabs = component$<TabsProps>(({ class: classList, onPlus$, values, value, onClick$, onDelete$, ...props }) => {
  return (
    <ButtonContainer { ...props }
      class={{
        'overflow-x-scroll *:flex-none justify-start *:lum-btn-p-1 items-stretch': true,
        ...classList,
      }}>
      {
        values?.map((valueString) => <div key={valueString} class={{
          'p-0!': true,
          'lum-grad-bg-lum-accent!': value == valueString,
        }}>
          <button class="lum-btn-p-1 pr-0"
            onClick$={() => onClick$?.(valueString)}>
            {valueString}
          </button>
          <button class="lum-btn lum-bg-transparent hover:lum-bg-red p-0.5 rounded-lum-2 m-1"
            title={`Delete ${valueString}`}
            onClick$={() => onDelete$?.(valueString)}>
            <X size={16} />
          </button>
        </div>)
      }
      <button onClick$={onPlus$} title="Add new tab">
        <Plus size={16} />
      </button>
    </ButtonContainer>
  );
});
