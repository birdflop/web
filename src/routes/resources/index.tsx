import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { Blobs, LogoDiscord, LogoPaper } from '@luminescent/ui-qwik';
import { Bot, Box, Eye, Flag, GalleryHorizontalEnd, Github, Link as LinkIcon, Palette, Presentation, Rainbow, Save, Text, Zap } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { unloadGoogleAds } from '~/util/GoogleAds';

export default component$(() => {
  const t = inlineTranslate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Box size={70} /> {t('nav.resources.title@@Resources')}
        </h1>
        <p>
          {t('nav.resources.description@@Here you can find all of Birdflop\'s public resources.')}
        </p>
        <hr/>
        <h3 class="my-0!">
          Gradient Tools
        </h3>
        <p class="mb-4">
          Tools to help you create gradient text in Minecraft.
        </p>
        <div class="flex [&>*]:flex-1 flex-wrap gap-2">
          <Link class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/rgb">
            <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Palette size={30} />
              {t('nav.resources.hexGradient.title@@RGBirdflop')}
            </h4>
            <p>
              {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-blue-900/30 hover:lum-bg-blue-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtab">
            <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Rainbow size={30} />
              {t('nav.resources.animatedTAB.title@@Animated TAB')}
            </h4>
            <p>
              {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/rgb">
            <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Save size={30} />
              {t('nav.resources.hexGradientPresets.title@@RGBirdflop Presets')}
            </h4>
            <p>
              {t('nav.resources.hexGradientPresets.description@@Here you can find and save, copy, or directly use presets for use on RGBirdflop.')}{' Stay tuned for a way to submit your own presets!'}
            </p>
          </Link>
        </div>
        <hr/>
        <h3 class="my-0!">
          Server tools
        </h3>
        <p class="mb-4">
          Tools to help configure and setup minecraft servers.
        </p>
        <div class="flex [&>*]:flex-1 flex-wrap gap-2">
          <Link class="lum-card lum-bg-yellow-900/30 hover:lum-bg-yellow-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/sparkprofile">
            <Blobs color='yellow' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Zap size={30} />
              {t('nav.resources.sparkProfile.title@@Spark Profile')}
            </h4>
            <p>
              {t('nav.resources.sparkProfile.description@@Analyze a Spark Profile and get possible optimizations')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-pink-900/30 hover:lum-bg-pink-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/papertimings">
            <Blobs color='pink' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <LogoPaper size={30} />
              {t('nav.resources.paperTimings.title@@Paper Timings')}
            </h4>
            <p>
              {t('nav.resources.paperTimings.description@@Analyze Paper Timings and get possible optimizations')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-orange-900/30 hover:lum-bg-orange-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/flags">
            <Blobs color='orange' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Flag size={30} />
              {t('nav.resources.flags.title@@Flags Generator')}
            </h4>
            <p>
              {t('nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags')}
            </p>
          </Link>
        </div>
        <hr/>
        <h3 class="my-0!">
          Miscellaneous tools
        </h3>
        <p class="mb-4">
          Miscellaneous tools to help with random miscellaneous things.
        </p>
        <div class="flex [&>*]:flex-1 flex-wrap gap-2 mb-2">
          <Link class="lum-card lum-bg-purple-900/30 hover:lum-bg-purple-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/banner">
            <Blobs color='purple' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Presentation size={30} />
              {t('nav.resources.banner.title@@Banner Generator')}
            </h4>
            <p>
              {t('nav.resources.banner.description@@Easily generate banner designs for Minecraft.')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-cyan-900/30 hover:lum-bg-cyan-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtexture">
            <Blobs color='cyan' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <GalleryHorizontalEnd size={30} />
              {t('nav.resources.animatedTextures.title@@Animated Textures')}
            </h4>
            <p>
              {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
            </p>
          </Link>
          <Link class="lum-card lum-bg-lime-900/30 hover:lum-bg-lime-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animpreview">
            <Blobs color='lime' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
            <h4 class="my-0! flex gap-3 items-center">
              <Eye size={30} />
              {t('nav.resources.tabAnimationPreview.title@@TAB Animation Preview')}
            </h4>
            <p>
              {t('nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game')}
            </p>
          </Link>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative mb-2">
          <h4 class="my-0! flex gap-3 items-center">
            <Bot size={30} />
            Botflop
          </h4>
          <p>
            A Discord bot that watches chat to chime in and provide suggestions. Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
          </p>
          <div class="flex gap-2">
            <a class="lum-btn lum-bg-blue-600/50 hover:lum-bg-blue-600"
              href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot">
              <LogoDiscord size={20} />
              Invite
            </a>
            <a class="lum-btn"
              href="https://github.com/birdflop/botflop">
              <Github size={20} />
              Learn More
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative mb-2">
          <h4 class="my-0! flex gap-3 items-center">
            <Text size={30} />
            Binflop
          </h4>
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
            <a class="lum-btn lum-bg-blue-600/50 hover:lum-bg-blue-600"
              href="https://bin.birdflop.com/">
              <LinkIcon size={20} /> Visit
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative mb-16">
          <h4 class="my-0! flex gap-3 items-center">
            <Bot size={30} />
            BirdTickets
          </h4>
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
            <a class="lum-btn lum-bg-blue-600/50 hover:lum-bg-blue-600"
              href="https://discord.com/oauth2/authorize?client_id=809975422640717845&permissions=0&scope=bot">
              <LogoDiscord size={20} />
              Invite
            </a>
            <a class="lum-btn"
              href="https://github.com/birdflop/birdtickets">
              <Github size={20} />
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Resources - Free Minecraft Resources by Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Public resources developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};