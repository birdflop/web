import { component$ } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';
import { Hoverable } from '@luminescent/ui-qwik';

import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';
import Binary from 'lucide-icons-qwik/icons/Binary';
import Blocks from 'lucide-icons-qwik/icons/Blocks';
import Bot from 'lucide-icons-qwik/icons/Bot';
import Box from 'lucide-icons-qwik/icons/Box';
import Eye from 'lucide-icons-qwik/icons/Eye';
import Flag from 'lucide-icons-qwik/icons/Flag';
import GalleryHorizontalEnd from 'lucide-icons-qwik/icons/GalleryHorizontalEnd';
import LinkIcon from 'lucide-icons-qwik/icons/Link';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Presentation from 'lucide-icons-qwik/icons/Presentation';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Save from 'lucide-icons-qwik/icons/Save';
import Server from 'lucide-icons-qwik/icons/Server';
import Wrench from 'lucide-icons-qwik/icons/Wrench';
import Zap from 'lucide-icons-qwik/icons/Zap';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <section
      class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20"
      style={{
        '--lum-border-radius': '1.2rem',
      }}
    >
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Box size={32} />
        {t('nav.resources.title@@Resources')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-8 border-b pb-4">
        {t(
          'nav.resources.description@@Here you can find all of Birdflop\'s public resources.',
        )}
      </p>

      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Palette size={30} />
        {t('nav.resources.gradientTools.title@@Gradient Tools')}
      </h2>
      <p class="text-lum-text-secondary mt-1 mb-4">
        {t(
          'nav.resources.gradientTools.description@@Tools to help you create gradient text in Minecraft.',
        )}
      </p>
      <div class="flex flex-wrap gap-2 *:flex-1">
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-red relative duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/rgb"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Palette size={30} />
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-blue relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/animtab"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Rainbow size={30} />
            {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.animatedTAB.description@@TAB plugin gradient animation creator',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-green relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/rgb/presets"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Save size={30} />
            {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.',
            )}
          </p>
        </Link>
      </div>
      <hr />
      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Server size={30} />
        {t('nav.resources.serverTools.title@@Server Tools')}
      </h2>
      <p class="text-lum-text-secondary mt-1 mb-4">
        {t(
          'nav.resources.serverTools.description@@Tools to help configure and setup minecraft servers.',
        )}
      </p>
      <div class="flex flex-wrap gap-2 *:flex-1">
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-yellow relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/analyze"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Zap size={30} />
            {t('nav.resources.analyze.title@@Analyze')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.analyze.description@@Analyze a Spark Profile or Paper Timings and get possible optimizations',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-orange relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/flags"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Flag size={30} />
            {t('nav.resources.flags.title@@Flags Generator')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-violet relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/plugins"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Blocks size={30} />
            {t('nav.resources.plugins.title@@Plugin Updates')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.plugins.description@@Keep track of plugin updates without checking every plugin page for updates.',
            )}
          </p>
        </Link>
      </div>
      <hr />
      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Wrench size={30} />
        {t('nav.resources.miscellaneousTools.title@@Miscellaneous Tools')}
      </h2>
      <p class="text-lum-text-secondary mt-1 mb-4">
        {t(
          'nav.resources.miscellaneousTools.description@@Miscellaneous tools to help with random miscellaneous things.',
        )}
      </p>
      <div class="mb-2 flex flex-wrap gap-2 *:flex-1">
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-purple relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/banner"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Presentation size={30} />
            {t('nav.resources.banner.title@@Banner Generator')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.banner.description@@Easily generate banner designs for Minecraft.',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-cyan relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/animtexture"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <GalleryHorizontalEnd size={30} />
            {t('nav.resources.animatedTextures.title@@Animated Textures')}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations',
            )}
          </p>
        </Link>
        <Link
          class="lum-card lum-grad-bg-lum-card-bg/30 hover:lum-bg-lime relative transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          href="/resources/animpreview"
        >
          <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <Eye size={30} />
            {t(
              'nav.resources.tabAnimationPreview.title@@TAB Animation Preview',
            )}
          </h3>
          <p class="text-lum-text-secondary">
            {t(
              'nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game',
            )}
          </p>
        </Link>
      </div>
      <hr />

      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Bot size={30} />
        Botflop
      </h2>
      <p class="text-lum-text-secondary">
        A Discord bot that watches chat to chime in and provide suggestions.
        Botflop responds to timings reports by viewing the server's
        configuration and suggesting potential optimizations. These
        optimizations will be unique to each timings report and each server.
        Botflop also uploads all text files to a paste bin for easier
        readability. No more having to download a config.yml, message.txt, or
        latest.log.
      </p>
      <div class="mt-2 flex gap-2">
        <a
          class="lum-btn lum-bg-blue/50 hover:lum-bg-blue"
          href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot"
        >
          <SiDiscord size={20} />
          Invite
        </a>
        <a
          class="lum-btn lum-bg-transparent"
          href="https://github.com/birdflop/botflop"
        >
          <SiGithub size={20} />
          Learn More
        </a>
      </div>

      <hr />

      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Binary size={30} />
        Binflop
      </h2>
      <p class="text-lum-text-secondary">
        Birdflop's spinoff of the original hastebin.com. Binflop improves upon
        Hastebin through the following methods:
      </p>
      <ul class="text-lum-text-secondary my-6 ml-6 list-disc space-y-2">
        <li>
          Ctrl + A, Ctrl + C no longer copies button text nor line numbers.
        </li>
        <li>
          Line numbering is correct across all browsers, all zoom settings, and
          all uploaded files.
        </li>
        <li>Colors are more vibrant and visible.</li>
        <li>Functions box no longer conceals part of the first line.</li>
        <li>Added a "Hide IPs" button to hide all public IPs.</li>
        <li>Links retain their content permanently.</li>
        <li>Expanded REST API.</li>
      </ul>
      <div class="mt-2 flex gap-2">
        <a
          class="lum-btn lum-bg-lime/50 hover:lum-bg-lime"
          href="https://bin.birdflop.com/"
        >
          <LinkIcon size={20} /> Visit
        </a>
      </div>

      <hr />

      <h2 class="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Bot size={30} />
        BirdTickets
      </h2>
      <p class="text-lum-text-secondary">
        A Discord ticket bot which provides premium features without a premium
        cost.
      </p>
      <ul class="text-lum-text-secondary my-6 ml-6 list-disc space-y-2">
        <li>Create tickets through commands and/or reactions.</li>
        <li>Close tickets through commands and/or reactions.</li>
        <li>Automatically close tickets if the creator leaves your server.</li>
        <li>Automatically close tickets if the creator is inactive.</li>
        <li>Automatically send a transcript to the creator upon closure.</li>
        <li>
          Automatically send a transcript to a specified channel upon closure.
        </li>
        <li>Beautiful HTML transcripts.</li>
        <li>And more...</li>
      </ul>
      <div class="mt-2 flex gap-2">
        <a
          class="lum-btn lum-bg-cyan/70 hover:lum-bg-cyan"
          href="https://discord.com/oauth2/authorize?client_id=809975422640717845&permissions=0&scope=bot"
        >
          <SiDiscord size={20} />
          Invite
        </a>
        <a
          class="lum-btn lum-bg-transparent"
          href="https://github.com/birdflop/birdtickets"
        >
          <SiGithub size={20} />
          Learn More
        </a>
      </div>

      <hr />
    </section>
  );
});

export const head = generateHead({
  title: 'Resources - Free Minecraft Resources by Birdflop',
  description: 'Public resources developed by Birdflop. ' + defaultDescription,
});
