import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { PeopleOutline } from 'qwik-ionicons';
import { Card, Header } from '@luminescent/ui';

export const staffList = [
  {
    name: 'Purpur',
    bio: 'Executive & technical director. Handles Birdflop\'s longterm vision and infrastructure',
    portfolio: 'https://github.com/kakduman',
    avatar: 'https://images-ext-1.discordapp.net/external/kth4aDLOuouTeuppDhbPjil0v2UiS_6zHu8OlgNXUXM/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/223585930093658122/ab42ed9463cf10fcfd10af490754ffd1.webp?format=webp',
  },
  {
    name: 'DrBot',
    bio: 'With 8+ years of experience as a server owner, can often help players diagnose issues',
    portfolio: 'https://github.com/akdukaan',
    avatar: 'https://images-ext-1.discordapp.net/external/54xlp6db35I0zvG9efg-3L8cpJdKCzqLuM9sVQW8sEY/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/322764955516665856/3c0561696e394bf5bbae151a323df17e.webp?format=webp&width=549&height=549',
  },
  {
    name: 'Technofied',
    bio: 'Heyo! I\'m Technofied, proud owner of a Minecraft server and Birdflop Operations Manager. I love to help people and make new friends!',
    portfolio: '',
    avatar: 'https://images-ext-1.discordapp.net/external/aNVJPw043vPvfHihpv0ECPsfjdohdDj_R1xS68harY8/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/158844320953270272/d3a034f6f03b718671c8a8804dffadc6.webp?format=webp&width=549&height=549',
  },
  {
    name: 'Oli/AkiraDev',
    bio: 'Developer of Birdflop Resources. I work on things like botflop, The panel, This Websites, and more! I can help you with client support and most other birdflop related things.',
    portfolio: 'https://bwmp.dev/',
    avatar: 'https://images-ext-1.discordapp.net/external/xrRx9dDuWdeESSCxOG10Psf3S7yEUBdXW89gNjuqA_Y/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/798738506859282482/b0cf17e71f1c00a0c7a0c7225bdbc759.webp?format=webp',
  },
  {
    name: 'Sab',
    bio: 'Hey! I mainly work on a Discord bot named Cactie & make websites, I am also a Culinary Arts student at NAIT and want to be a chef for a living.',
    portfolio: 'https://luminescent.dev/',
    avatar: 'https://images-ext-1.discordapp.net/external/LDLm_uDXPVBArnvLkbQqxfq6yFis2e33WMCofi2t9ow/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/249638347306303499/4207e5d38fc5a4b4b7c9e8457ab02313.webp?format=webp',
  },
  {
    name: 'Person0z',
    bio: 'Heyo! I\'m a self taught developer who loves to make things. I\'m currently working on a few projects, also I love talking so reach out to me!',
    portfolio: 'https://person0z.me/',
    avatar: 'https://images-ext-1.discordapp.net/external/778EsjMBS_d9HWMCGqr9TQgz44nuRyJgiksjtsAWbpg/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/640363201510244362/bb74f36d55d0d7adc038fe9d44c1d367.webp?format=webp&width=549&height=549',
  },
  {
    name: 'Ninevolt',
    bio: 'Avid Minecraft Player. My passion is to help others and provide people with the Minecraft experience I was not given growing up. Open for new friends!',
    portfolio: 'https://azrian.xyz/',
    avatar: 'https://images-ext-1.discordapp.net/external/quhoTVdSO2j1WTCYot80PfO62U-eOxXnpgC_nZFH6hU/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/306917480432140301/3628068f5ac9fff6afe9f48f8fc1892b.webp?format=webp',
  },
];

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="w-full my-10 min-h-[60px]">
        <h1 class="flex gap-4 items-center justify-center text-gray-100 text-2xl sm:text-4xl font-bold text-center drop-shadow-lg mb-6">
          <PeopleOutline width="64" style={{ color: 'white' }} /> Meet The Team
        </h1>
        <div id="staff-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center">
          {staffList.map((staff, i) => (
            <Card key={i} hover="clickable" blobs="darkgray" href={staff.portfolio} row color="zinc" class={{ 'flex flex-row items-start gap-4 max-w-full': true }}>
              <img src={staff.avatar} width='64' height='64' alt={staff.name} class="rounded-full object-cover" />
              <Header subheader={staff.bio}>{staff.name}</Header>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Birdflop - Meet The Team',
  meta: [
    {
      name: 'description',
      content: 'Meet the dedicated team behind Birdflop, a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources.',
    },
    {
      name: 'og:description',
      content: 'Meet the dedicated team behind Birdflop, a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};