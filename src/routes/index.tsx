import { component$, useVisibleTask$, useSignal } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';

import { Birdflop } from '@luminescent/icons-qwik';
import { Anchor, Hoverable } from '@luminescent/ui-qwik';
import ShoppingCart from 'lucide-icons-qwik/icons/ShoppingCart';
import HandCoins from 'lucide-icons-qwik/icons/HandCoins';
import Eye from 'lucide-icons-qwik/icons/Eye';
import Globe from 'lucide-icons-qwik/icons/Globe';
import Heart from 'lucide-icons-qwik/icons/Heart';
import Rocket from 'lucide-icons-qwik/icons/Rocket';
import Server from 'lucide-icons-qwik/icons/Server';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import AlertTriangle from 'lucide-icons-qwik/icons/AlertTriangle';
import Box from 'lucide-icons-qwik/icons/Box';
import Settings from 'lucide-icons-qwik/icons/Settings';
import { initiateTyper } from '~/util/Typer';

import { plans } from './plans';
import HistoricLinePlot from '~/components/home/HistoricLinePlot';
import { generateHead } from '~/root';
import ExpensesChart from '~/components/home/ExpensesChart';
import {
  csroomLink,
  discordLink,
  donateLink,
  nonprofitLink,
} from '~/components/Elements/Nav';
import Testimonials from '~/components/home/Testimonials';

export default component$(() => {
  const missionExpanded = useSignal(false);

  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => initiateTyper());

  return (
    <>
      <section class="relative flex min-h-svh justify-center overflow-hidden [--lum-border-radius:1.5rem]">
        <div
          id="hero"
          class="flex w-full max-w-5xl flex-col items-center justify-center px-6 pt-18 text-gray-100 sm:px-20 md:flex-row md:justify-between xl:max-w-6xl 2xl:max-w-7xl"
        >
          <div class="relative flex flex-col gap-4 xl:gap-8">
            <div class="relative mr-auto">
              <div class="absolute -inset-4 rounded-4xl blur-lg backdrop-blur-md" />
              <h1 class="animate-in fade-in motion-safe:slide-in-from-top-16 relative flex items-center bg-clip-text text-7xl font-extrabold text-transparent drop-shadow-lg motion-safe:duration-600 xl:text-8xl">
                <Birdflop
                  size={70}
                  fillGradient={['#54daf4', '#545eb6']}
                  class="absolute -z-1 w-12.5 xl:-left-1 xl:w-17.5"
                />
                <span class="text-transparent!">
                  <span>b</span>
                  <span class="home-title-gradient">irdflop</span>
                </span>
              </h1>
            </div>
            <div class="relative mr-auto">
              <div class="absolute -inset-2 rounded-2xl blur-lg backdrop-blur-md" />
              <h2 class="animate-in fade-in motion-safe:slide-in-from-top-16 text-xl! font-bold drop-shadow-md motion-safe:duration-800 md:text-2xl! xl:text-3xl!">
                The only 501(c)(3) nonprofit server host{' '}
                <br class="hidden sm:block" />
                dedicated to <br class="sm:hidden" />
                <span
                  class="typer"
                  id="main"
                  data-words={'public resources,communities,you'}
                  data-colors="#5487CB,#54B1DF,#54DAF4,#54EEFF"
                  data-delay="50"
                  data-deleteDelay="1500"
                ></span>
                <span
                  class="cursor"
                  data-owner="main"
                  data-cursor-display="|"
                ></span>
              </h2>
            </div>
          </div>
          <div class="mt-8 flex flex-col gap-2">
            <a
              href="#plans"
              class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 lum-bg-blue-600/40 hover:lum-bg-blue-700 animate-in fade-in motion-safe:slide-in-from-top-16 text-xl backdrop-blur-sm motion-safe:duration-600"
            >
              <Server class="home-hero-icon" />
              Hosting
            </a>
            <Link
              href="/resources"
              class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 lum-bg-purple-600/40 hover:lum-bg-purple-700 animate-in fade-in motion-safe:slide-in-from-top-16 text-xl backdrop-blur-sm motion-safe:duration-800"
            >
              <Box class="home-hero-icon" />
              Resources
            </Link>
            <a
              href={nonprofitLink}
              class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 lum-bg-pink-600/40 hover:lum-bg-pink-700 animate-in fade-in motion-safe:slide-in-from-top-16 text-xl backdrop-blur-sm motion-safe:duration-1000"
            >
              <Heart class="home-hero-icon" />
              Nonprofit Site
            </a>
          </div>
        </div>
      </section>
      <div class="to-bg h-20 bg-linear-to-b from-transparent" />
      <section class="home-section">
        <h3 class="home-heading">Our Nonprofit Mission</h3>
        <p class="home-text max-w-3xl">
          At the heart of our mission, we are dedicated to igniting and
          nurturing a passion for technology and computer science. We uniquely
          approach our mission by offering affordable and accessible hosting
          resources, not just as a service, but as a catalyst for technological
          curiosity. Learn more about the Birdflop nonprofit at{' '}
          <a href={nonprofitLink} class="text-lum-accent hover:underline">
            birdflop.org
          </a>{' '}
          and our computer science education initiative at{' '}
          <a href={csroomLink} class="text-lum-accent hover:underline">
            csroom.org
          </a>
          .&nbsp;
          {missionExpanded.value && (
            <>
              Our belief is rooted in the idea that the hands-on experience of
              creating and managing a game server can be a gateway to a lifelong
              interest in technology and computer science. By ensuring this
              journey is engaging and frustration-free, we significantly enhance
              the likelihood of sparking a deeper interest in technological
              fields.
              <br />
              <br />
              Birdflop goes beyond mere hosting; we actively foster a community
              of learning and growth, exemplified through the wealth of public
              resources available on our{' '}
              <Link href="/resources" class="text-lum-accent hover:underline">
                Resources
              </Link>{' '}
              page. Looking ahead, we are committed to expanding our reach,
              investing in initiatives that fuel a passion for computer science
              and technology, and making a lasting impact in shaping future
              innovators. If you would like to further our mission, please
              consider making a tax-deductible{' '}
              <a href={donateLink} class="text-lum-accent hover:underline">
                charitable donation
              </a>
              .&nbsp;
            </>
          )}
          <button
            class="text-lum-accent hover:underline"
            onClick$={() => (missionExpanded.value = !missionExpanded.value)}
          >
            {missionExpanded.value ? 'Read less' : 'Read more'}
          </button>
        </p>
      </section>
      <section class="home-section">
        <Anchor id="plans">
          <h3 id="plans" class="home-heading-anchored">
            Plans
          </h3>
        </Anchor>
        <div class="home-grid max-w-4xl md:grid-cols-3">
          {Object.keys(plans).map((planName) => {
            const plan = plans[planName as keyof typeof plans];
            const ramOptions = Object.keys(plan.ramAndId);
            return (
              <div class="home-card" key={planName}>
                <p class="text-lum-text-secondary">
                  Last quarter, clients paid{' '}
                  <strong>${plan.$PerGBReimbursed}/GB RAM</strong> after
                  reimbursements.
                </p>
                <h4 class="home-card-title">{planName}</h4>
                <p class="text-lum-text-secondary">
                  {ramOptions[0]} - {ramOptions[ramOptions.length - 1]} GB plans
                  <br />
                  capped at ${plan.$PerGB}/GB
                </p>
                <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                  {plan.features.map((feature) => {
                    return <li key={feature}>{feature}</li>;
                  })}
                </ul>
                {plan.outOfStock ? (
                  <a
                    href={discordLink}
                    data-umami-event="discord-link"
                    data-umami-source="plans"
                    target="_blank"
                    class="lum-btn lum-bg-red-600/50 hover:lum-bg-red-600 m-auto mt-4 w-min"
                  >
                    <AlertTriangle class="home-icon" />
                    Out of stock
                  </a>
                ) : (
                  <Link
                    href={`/plans?plan=${encodeURIComponent(planName)}`}
                    class="lum-btn lum-bg-blue/50 hover:lum-bg-blue-500 m-auto mt-4 w-min"
                    data-umami-event="Plan Ordernow Click"
                    data-umami-event-page="home"
                    data-umami-event-variant={planName}
                  >
                    <ShoppingCart class="home-icon" />
                    Order Now
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <div
          class="lum-card lum-grad-bg-green/60 mt-5 max-w-xl min-w-0 transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
        >
          <h4 class="home-card-title">
            <CheckCircle class="home-icon" />
            Benefits Galore
          </h4>
          <p>
            All plans come with a one-click modpack installer, DDoS protection,
            3 off-site backups, dedicated IPs on 8+ GB plans, an improved
            Pterodactyl Panel for server management, and a 3-day satisfaction
            guarantee.
          </p>
        </div>
      </section>
      <section class="home-section">
        <Anchor id="features">
          <h3 id="features" class="home-heading-anchored">
            Features
          </h3>
        </Anchor>
        <div class="home-grid max-w-5xl">
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <Rocket class="home-icon" />
              Sheer Performance
            </h4>
            <p>
              We don't make compromises. Choose from our blazing fast Ryzen 9
              processors and NVMe SSDs. All plans include a satisfaction
              guarantee.
            </p>
          </div>
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <Settings class="home-icon" />
              Fully Configurable
            </h4>
            <p>
              You'll have full access to your server. You can set your startup
              flags, change your java version, upload custom jars, and create
              reverse proxies.
            </p>
          </div>
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <Eye class="home-icon" />
              Transparent
            </h4>
            <p>
              We don't oversell, and we're transparent about that. View our
              public{' '}
              <Link href="/node-stats" class="text-lum-accent hover:underline">
                detailed server statistics
              </Link>{' '}
              or financial breakdown.
            </p>
          </div>
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <Globe class="home-icon" />
              Price Matching
            </h4>
            <p>
              We're confident that we have the best plans available. If you
              locate a similar plan at a lower price, ask us about our price
              matching.
            </p>
          </div>
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <Heart class="home-icon" />
              Instant Support
            </h4>
            <p>
              You can contact support at any time through our{' '}
              <a
                href={discordLink}
                data-umami-event="discord-link"
                data-umami-source="support"
                class="text-lum-accent hover:underline"
              >
                Discord server
              </a>
              .
            </p>
          </div>
          <div
            class="home-card-hover"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="home-card-title">
              <HandCoins class="home-icon" />
              Nonprofit
            </h4>
            <p>
              Our nonprofit status helps us keep our services affordable and
              accessible. Clients receive periodic reimbursements for excess
              profit.
            </p>
          </div>
        </div>
      </section>
      <section class="home-section">
        <h3 class="home-heading">How do reimbursements work?</h3>
        <p class="home-text">
          As a nonprofit, Birdflop periodically reimburses clients based on
          excess profit. At the end of each reimbursement period, active clients
          receive a reimbursement for excess profit from their plan. These
          reimbursements are dependent on usage, maximally lowering prices at
          high service utilization. Last quarter, US clients received a 33.7%
          reimbursement and EU clients received a 26% reimbursement, effectively
          lowering prices to $1.99/GB RAM and $1.48/GB RAM for the US and EU,
          respectively. Not good enough? Find a competitor with similar
          specifications and inquire about our price matching.&nbsp;
        </p>
        <div class="home-card mt-12 w-full max-w-4xl">
          <h4 class="home-card-title">
            Historical Reimbursement Rates for US and EU Clients
          </h4>
          <div class="home-chart">
            <HistoricLinePlot />
          </div>
        </div>
      </section>
      <section class="home-section">
        <h3 class="home-heading">Where do my payments go?</h3>
        <div class="home-grid mt-12 max-w-5xl gap-10">
          <div class="home-card">
            <div class="home-chart">
              <ExpensesChart />
            </div>
            <p class="text-lum-text-secondary py-2 text-center text-sm">
              Plot shows revenue (inner ring) and expenditures (outer ring) for
              Q1 2025. Some numbers may be approximations, and categories may be
              simplified. US Hosting Expenses includes depreciation.
            </p>
          </div>
          <div class="flex min-w-0 flex-col gap-4">
            <p class="text-lum-text-secondary">
              Birdflop is a 501(c)(3) nonprofit organization. As such, all
              profit generated is reinvested into improving our services and
              accomplishing our mission. Your service fees are used for covering
              our server costs, including building new servers, colocation fees,
              server rental fees, and software licensing fees. Our quarterly
              financial report is proudly displayed on the left.
            </p>
            <p class="text-lum-text-secondary">
              Your payments get you the best possible rate while contributing to
              the development of our{' '}
              <Link href="/resources" class="text-lum-accent hover:underline">
                free public resources
              </Link>
              . We reimburse clients based on excess profit, and we never
              overload our servers. View our server statistics on the{' '}
              <Link href="/node-stats" class="text-lum-accent hover:underline">
                Node Stats
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </section>
      <Testimonials />
      <section class="home-section">
        <h3 class="home-heading">Still not convinced?</h3>
        <p class="max-w-4xl">
          Create a ticket on our{' '}
          <a
            href={discordLink}
            data-umami-event="discord-link"
            data-umami-source="trial"
            class="text-lum-accent hover:underline"
          >
            Discord server
          </a>{' '}
          to ask for more information or request a free trial. All plans include
          a 3-day refund guarantee if you're not satisfied for any reason. On
          the Discord, you'll also find several more happy clients who can tell
          you about their experiences with Birdflop.
        </p>
      </section>
    </>
  );
});

export const head = generateHead({});
