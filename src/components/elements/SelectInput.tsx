import { component$, Slot } from '@builder.io/qwik';

export default component$(({ label, ...props }: any) => {
  return (
    <div class="flex flex-col">
      <label for={props.id} class="mb-2">
        {label}
      </label>
      <RawSelectInput {...props}>
        <Slot />
      </RawSelectInput>
    </div>
  );
});

export const RawSelectInput = component$(({ transparent, extraClass, ...props }: any) => {
  return (
    <select {...props} class={{
      'transition ease-in-out text-lg border border-gray-700 bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-2 py-3': true,
      'border-0 bg-transparent': transparent,
      [extraClass]: !!extraClass,
    }}>
      <Slot />
    </select>
  );
});