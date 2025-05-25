import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { Blobs, LogoDiscord } from '@luminescent/ui-qwik';
import { Github, Link as LinkIcon } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { unloadGoogleAds } from '~/util/GoogleAds';

export default component$(() => {
  const t = inlineTranslate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-6xl px-6 py-16 items-center justify-center min-h-svh">
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-4 mt-10 drop-shadow-lg">
        {t('nav.resources.title@@Resources')}
      </h1>
      <div class="min-h-[60px] text-2xl flex flex-col gap-4">
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            Gradient Tools
          </h2>
          <h3 class="text-sm text-gray-400">
            Tools to help you create gradient text in Minecraft.
          </h3>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Link class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/rgb">
              <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.hexGradient.title@@RGBirdflop')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.hexGradient.description@@Hex gradient text generator, Powered by Birdflop, a 501(c)(3) nonprofit Minecraft host.')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-green-900/30 hover:lum-bg-green-900/70 transition duration-300 hover:duration-75 ease-out relative" href="https://docs.web-d5m.pages.dev/docs/rgbirdflop/api/">
              <Blobs color='green' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.hexGradientAPIDocs.title@@RGBirdflop API Docs')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.hexGradientAPIDocs.description@@Documentation for the RGBirdflop API')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-blue-900/30 hover:lum-bg-blue-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtab">
              <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.animatedTAB.title@@Animated TAB')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
              </h3>
            </Link>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            Server tools
          </h2>
          <h3 class="text-sm text-gray-400">
            Tools to help configure and setup minecraft servers.
          </h3>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Link class="lum-card lum-bg-yellow-900/30 hover:lum-bg-yellow-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/sparkprofile">
              <Blobs color='yellow' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.sparkProfile.title@@Spark Profile')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.sparkProfile.description@@Analyze a Spark Profile and get possible optimizations')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-pink-900/30 hover:lum-bg-pink-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/papertimings">
              <Blobs color='pink' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.paperTimings.title@@Paper Timings')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.paperTimings.description@@Analyze Paper Timings and get possible optimizations')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-orange-900/30 hover:lum-bg-orange-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/flags">
              <Blobs color='orange' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.flags.title@@Flags Generator')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags')}
              </h3>
            </Link>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            Miscellaneous tools
          </h2>
          <h3 class="text-sm text-gray-400">
            Miscellaneous tools to help with random miscellaneous things.
          </h3>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Link class="lum-card lum-bg-purple-900/30 hover:lum-bg-purple-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/banner">
              <Blobs color='purple' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.banner.title@@Banner Generator')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.banner.description@@Easily generate banner designs for Minecraft.')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-cyan-900/30 hover:lum-bg-cyan-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtexture">
              <Blobs color='cyan' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.animatedTextures.title@@Animated Textures')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
              </h3>
            </Link>
            <Link class="lum-card lum-bg-lime-900/30 hover:lum-bg-lime-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animpreview">
              <Blobs color='lime' class={{ 'absolute overflow-clip rounded-lg -z-10': true }} style={{ transform: 'translateZ(-10px)' }}/>
              <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
                {t('nav.resources.tabAnimationPreview.title@@TAB Animation Preview')}
              </h2>
              <h3 class="text-sm text-gray-400">
                {t('nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game')}
              </h3>
            </Link>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            Botflop
          </h2>
          <h3 class="text-sm text-gray-400">
            A Discord bot that watches chat to chime in and provide suggestions. Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
          </h3>
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
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            Binflop
          </h2>
          <h3 class="text-sm text-gray-400">
            Birdflop's spinoff of the original hastebin.com. Binflop improves upon Hastebin through the following methods:
          </h3>
          <div class="text-lg">
            <ul class="list-disc ml-5 space-y-1">
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
          </div>
          <div class="flex gap-2">
            <a class="lum-btn lum-bg-blue-600/50 hover:lum-bg-blue-600"
              href="https://bin.birdflop.com/">
              <LinkIcon size={20} /> Visit
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <h2 class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center">
            BirdTickets
          </h2>
          <h3 class="text-sm text-gray-400">
            A Discord ticket bot which provides premium features without a premium cost.
          </h3>
          <ul class="list-disc ml-5 space-y-1 text-lg">
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