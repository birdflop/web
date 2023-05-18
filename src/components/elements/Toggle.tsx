import { component$, Slot } from '@builder.io/qwik';

export default component$((props: any) => {
  return (
    <div class="flex items-center">
      <label class="inline-flex relative items-center cursor-pointer mr-3">
        <input type="checkbox" {...props} class="sr-only peer" />
        <div class="transition ease-in-out w-12 h-7 rounded-md peer bg-gray-800 hover:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-600 hover:after:bg-gray-500 peer-checked:after:bg-purple-600 after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-900" />
      </label>
      <label for={props.id} class="text-white">
        <Slot/>
      </label>
    </div>
  );
});