import { component$, useOnDocument, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Blobs, Header } from '@luminescent/ui-qwik';
import { LogoDiscord, LogoGithub } from 'qwik-ionicons';
import { unloadGoogleAds } from '~/components/util/GoogleAds';

export default component$(() => {

  useOnDocument(
    'load',
    $(() => {
      unloadGoogleAds();
    }),
  );

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-6xl px-6 py-16 items-center justify-center min-h-svh">
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-4 mt-10 drop-shadow-lg">
        Resources
      </h1>
      <div class="min-h-[60px] text-2xl flex flex-col gap-4">
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="Tools to help you create gradient text in Minecraft.">
            Gradient Tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <a class="lum-card lum-bg-red-900/30 hover:lum-bg-red-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/rgb">
              <Header subheader="RGB gradient creator">
                RGBirdflop
              </Header>
              <Blobs color='red' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-green-900/30 hover:lum-bg-green-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/api/v2/docs">
              <Header subheader="Documentation for the RGBirdflop API">
                API Docs
              </Header>
              <Blobs color='green' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-blue-900/30 hover:lum-bg-blue-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtab">
              <Header subheader="TAB plugin gradient animation creator">
                Animated TAB
              </Header>
              <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="Tools to help configure and setup minecraft servers.">
            Server tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <a class="lum-card lum-bg-yellow-900/30 hover:lum-bg-yellow-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/sparkprofile">
              <Header subheader="Analyze Spark Profiles and get possible optimizations">
                Spark Profile
              </Header>
              <Blobs color='yellow' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-pink-900/30 hover:lum-bg-pink-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/papertimings">
              <Header subheader="Analyze Paper Timings Reports and get possible optimizations">
                Paper Timings
              </Header>
              <Blobs color='pink' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-orange-900/30 hover:lum-bg-orange-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/flags">
              <Header subheader="A simple script generator to start your Minecraft servers with optimal flags">
                Flags
              </Header>
              <Blobs color='orange' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="Miscellaneous tools to help with random miscellaneous things.">
            Miscellaneous tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <a class="lum-card lum-bg-purple-900/30 hover:lum-bg-purple-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animtexture">
              <Header subheader="Easily merge textures for resource pack animations">
                Animated Textures
              </Header>
              <Blobs color='purple' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-lime-900/30 hover:lum-bg-lime-900/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/animpreview">
              <Header subheader="Preview TAB Animations without the need to put them in-game">
                TAB Animation Previewer
              </Header>
              <Blobs color='lime' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
            <a class="lum-card lum-bg-gray-800/30 hover:lum-bg-gray-800/70 transition duration-300 hover:duration-75 ease-out relative" href="/resources/colorstrip">
              <Header subheader="Strips all color / format codes from text">
                Color Code Stripper
              </Header>
              <Blobs color='gray' class={{ 'absolute overflow-clip rounded-lg': true }} style={{ transform: 'translateZ(-10px)' }}/>
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="Botflop is a Discord bot that watches chat to chime in and provide suggestions.">
            Botflop
          </Header>
          <div class="text-lg">
            Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
          </div>
          <div class="flex gap-2">
            <a class="lum-btn lum-pad-md rounded-lg text-lg lum-bg-blue-700/80 hover:lum-bg-blue-600 gap-4 fill-current"
              href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot">
              <LogoDiscord width="24" />
              Invite
            </a>
            <a class="lum-btn lum-pad-md rounded-lg text-lg gap-4 fill-current"
              href="https://github.com/birdflop/botflop">
              <LogoGithub width="24" />
              Learn More
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="Binflop is Birdflop's spinoff of the original hastebin.com.">
            Binflop
          </Header>
          <div class="text-lg">
            Binflop improves upon Hastebin through the following methods:
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
            <a class="lum-btn lum-pad-md rounded-lg text-lg lum-bg-blue-700/80 hover:lum-bg-blue-600 gap-4"
              href="https://bin.birdflop.com/">
              Try it
            </a>
          </div>
        </div>
        <div class="lum-card lum-bg-gray-800/50 hover:lum-bg-gray-800/70 transition duration-1000 hover:duration-75 ease-out relative">
          <Header subheader="BirdTickets is a Discord ticket bot which provides premium features without a premium cost.">
            BirdTickets
          </Header>
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
            <a class="lum-btn lum-pad-md rounded-lg text-lg lum-bg-blue-700/80 hover:lum-bg-blue-600 gap-4 fill-current"
              href="https://discord.com/oauth2/authorize?client_id=809975422640717845&permissions=0&scope=bot">
              <LogoDiscord width="24" />
              Invite
            </a>
            <a class="lum-btn lum-pad-md rounded-lg text-lg gap-4 fill-current"
              href="https://github.com/birdflop/birdtickets">
              <LogoGithub width="24" />
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