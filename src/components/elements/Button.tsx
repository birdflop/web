import { component$, Slot } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

const classes = {
  primary: 'bg-luminescent-600/90 border-luminescent-500 hover:bg-luminescent-500 focus:bg-luminescent-500',
  secondary: 'bg-gray-800/90 border-gray-700 hover:bg-gray-700 focus:bg-gray-700',
  danger: 'bg-red-700/90 border-red-600 hover:bg-red-600 focus:bg-red-600',
  success: 'bg-green-700/90 border-green-600 hover:bg-green-600 focus:bg-green-600',
  warning: 'bg-yellow-700/90 border-yellow-600 hover:bg-yellow-600 focus:bg-yellow-600',
  info: 'bg-blue-700/90 border-blue-600 hover:bg-blue-600 focus:bg-blue-600',
};

export const Button = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <button {...props} class={{
      'relative flex items-center gap-3 transition ease-in-out border text-gray-50': true,
      [color]: true,
      'text-sm px-2 py-1 rounded-md': props.small,
      'text-base px-6 py-3 rounded-lg': props.big,
      'text-base px-8 py-4 rounded-xl': props.massive,
      'font-bold': props.bold,
      'text-base px-4 py-2 rounded-md': !props.small && !props.big && !props.massive,
      [props.extraClass]: !!props.extraClass,
    }}>
      <Slot />
    </button>
  );
});

export const SPAButton = component$(({ href, color, small, big, massive, bold, extraClass }: any) => {
  const colorClasses = color ? classes[color as keyof typeof classes] : classes.secondary;
  return (
    <Link href={href} class={{
      'relative flex items-center gap-3 transition ease-in-out border text-gray-50': true,
      [colorClasses]: true,
      'text-sm px-2 py-1 rounded-md': small,
      'text-base px-6 py-3 rounded-xl': big,
      'text-base px-8 py-4 rounded-xl': massive,
      'font-bold': bold,
      'text-base px-4 py-2 rounded-md': !small && !big && !massive,
      [extraClass]: !!extraClass,
    }}>
      <Slot />
    </Link>
  );
});

export const ExternalButton = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <a {...props} class={{
      'relative flex items-center gap-3 transition ease-in-out border text-gray-50': true,
      [color]: true,
      'text-sm px-2 py-1 rounded-md': props.small,
      'text-base px-6 py-3 rounded-xl': props.big,
      'text-base px-8 py-4 rounded-xl': props.massive,
      'font-bold': props.bold,
      'text-base px-4 py-2 rounded-md': !props.small && !props.big && !props.massive,
      [props.extraClass]: !!props.extraClass,
    }}>
      <Slot />
    </a>
  );
});