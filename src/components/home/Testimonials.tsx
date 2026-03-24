import { component$, useOnWindow, $ } from '@builder.io/qwik';

import { Anchor, Hoverable } from '@luminescent/ui-qwik';
import { generateHead } from '~/root';
import { CircleUser, Star } from 'lucide-icons-qwik';

const testimonials = [
  {
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjUNDQylUlWQB3O8Hu6QMwbxIfP1OMRqpGYZ3fW72-JuVt-wZ5eFvQ=w72-h72-p-rp-mo-ba3-br100',
    name: 'Mikkel Hansen',
    description: `
      I'm happy with my subscription, providing nearly full system access at a great price point.
      They've proven to be reliable, trustworthy and transparent. It's clear that actual humans run this place and their support is S tier
      (if you don't mind the need to be part of their Discord server).
    `,
    link: 'https://maps.app.goo.gl/6zZBB1HSqdGyTmeT6',
  },
  {
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjWgGf8lxvVXxJ-XLj4lR_fg9vpg6Es7yyO3L_kn5bFA-mlE2So=w72-h72-p-rp-mo-ba2-br100',
    name: 'Hunter Smith',
    description: `
      Great service! I like hosting my Minecraft server here and the customer service that is provided is awesome.
    `,
    link: 'https://maps.app.goo.gl/muRrvsTKKVYFgtYq9',
  },
  {
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjVUyTs5IBGv7tzc6vfl3LPjoJqE3fYZx3AkVP7-Yb_qClOeecg=w72-h72-p-rp-mo-br100',
    name: 'Rensura',
    description: `
      Absolutely amazing service. Ever since setting up my server they have been absolutely phenomenal in response time,
      their support is unrivaled and I couldn't be happier to have them as my host. I'll recommend them to everybody!
    `,
    link: 'https://maps.app.goo.gl/GEc5uhvu9GpkMyN47',
  },
  {
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjXgAKImQtGZT54-UxHCp0q1qKxXxvN5bWtW25WsMXp_GXpo5tg=w72-h72-p-rp-mo-br100',
    name: 'Voldechu The Second',
    description: `
      Server has run off of Birdflop for years now, and when the rare problem occurs they're on top of it in minutes!
    `,
    link: 'https://maps.app.goo.gl/UYenFJwRmsW6ZFZj8',
  },
  {
    image: 'https://lh3.googleusercontent.com/a-/ALV-UjU4YKyizffiGFijCfoFHF6L-Y1yvfCFc_0DdXHXlvj9irg21sjEUQ=w72-h72-p-rp-mo-ba3-br100',
    name: 'Muhammad Saboor Bilal',
    description: `
      amazing host fr top tier, the fact that it's non-profit makes it also cheaper than other hosts
    `,
    link: 'https://maps.app.goo.gl/8ACmFHJhU2JLd8g89',
  },
  {
    image: 'https://user-images.trustpilot.com/65a592af0b3452001203b7e7/73x73.png',
    name: 'Wizzy SMP',
    title: 'Birdflop is the best Minecraft server host!',
    description: `
      Birdflop is the best Minecraft server hosting out there! Unbeatable pricing (due to their tax-exempt 501(c)3 non-profit status),
      amazing support on their Discord server and great servers! We have 24/7 access to all stats that we'd need to know
      like in/out network speed, average CPU usage per node, and a lot more. Birdflop is my recommendation to all my friends!
    `,
    link: 'https://www.trustpilot.com/reviews/65a592b5f66c25889e859abe',
  },
  {
    name: 'Beaunation',
    description: `
      I've been with Birdflop about a year and a half now. I've experienced amazing customer service and it's very obvious they prioritize the satisfaction of their customers over profits. I have 0 complaints and I rate this a 5 out of 5.
    `,
    link: 'https://www.trustpilot.com/reviews/62b14bd9787382efe2128729',
  },
  {
    name: 'Jmaster',
    description: `
      Amazing hosting, amazing staff, and top of the line performance. 11/10, and I recommend it to everyone. I can say with confidence, this is a valid host and has no cringe features.
    `,
    link: 'https://www.trustpilot.com/reviews/602d901e679d97052cdb67d1',
  },
  {
    name: 'Oliver Flynn',
    title: 'Great hosting',
    description: `
      Best hosting I have ever used. great owners, fast help, amazing servers. all around a good host.
    `,
    link: 'https://www.trustpilot.com/reviews/5fd91bba755dc10b4824093d',
  },
  {
    image: 'https://user-images.trustpilot.com/5ee43541207f32075f73a687/73x73.png',
    name: 'sab',
    title: 'birdflop good',
    description: `
      best hosting service i've seen yet, fast servers, fair prices, beats any other hosting service i've heard of
    `,
    link: 'https://www.trustpilot.com/reviews/5fd91054755dc107e0c449a4',
  },
  {
    name: 'Arkadi Statsenko',
    description: `
      Amazing hosting provider, can recommend. The quality of services and support is outstanding, and all for a very reasonable price. Have been a client since 2021.
    `,
    link: 'https://www.trustpilot.com/reviews/655f9f61ead4189d862f06ce',
  },
  {
    image: 'https://user-images.trustpilot.com/603d5a838063b500195c1f75/73x73.png',
    name: 'Kayla T.',
    description: `
      I've been using Birdflop for a week now and I've gotten service that is not only cheaper than a shared CPU VPS at a hosting provider, but excellent support from the support team on odd issues I've had.
      I would recommend them to anyone looking for a more personalized hosting experience with administrators that are open to looking at optimizing their platform to prevent cross-contamination of resource exhaustion.
    `,
    link: 'https://www.trustpilot.com/reviews/603d5b3cf85d750b98a48f2f',
  },
  {
    name: 'JustDoom',
    description: `
      Support is amazing, very fast and the staff are friendly. Friendly community and the owner created a discord bot that suggests what to optimize for your Minecraft server which helps the community a lot.
      The hardware is amazing and cheap. The panel used for servers is clean and looks good, it also works on mobile really well.
    `,
    link: 'https://www.trustpilot.com/reviews/6035f67ef85d7509d8e29acf',
  },
  {
    name: 'Lefty',
    description: `
      Ive had a great experience with this hosting so far, I currently have four servers hosted by Birdflop and each of them run very well.
      They provide quick support for issues/questions regarding hosting and for help with plugins too. Definitely would recommend :)
    `,
    link: 'https://www.trustpilot.com/reviews/5fd922b3755dc107e0c45e1d',
  },
];

export default component$(() => {
  useOnWindow('scroll', $(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    const bg = document.getElementById('bg')!;
    bg.style.bottom = `${window.scrollY / 3}px`;
    bg.style.setProperty('--tw-blur', `blur(${window.scrollY / 20}px)`);
    const hero = document.getElementById('hero')!;
    hero.style.transform = `translateY(${window.scrollY / 2}px)`;
  }));

  // pick random 5 testimonials to show
  const fiveTestimonials = testimonials.sort(() => 0.5 - Math.random()).slice(0, 5);

  return <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
    <Anchor id="testimonials">
      <h1 id="testimonials" class="mr-2">
        Testimonials
      </h1>
    </Anchor>
    <div class="grid md:grid-cols-2 gap-2 max-w-6xl">
      {fiveTestimonials.map(({ name, image, title, description, link }) => {
        return <a href={link} key={name}
          class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            {image ?
              <img src={image} alt={name} class="rounded-full object-cover" width={30} height={30} />
              : <CircleUser size={30} />}
            {name}
          </h3>
          {title && <p class="font-bold">
            {title}
          </p>}
          <p class="whitespace-normal">
            {description}
          </p>
        </a>;
      })}
      <div class="lum-card transition-all duration-200!"
        onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
        onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
        <h3 class="mt-0! mb-2! flex items-center gap-2">
          <Star size={30} /> More
        </h3>
        <p>
          Check out our Trustpilot or Google page for more testimonials.
        </p>
        <div class="flex gap-2">
          <a href="https://www.trustpilot.com/review/birdflop.com" class="lum-btn">
            Trustpilot
          </a>
          <a href="https://maps.app.goo.gl/R1AYXVd1Q6YvTLBT8" class="lum-btn">
            Google
          </a>
        </div>
      </div>
    </div>
  </section>;
});

export const head = generateHead({});