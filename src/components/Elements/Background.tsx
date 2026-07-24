import { Component, PropsOf } from '@qwik.dev/core';
//@ts-expect-error vite imagetools
import Hero1 from '~/images/hero/Hero1.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero2 from '~/images/hero/Hero2.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero3 from '~/images/hero/Hero3.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero4 from '~/images/hero/Hero4.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero5 from '~/images/hero/Hero5.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero6 from '~/images/hero/Hero6.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import HeroLight1 from '~/images/hero/HeroLight1.png?jsx&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import HeroLight2 from '~/images/hero/HeroLight2.png?jsx&format=avif&w=1280;1920;2560;3840';

export default [Hero1, Hero2, Hero3, Hero4, Hero5, Hero6] as Component<
  PropsOf<'img'>
>[];

export const lightBackgrounds = [HeroLight1, HeroLight2] as Component<
  PropsOf<'img'>
>[];
