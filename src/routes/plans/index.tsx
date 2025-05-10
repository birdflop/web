import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Anchor, Blobs, Header } from '@luminescent/ui-qwik';
import { Package, ShoppingCart } from 'lucide-icons-qwik';
import { unloadGoogleAds } from '~/util/GoogleAds';

export const plans = {
  'EU Premium': {
    id: 'eu-premium',
    groupId: 9,
    $PerGB: 2,
    $PerGBReimbursed: 1.44,
    ramAndId: {
      4: 8,
      6: 9,
      8: 10,
      12: 11,
      16: 12,
      20: 13,
    },
    features: [
      'Falkenstein, Germany',
      'Ryzen 9 5950X',
      '6 Logical Cores',
      'Unmetered* NVMe Storage',
    ],
    outOfStock: false,
  },
  'US Premium': {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    $PerGBReimbursed: 1.99,
    ramAndId: {
      4: 1,
      6: 2,
      8: 3,
    },
    features: [
      'US East (NYC / Ashburn VA)',
      'Ryzen 9 3900XT or Better',
      '4 Logical Cores',
      'Up to 80 GB NVMe Storage',
      'Free upgrade to US Premium+ after 6 months',
    ],
    outOfStock: true,
  },
  'US Premium+': {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    $PerGBReimbursed: 1.99,
    ramAndId: {
      12: 4,
      16: 5,
      20: 6,
    },
    features: [
      'US East (NYC / Ashburn VA)',
      'Ryzen 9 7900X or Better',
      '6 Logical Cores',
      'Unmetered* NVMe Storage',
    ],
    outOfStock: true,
  },
};

export const useParams = routeLoader$(({ query }) => {
  return query;
});

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => unloadGoogleAds());

  const params = useParams().value;
  const plansStore = useStore({
    plan: params.get('plan') ?? undefined as number | string | undefined,
    showMiscPlans: false,
    gb: 0,
    name: 'My server',
    desc: '',
  });

  return <>
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl flex gap-4 items-center">
          <ShoppingCart size={48} /> Order your new server
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.
        </h2>
        <div class="flex flex-col gap-8">
          <Header subheader="This will be the tier and location of your new server. All plans come with 3 off-site backups, DDoS protection, dedicated IPs on 8+ GB plans, an improved Pterodactyl Panel for server management, and a 3-day satisfaction guarantee.">
            Pick your plan
            <button class="text-blue-400 hover:underline text-sm font-normal" onClick$={() => plansStore.showMiscPlans = !plansStore.showMiscPlans}>
              {plansStore.showMiscPlans ? 'Hide misc plans' : 'Show misc plans'}
            </button>
          </Header>
          <div class="grid md:grid-cols-3 gap-2">
            {Object.keys(plans).map((planName) => {
              const plan = plans[planName as keyof typeof plans];
              const ramOptions = Object.keys(plan.ramAndId);
              return <button
                class={{
                  'lum-card transition duration-300 hover:duration-75 ease-out text-left relative': true,
                  'opacity-50': plan.outOfStock,
                  'lum-bg-gray-800 hover:lum-bg-gray-800/70': plansStore.plan != planName,
                  'lum-bg-blue-500/30 hover:lum-bg-blue-500/30 ': plansStore.plan == planName,
                }}
                key={planName}
                onClick$={() => {
                  if (plan.outOfStock) return window.open('https://discord.gg/nmgtX5z', '_blank')?.focus();
                  plansStore.plan = planName;
                  plansStore.gb = 0;
                  const anchor = document.getElementById('ram');
                  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
                }}>
                <p>
                  Last quarter, clients paid <strong>${plan.$PerGBReimbursed}/GB RAM</strong> after reimbursements.
                </p>
                <Header subheader={<>{ramOptions[0]} - {ramOptions[ramOptions.length - 1]} GB plans<br/>capped at ${plan.$PerGB}/GB</>}>
                  {planName}
                </Header>
                <ul class="list-disc ml-5 flex flex-col gap-2 h-full">
                  {plan.features.map((feature) => {
                    return <li key={feature}>
                      {feature}
                    </li>;
                  })}
                </ul>
                {plan.outOfStock && <p class="text-red-500">
                  Out of stock
                </p>}
                {plansStore.plan == planName && <Blobs color='blue' class={{ 'absolute overflow-clip rounded-lg': true }} style={{
                  transform: 'translateZ(-10px)',
                }}/>}
              </button>;
            })}
          </div>
          {plansStore.showMiscPlans && <>
            <Header subheader="Here lies dragons! You most likely will not recieve support for these plans. Only proceed if you know what you're doing!">
              Misc Plans
            </Header>
            <div class="grid md:grid-cols-3 gap-2">
              <a class="lum-card transition duration-300 hover:duration-75 ease-out lum-bg-red-700/30 hover:lum-bg-red-700"
                href="https://client.birdflop.com/order/main/packages/discord/?group_id=12" target='_blank'>
                <Header subheader="$3/mo - 1GB">
                  Discord Bot Hosting*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    Falkenstein, Germany
                  </li>
                  <li>
                    Ryzen 9 5950X (1 vCore)
                  </li>
                  <li>
                    10GB NVMe Storage
                  </li>
                </ul>
              </a>
              <a class="lum-card transition duration-300 hover:duration-75 ease-out lum-bg-red-700/30 hover:lum-bg-red-700"
                href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=15" target='_blank'>
                <Header subheader="$6/mo - 2GB">
                  US Dev/Hub*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    US East (NYC / Ashburn VA)
                  </li>
                  <li>
                    Ryzen 9 3900XT or Better (1 vCore)
                  </li>
                  <li>
                    10GB NVMe Storage
                  </li>
                </ul>
              </a>
              <a class="lum-card transition duration-300 hover:duration-75 ease-out lum-bg-red-700/30 hover:lum-bg-red-700"
                href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=7" target='_blank'>
                <Header subheader="$6/mo - 2GB">
                  US Proxy*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    US East (NYC / Ashburn VA)
                  </li>
                  <li>
                    Ryzen 9 3900XT or Better (4 vCores)
                  </li>
                  <li>
                    20GB NVMe Storage
                  </li>
                </ul>
              </a>
              <a class="lum-card transition duration-300 hover:duration-75 ease-out lum-bg-red-700/30 hover:lum-bg-red-700"
                href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=16" target='_blank'>
                <Header subheader="$4/mo - 2GB">
                  EU Dev/Hub*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    Falkenstein, Germany
                  </li>
                  <li>
                    Ryzen 9 5950X (1 vCore)
                  </li>
                  <li>
                    20GB NVMe Storage
                  </li>
                </ul>
              </a>
              <a class="lum-card transition duration-300 hover:duration-75 ease-out lum-bg-red-700/30 hover:lum-bg-red-700"
                href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=14" target='_blank'>
                <Header subheader="$4/mo - 2GB">
                  EU Proxy*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    Falkenstein, Germany
                  </li>
                  <li>
                    Ryzen 9 5950X (4 vCores)
                  </li>
                  <li>
                    Unmetered* NVMe Storage
                  </li>
                </ul>
              </a>
            </div>
          </>}

          <Anchor id="ram" />
          {plansStore.plan && isNaN(Number(plansStore.plan)) && <>
            <Header subheader="This will be the amount of RAM in your new server.">
              Configure your RAM amount
            </Header>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              {plans[plansStore.plan as keyof typeof plans] && Object.keys(plans[plansStore.plan as keyof typeof plans].ramAndId).map((gb) => {
                return <button key={`${plansStore.plan}-${gb}`}
                  onClick$={() => {
                    plansStore.gb = Number(gb);
                    const anchor = document.getElementById('summary');
                    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
                  }}
                  class={{
                    'lum-card transition duration-300 hover:duration-75 ease-out text-left relative': true,
                    'lum-bg-gray-800 hover:lum-bg-gray-800/70': plansStore.gb != Number(gb),
                    'lum-bg-green-500/30 hover:lum-bg-green-500/30 ': plansStore.gb == Number(gb),
                  }}>
                  <Header subheader={`~$${(Number(gb) * plans[plansStore.plan as keyof typeof plans].$PerGBReimbursed).toFixed(2)}/mo after reimbursements.\nCapped at $${Number(gb) * plans[plansStore.plan as keyof typeof plans].$PerGB}/mo.`}>
                    {gb} GB
                  </Header>
                  {plansStore.gb == Number(gb) && <Blobs color='green' class={{ 'absolute overflow-clip rounded-lg': true }} style={{
                    transform: 'translateZ(-10px)',
                  }}/>}
                </button>;
              })}
            </div>
          </>}

          <Anchor id="summary" />
          {!!plansStore.gb && <div class="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-2 mt-6 mb-24">
            <Package size={72} class="sm:mx-5 flex" />
            <div class="flex flex-1 flex-col gap-2">
              <Header>
                Order Summary
              </Header>
              <p>{plansStore.plan} {plansStore.gb} GB</p>
              <p>Capped at ${(plansStore.gb * plans[plansStore.plan as keyof typeof plans]?.$PerGB).toFixed(2)}/mo.</p>
              <p>~${(plansStore.gb * plans[plansStore.plan as keyof typeof plans]?.$PerGBReimbursed).toFixed(2)}/mo after reimbursements.</p>
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <label for="server_name" class="lum-label">Server Name</label>
              <input id="server_name" class="lum-input" onChange$={(e, el) => plansStore.name = el.value} />
              <label for="server_description" class="lum-label">Server Description (optional)</label>
              <input id="server_description" class="lum-input" onChange$={(e, el) => plansStore.desc = el.value} />
            </div>
            <div class="flex flex-1 gap-4 justify-end">
              <a class="lum-btn lum-btn-p-4 text-lg lum-bg-blue-700/80 hover:lum-bg-blue-600 gap-4 mt-auto"
                href={`https://client.birdflop.com/order/config/index/${plans[plansStore.plan as keyof typeof plans]?.id}/?group_id=${plans[plansStore.plan as keyof typeof plans]?.groupId}&pricing_id=${(plans[plansStore.plan as keyof typeof plans]?.ramAndId as any)[plansStore.gb]}&server_name=${plansStore.name}&server_description=${plansStore.desc}&billing_cycle=monthly`}>
                <ShoppingCart size={26}/> Add to cart
              </a>
            </div>
          </div>}
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'Order your new server',
  meta: [
    {
      name: 'description',
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.48/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};
