import { component$, useVisibleTask$, useSignal, useOnWindow, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

import { Anchor, Hoverable, LogoBirdflop } from '@luminescent/ui-qwik';
import { ShoppingCart, HandCoins, Eye, Globe, Heart, Rocket, Server, CheckCircle, AlertTriangle, Box, Settings, PiggyBank } from 'lucide-icons-qwik';
import { initiateTyper } from '~/util/Typer';

import { plans } from './plans';
import HistoricLinePlot from '~/components/home/HistoricLinePlot';
import { generateHead } from '~/root';
import ExpensesChart from '~/components/home/ExpensesChart';
import { discordLink, donateLink } from '~/components/Elements/Nav';
import Testimonials from '~/components/home/Testimonials';

export default component$(() => {
  const missionExpanded = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => initiateTyper());

  useOnWindow('scroll', $(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    const bg = document.getElementById('bg')!;
    bg.style.bottom = `${window.scrollY / 3}px`;
    bg.style.setProperty('--tw-blur', `blur(${window.scrollY / 20}px)`);
    const hero = document.getElementById('hero')!;
    hero.style.transform = `translateY(${window.scrollY / 2}px)`;
  }));

  return <>
    <section class="min-h-svh flex justify-center relative overflow-hidden">
      <div id="hero" class="flex flex-col md:flex-row text-gray-100 px-20 items-center justify-center md:justify-between pt-18 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl w-full">
        <div class="relative flex flex-col gap-4 xl:gap-8">
          <div class={{
            'relative mr-auto': true,
          }}>
            <div class="absolute -inset-4 blur-lg backdrop-blur-md rounded-4xl" />
            <h1 class={{
              'my-0! text-7xl! xl:text-8xl! relative flex items-center drop-shadow-lg text-transparent bg-clip-text': true,
              'animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:anim-duration-600': true,
            }}>
              <LogoBirdflop size={70} fillGradient={['#54daf4', '#545eb6']} class="absolute -z-1 w-12.5 xl:w-17.5 xl:-left-1" />
              <span class="text-transparent!">
                <span>b</span>
                <span
                  style={{
                    background: 'linear-gradient(180deg, #54daf4, #545eb6)',
                    backgroundClip: 'text',
                  }}>
                  irdflop
                </span>
              </span>
            </h1>
          </div>
          <div class={{
            'relative mr-auto': true,
          }}>
            <div class="absolute -inset-2 blur-lg backdrop-blur-md rounded-2xl" />
            <h2 class="my-0! text-xl! md:text-2xl! xl:text-3xl! animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:anim-duration-800 drop-shadow-md">
              The only 501(c)(3) nonprofit server host <br class="hidden sm:block"/> dedicated to <br class="sm:hidden"/><span
                class="typer"
                id="main"
                data-words={'public resources,communities,you'}
                data-colors="#5487CB,#54B1DF,#54DAF4,#54EEFF"
                data-delay="50"
                data-deleteDelay="1500">
              </span>
              <span class="cursor" data-owner="main" data-cursor-display="|"></span>
            </h2>
          </div>
        </div>
        <div class="flex flex-col gap-2 mt-8"
          style={{
            '--lum-border-radius': '1rem',
          }}>
          <a href="#plans"
            class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 backdrop-blur-sm text-xl lum-bg-blue-600/40 hover:lum-bg-blue-700 animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:anim-duration-600">
            <Server size={32} /> Hosting
          </a>
          <Link href="/resources"
            class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 backdrop-blur-sm text-xl lum-bg-purple-600/40 hover:lum-bg-purple-700 animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:anim-duration-800">
            <Box size={32}  /> Resources
          </Link>
          <a href={donateLink}
            class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 backdrop-blur-sm text-xl lum-bg-pink-600/40 hover:lum-bg-pink-700 animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:anim-duration-1000">
            <PiggyBank size={32} /> Donate Today
          </a>
        </div>
      </div>
    </section>
    <div class="bg-linear-to-b from-transparent to-bg h-20" />
    <section class="flex flex-col w-full p-10 bg-bg items-center justify-center">
      <h1>
        Our Nonprofit Mission
      </h1>
      <p class="max-w-3xl">
        At the heart of our mission, we are dedicated to igniting and nurturing a passion for technology and computer science. We uniquely approach our mission by offering affordable and accessible hosting resources, not just as a service, but as a catalyst for technological curiosity.&nbsp;
        {missionExpanded.value && <>
          Our belief is rooted in the idea that the hands-on experience of creating and managing a game server can be a gateway to a lifelong interest in technology and computer science. By ensuring this journey is engaging and frustration-free, we significantly enhance the likelihood of sparking a deeper interest in technological fields.
          <br />
          <br />
          Birdflop goes beyond mere hosting; we actively foster a community of learning and growth, exemplified through the wealth of public resources available on our <Link href="/resources" class="text-blue-400 hover:underline">Resources</Link> page. Looking ahead, we are committed to expanding our reach, investing in initiatives that fuel a passion for computer science and technology, and making a lasting impact in shaping future innovators. If you would like to further our mission, please consider making a tax-deductible <a href={donateLink} class="text-blue-400 hover:underline">charitable donation</a>.&nbsp;
        </>}
        <button class="text-blue-400 hover:underline" onClick$={() => missionExpanded.value = !missionExpanded.value}>
          {missionExpanded.value ? 'Read less' : 'Read more'}
        </button>
      </p>
    </section>
    <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
      <Anchor id="plans">
        <h1 id="plans" class="mr-2">
          Plans
        </h1>
      </Anchor>
      <div class="grid md:grid-cols-3 gap-2 max-w-4xl">
        {Object.keys(plans).map((planName) => {
          const plan = plans[planName as keyof typeof plans];
          const ramOptions = Object.keys(plan.ramAndId);
          return <div class="lum-card transition duration-1000 hover:duration-75 ease-out" key={planName}>
            <p>
              Last quarter, clients paid <strong>${plan.$PerGBReimbursed}/GB RAM</strong> after reimbursements.
            </p>
            <h3 class="my-0!">
              {planName}
            </h3>
            <p class="my-0!">
              {ramOptions[0]} - {ramOptions[ramOptions.length - 1]} GB plans<br/>capped at ${plan.$PerGB}/GB
            </p>
            <ul class="list-disc ml-4! h-full">
              {plan.features.map((feature) => {
                return <li key={feature}>
                  {feature}
                </li>;
              })}
            </ul>
            {plan.outOfStock ?
              <a href={discordLink} data-umami-event="discord-link" data-umami-source="plans" target="_blank"
                class="lum-btn lum-bg-red-600/50 hover:lum-bg-red-600 mt-4 w-min m-auto">
                <AlertTriangle size={20} class="text-3xl" /> Out of stock
              </a>
              :
              <Link href={`/plans?plan=${encodeURIComponent(planName)}`} class="lum-btn lum-bg-blue/50 hover:lum-bg-blue-500 mt-4 w-min m-auto"
                data-umami-event="Plan Ordernow Click"
                data-umami-event-page="home"
                data-umami-event-variant={planName}>
                <ShoppingCart size={20} class="text-3xl" /> Order Now
              </Link>
            }
          </div>;
        })}
      </div>
      <div class="lum-card lum-bg-green/60 transition-all duration-200! max-w-xl mt-5"
        onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
        onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
        <h4 class="my-0! flex items-center gap-2">
          <CheckCircle size={30} /> Benefits Galore
        </h4>
        <p>
          All plans come with a one-click modpack installer, DDoS protection, 3 off-site backups, dedicated IPs on 8+ GB plans, an improved Pterodactyl Panel for server management, and a 3-day satisfaction guarantee.
        </p>
      </div>
    </section>
    <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
      <Anchor id="features">
        <h1 id="features" class="mr-2">
          Features
        </h1>
      </Anchor>
      <div class="grid md:grid-cols-2 gap-2 max-w-5xl">
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <Rocket size={30} /> Sheer Performance
          </h3>
          <p>
            We don't make compromises. Choose from our blazing fast Ryzen 9 processors and NVMe SSDs. All plans include a satisfaction guarantee.
          </p>
        </div>
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <Settings size={30} /> Fully Configurable
          </h3>
          <p>
            You'll have full access to your server. You can set your startup flags, change your java version, upload custom jars, and create reverse proxies.
          </p>
        </div>
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <Eye size={30} /> Transparent
          </h3>
          <p>
            We don't oversell, and we're transparent about that. View our public <Link href="/node-stats" class="text-blue-400 hover:underline">detailed server statistics</Link> or financial breakdown.
          </p>
        </div>
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <Globe size={30} /> Price Matching
          </h3>
          <p>
            We're confident that we have the best plans available. If you locate a similar plan at a lower price, ask us about our price matching.
          </p>
        </div>
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <Heart size={30} /> Instant Support
          </h3>
          <p>
            You can contact support at any time through our <a href={discordLink} data-umami-event="discord-link" data-umami-source="support" class="text-blue-400 hover:underline">Discord server</a>.
          </p>
        </div>
        <div class="lum-card transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}>
          <h3 class="mt-0! mb-2! flex items-center gap-2">
            <HandCoins size={30} /> Nonprofit
          </h3>
          <p>
            Our nonprofit status helps us keep our services affordable and accessible. Clients receive periodic reimbursements for excess profit.
          </p>
        </div>
      </div>
    </section>
    <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
      <h1>
        How do reimbursements work?
      </h1>
      <p class="max-w-4xl">
        As a nonprofit, Birdflop periodically reimburses clients based on excess profit. At the end of each reimbursement period, active clients receive a reimbursement for excess profit from their plan. These reimbursements are dependent on usage, maximally lowering prices at high service utilization. Last quarter, US clients received a 33.7% reimbursement and EU clients received a 26% reimbursement, effectively lowering prices to $1.99/GB RAM and $1.48/GB RAM for the US and EU, respectively. Not good enough? Find a competitor with similar specifications and inquire about our price matching.&nbsp;
      </p>
      <div class="mt-4">
        <h4>
          Historical Reimbursement Rates for US and EU Clients
        </h4>
        <HistoricLinePlot />
      </div>
    </section>
    <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
      <h1>
        Where do my payments go?
      </h1>
      <div class="grid md:grid-cols-2 gap-10 max-w-5xl">
        <div>
          <ExpensesChart />
          <p class="text-lum-text-secondary text-center py-2 text-sm">
            Plot shows revenue (inner ring) and expenditures (outer ring) for Q1 2025. Some numbers may be approximations, and categories may be simplified. US Hosting Expenses includes depreciation.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <p>
            Birdflop is a 501(c)(3) nonprofit organization. As such, all profit generated is reinvested into improving our services and accomplishing our mission. Your service fees are used for covering our server costs, including building new servers, colocation fees, server rental fees, and software licensing fees. Our quarterly financial report is proudly displayed on the left.
          </p>
          <p>
            Your payments get you the best possible rate while contributing to the development of our <Link href="/resources" class="text-blue-400 hover:underline">free public resources</Link>. We reimburse clients based on excess profit, and we never overload our servers. View our server statistics on the <Link href="/node-stats" class="text-blue-400 hover:underline">Node Stats</Link> page.
          </p>
        </div>
      </div>
    </section>
    <Testimonials />
    <section class="flex flex-col w-full bg-bg p-10 items-center justify-center">
      <h1>
        Still not convinced?
      </h1>
      <p class="max-w-4xl">
        Create a ticket on our <a href={discordLink} data-umami-event="discord-link" data-umami-source="trial" class="text-blue-400 hover:underline">Discord server</a> to ask for more information or request a free trial. All plans include a 3-day refund guarantee if you're not satisfied for any reason. On the Discord, you'll also find several more happy clients who can tell you about their experiences with Birdflop.
      </p>
    </section>
  </>;
});

export const head = generateHead({});
