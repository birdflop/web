import { getClassObject } from '@luminescent/ui-qwik';
import { component$, PropsOf, Slot } from '@qwik.dev/core';

export const ButtonContainer = component$<PropsOf<'div'>>((props) => {
  return (
    <div
      {...props}
      class={{
        'lum-card flex-row items-center justify-evenly gap-1 p-1 transition-colors duration-200': true,
        '[&>button]:lum-btn [&>button]:group [&>button]:lum-bg-transparent [&>button]:rounded-lum-1 *:rounded-lum-1 *:lum-bg-transparent *:flex-1 [&>button]:flex-1': true,
        ...getClassObject(props.class),
      }}
    >
      <Slot />
    </div>
  );
});
