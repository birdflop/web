import { component$, Slot } from '@builder.io/qwik';

export default component$(({ id, checked, onChange$ }: any) => {
    return (
        <div class="flex items-center">
          <label for={id} class="inline-flex relative items-center cursor-pointer mr-4">
            <input type="checkbox" onChange$={onChange$} checked={checked} id={id} class="sr-only peer" />
            <div class="w-12 h-7 peer-focus:ring ring-indigo-600 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
          <p class="text-white">
            <Slot/>
          </p>
        </div>
    )
});