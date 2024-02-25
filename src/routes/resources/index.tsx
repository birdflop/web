import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { ButtonAnchor, Card, Header } from '@luminescent/ui';
import { LogoDiscord, LogoGithub } from 'qwik-ionicons';

export default component$(() => {

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-6xl px-6 py-16 items-center justify-center min-h-[calc(100svh-68px)]">
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-4 mt-10">
        Resources
      </h1>
      <div class="min-h-[60px] text-2xl flex flex-col gap-4">
        <Card color="darkgray">
          <Header subheader="Tools to help you create gradient text in Minecraft.">
            Gradient Tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Card href="/resources/rgb" color="red" blobs hover="clickable">
              <Header subheader="RGB gradient creator">
                RGBirdflop
              </Header>
            </Card>
            <Card href="/resources/animtab" color="blue" blobs hover="clickable">
              <Header subheader="TAB plugin gradient animation creator">
                Animated TAB
              </Header>
            </Card>
            <Card href="/resources/animpreview" color="green" blobs hover="clickable">
              <Header subheader="Preview TAB Animations without the need to put them in-game">
                TAB Animation Previewer
              </Header>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <Header subheader="Tools to help configure and setup minecraft servers.">
            Server tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Card href="/resources/sparkprofile" color="yellow" blobs hover="clickable">
              <Header subheader="Analyze Spark Profiles and get possible optimizations">
                Spark Profile
              </Header>
            </Card>
            <Card href="/resources/papertimings" color="pink" blobs hover="clickable">
              <Header subheader="Analyze Paper Timings Reports and get possible optimizations">
                Paper Timings
              </Header>
            </Card>
            <Card href="/resources/flags" color="orange" blobs hover="clickable">
              <Header subheader="A simple script generator to start your Minecraft servers with optimal flags">
                Flags
              </Header>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <Header subheader="Miscellaneous tools to help with random miscellaneous things.">
            Miscellaneous tools
          </Header>
          <div class="flex [&>*]:flex-1 flex-wrap gap-4">
            <Card href="/resources/animtexture" color="purple" blobs hover="clickable">
              <Header subheader="Easily merge textures for resource pack animations">
                Animated Textures
              </Header>
            </Card>
            <Card href="/resources/colorstrip" color="gray" blobs hover="clickable">
              <Header subheader="Strips all color / format codes from text">
                Color Code Stripper
              </Header>
            </Card>
            <Card href="/resources/presettools" color="red" blobs hover="clickable">
              <Header subheader="Update older preset versions to the newest version">
                Preset Tools
              </Header>
            </Card>
          </div>
        </Card>
        <Card color="darkgray">
          <Header subheader="Botflop is a Discord bot that watches chat to chime in and provide suggestions.">
            Botflop
          </Header>
          <div class="text-lg">
            Botflop responds to timings reports by viewing the server's configuration and suggesting potential optimizations. These optimizations will be unique to each timings report and each server. Botflop also uploads all text files to a paste bin for easier readability. No more having to download a config.yml, message.txt, or latest.log.
          </div>
          <div class="flex gap-2">
            <ButtonAnchor href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot" size="lg" color="blue">
              <LogoDiscord width="24" />
              Invite
            </ButtonAnchor>
            <ButtonAnchor href="https://github.com/birdflop/botflop" size="lg">
              <LogoGithub width="24" />
              Learn More
            </ButtonAnchor>
          </div>
        </Card>
        <Card color="darkgray">
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
            <ButtonAnchor href="https://bin.birdflop.com/" size="lg" color="blue">
              Try it
            </ButtonAnchor>
          </div>
        </Card>
        <Card color="darkgray">
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
            <ButtonAnchor href="https://discord.com/oauth2/authorize?client_id=809975422640717845&permissions=0&scope=bot" size="lg" color="blue">
              <LogoDiscord width="24" />
              Invite
            </ButtonAnchor>
            <ButtonAnchor href="https://github.com/birdflop/birdtickets" size="lg">
              <LogoGithub width="24" />
              Learn More
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