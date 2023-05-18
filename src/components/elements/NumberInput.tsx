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

export const RawNumberInput = component$((props: any) => {
  return (
    <div class={`flex ${props.input ? '' : 'gap-2'}`}>
      <button data-action="decrement" disabled={props.value <= props.min} onClick$={props.onDecrement$} class={`flex justify-center items-center transition ease-in-out bg-gray-700 text-white text-2xl hover:bg-gray-600 h-full py-1.5 ${props.input ? 'w-20 rounded-l-md' : 'w-[50%] rounded-md'} cursor-pointer`}>
        <Remove width="36" class="fill-current" />
      </button>
      {
        props.input && <input type="number" id={...props} class="transition ease-in-out text-lg text-center bg-gray-800 text-gray-50 hover:bg-gray-600 focus:bg-gray-600 px-3 py-2 w-[calc(100%-10rem)]" />
      }
      <button data-action="increment" disabled={props.value >= props.max} onClick$={props.onIncrement$} class={`flex justify-center items-center transition ease-in-out bg-gray-700 text-white text-2xl hover:bg-gray-600 h-full py-1.5 ${props.input ? 'w-20 rounded-r-md' : 'w-[50%] rounded-md'} cursor-pointer`}>
        <Add width="36" class="fill-current" />
      </button>
    </div>
  );
});