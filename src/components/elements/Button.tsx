import { component$, Slot, useStore } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

import LoadingIcon from '~/components/icons/LoadingIcon';

const classes = {
  primary: 'bg-purple-600 hover:bg-purple-500 focus:bg-purple-500',
  secondary: 'bg-gray-800 hover:bg-gray-700 focus:bg-gray-700',
  danger: 'bg-red-600 hover:bg-red-500 focus:bg-red-500',
  success: 'bg-green-600 hover:bg-green-500 focus:bg-green-500',
  warning: 'bg-yellow-600 hover:bg-yellow-500 focus:bg-yellow-500',
  info: 'bg-blue-600 hover:bg-blue-500 focus:bg-blue-500',
};

export const Button = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <button {...props} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
      <Slot />
    </button>
  );
});

export const SPAButton = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  const store = useStore({
    loading: false,
  });
  const nav = useNavigate();
  return (
    <div class="flex flex-cols">
      <button {...props} onClick$={async () => { store.loading = true; await nav(props.href); store.loading = false; }} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
        <div class="flex items-center">
          <Slot /> <LoadingIcon extraClass={`${!store.loading && 'hidden'}`}/>
        </div>
      </button>
    </div>
  );
});

export const ExternalButton = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <a {...props} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
      <Slot />
    </a>
  );
});