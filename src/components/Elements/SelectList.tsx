import { getClassObject } from '@luminescent/ui-qwik';
import type { ClassList, JSXChildren, PropsOf, QRL } from '@qwik.dev/core';
import { component$, Slot, useSignal } from '@qwik.dev/core';

interface SelectListProps extends Omit<
  PropsOf<'select'>,
  'size' | 'onChange$'
> {
  btnClass?: ClassList;
  values?: {
    name: JSXChildren;
    value: string | number;
  }[];
  onChange$?: QRL<(event: Event, element: HTMLSelectElement) => void>;
}

export const SelectList = component$<SelectListProps>(
  ({
    values,
    class: Class,
    btnClass = 'lum-bg-transparent',
    onChange$,
    ...props
  }) => {
    const selected = useSignal<string | number>('');
    const selectRef = useSignal<HTMLInputElement>();

    return (
      <div
        class={{
          'lum-card lum-grad-bg-lum-input-bg relative max-h-64 touch-manipulation gap-1 overflow-auto p-1': true,
          ...getClassObject(Class),
        }}
      >
        {values && (
          <select
            {...props}
            onChange$={async (e, el) => {
              selected.value = el.value;
              await onChange$?.(e, el);
            }}
            ref={selectRef}
            class="hidden"
          >
            {values.map((value) => {
              return (
                <option
                  key={value.value}
                  value={value.value}
                >{`${value.value}`}</option>
              );
            })}
          </select>
        )}
        {values?.map(({ name, value }, i) => {
          return (
            <button
              type="button"
              class={{
                'lum-btn rounded-lum-1': true,
                'lum-grad-bg-lum-input-hover-bg hover:lum-bg-lum-input-bg/50':
                  selected.value == value,
                ...getClassObject(btnClass),
              }}
              key={i}
              onClick$={() => {
                // set the value of the select element
                const select = selectRef.value;
                if (select) {
                  select.value = value.toString();
                  select.dispatchEvent(new Event('change'));
                }
                selected.value = value.toString();
              }}
            >
              {name}
            </button>
          );
        })}
        <Slot name="extra-content" />
      </div>
    );
  }
);
