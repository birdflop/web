import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { ButtonAnchor, Card, CardHeader } from '@luminescent/ui';
import { LogoDiscord, LogoGithub } from 'qwik-ionicons';

export default component$(() => {

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 py-16 sm:items-center justify-center min-h-[calc(100svh-100px)]">
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-4">
        Resources
      </h1>
      <div class="min-h-[60px] text-2xl flex flex-col gap-4">
        <Card color="darkgray">
          <CardHeader>
            Gradient Tools
            <span q:slot='subheader' class="text-xs text-gray-300">
              Tools to help you create gradient text in minecraft.
            </span>
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/rgb" color="red" blobs hoverable>
              <CardHeader>
                RGBirdflop
                <span q:slot='subheader' class="text-xs text-gray-300">
                  RGB gradient creator
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/animtab" color="blue" blobs hoverable>
              <CardHeader>
                Animated TAB
                <span q:slot='subheader' class="text-xs text-gray-300">
                  TAB plugin gradient animation creator
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/animpreview" color="green" blobs hoverable>
              <CardHeader>
                TAB Animation Previewer
                <span q:slot='subheader' class="text-xs text-gray-300">
                  Preview TAB Animations without the need to put them in-game
                </span>
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <CardHeader>
            Server tools
            <span q:slot='subheader' class="text-xs text-gray-300">
              Tools to help configure and setup minecraft servers.
            </span>
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/sparkprofile" color="yellow" blobs hoverable>
              <CardHeader>
                Spark Profile
                <span q:slot='subheader' class="text-xs text-gray-300">
                  Analyze Spark Profiles and get possible optimizations
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/papertimings" color="pink" blobs hoverable>
              <CardHeader>
                Paper Timings
                <span q:slot='subheader' class="text-xs text-gray-300">
                  Analyze Paper Timings Reports and get possible optimizations
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/flags" color="orange" blobs hoverable>
              <CardHeader>
                Flags
                <span q:slot='subheader' class="text-xs text-gray-300">
                  A simple script generator to start your Minecraft servers with optimal flags
                </span>
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <CardHeader>
            Miscellaneous tools
            <span q:slot='subheader' class="text-xs text-gray-300">
              Miscellaneous tools to help with random miscellaneous things.
            </span>
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/animtexture" color="purple" blobs hoverable>
              <CardHeader>
                Animated Textures
                <span q:slot='subheader' class="text-xs text-gray-300">
                  Easily merge textures for resource pack animations
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/colorstrip" color="gray" blobs hoverable>
              <CardHeader>
                Color Code Stripper
                <span q:slot='subheader' class="text-xs text-gray-300">
                  Strips all color / format codes from text
                </span>
              </CardHeader>
            </Card>
            <Card href="/resources/presettools" color="red" blobs hoverable>
              <CardHeader>
                Preset Tools
                <span q:slot='subheader' class="text-xs text-gray-300">
                  This will update older preset versions to the newest version
                </span>
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <CardHeader>
            Botflop
            <span q:slot='subheader' class="text-xs text-gray-300">
              Botflop is a Discord bot that watches chat to chime in and provide suggestions.
            </span>
          </CardHeader>
          <div class="text-lg">
            Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
          </div>
          <div class="flex gap-2">
            <ButtonAnchor href="https://github.com/birdflop/botflop" size="lg">
              <LogoGithub width="24" />
              Learn More
            </ButtonAnchor>
            <ButtonAnchor href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot" size="lg">
              <LogoDiscord width="24" />
              Invite
            </ButtonAnchor>
          </div>
        </Card>
        <Card color="darkgray">
          <CardHeader>
            Binflop
            <span q:slot='subheader' class="text-xs text-gray-300">
              Binflop is Birdflop's spinoff of the original hastebin.com.
            </span>
          </CardHeader>
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
            <ButtonAnchor href="https://bin.birdflop.com/" size="lg">
              Try it
            </ButtonAnchor>
          </div>
        </Card>
        <Card color="darkgray">
          <CardHeader>
            BirdTickets
            <span q:slot='subheader' class="text-xs text-gray-300">
              BirdTickets is a Discord ticket bot which provides premium features without a premium cost.
            </span>
          </CardHeader>
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
            <ButtonAnchor href="https://github.com/birdflop/botflop" size="lg">
              Learn More
            </ButtonAnchor>
            <ButtonAnchor href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot" size="lg">
              Invite
            </ButtonAnchor>
          </div>
        </Card>
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