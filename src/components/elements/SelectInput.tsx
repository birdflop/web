import { component$, Slot } from '@builder.io/qwik';

export default component$(({ label, id, value, placeholder, onChange$, className }: any) => {
  return (
    <div class="flex flex-col">
      <label for={id} class="mb-2">
        {label}
      </label>
      <RawSelectInput id={id} value={value} placeholder={placeholder} onChange$={onChange$} className={`mb-3 ${className}`}>
        <Slot />  
      </RawSelectInput>
    </div>
  )
});

export const RawSelectInput = component$(({ id, value, placeholder, onChange$, className }: any) => {
  return (
    <select class={`text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-2 py-3 ${className}`} id={id} value={value} placeholder={placeholder} onChange$={onChange$}>
      <Slot />
    </select>
  )
});