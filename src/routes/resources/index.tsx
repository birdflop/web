import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LogoDiscord, LogoGithub } from 'qwik-ionicons';
import { ExternalButton } from '~/components/elements/Button';
import Card, { CardHeader } from '~/components/elements/Card';

export default component$(() => {

  return (
    <section class="flex flex-col gap-3 mx-auto max-w-7xl px-6 py-16 sm:items-center justify-center min-h-[calc(100svh-100px)]">
      <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-4">
        Resources
      </h1>
      <div class="min-h-[60px] text-2xl flex flex-col gap-4">
        <Card darker>
          <CardHeader subheader="Tools to help you create gradient text in minecraft.">
            Gradient Tools
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/gradients" color="red">
              <CardHeader subheader="Hex color gradient creator">
                Hex Gradient
              </CardHeader>
            </Card>
            <Card href="/resources/animtab" color="blue">
              <CardHeader subheader="TAB plugin gradient animation creator">
                Animated TAB
              </CardHeader>
            </Card>
            <Card href="/resources/animpreview" color="green">
              <CardHeader subheader="Preview TAB Animations without the need to put them in-game">
                TAB Animation Previewer
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card darker>
          <CardHeader subheader="Tools to help configure and setup minecraft servers.">
            Server tools
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/sparkprofile" color="yellow">
              <CardHeader subheader="Analyze Spark Profiles and get possible optimizations">
                Spark Profile
              </CardHeader>
            </Card>
            <Card href="/resources/papertimings" color="pink">
              <CardHeader subheader="Analyze Paper Timings Reports and get possible optimizations">
                Paper Timings
              </CardHeader>
            </Card>
            <Card href="/resources/flags" color="orange">
              <CardHeader subheader="A simple script generator to start your Minecraft servers with optimal flags">
                Flags
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card darker>
          <CardHeader subheader="Miscellaneous tools to help with random miscellaneous things.">
            Miscellaneous tools
          </CardHeader>
          <div class="flex flex-warp gap-4">
            <Card href="/resources/animtexture" color="purple">
              <CardHeader subheader="Easily merge textures for resource pack animations">
                Animated Textures
              </CardHeader>
            </Card>
            <Card href="/resources/colorstrip" color="gray">
              <CardHeader subheader="Strips all color / format codes from text">
                Color Code Stripper
              </CardHeader>
            </Card>
            <Card href="/resources/presettools" color="red">
              <CardHeader subheader="This will update older preset versions to the newest version">
                Preset Tools
              </CardHeader>
            </Card>
          </div>
        </Card>
        <Card darker>
          <CardHeader subheader="Botflop is a Discord bot that watches chat to chime in and provide suggestions.">
            Botflop
          </CardHeader>
          <div class="flex gap-2">
            <ExternalButton href="https://github.com/birdflop/botflop" big>
              <LogoGithub width="24" />
              Learn More
            </ExternalButton>
            <ExternalButton href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot" big>
              <LogoDiscord width="24" />
              Invite
            </ExternalButton>
          </div>
        </Card>
        <Card darker>
          <CardHeader subheader="Binflop is Birdflop's spinoff of the original hastebin.com.">
            Binflop
          </CardHeader>
          <h2>
            Binflop improves upon Hastebin through the following methods:
          </h2>
          <ul class="list-disc ml-5 space-y-2">
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
            <ExternalButton href="https://bin.birdflop.com/" big>
              Try it
            </ExternalButton>
          </div>
        </Card>
        <Card darker>
          <CardHeader subheader="BirdTickets is a Discord ticket bot which provides premium features without a premium cost.">
            BirdTickets
          </CardHeader>
          <ul class="list-disc ml-5 space-y-2">
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
            <ExternalButton href="https://github.com/birdflop/botflop" big>
              Learn More
            </ExternalButton>
            <ExternalButton href="https://discord.com/oauth2/authorize?client_id=787929894616825867&permissions=0&scope=bot" big>
              Invite
            </ExternalButton>
          </div>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Resources',
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
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};