import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
import Server from '~/components/serverlist/Server';

export const useGetServers = routeLoader$(async ({ env }) => {
  const prisma = new PrismaClient({ datasources: { db: { url: env.get('DATABASE_URL') } } });
  const servers = await prisma.server.findMany();
  return servers;
});

export default component$(() => {
  const servers = useGetServers();
  // const store: any = useStore({
  //   sortType: 'players',
  //   alerts: [],
  // }, { deep: true });

  // const sortedServers = servers.value.sort((a, b) => {
  //   if (store.sortType === 'players') {
  //     return b.players - a.players;
  //   } else if (store.sortType === 'name') {
  //     return a.name.localeCompare(b.name);
  //   }
  //   return 0;
  // });

  return (
    <section class="flex mx-auto max-w-7xl justify-center min-h-[calc(100vh-68px)] flex-wrap">
      <div class="my-10 space-y-3 min-h-[60px] w-full flex flex-col justify-center">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-12 w-full text-center">Server List</h1>
        <div class="flex space-x-4 w-full">
          <div class="w-1/5">
            <label for="sortVersion" class="block text-sm font-medium text-white">Sort by version</label>
            <select id="sortVersion" name="sortVersion" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="all">All</option>
              <option value="1.20.4">1.20.4</option>
              <option value="1.20.3">1.20.3</option>
            </select>
          </div>
          <div class="w-3/4">
            {
              servers.value.map((server: any, index: string | number | null | undefined) => (
                <Server key={index} server={server} index={index} />
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Privacy Policy',
  meta: [
    {
      name: 'description',
      content: 'View our Privacy Policy',
    },
    {
      name: 'og:description',
      content: 'View our Privacy Policy',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};