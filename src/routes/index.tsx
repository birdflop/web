import {
  component$,
  useVisibleTask$,
  useSignal,
  useOnWindow,
  $,
} from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";

import { Birdflop } from "@luminescent/icons-qwik";
import { Anchor, Hoverable } from "@luminescent/ui-qwik";
import ShoppingCart from "lucide-icons-qwik/icons/ShoppingCart";
import HandCoins from "lucide-icons-qwik/icons/HandCoins";
import Eye from "lucide-icons-qwik/icons/Eye";
import Globe from "lucide-icons-qwik/icons/Globe";
import Heart from "lucide-icons-qwik/icons/Heart";
import Rocket from "lucide-icons-qwik/icons/Rocket";
import Server from "lucide-icons-qwik/icons/Server";
import CheckCircle from "lucide-icons-qwik/icons/CheckCircle";
import AlertTriangle from "lucide-icons-qwik/icons/AlertTriangle";
import Box from "lucide-icons-qwik/icons/Box";
import Settings from "lucide-icons-qwik/icons/Settings";
import PiggyBank from "lucide-icons-qwik/icons/PiggyBank";
import { initiateTyper } from "~/util/Typer";

import { plans } from "./plans";
import HistoricLinePlot from "~/components/home/HistoricLinePlot";
import { generateHead } from "~/root";
import ExpensesChart from "~/components/home/ExpensesChart";
import { discordLink, donateLink } from "~/components/Elements/Nav";
import Testimonials from "~/components/home/Testimonials";

export default component$(() => {
  const missionExpanded = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => initiateTyper());

  useOnWindow(
    "scroll",
    $(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;
      const bg = document.getElementById("bg")!;
      bg.style.bottom = `${window.scrollY / 3}px`;
      bg.style.setProperty("--tw-blur", `blur(${window.scrollY / 20}px)`);
      const hero = document.getElementById("hero")!;
      hero.style.transform = `translateY(${window.scrollY / 2}px)`;
    }),
  );

  return (
    <>
      <section
        class="relative flex min-h-svh justify-center overflow-hidden"
        style={{
          "--lum-border-radius": "1.5rem",
        }}
      >
        <div
          id="hero"
          class="flex w-full max-w-5xl flex-col items-center justify-center px-20 pt-18 text-gray-100 md:flex-row md:justify-between xl:max-w-6xl 2xl:max-w-7xl"
        >
          <div class="relative flex flex-col gap-4 xl:gap-8">
            <div
              class={{
                "relative mr-auto": true,
              }}
            >
              <div class="absolute -inset-4 rounded-4xl blur-lg backdrop-blur-md" />
              <h1
                class={{
                  "relative flex items-center bg-clip-text text-7xl font-extrabold text-transparent drop-shadow-lg xl:text-8xl": true,
                  "animate-in fade-in motion-safe:slide-in-from-top-16 motion-safe:duration-600": true,
                }}
              >
                <Birdflop
                  size={70}
                  fillGradient={["#54daf4", "#545eb6"]}
                  class="absolute -z-1 w-12.5 xl:-left-1 xl:w-17.5"
                />
                <span class="text-transparent!">
                  <span>b</span>
                  <span
                    style={{
                      background: "linear-gradient(180deg, #54daf4, #545eb6)",
                      backgroundClip: "text",
                    }}
                  >
                    irdflop
                  </span>
                </span>
              </h1>
            </div>
            <div
              class={{
                "relative mr-auto": true,
              }}
            >
              <div class="absolute -inset-2 rounded-2xl blur-lg backdrop-blur-md" />
              <h2 class="animate-in fade-in motion-safe:slide-in-from-top-16 text-xl! font-bold drop-shadow-md motion-safe:duration-800 md:text-2xl! xl:text-3xl!">
                The only 501(c)(3) nonprofit server host{" "}
                <br class="hidden sm:block" /> dedicated to{" "}
                <br class="sm:hidden" />
                <span
                  class="typer"
                  id="main"
                  data-words={"public resources,communities,you"}
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
              <Server size={32} /> Hosting
            </a>
            <Link
              href="/resources"
              class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 lum-bg-purple-600/40 hover:lum-bg-purple-700 animate-in fade-in motion-safe:slide-in-from-top-16 text-xl backdrop-blur-sm motion-safe:duration-800"
            >
              <Box size={32} /> Resources
            </Link>
            <a
              href={donateLink}
              class="lum-btn lum-btn-p-4 xl:lum-btn-p-6 lum-bg-pink-600/40 hover:lum-bg-pink-700 animate-in fade-in motion-safe:slide-in-from-top-16 text-xl backdrop-blur-sm motion-safe:duration-1000"
            >
              <PiggyBank size={32} /> Donate Today
            </a>
          </div>
        </div>
      </section>
      <div class="to-bg h-20 bg-linear-to-b from-transparent" />
      <section class="bg-bg flex w-full flex-col items-center justify-center p-10">
        <h3 class="my-6 text-5xl font-extrabold">Our Nonprofit Mission</h3>
        <p class="text-lum-text-secondary max-w-3xl">
          At the heart of our mission, we are dedicated to igniting and
          nurturing a passion for technology and computer science. We uniquely
          approach our mission by offering affordable and accessible hosting
          resources, not just as a service, but as a catalyst for technological
          curiosity.&nbsp;
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
              resources available on our{" "}
              <Link href="/resources" class="text-blue-400 hover:underline">
                Resources
              </Link>{" "}
              page. Looking ahead, we are committed to expanding our reach,
              investing in initiatives that fuel a passion for computer science
              and technology, and making a lasting impact in shaping future
              innovators. If you would like to further our mission, please
              consider making a tax-deductible{" "}
              <a href={donateLink} class="text-blue-400 hover:underline">
                charitable donation
              </a>
              .&nbsp;
            </>
          )}
          <button
            class="text-blue-400 hover:underline"
            onClick$={() => (missionExpanded.value = !missionExpanded.value)}
          >
            {missionExpanded.value ? "Read less" : "Read more"}
          </button>
        </p>
      </section>
      <section
        class="bg-bg flex w-full flex-col items-center justify-center p-10"
        style={{
          "--lum-border-radius": "1.5rem",
        }}
      >
        <Anchor id="plans">
          <h3 id="plans" class="my-6 mr-2 text-5xl font-extrabold">
            Plans
          </h3>
        </Anchor>
        <div class="grid max-w-4xl gap-2 md:grid-cols-3">
          {Object.keys(plans).map((planName) => {
            const plan = plans[planName as keyof typeof plans];
            const ramOptions = Object.keys(plan.ramAndId);
            return (
              <div class="lum-card lum-grad-bg-lum-card-bg" key={planName}>
                <p class="text-lum-text-secondary">
                  Last quarter, clients paid{" "}
                  <strong>${plan.$PerGBReimbursed}/GB RAM</strong> after
                  reimbursements.
                </p>
                <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                  {planName}
                </h4>
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
                    <AlertTriangle size={20} class="text-3xl" /> Out of stock
                  </a>
                ) : (
                  <Link
                    href={`/plans?plan=${encodeURIComponent(planName)}`}
                    class="lum-btn lum-bg-blue/50 hover:lum-bg-blue-500 m-auto mt-4 w-min"
                    data-umami-event="Plan Ordernow Click"
                    data-umami-event-page="home"
                    data-umami-event-variant={planName}
                  >
                    <ShoppingCart size={20} class="text-3xl" /> Order Now
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <div
          class="lum-card lum-grad-bg-green/60 mt-5 max-w-xl transition-all duration-200!"
          onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
          onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
        >
          <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
            <CheckCircle size={30} /> Benefits Galore
          </h4>
          <p>
            All plans come with a one-click modpack installer, DDoS protection,
            3 off-site backups, dedicated IPs on 8+ GB plans, an improved
            Pterodactyl Panel for server management, and a 3-day satisfaction
            guarantee.
          </p>
        </div>
      </section>
      <section
        class="bg-bg flex w-full flex-col items-center justify-center p-10"
        style={{
          "--lum-border-radius": "1.5rem",
        }}
      >
        <Anchor id="features">
          <h3 id="features" class="my-6 mr-2 text-5xl font-extrabold">
            Features
          </h3>
        </Anchor>
        <div class="grid max-w-5xl gap-2 md:grid-cols-2">
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Rocket size={30} /> Sheer Performance
            </h4>
            <p>
              We don't make compromises. Choose from our blazing fast Ryzen 9
              processors and NVMe SSDs. All plans include a satisfaction
              guarantee.
            </p>
          </div>
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Settings size={30} /> Fully Configurable
            </h4>
            <p>
              You'll have full access to your server. You can set your startup
              flags, change your java version, upload custom jars, and create
              reverse proxies.
            </p>
          </div>
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Eye size={30} /> Transparent
            </h4>
            <p>
              We don't oversell, and we're transparent about that. View our
              public{" "}
              <Link href="/node-stats" class="text-blue-400 hover:underline">
                detailed server statistics
              </Link>{" "}
              or financial breakdown.
            </p>
          </div>
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Globe size={30} /> Price Matching
            </h4>
            <p>
              We're confident that we have the best plans available. If you
              locate a similar plan at a lower price, ask us about our price
              matching.
            </p>
          </div>
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <Heart size={30} /> Instant Support
            </h4>
            <p>
              You can contact support at any time through our{" "}
              <a
                href={discordLink}
                data-umami-event="discord-link"
                data-umami-source="support"
                class="text-blue-400 hover:underline"
              >
                Discord server
              </a>
              .
            </p>
          </div>
          <div
            class="lum-card lum-grad-bg-lum-card-bg transition-all duration-200!"
            onMouseMove$={(e, el) => Hoverable.onMouseMove$(e, el)}
            onMouseLeave$={(e, el) => Hoverable.onMouseLeave$(e, el)}
          >
            <h4 class="mb-2 flex items-center gap-2 text-2xl font-bold">
              <HandCoins size={30} /> Nonprofit
            </h4>
            <p>
              Our nonprofit status helps us keep our services affordable and
              accessible. Clients receive periodic reimbursements for excess
              profit.
            </p>
          </div>
        </div>
      </section>
      <section class="bg-bg flex w-full flex-col items-center justify-center p-10">
        <h3 class="my-6 text-5xl font-extrabold">
          How do reimbursements work?
        </h3>
        <p class="text-lum-text-secondary max-w-4xl">
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
        <div
          class="lum-card lum-grad-bg-lum-card-bg mt-12"
          style={{
            "--lum-border-radius": "1.5rem",
          }}
        >
          <h4 class="mb-2 text-2xl font-bold">
            Historical Reimbursement Rates for US and EU Clients
          </h4>
          <HistoricLinePlot />
        </div>
      </section>
      <section class="bg-bg flex w-full flex-col items-center justify-center p-10">
        <h3 class="my-6 text-5xl font-extrabold">Where do my payments go?</h3>
        <div class="mt-12 grid max-w-5xl gap-10 md:grid-cols-2">
          <div
            class="lum-card lum-grad-bg-lum-card-bg"
            style={{
              "--lum-border-radius": "1.5rem",
            }}
          >
            <ExpensesChart />
            <p class="text-lum-text-secondary py-2 text-center text-sm">
              Plot shows revenue (inner ring) and expenditures (outer ring) for
              Q1 2025. Some numbers may be approximations, and categories may be
              simplified. US Hosting Expenses includes depreciation.
            </p>
          </div>
          <div class="flex flex-col gap-4">
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
              the development of our{" "}
              <Link href="/resources" class="text-blue-400 hover:underline">
                free public resources
              </Link>
              . We reimburse clients based on excess profit, and we never
              overload our servers. View our server statistics on the{" "}
              <Link href="/node-stats" class="text-blue-400 hover:underline">
                Node Stats
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </section>
      <Testimonials />
      <section class="bg-bg flex w-full flex-col items-center justify-center p-10">
        <h3 class="my-6 text-5xl font-extrabold">Still not convinced?</h3>
        <p class="max-w-4xl">
          Create a ticket on our{" "}
          <a
            href={discordLink}
            data-umami-event="discord-link"
            data-umami-source="trial"
            class="text-blue-400 hover:underline"
          >
            Discord server
          </a>{" "}
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
