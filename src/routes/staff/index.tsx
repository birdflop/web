import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { PeopleOutline } from 'qwik-ionicons';
import { staffList } from '~/data/staff';
import { Card, Header } from '@luminescent/ui';
import Background from '~/components/images/staff-bg.png?jsx';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px] relative">
      <Background class="fixed bottom-0 scale-110 overflow-hidden -z-10 h-lvh w-lvw object-cover object-center opacity-50" id="bg" alt="background" />
      <div class="w-full my-10 min-h-[60px] scale-for-mac">
        <h1 class="flex gap-4 items-center justify-center text-gray-100 text-2xl sm:text-4xl font-bold text-center drop-shadow-lg mb-6">
          <PeopleOutline width="64" style={{ color: 'white' }} /> Meet The Team
        </h1>
        <div id="staff-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff, i) => (
            <Card key={i} hover="clickable" blobs="darkgray" href={staff.portfolio} row color="zinc">
              <img src={staff.avatar} width='0' height='0' alt={staff.name} class="w-16 h-16 rounded-full object-cover" />
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