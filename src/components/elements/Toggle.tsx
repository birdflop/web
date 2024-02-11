import { component$, Slot } from '@builder.io/qwik';

export default component$(({ nolabel, center, ...props }: any) => {
  return (
    <div class={{
      'flex gap-3 items-center': true,
      'justify-center': center,
    }}>
      <label class="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" {...props} class="sr-only peer" />
        <div class={{
          'transition ease-in-out w-12 h-7 rounded-md peer bg-gray-800 border border-gray-700 hover:bg-gray-700': true,
          'peer-checked:bg-blue-700 peer-checked:border-blue-600 peer-checked:hover:bg-blue-600': true,
          'after:content-[\'\'] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-700 after:border after:border-gray-600 hover:after:bg-gray-600 after:rounded-md after:h-5 after:w-5 after:transition-all after:ease-in-out': true,
          'peer-checked:after:translate-x-full peer-checked:after:bg-blue-500 peer-checked:after:border-blue-400 peer-checked:hover:after:bg-blue-400': true,
        }} />
      </label>
      {!nolabel &&
        <label for={props.id} class="text-gray-100">
          <Slot/>
        </label>
      }
    </div>
  );
});