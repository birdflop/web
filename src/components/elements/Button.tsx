import type { PropsOf } from '@builder.io/qwik';
import { component$, Slot } from '@builder.io/qwik';
import type { LinkProps } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const classes = {
  blue: 'bg-blue-600/90 border-blue-500 hover:bg-blue-500 focus:bg-blue-500',
  purple: 'bg-purple-600/90 border-purple-500 hover:bg-purple-500 focus:bg-purple-500',
  pink: 'bg-pink-600/90 border-pink-500 hover:bg-pink-500 focus:bg-pink-500',
  gray: 'bg-gray-800/90 border-gray-700 hover:bg-gray-700 focus:bg-gray-700',
  red: 'bg-red-700/90 border-red-600 hover:bg-red-600 focus:bg-red-600',
  green: 'bg-green-700/90 border-green-600 hover:bg-green-600 focus:bg-green-600',
  yellow: 'bg-yellow-700/90 border-yellow-600 hover:bg-yellow-600 focus:bg-yellow-600',
};

interface GenericButtonProps {
  color?: keyof typeof classes;
  small?: boolean;
  big?: boolean;
  massive?: boolean;
  bold?: boolean;
  class?: { [key: string]: boolean };
}

interface ButtonProps extends Omit<PropsOf<'button'>, 'class'>, GenericButtonProps {}
interface ButtonSPAProps extends Omit<LinkProps, 'class'>, GenericButtonProps {}
interface ButtonExternalProps extends Omit<PropsOf<'a'>, 'class'>, GenericButtonProps {}

export const Button = component$<ButtonProps>(({ color = 'gray', small, big, massive, bold, ...props }) => {
  const colorClasses = classes[color as keyof typeof classes];

  return (
    <button {...props} class={{
      'relative flex items-center transition ease-in-out border text-gray-50 disabled:opacity-50': true,
      [colorClasses]: true,
      'text-sm px-2 py-1 rounded-md gap-2': small,
      'text-base px-6 py-3 rounded-lg gap-3': big,
      'text-base px-8 py-4 rounded-xl gap-4': massive,
      'font-bold': bold,
      'text-base px-4 py-2 rounded-md gap-3': !small && !big && !massive,
      ...props.class,
    }}>
      <Slot />
    </button>
  );
});

export const ButtonSPA = component$<ButtonSPAProps>(({ color = 'gray', small, big, massive, bold, ...props }) => {
  const colorClasses = classes[color as keyof typeof classes];

  return (
    <Link {...props} class={{
      'relative flex items-center gap-3 transition ease-in-out border text-gray-50': true,
      [colorClasses]: true,
      'text-sm px-2 py-1 rounded-md': small,
      'text-base px-6 py-3 rounded-xl': big,
      'text-base px-8 py-4 rounded-xl': massive,
      'font-bold': bold,
      'text-base px-4 py-2 rounded-md': !small && !big && !massive,
      ...props.class,
    }}>
      <Slot />
    </Link>
  );
});

export const ButtonExternal = component$<ButtonExternalProps>(({ color = 'gray', small, big, massive, bold, ...props }) => {
  const colorClasses = classes[color as keyof typeof classes];

  return (
    <a {...props} class={{
      'relative flex items-center gap-3 transition ease-in-out border text-gray-50 fill-gray-50': true,
      [colorClasses]: true,
      'text-sm px-2 py-1 rounded-md': small,
      'text-base px-6 py-3 rounded-xl': big,
      'text-base px-8 py-4 rounded-xl': massive,
      'font-bold': bold,
      'text-base px-4 py-2 rounded-md': !small && !big && !massive,
      ...props.class,
    }}>
      <Slot />
    </a>
  );
});