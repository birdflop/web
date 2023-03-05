import { component$, Slot } from '@builder.io/qwik';

export default component$(({ id, value, placeholder, onInput$ }: any) => {
    return (
        <div class="flex flex-col">
          <label for={id}>
            <Slot />
          </label>
          <input class="text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mb-6 mt-2" onInput$={onInput$} value={value} placeholder={placeholder} id={id}/>
        </div>
    )
})