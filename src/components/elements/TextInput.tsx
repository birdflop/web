import { component$, Slot } from '@builder.io/qwik';

export default component$((props: any) => {
  return (
    <div class="flex flex-col">
      <label for={props.id} class="mb-2">
        <Slot />
      </label>
      {props.big ?
        <RawTextAreaInput {...props} extraClass={`mb-3 ${props.extraClass}`} /> :
        <RawTextInput {...props} extraClass={`mb-3 ${props.extraClass}`} />
      }
    </div>
  );
});

export const RawTextInput = component$((props: any) => {
  return (
    <input {...props} class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 ${props.extraClass}`}/>
  );
});

export const RawTextAreaInput = component$((props: any) => {
  return (
    <textarea {...props} class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 resize-y w-full h-32 ${props.extraClass}`}/>
  );
});