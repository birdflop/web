import { component$, $, useOnWindow, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { CashOutline, ServerOutline } from 'qwik-ionicons';
import Birdflop from '~/components/icons/Birdflop';
import { initiateTyper } from '~/components/util/Typer';

import background from '~/images/background.png';

export default component$(() => {

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    initiateTyper();
  });

  useOnWindow('scroll', $(() => {
    console.log('scroll');
    const bg = document.getElementById('bg')!;
    bg.style.bottom = `${window.scrollY / 2}px`;
    bg.style.filter = `blur(${window.scrollY * 2 / 100}px)`;
  }));

  return <>
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-56px)]">
      <picture class="fixed bottom-0 scale-105 overflow-hidden -z-10 h-[100lvh] w-[100lvw]" id="bg">
        <img
          width={1920}
          height={1080}
          src={background}
          class="object-cover object-center h-full w-full opacity-55"
          alt="Birdflop Hosting"
        />
      </picture>
      <div class="text-center justify-center flex relative align-center w-full">
        <div class="flex flex-col gap-6 w-full">
          <div class="flex relative justify-center align-center fade-in animation-delay-100 mb-8 drop-shadow-2xl">
            <Birdflop width={200} />
          </div>
          <h1 class="text-gray-100 text-6xl font-bold fade-in animation-delay-200">
            Birdflop Hosting
          </h1>
          <h2 class="text-gray-300 text-2xl fade-in animation-delay-300">
            The only 501(c)(3) nonprofit server host dedicated to <span
              class="typer"
              id="main"
              data-words={'minecraft hosting,public resources,communities,you'}
              data-colors="#54DAF4,#54B1DF,#5487CB,#545EB6,#545EB6,#5487CB,#54B1DF,#54DAF4"
              data-delay="30"
              data-deleteDelay="1000"
            >
            </span>
            <span class="cursor" data-owner="main" data-cursor-display="|"></span>
          </h2>
          <div class="flex gap-4 justify-center fade-in animation-delay-400 mt-8">
            <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-sky-700/80 hover:bg-sky-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
              <ServerOutline width="30" class="text-3xl" /> Hosting
            </a>
            <a href="https://www.paypal.com/donate/?hosted_button_id=6NJAD4KW8V28U" class="flex transition ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-pink-900/80 hover:bg-pink-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
              <CashOutline width="30" class="text-3xl" /> Donate Today
            </a>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-4">
          <h2 class="text-gray-100 text-6xl font-bold mb-4">
            Our Nonprofit Mission
          </h2>
          <p class="text-gray-300 text-2xl">
            Birdflop's mission is "to promote and encourage interest in technology and computer science, generally but not exclusively through affordable and accessible virtual server hosting."
          </p>
          <p class="text-gray-300 text-2xl">
            At the heart of our mission, we are dedicated to igniting and nurturing a passion for technology and computer science. We uniquely approach our mission by offering affordable and accessible hosting resources, not just as a service, but as a catalyst for technological curiosity. Our belief is rooted in the idea that the hands-on experience of creating and managing a game server can be a gateway to a lifelong interest in technology and computer science. By ensuring this journey is engaging and frustration-free, we significantly enhance the likelihood of sparking a deeper interest in technological fields.
          </p>
          <p class="text-gray-300 text-2xl">
            Birdflop goes beyond mere hosting; we actively foster a community of learning and growth, exemplified through the wealth of public resources available on our Resources page. Looking ahead, we are committed to expanding our reach, investing in initiatives that fuel a passion for computer science and technology, and making a lasting impact in shaping future innovators. If you would like to further our mission, please consider making a charitable donation, tax-deductible in the United States.
          </p>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold mb-4">
            Where do my payments go?
          </h2>
          <div class="grid sm:grid-cols-2">
            <div></div>
            <div class="flex flex-col gap-8">
              <p class="text-gray-300 text-2xl">
                Birdflop is a 501(c)(3) nonprofit organization with no paid employees or directors. As such, all profit generated is reinvested into improving our services and accomplishing our mission. Your service fees are used for covering our server costs, including building new servers, colocation fees, server rental fees, and software licensing fees. Our quarterly financial report is proudly displayed on the left.
              </p>
              <p class="text-gray-300 text-2xl">
                Your payments get you the best possible rate while contributing to the development of our free public resources. We reimburse clients based on excess profit, and we never overload our servers. View our server statistics on the Node Stats page.
              </p>
              <p class="text-gray-300 text-2xl">
                If you'd like to further our mission of promoting interest in technology, please consider making a charitable donation, tax-deductible in the United States. You may indicate how you would like us to spend your charitable contribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold">
            Plans
          </h2>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold">
            Features
          </h2>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold">
            How do reimbursements work?
          </h2>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold">
            Testimonials
          </h2>
        </div>
      </div>
    </section>
    <section class="flex mx-auto pt-16 items-center justify-center bg-gray-800">
      <div class="justify-center flex relative align-center max-w-7xl">
        <div class="flex flex-col gap-8">
          <h2 class="text-gray-100 text-6xl font-bold">
            Want More Info?
          </h2>
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'Minecraft Hosting & Resources',
  meta: [
    {
      name: 'description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
