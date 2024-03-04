import { component$, useStore } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import { ButtonAnchor, Card, Header } from '@luminescent/ui';
import { CartOutline } from 'qwik-ionicons';

const plans = {
  EUPremium: {
    id: 'eu-premium',
    groupId: 9,
    $PerGB: 2,
    ramAndId: {
      4: 8,
      6: 9,
      8: 10,
      12: 11,
      16: 12,
      20: 13,
    },
  },
  USPremium: {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    ramAndId: {
      4: 1,
      6: 2,
      8: 3,
    },
  },
  USPremiumPlus: {
    id: 'us-premium',
    groupId: 7,
    $PerGB: 3,
    ramAndId: {
      12: 4,
      16: 5,
      20: 6,
    },
  },
};

export default component$(() => {
  const store = useStore({
    plan: undefined as number | string | undefined,
    showMiscPlans: false,
    gb: 0,
  });

  return <>
    <section class="flex flex-col gap-3 mx-auto max-w-6xl px-6 py-16 items-center min-h-[100svh]">
      <div class="justify-center flex relative max-w-5xl px-10 py-10">
        <div class="flex flex-col gap-8">
          <h1 class="flex gap-6 items-center justify-center text-gray-100 text-3xl sm:text-5xl font-bold mb-4 text-center">
            <CartOutline width="72" /> Order your new server
          </h1>
          <Header subheader="This will be the tier and location of your new server. All plans come with 3 off-site backups, DDoS protection, dedicated IPs on 8+ GB plans, an improved Pterodactyl Panel for server management, and a 3-day satisfaction guarantee.">
            Pick your plan
            <button class="text-blue-400 hover:underline text-sm font-normal" onClick$={() => store.showMiscPlans = !store.showMiscPlans}>
              {store.showMiscPlans ? 'Hide misc plans' : 'Show misc plans'}
            </button>
          </Header>
          <div class="grid md:grid-cols-3 gap-4">
            <Card color={store.plan == 'EUPremium' ? 'blue' : 'darkgray'} blobs={store.plan == 'EUPremium'} hover="clickable"
              onClick$={() => store.plan = 'EUPremium'}>
              <Header subheader="4+ GB plans capped at $2/GB">
                EU Premium
              </Header>
              <ul class="list-disc ml-5 space-y-2 h-full">
                <li>
                  Falkenstein, Germany
                </li>
                <li>
                  Ryzen 9 5950X (6 vCores)
                </li>
                <li>
                  Unmetered* NVMe Storage
                </li>
              </ul>
            </Card>
            <Card color={store.plan == 'USPremium' ? 'blue' : 'darkgray'} blobs={store.plan == 'USPremium'} hover>
              <Header subheader="4-8 GB plans capped at $3/GB">
                US Premium
              </Header>
              <ul class="list-disc ml-5 space-y-2 h-full">
                <li>
                  New York City, NY, USA
                </li>
                <li>
                  Ryzen 9 3900XT (4 vCores)
                </li>
                <li>
                  Up to 80 GB NVMe Storage
                </li>
                <li>
                  Free upgrade to US Premium+ after 6 months
                </li>
              </ul>
              <p class="text-red-500">Out of stock</p>
            </Card>
            <Card color={store.plan == 'USPremiumPlus' ? 'green' : 'darkgray'} blobs={store.plan == 'USPremiumPlus'} hover="clickable"
              onClick$={() => store.plan = 'USPremiumPlus'}>
              <Header subheader="12+ GB plans capped at $3/GB">
                US Premium+
              </Header>
              <ul class="list-disc ml-5 space-y-2 h-full">
                <li>
                  Asburn, VA, USA
                </li>
                <li>
                  Ryzen 9 7950X (6 vCores)
                </li>
                <li>
                  Unmetered* NVMe Storage
                </li>
              </ul>
            </Card>
          </div>
          {store.showMiscPlans && <>
            <Header subheader="Here lies dragons! You most likely will not recieve support for these plans. Only proceed if you know what you're doing!">
              Misc Plans
            </Header>
            <div class="grid md:grid-cols-3 gap-4">
              <Card color={store.plan == 4 ? 'red' : 'darkgray'} blobs={store.plan == 4} hover="clickable"
                onClick$={() => store.plan = 4}>
                <Header subheader="$3/mo - 1GB">
                  Discord Bot Hosting
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
              <Card color={store.plan == 5 ? 'red' : 'darkgray'} blobs={store.plan == 5} hover="clickable"
                onClick$={() => store.plan = 5}>
                <Header subheader="$6/mo - 2GB">
                  US Dev/Hub
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
              <Card color={store.plan == 6 ? 'red' : 'darkgray'} blobs={store.plan == 6} hover="clickable"
                onClick$={() => store.plan = 6}>
                <Header subheader="$6/mo - 2GB">
                  US Proxy
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
              <Card color={store.plan == 7 ? 'red' : 'darkgray'} blobs={store.plan == 7} hover="clickable"
                onClick$={() => store.plan = 7}>
                <Header subheader="$4/mo - 2GB">
                  EU Dev/Hub
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
              <Card color={store.plan == 8 ? 'red' : 'darkgray'} blobs={store.plan == 8} hover="clickable"
                onClick$={() => store.plan = 8}>
                <Header subheader="$4/mo - 2GB">
                  EU Proxy
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

          {isNaN(Number(store.plan)) && <>
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
                return <Card key={`${store.plan}-${gb}`} color={store.gb == Number(gb) ? 'blue' : 'darkgray'} blobs={store.gb == Number(gb)} hover="clickable"
                  onClick$={() => store.gb = Number(gb)}>
                  <Header subheader={`$${Number(gb) * plans[store.plan as keyof typeof plans].$PerGB}/mo`}>
                    {gb} GB
                  </Header>
                </Card>;
              })}
            </div>
          </>}

          <ButtonAnchor href={`https://client.birdflop.com/order/config/index/${plans[store.plan as keyof typeof plans]?.id}/?group_id=${plans[store.plan as keyof typeof plans]?.groupId}&pricing_id=${(plans[store.plan as keyof typeof plans]?.ramAndId as any)[store.gb]}&billing_cycle=monthly`}
            size="lg" color="blue">
            Order
          </ButtonAnchor>
        </div>
      </div>
    </section>
  </>;
});

export const head: DocumentHead = {
  title: 'Birdflop - Minecraft Hosting & Resources',
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
