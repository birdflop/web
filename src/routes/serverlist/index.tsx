import { component$, useStore } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead, server$ } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client';
import { Button } from '~/components/elements/Button';

const prisma = new PrismaClient();

export const useGetServers = routeLoader$(async () => {
  const servers = await prisma.server.findMany();
  return servers;
});

// const servers = [
//   {
//     name: 'Aether SMP',
//     ip: 'play.aethersmp.com',
//     version: '1.20.4',
//     players: 0,
//     maxPlayers: 100,
//     onlineStatus: 'Offline',
//     banner: 'https://minecraft-mp.com/images/banners/banner-328089-1704831881.png',
//     icon: 'https://minecraft-mp.com/images/favicon/328089.png?ts=1706602288',
//     tags: ['Discord', 'Economy', 'Events', 'Jobs', 'Land Claim', 'Ranks', 'SMP', 'Spigot', 'Survival'],
//   },
//   {
//     name: 'AcornMC',
//     ip: 'play.acornmc.org',
//     version: '1.20.4',
//     players: 69,
//     maxPlayers: 100,
//     onlineStatus: 'Online',
//     banner: 'https://minecraft-mp.com/images/banners/banner-174434-1686514033.png',
//     icon: 'https://minecraft-mp.com/images/favicon/174434.png?ts=1706612778',
//     tags: ['Bukkit', 'BungeeCord', 'Economy', 'Land Claim', 'PvE', 'Ranks', 'Spitgot', 'Survival', 'Vanilla'],
//   },
//   {
//     name: 'Piglin',
//     ip: 'play.piglin.org',
//     version: '1.20.4',
//     players: 10,
//     maxPlayers: 100,
//     onlineStatus: 'Online',
//     banner: 'https://minecraft-mp.com/images/banners/banner-253785-1686357389.png',
//     icon: 'https://minecraft-mp.com/images/favicon/253785.png?ts=1706619950',
//     tags: ['Casual', 'Discord', 'Economy', 'Land Claim', 'PvE', 'Survival'],
//   },
// ];

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

const Server = component$(({ ...props }: any) => {
  const { server, index } = props;

  return (
    <div class="text-black flex items-center bg-gray-200 p-4 rounded-lg mb-4 w-full mx-auto h-32">
      <div class="flex flex-col items-center justify-center mr-4">
        <span class="text-xl font-bold"># {index + 1}</span>
      </div>
      <div class="flex-1 flex flex-col items-start justify-center mr-4">
        <h2 class="text-lg font-bold">{server.name}</h2>
        <p>{server.version}</p>
      </div>
      <div class="flex-grow-1.5 flex flex-col mr-4">
        <img src={server.banner} alt="Server banner" width={468} height={60} />
        <div class="flex items-center border p-1 rounded w-full">
          <span class="bg-white flex-grow pl-2 p-1">{server.ip}</span>
          <button class="bg-gray-300 h-full">
            Copy IP
          </button>
        </div>
      </div>
      <div class="flex-1 flex flex-wrap">
        {JSON.parse(server.tags).slice(0, 5).map((tag: string, i: number) => (
          i < 4 ?
            <span key={i} class="inline-block bg-gray-500 rounded-full px-2 py-1 text-xs font-semibold text-white mr-2 mb-2">{tag}</span>
            :
            <span key={i} class="inline-block bg-gray-500 rounded-full px-2 py-1 text-xs font-semibold text-white mr-2 mb-2">...</span>
        ))}
      </div>
      <div class="w-20 flex flex-col items-start justify-between h-full">
        <div class="flex-1 flex items-start justify-start flex-col">
          <p class="text-sm">Players:</p>
          <p class="text-center text-lg">{server.players}/{server.maxPlayers}</p>
        </div>
        <div class="flex-1 flex items-start justify-start flex-col">
          <p class="text-sm">Status:</p>
          <p class={`text-lg font-bold ${'Online'.toLowerCase() === 'online' ? 'text-green-500' : 'text-red-500'}`}>
            {server.onlineStatus}
          </p>
        </div>
      </div>
    </div>
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