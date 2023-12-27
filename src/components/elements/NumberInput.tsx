import { component$, Slot } from '@builder.io/qwik';

import { Add, Remove } from 'qwik-ionicons';

export default component$((props: any) => {
  return (
    <div class="flex flex-col">
      <label for={props.id} class="mb-2">
        <Slot />
      </label>
      <RawNumberInput {...props} />
    </div>
  );
});

export const RawNumberInput = component$(({ input, onDecrement$, onIncrement$, ...props }: any) => {
  return (
    <div id={!input && props.id} class={{
      'flex': true,
      'gap-2': !input,
    }}>
      <button data-action="decrement" aria-label="Decrement" disabled={props.value <= props.min} onClick$={onDecrement$} class={{
        'flex justify-center items-center transition ease-in-out border border-gray-700 bg-gray-800 text-2xl hover:bg-gray-600 h-full py-1.5 cursor-pointer': true,
        'px-3 rounded-l-md border-r-0': input,
        'w-[50%] rounded-md': !input,
        'opacity-50 pointer-events-none': props.value <= props.min,
      }}>
        <Remove width="24" class="fill-current" />
      </button>
      {
        input && <input type="number" {...props} class="transition ease-in-out text-lg text-center border border-gray-600 bg-gray-700 text-gray-50 hover:bg-gray-600 focus:bg-gray-500 px-3 py-1 w-full" />
      }
      <button data-action="increment" aria-label="Increment" disabled={props.value >= props.max} onClick$={onIncrement$} class={{
        'flex justify-center items-center transition ease-in-out border border-gray-700 bg-gray-800 text-2xl hover:bg-gray-600 h-full py-1.5 cursor-pointer': true,
        'px-3 rounded-r-md border-l-0': input,
        'w-[50%] rounded-md': !input,
        'opacity-50 pointer-events-none': props.value <= props.max,
      }}>
        <Add width="24" class="fill-current" />
      </button>
    </div>
  );
});