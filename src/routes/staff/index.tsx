import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { PeopleOutline } from 'qwik-ionicons';
import { staffList } from '/staff';
import { Card } from '@luminescent/ui';
import backgroundImage from '/src/components/images/staff-bg.png';

export default component$(() => {
  return (
    <div class="staff-page">
      <section class="staff-section bg-cover bg-center bg-fixed min-h-screen relative pt-36 pb-10 text-white text-center px-5" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>
        <div class="staff-container relative z-10">
          <h1 class="flex gap-4 items-center justify-center text-gray-100 text-2xl sm:text-4xl font-bold text-center drop-shadow-lg mb-10 mt-5">
            <PeopleOutline width="64" style={{ color: 'white' }} /> Meet The Team
          </h1>
          <div class="staff-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((staff, i) => {
              return (
                <Card key={i} hover="clickable" blobs="darkergray" href={staff.portfolio} row color="zinc">
                  <img src={staff.avatar} width='0' height='0' alt={staff.name} class="staff-avatar w-16 h-16 rounded-full object-cover" />
                  <div class="text-left">
                    <h2 class="staff-name text-lg font-bold">{staff.name}</h2>
                    <p class="staff-bio text-sm">{staff.bio}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
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