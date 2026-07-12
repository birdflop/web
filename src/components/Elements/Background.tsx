//@ts-expect-error vite imagetools
import Hero1 from '~/images/Hero1.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero2 from '~/images/Hero2.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero3 from '~/images/Hero3.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero4 from '~/images/Hero4.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero5 from '~/images/Hero5.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import Hero6 from '~/images/Hero6.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import HeroLight1 from '~/images/HeroLight1.png?url&format=avif&w=1280;1920;2560;3840';
//@ts-expect-error vite imagetools
import HeroLight2 from '~/images/HeroLight2.png?url&format=avif&w=1280;1920;2560;3840';

export default [Hero1, Hero2, Hero3, Hero4, Hero5, Hero6] as string[];

export const lightBackgrounds = [HeroLight1, HeroLight2] as string[];
