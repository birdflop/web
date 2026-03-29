import type { JSXChildren, PropsOf, QRL } from '@builder.io/qwik';
import { component$, Slot, useSignal } from '@builder.io/qwik';

interface SelectListProps extends Omit<PropsOf<'select'>, 'class' | 'size' | 'onChange$'> {
  btnClass?: string;
  class?: { [className: string]: boolean };
  values?: {
    name: JSXChildren;
    value: string | number;
  }[];
  onChange$?: QRL<(event: Event, element: HTMLSelectElement) => void>;
}

export const SelectList = component$<SelectListProps>(({
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
        'max-h-64 relative touch-manipulation overflow-auto lum-card lum-bg-lum-input-bg p-1 gap-1': true,
        ...Class,
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
          {values.map((value, i) => {
            return (
              <option key={i} value={value.value}>{`${value.value}`}</option>
            );
          })}
        </select>
      )}
      {values?.map(({ name, value }, i) => {
        return (
          <button type="button"
            class={{
              'lum-btn rounded-lum-1': true,
              'lum-bg-lum-input-hover-bg hover:lum-bg-lum-input-bg/50': selected.value == value,
              [btnClass]: true,
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
      <Slot name="extra-buttons" />
    </div>
  );
});