import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Blobs, Hoverable, LogoDiscord, LogoPaper } from '@luminescent/ui-qwik';
import { Binary, Bot, Box, Eye, Flag, GalleryHorizontalEnd, Github, Link as LinkIcon, Palette, Presentation, Rainbow, Save, Zap } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl! items-center my-2!">
        <Box size={32} />
        {t('nav.resources.title@@Resources')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.resources.description@@Here you can find all of Birdflop\'s public resources.')}
      </p>

      <h2 class="my-0! text-xl!">
        {t('nav.resources.gradientTools.title@@Gradient Tools')}
      </h2>
      <p class="mb-4">
        {t('nav.resources.gradientTools.description@@Tools to help you create gradient text in Minecraft.')}
      </p>
      <div class="flex *:flex-1 flex-wrap gap-2">
        <Link class="lum-card lum-bg-red/10 hover:lum-bg-red/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/rgb">
          <Blobs color="red" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Palette />
            {t('nav.resources.hexGradient.title@@RGBirdflop')}
          </h3>
          <p>
            {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-blue/10 hover:lum-bg-blue/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/animtab">
          <Blobs color="blue" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Rainbow />
            {t('nav.resources.animatedTAB.title@@Animated TAB')}
          </h3>
          <p>
            {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-green/10 hover:lum-bg-green/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/rgb/presets">
          <Blobs color="green" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Save />
            {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
          </h3>
          <p>
            {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}
          </p>
        </Link>
      </div>
      <hr/>
      <h2 class="my-0! text-xl!">
        {t('nav.resources.serverTools.title@@Server Tools')}
      </h2>
      <p class="mb-4">
        {t('nav.resources.serverTools.description@@Tools to help configure and setup minecraft servers.')}
      </p>
      <div class="flex *:flex-1 flex-wrap gap-2">
        <Link class="lum-card lum-bg-yellow/10 hover:lum-bg-yellow/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/sparkprofile">
          <Blobs color="yellow" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Zap />
            {t('nav.resources.sparkProfile.title@@Spark Profile')}
          </h3>
          <p>
            {t('nav.resources.sparkProfile.description@@Analyze a Spark Profile and get possible optimizations')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-pink/10 hover:lum-bg-pink/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/papertimings">
          <Blobs color="pink" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <LogoPaper size={24} />
            {t('nav.resources.paperTimings.title@@Paper Timings')}
          </h3>
          <p>
            {t('nav.resources.paperTimings.description@@Analyze Paper Timings and get possible optimizations')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-orange/10 hover:lum-bg-orange/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/flags">
          <Blobs color="orange" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Flag />
            {t('nav.resources.flags.title@@Flags Generator')}
          </h3>
          <p>
            {t('nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags')}
          </p>
        </Link>
      </div>
      <hr/>
      <h2 class="my-0! text-xl!">
        {t('nav.resources.miscellaneousTools.title@@Miscellaneous Tools')}
      </h2>
      <p class="mb-4">
        {t('nav.resources.miscellaneousTools.description@@Miscellaneous tools to help with random miscellaneous things.')}
      </p>
      <div class="flex *:flex-1 flex-wrap gap-2 mb-2">
        <Link class="lum-card lum-bg-purple/10 hover:lum-bg-purple/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/banner">
          <Blobs color="purple" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Presentation />
            {t('nav.resources.banner.title@@Banner Generator')}
          </h3>
          <p>
            {t('nav.resources.banner.description@@Easily generate banner designs for Minecraft.')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-cyan/10 hover:lum-bg-cyan/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/animtexture">
          <Blobs color="cyan" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <GalleryHorizontalEnd />
            {t('nav.resources.animatedTextures.title@@Animated Textures')}
          </h3>
          <p>
            {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
          </p>
        </Link>
        <Link class="lum-card lum-bg-lime/10 hover:lum-bg-lime/30 transition duration-1000 hover:duration-75 ease-out relative lum-hoverable"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)} href="/resources/animpreview">
          <Blobs color="lime" class={{ 'absolute overflow-clip rounded-lum -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
          <h3 class="my-0! text-xl! flex gap-2 items-center">
            <Eye />
            {t('nav.resources.tabAnimationPreview.title@@TAB Animation Preview')}
          </h3>
          <p>
            {t('nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game')}
          </p>
        </Link>
      </div>
      <hr/>
      <div class="flex flex-col gap-2 mb-2">
        <h2 class="my-0! text-xl! flex gap-3 items-center">
          <Bot />
          Botflop
        </h2>
        <p>
          A Discord bot that watches chat to chime in and provide suggestions. Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
        </p>
        <div class="flex gap-2">
          <a class="lum-btn lum-bg-blue/50 hover:lum-bg-blue"
            href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot">
            <LogoDiscord size={20} />
            Invite
          </a>
          <a class="lum-btn lum-bg-transparent"
            href="https://github.com/birdflop/botflop">
            <Github size={20} />
            Learn More
          </a>
        </div>
      </div>
      <hr/>
      <div class="flex flex-col gap-2 mb-2">
        <h2 class="my-0! text-xl! flex gap-3 items-center">
          <Binary />
          Binflop
        </h2>
        <p>
          Birdflop's spinoff of the original hastebin.com. Binflop improves upon Hastebin through the following methods:
        </p>
        <ul>
          <li>
            Ctrl + A, Ctrl + C no longer copies button text nor line numbers.
          </li>
          <li>
            Line numbering is correct across all browsers, all zoom settings, and all uploaded files.
          </li>
          <li>
            Colors are more vibrant and visible.
          </li>
          <li>
            Functions box no longer conceals part of the first line.
          </li>
          <li>
            Added a "Hide IPs" button to hide all public IPs.
          </li>
          <li>
            Links retain their content permanently.
          </li>
          <li>
            Expanded REST API.
          </li>
        </ul>
        <div class="flex gap-2">
          <a class="lum-btn lum-bg-lime/50 hover:lum-bg-lime"
            href="https://bin.birdflop.com/">
            <LinkIcon size={20} /> Visit
          </a>
        </div>
      </div>
      <hr/>
      <div class="flex flex-col gap-2 mb-6">
        <h2 class="my-0! text-xl! flex gap-3 items-center">
          <Bot />
          BirdTickets
        </h2>
        <p>
          A Discord ticket bot which provides premium features without a premium cost.
        </p>
        <ul>
          <li>
            Create tickets through commands and/or reactions.
          </li>
          <li>
            Close tickets through commands and/or reactions.
          </li>
          <li>
            Automatically close tickets if the creator leaves your server.
          </li>
          <li>
            Automatically close tickets if the creator is inactive.
          </li>
          <li>
            Automatically send a transcript to the creator upon closure.
          </li>
          <li>
            Automatically send a transcript to a specified channel upon closure.
          </li>
          <li>
            Beautiful HTML transcripts.
          </li>
          <li>
            And more...
          </li>
        </ul>
        <div class="flex gap-2">
          <a class="lum-btn lum-bg-cyan/70 hover:lum-bg-cyan"
            href="https://discord.com/oauth2/authorize?client_id=809975422640717845&permissions=0&scope=bot">
            <LogoDiscord size={20} />
            Invite
          </a>
          <a class="lum-btn lum-bg-transparent"
            href="https://github.com/birdflop/birdtickets">
            <Github size={20} />
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Resources - Free Minecraft Resources by Birdflop',
  description: 'Public resources developed by Birdflop. ' + defaultDescription,
});