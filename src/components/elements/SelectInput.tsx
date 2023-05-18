import { component$, Slot } from '@builder.io/qwik';

export default component$((props: any) => {
  return (
    <div class="flex flex-col">
      <label for={props.id} class="mb-2">
        {props.label}
      </label>
      <RawSelectInput {...props} extraClass={`mb-3 ${props.extraClass}`}>
        <Slot />
      </RawSelectInput>
    </div>
  );
});

export const RawSelectInput = component$((props: any) => {
  return (
    <select {...props} class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-2 py-3 ${props.extraClass}`}>
      <Slot />
    </select>
  );
});