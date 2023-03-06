import { component$, Slot } from '@builder.io/qwik';

export default component$(({ id, value, placeholder, onInput$, jscolorData, className }: any) => {
  return (
    <div class="flex flex-col">
      <label for={id} class="mb-2">
        <Slot />
      </label>
      <RawColorInput jscolorData={jscolorData} id={id} value={value} placeholder={placeholder} onInput$={onInput$} className={`mb-3 ${className}`} />
    </div>
  )
});

export const RawColorInput = component$(({ id, value, placeholder, onInput$, jscolorData, className }: any) => {
  return (
    <>
      <input class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md py-2 ${className}`} data-jscolor={JSON.stringify({ preset: 'small dark', position: 'bottom', ...jscolorData })} id={id} value={value} placeholder={placeholder} onInput$={onInput$}/>
      <script dangerouslySetInnerHTML={'jscolor.install()'}></script>
    </>
  )
});