import { component$, Slot, useStore } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

import LoadingIcon from '~/components/icons/LoadingIcon';

export const Button = component$(({ id, onClick$, className }: any) => {
  return (
    <button class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 ${className}`} id={id} onClick$={onClick$}>
      <Slot />
    </button>
  );
});

export const SPA = component$(({ id, className, href }: any) => {
  const store = useStore({
    loading: false,
  });
  const nav = useNavigate();
  return (
    <div class="flex flex-cols">
      <button class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 ${className}`} id={id} onClick$={() => {store.loading = true; nav(href);}}>
        <div class="flex items-center">
          <Slot /> <LoadingIcon className={`${!store.loading && 'hidden'}`}/>
        </div>
      </button>
    </div>
  );
});

export const External = component$(({ id, className, href }: any) => {
  return (
    <a href={href} class={`transition ease-in-out text-lg bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 ${className}`} id={id}>
      <Slot />
    </a>
  );
});

export default {
  Button,
  SPA,
  External,
}; 