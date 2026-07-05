import { component$, useStore } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import { Blobs } from '@luminescent/ui-qwik';
import { Package, ShoppingCart } from 'lucide-icons-qwik';
import { discordLink } from '~/components/Elements/Nav';
import { generateHead } from '~/root';

export const plans = {
  'EU Premium': {
    id: 'eu-premium',
    groupId: 9,
    $PerGB: 2,
    $PerGBReimbursed: 1.48,
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
    outOfStock: false,
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
      'Ryzen 9 9900X or Better',
      '6 Logical Cores',
      'Unmetered* NVMe Storage',
    ],
    outOfStock: false,
  },
};

export const useParams = routeLoader$(({ query }) => {
  return query;
});

export default component$(() => {
  const params = useParams().value;
  const plansStore = useStore({
    plan: params.get('plan') as keyof typeof plans,
    showMiscPlans: false,
    gb: 0,
    name: 'My server',
    desc: '',
  });

  return (
    <>
      <section
        class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20"
        style={{
          '--lum-border-radius': '1.5rem',
        }}
      >
        <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
          <ShoppingCart size={32} />
          Order your new server
        </h1>
        <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
          Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to
          provide affordable and accessible hosting and resources. Check out our
          plans starting at $1.48/GB RAM for some of the industry\'s fastest and
          cheapest servers, or use our free public resources.
        </p>
        <div class="flex flex-col">
          <h2 class="mb-2 text-2xl font-extrabold">
            Pick your plan
            <button
              class="ml-2 text-sm font-normal text-blue-400 hover:underline"
              onClick$={() =>
                (plansStore.showMiscPlans = !plansStore.showMiscPlans)
              }
            >
              {plansStore.showMiscPlans ? 'Hide misc plans' : 'Show misc plans'}
            </button>
          </h2>
          <p class="text-lum-text-secondary">
            This will be the tier and location of your new server. All plans
            come with 3 off-site backups, DDoS protection, dedicated IPs on 8+
            GB plans, an improved Pterodactyl Panel for server management, and a
            3-day satisfaction guarantee.
          </p>

          <div class="mt-4 grid gap-2 md:grid-cols-3">
            {(Object.keys(plans) as Array<keyof typeof plans>).map(
              (planName) => {
                const plan = plans[planName];
                const ramOptions = Object.keys(plan.ramAndId);
                return (
                  <button
                    class={{
                      'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                      'opacity-50': plan.outOfStock,
                      'lum-grad-bg-lum-input-bg hover:lum-bg-lum-input-bg/70':
                        plansStore.plan != planName,
                      'lum-grad-bg-blue-500/30 hover:lum-bg-blue-500/30':
                        plansStore.plan == planName,
                    }}
                    data-umami-event="Plan Pick Click"
                    data-umami-event-page="plans"
                    data-umami-event-variant={planName}
                    key={planName}
                    onClick$={() => {
                      if (plan.outOfStock)
                        return window.open(discordLink, '_blank')?.focus();
                      plansStore.plan = planName;
                      plansStore.gb = 0;
                      setTimeout(() => {
                        const anchor = document.getElementById('ram');
                        if (anchor)
                          anchor.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    {plansStore.plan == planName && (
                      <Blobs
                        color="blue"
                        class={{
                          'rounded-lum absolute -z-10 overflow-clip': true,
                        }}
                        style={{
                          transform: 'translateZ(-10px)',
                        }}
                      />
                    )}
                    <p class="text-lum-text-secondary">
                      Last quarter, clients paid{' '}
                      <strong>${plan.$PerGBReimbursed}/GB RAM</strong> after
                      reimbursements.
                    </p>
                    <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                      {planName}
                    </h3>
                    <p class="text-lum-text-secondary">
                      {ramOptions[0]} - {ramOptions[ramOptions.length - 1]} GB
                      plans
                      <br />
                      capped at ${plan.$PerGB}/GB
                    </p>
                    <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                      {plan.features.map((feature) => {
                        return <li key={feature}>{feature}</li>;
                      })}
                    </ul>
                  </button>
                );
              },
            )}
          </div>
          {plansStore.showMiscPlans && (
            <>
              <h2 class="mb-2 text-2xl font-extrabold">Misc Plans</h2>
              <p class="text-lum-text-secondary">
                Here lies dragons! You most likely will not receive support for
                these plans. Only proceed if you know what you're doing!
              </p>

              <div class="mt-2 grid gap-2 md:grid-cols-3">
                <a
                  class={{
                    'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                  }}
                  href="https://client.birdflop.com/order/main/packages/discord/?group_id=12"
                  target="_blank"
                >
                  <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                    Discord Bot Hosting*
                  </h3>
                  <p class="text-lum-text-secondary">$3/mo - 1GB</p>
                  <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                    <li>Falkenstein, Germany</li>
                    <li>Ryzen 9 5950X (1 vCore)</li>
                    <li>10GB NVMe Storage</li>
                  </ul>
                </a>
                <a
                  class={{
                    'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                  }}
                  href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=15"
                  target="_blank"
                >
                  <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                    US Dev/Hub*
                  </h3>
                  <p class="text-lum-text-secondary">$6/mo - 2GB</p>
                  <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                    <li>US East (NYC / Ashburn VA)</li>
                    <li>Ryzen 9 3900XT or Better (1 vCore)</li>
                    <li>10GB NVMe Storage</li>
                  </ul>
                </a>
                <a
                  class={{
                    'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                  }}
                  href="https://client.birdflop.com/order/config/index/us-premium/?group_id=8&pricing_id=7"
                  target="_blank"
                >
                  <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                    US Proxy*
                  </h3>
                  <p class="text-lum-text-secondary">$6/mo - 2GB</p>
                  <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                    <li>US East (NYC / Ashburn VA)</li>
                    <li>Ryzen 9 3900XT or Better (4 vCores)</li>
                    <li>20GB NVMe Storage</li>
                  </ul>
                </a>
                <a
                  class={{
                    'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                  }}
                  href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=16"
                  target="_blank"
                >
                  <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                    EU Dev/Hub*
                  </h3>
                  <p class="text-lum-text-secondary">$4/mo - 2GB</p>
                  <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                    <li>Falkenstein, Germany</li>
                    <li>Ryzen 9 5950X (1 vCore)</li>
                    <li>20GB NVMe Storage</li>
                  </ul>
                </a>
                <a
                  class={{
                    'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                  }}
                  href="https://client.birdflop.com/order/config/index/eu-premium/?group_id=11&pricing_id=14"
                  target="_blank"
                >
                  <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                    EU Proxy*
                  </h3>
                  <p class="text-lum-text-secondary">$4/mo - 2GB</p>
                  <ul class="text-lum-text-secondary ml-4 flex-1 list-disc">
                    <li>Falkenstein, Germany</li>
                    <li>Ryzen 9 5950X (4 vCores)</li>
                    <li>Unmetered* NVMe Storage</li>
                  </ul>
                </a>
              </div>
            </>
          )}

          {plansStore.plan && isNaN(Number(plansStore.plan)) && (
            <>
              <h2 class="mt-6 mb-2 text-2xl font-extrabold" id="ram">
                Configure your RAM amount
              </h2>
              <p class="text-lum-text-secondary">
                This will be the amount of RAM in your new server.
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {plans[plansStore.plan] &&
                  Object.keys(plans[plansStore.plan].ramAndId).map((gb) => {
                    return (
                      <button
                        key={`${plansStore.plan}-${gb}`}
                        onClick$={() => {
                          plansStore.gb = Number(gb);
                          setTimeout(() => {
                            const anchor = document.getElementById('summary');
                            if (anchor)
                              anchor.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        class={{
                          'lum-card relative text-left transition duration-300 ease-out hover:duration-75': true,
                          'lum-grad-bg-lum-input-bg hover:lum-bg-lum-input-bg/70':
                            plansStore.gb != Number(gb),
                          'lum-grad-bg-green-500/30 hover:lum-bg-green-500/30':
                            plansStore.gb == Number(gb),
                        }}
                        data-umami-event="Plan RAM Click"
                        data-umami-event-plan={plansStore.plan}
                        data-umami-event-amount={gb}
                      >
                        <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                          {gb} GB
                        </h3>
                        <p class="text-lum-text-secondary">
                          {`~$${(Number(gb) * plans[plansStore.plan].$PerGBReimbursed).toFixed(2)}/mo after reimbursements.\nCapped at $${Number(gb) * plans[plansStore.plan].$PerGB}/mo.`}
                        </p>
                        {plansStore.gb == Number(gb) && (
                          <Blobs
                            color="green"
                            class={{
                              'rounded-lum absolute overflow-clip': true,
                            }}
                            style={{
                              transform: 'translateZ(-10px)',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
              </div>
            </>
          )}

          {!!plansStore.gb && (
            <div
              id="summary"
              class="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-2"
            >
              <Package size={72} class="flex sm:mx-5" />
              <div class="flex-1">
                <h3 class="mb-2 flex items-center gap-2 text-2xl font-bold">
                  Order Summary
                </h3>
                <p class="text-lum-text-secondary">
                  {plansStore.plan} {plansStore.gb} GB
                  <br />
                  Capped at $
                  {(plansStore.gb * plans[plansStore.plan]?.$PerGB).toFixed(2)}
                  /mo.
                  <br />
                  ~$
                  {(
                    plansStore.gb * plans[plansStore.plan]?.$PerGBReimbursed
                  ).toFixed(2)}
                  /mo after reimbursements.
                </p>
              </div>
              <div class="flex-1 space-y-2">
                <label for="server_name">Server Name</label>
                <input
                  id="server_name"
                  placeholder="A Minecraft Server"
                  class="lum-input"
                  onChange$={(e, el) => (plansStore.name = el.value)}
                />
                <label for="server_description">
                  Server Description (optional)
                </label>
                <input
                  id="server_description"
                  placeholder="This is my Minecraft server!"
                  class="lum-input"
                  onChange$={(e, el) => (plansStore.desc = el.value)}
                />
              </div>
              <div>
                <a
                  class="lum-btn lum-btn-p-4 lum-grad-bg-blue/80 hover:lum-bg-blue mt-auto gap-4 text-lg"
                  href={
                    'https://client.birdflop.com/order/config/index/' +
                    plans[plansStore.plan]?.id +
                    '/?group_id=' +
                    plans[plansStore.plan]?.groupId +
                    // @ts-expect-error type wont work with how this works
                    '&pricing_id=' +
                    plans[plansStore.plan]?.ramAndId[plansStore.gb] +
                    '&server_name=' +
                    plansStore.name +
                    '&server_description=' +
                    plansStore.desc +
                    '&billing_cycle=monthly'
                  }
                  target="_blank"
                  data-umami-event="Plan AddToCart Click"
                  data-umami-event-plan={plansStore.plan}
                  data-umami-event-amount={plansStore.gb}
                >
                  <ShoppingCart size={26} /> Add to cart
                </a>
              </div>
            </div>
          )}
          <div class="mb-24" />
        </div>
      </section>
    </>
  );
});

export const head = generateHead({
  title: 'Order your new server - Birdflop',
});
