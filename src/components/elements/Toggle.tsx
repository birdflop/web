import { component$, Slot } from '@builder.io/qwik';

export default component$((props: any) => {
  return (
    <div class="flex gap-3 items-center">
      <label class="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" {...props} class="sr-only peer" />
        <div class={{
          'transition ease-in-out w-12 h-7 rounded-md peer bg-gray-800 border border-gray-700 hover:bg-gray-700': true,
          'peer-checked:bg-luminescent-700 peer-checked:border-luminescent-600 peer-checked:hover:bg-luminescent-600': true,
          'after:content-[\'\'] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-700 after:border after:border-gray-600 hover:after:bg-gray-600 after:rounded-md after:h-5 after:w-5 after:transition-all after:ease-in-out': true,
          'peer-checked:after:translate-x-full peer-checked:after:bg-luminescent-500 peer-checked:after:border-luminescent-400 peer-checked:hover:after:bg-luminescent-400': true,
        }} />
      </label>
      {!props.nolabel &&
        <label for={props.id} class="text-gray-100">
          <Slot/>
        </label>
      }
    </div>
  );
});