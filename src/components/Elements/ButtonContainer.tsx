import { component$, PropsOf, Slot } from '@qwik.dev/core';

export interface ButtonContainerProps extends Omit<PropsOf<'div'>, 'class'> {
  class?: {
    [key: string]: boolean;
  };
}

export const ButtonContainer = component$<ButtonContainerProps>(
  ({ class: classList, ...props }) => {
    return (
      <div
        {...props}
        class={{
          'lum-card flex-row items-center justify-evenly gap-1 p-1 transition-colors duration-200': true,
          '*:lum-btn *:lum-bg-transparent *:group *:rounded-lum-1 *:flex-1': true,
          ...classList,
        }}
      >
        <Slot />
      </div>
    );
  },
);
