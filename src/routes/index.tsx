import { component$, useVisibleTask$, useSignal, useOnWindow, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

import { Anchor, Hoverable } from '@luminescent/ui-qwik'; // removed LogoBirdflop
import { Palette, Box, Wrench, Github } from 'lucide-icons-qwik';
import { initiateTyper } from '~/util/Typer';
import { generateHead } from '~/root';

export default component$(() => {
  const aboutExpanded = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    initiateTyper();
  });

  useOnWindow(
    'scroll',
    $(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) return;
      const bg = document.getElementById('bg');
      if (!bg) return;
      bg.style.bottom = `${window.scrollY / 2}px`;
      bg.style.setProperty('--tw-blur', `blur(${window.scrollY / 20}px)`);
    })
  );

  return (
    <>
      {/* Hero */}
      <section class="flex flex-col text-gray-100 mx-auto px-10 items-center justify-center text-center min-h-lvh pt-[72px]">
        <div class="relative my-0! mx-auto drop-shadow-lg">
          {/* Swap this image with your logo file in /public */}
          <img
            src="/brewmc-logo.png"
            alt="BrewMC"
            width={180}
            height={180}
            class="mx-auto select-none"
            draggable={false}
          />
        </div>

        <h5 class="animate-in fade-in slide-in-from-top-16 anim-duration-1000 drop-shadow-md mt-4">
          Tools & resources for{' '}
          <span
            class="typer"
            id="main"
            data-words={'RGB gradients,Minecraft styling,hex & amp codes'}
            data-colors="#8F6E54,#B53F33,#CFA57B,#F3E2C6"
            data-delay="45"
            data-deleteDelay="1400"
          ></span>
          <span class="cursor" data-owner="main" data-cursor-display="|"></span>
        </h5>

        <div class="flex flex-col gap-2 mt-8 animate-in fade-in slide-in-from-top-24 anim-duration-1000">
          <div class="flex flex-col sm:flex-row gap-2 justify-center">
            {/* Link this to your RGB tool route */}
            <Link
              href="/resources/rgb"
              class="lum-btn lum-btn-p-4 text-white! lum-bg-[#B53F33] hover:lum-bg-[#a23a2e]"
              onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
              onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
            >
              <Palette size={26} /> Open RGB Tool
            </Link>

            <Link
              href="/resources"
              class="lum-btn lum-btn-p-4 text-white! lum-bg-[#8F6E54] hover:lum-bg-[#7d5f49]"
              onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
              onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
            >
              <Box size={26} /> All Resources
            </Link>

            <a
              href="https://discord.gg/brewmc"
              target="_blank"
              class="lum-btn lum-btn-p-4 text-white! lum-bg-[#CFA57B] hover:lum-bg-[#bf966e]"
              onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
              onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
            >
              <Wrench size={26} /> Discord Support
            </a>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href="https://github.com/your-username/brewmc-rgb" // <- change to your fork URL
              target="_blank"
              class="lum-btn lum-btn-p-4 text-white! lum-bg-[#444] hover:lum-bg-[#333]"
              onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
              onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
            >
              <Github size={26} /> View Source
            </a>
          </div>
        </div>
      </section>

      {/* About / Intro */}
      <div class="bg-lum-card-bg border-t border-lum-border/30 pb-16">
        <section class="flex flex-col mx-auto max-w-3xl px-10 items-center justify-center pt-10">
          <h1>About BrewMC RGB</h1>
          <p>
            BrewMC RGB is a tiny toolkit for creators: generate gradient text, hex/amp codes,
            and copy-paste snippets for your Minecraft server and store pages.&nbsp;
            {aboutExpanded.value && (
              <>
                You can quickly preview gradients, export codes, and keep a consistent
                BrewMC look across chat, scoreboard, and web. We’ll add more helpers over time.
              </>
            )}
            <button
              class="text-blue-400 hover:underline ml-2"
              onClick$={() => (aboutExpanded.value = !aboutExpanded.value)}
            >
              {aboutExpanded.value ? 'Read less' : 'Read more'}
            </button>
          </p>
        </section>

        {/* Credit footer (Option A) */}
        <section class="flex flex-col mx-auto max-w-3xl px-10 items-center justify-center pt-6">
          <p class="text-sm opacity-70 text-center">
            Forked from{' '}
            <a
              href="https://github.com/birdflop/web"
              target="_blank"
              rel="noreferrer"
              class="underline"
            >
              birdflop/web
            </a>{' '}
            — original RGB tool at{' '}
            <a
              href="https://rgb.birdflop.com"
              target="_blank"
              rel="noreferrer"
              class="underline"
            >
              rgb.birdflop.com
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
});

export const head = generateHead({});
