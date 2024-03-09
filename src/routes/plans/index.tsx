import { component$, useStore } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';

import { Anchor, ButtonAnchor, Card, Header } from '@luminescent/ui';
import { CartOutline, CubeOutline } from 'qwik-ionicons';

export const plans = {
  'EU Premium': {
    id: 'eu-premium',
    groupId: 9,
    $PerGB: 2,
    $PerGBReimbursed: 1.88,
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
      'Ryzen 9 5950X (6 vCores)',
      'Unmetered* NVMe Storage',
    ],
    outOfStock: false,
  },
  'US Premium': {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    $PerGBReimbursed: 1.95,
    ramAndId: {
      4: 1,
      6: 2,
      8: 3,
    },
    features: [
      'New York City, NY, USA',
      'Ryzen 9 3900XT (4 vCores)',
      'Up to 80 GB NVMe Storage',
      'Free upgrade to US Premium+ after 6 months',
    ],
    outOfStock: true,
  },
  'US Premium+': {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    $PerGBReimbursed: 1.95,
    ramAndId: {
      12: 4,
      16: 5,
      20: 6,
    },
    features: [
      'Ashburn, VA, USA',
      'Ryzen 9 7950X (6 vCores)',
      'Unmetered* NVMe Storage',
    ],
    outOfStock: false,
  },
};

export const useParams = routeLoader$(async ({ query }) => {
  return query;
});

export default component$(() => {
  const params = useParams().value;
  const store = useStore({
    plan: params.get('plan') ?? undefined as number | string | undefined,
    showMiscPlans: false,
    gb: 0,
  });

  return <>
    <section class="flex flex-col gap-3 mx-auto max-w-6xl px-6 py-16 items-center min-h-[100svh]">
      <div class="justify-center flex relative max-w-5xl px-10 py-24">
        <div class="flex flex-col gap-8">
          <h1 class="flex gap-4 items-center justify-center text-gray-100 text-2xl sm:text-4xl font-bold mb-4 text-center drop-shadow-lg">
            <CartOutline width="64" /> Order your new server
          </h1>
          <Header subheader="This will be the tier and location of your new server. All plans come with 3 off-site backups, DDoS protection, dedicated IPs on 8+ GB plans, an improved Pterodactyl Panel for server management, and a 3-day satisfaction guarantee.">
            Pick your plan
            <button class="text-blue-400 hover:underline text-sm font-normal" onClick$={() => store.showMiscPlans = !store.showMiscPlans}>
              {store.showMiscPlans ? 'Hide misc plans' : 'Show misc plans'}
            </button>
          </Header>
          <div class="grid md:grid-cols-3 gap-4">
            {Object.keys(plans).map((planName) => {
              const plan = plans[planName as keyof typeof plans];
              const ramOptions = Object.keys(plan.ramAndId);
              return <Card key={planName} color={store.plan == planName ? 'blue' : 'darkgray'} blobs={store.plan == planName}
                hover={!plan.outOfStock ? 'clickable' : false}
                class={{
                  'opacity-50': plan.outOfStock,
                }}
                onClick$={() => { if (!plan.outOfStock) store.plan = planName; store.gb = 0; }}
                href="#ram">
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
              </Card>;
            })}
          </div>
          {store.showMiscPlans && <>
            <Header subheader="Here lies dragons! You most likely will not recieve support for these plans. Only proceed if you know what you're doing!">
              Misc Plans
            </Header>
            <div class="grid md:grid-cols-3 gap-4">
              <Card color={store.plan == 4 ? 'red' : 'darkgray'} hover="clickable"
                href="https://client.birdflop.com/order/main/packages/discord/?group_id=12">
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
              </Card>
              <Card color={store.plan == 5 ? 'red' : 'darkgray'} hover="clickable"
                href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=15">
                <Header subheader="$6/mo - 2GB">
                  US Dev/Hub*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    New York City, NY, USA
                  </li>
                  <li>
                    Ryzen 9 3900XT (1 vCore)
                  </li>
                  <li>
                    10GB NVMe Storage
                  </li>
                </ul>
              </Card>
              <Card color={store.plan == 6 ? 'red' : 'darkgray'} hover="clickable"
                href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=7">
                <Header subheader="$6/mo - 2GB">
                  US Proxy*
                </Header>
                <ul class="list-disc ml-5 space-y-2 h-full">
                  <li>
                    New York City, NY, USA
                  </li>
                  <li>
                    Ryzen 9 3900XT (4 vCores)
                  </li>
                  <li>
                    20GB NVMe Storage
                  </li>
                </ul>
              </Card>
              <Card color={store.plan == 7 ? 'red' : 'darkgray'} hover="clickable"
                href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=16">
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
              </Card>
              <Card color={store.plan == 8 ? 'red' : 'darkgray'} hover="clickable"
                href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=14">
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
              </Card>
            </div>
          </>}

          {store.plan && isNaN(Number(store.plan)) && <>
            <Anchor id="ram" />
            <Header subheader="This will be the amount of RAM in your new server.">
              Configure your RAM amount
            </Header>
            <div class="grid md:grid-cols-3 gap-4">
              {!plans[store.plan as keyof typeof plans] && <Card color="darkgray">
                <Header subheader="Please select a plan first.">
                  RAM
                </Header>
              </Card>}
              {plans[store.plan as keyof typeof plans] && Object.keys(plans[store.plan as keyof typeof plans].ramAndId).map((gb) => {
                return <Card key={`${store.plan}-${gb}`} color={store.gb == Number(gb) ? 'green' : 'darkgray'} blobs={store.gb == Number(gb)} hover="clickable"
                  onClick$={() => store.gb = Number(gb)}>
                  <Header subheader={`$${(Number(gb) * plans[store.plan as keyof typeof plans].$PerGBReimbursed).toFixed(2)}/mo after reimbursements\nCapped at $${Number(gb) * plans[store.plan as keyof typeof plans].$PerGB}/mo`}>
                    {gb} GB
                  </Header>
                </Card>;
              })}
            </div>
          </>}

          {!!store.gb && <div class="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-2 mt-6">
            <CubeOutline width={72} class="sm:mx-5" />
            <div class="flex-1 flex flex-col gap-2">
              <Header>
                Order Summary
              </Header>
              <p>{store.plan} {store.gb} GB</p>
              <p>Capped at ${(store.gb * plans[store.plan as keyof typeof plans]?.$PerGB).toFixed(2)}/mo</p>
              <p>${(store.gb * plans[store.plan as keyof typeof plans]?.$PerGBReimbursed).toFixed(2)}/mo after reimbursements.</p>
            </div>
            <ButtonAnchor href={`https://client.birdflop.com/order/config/index/${plans[store.plan as keyof typeof plans]?.id}/?group_id=${plans[store.plan as keyof typeof plans]?.groupId}&pricing_id=${(plans[store.plan as keyof typeof plans]?.ramAndId as any)[store.gb]}&billing_cycle=monthly`}
              size="xl" color="blue">
              <CartOutline width={36}/> Add to cart
            </ButtonAnchor>
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
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.88/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $1.88/GB RAM for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};
