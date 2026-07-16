import { getClassObject } from '@luminescent/ui-qwik';
import { component$, PropsOf, Slot } from '@qwik.dev/core';

export const ButtonContainer = component$<PropsOf<'div'>>((props) => {
  return (
    <div
      {...props}
      class={{
        'lum-card flex-row items-center justify-evenly gap-1 p-1 transition-colors duration-200': true,
        '[&>button]:lum-btn [&>button]:group [&>button]:lum-bg-transparent [&>button]:rounded-lum-1 [&>button]:flex-1 [&>button]:p-2': true,
        '[&>a]:lum-btn [&>a]:group [&>a]:lum-bg-transparent [&>a]:rounded-lum-1 [&>a]:flex-1 [&>a]:p-2': true,
        '*:rounded-lum-1 *:lum-bg-transparent *:flex-1': true,
        ...getClassObject(props.class),
      }}
    >
      <Slot />
    </div>
  );
});
