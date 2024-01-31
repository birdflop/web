import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

const servers = [
  {
    name: 'Aether SMP',
    ip: 'play.aethersmp.com',
    version: '1.20.4',
    players: 0,
    maxPlayers: 100,
    onlineStatus: 'Offline',
    banner: 'https://minecraft-mp.com/images/banners/banner-328089-1704831881.png',
    tags: ['Discord', 'Economy', 'Events', 'Jobs', 'Land Claim', 'Ranks', 'SMP', 'Spigot', 'Survival'],
  },
  {
    name: 'AcornMC',
    ip: 'play.acornmc.org',
    version: '1.20.4',
    players: 69,
    maxPlayers: 100,
    onlineStatus: 'Online',
    banner: 'https://minecraft-mp.com/images/banners/banner-174434-1686514033.png',
    tags: ['Bukkit', 'BungeeCord', 'Economy', 'Land Claim', 'PvE', 'Ranks', 'Spitgot', 'Survival', 'Vanilla'],
  },
  {
    name: 'Piglin',
    ip: 'play.piglin.org',
    version: '1.20.4',
    players: 10,
    maxPlayers: 100,
    onlineStatus: 'Online',
    banner: 'https://minecraft-mp.com/images/banners/banner-253785-1686357389.png',
    tags: ['Casual', 'Discord', 'Economy', 'Land Claim', 'PvE', 'Survival'],
  },
];

export default component$(() => {

  const store: any = useStore({
    sortType: 'players',
    alerts: [],
  }, { deep: true });

  const sortedServers = servers.sort((a, b) => {
    if (store.sortType === 'players') {
      return b.players - a.players;
    } else if (store.sortType === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 justify-center min-h-[calc(100lvh-68px)] flex-wrap">
      <div class="my-10 space-y-3 min-h-[60px] w-full flex flex-col justify-center">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-12 w-full text-center">Server List</h1>
        {
          sortedServers.map((server, index) => (
            <Server key={index} server={server} index={index} />
          ))
        }
      </div>
    </section>
  );
});

const Server = component$(({ ...props }: any) => {
  const { server, index } = props;

  return (
    <div class="text-black flex items-center bg-gray-200 p-4 rounded-lg mb-4 w-full">
      <div class="flex flex-col items-center justify-center mr-4">
        <span class="text-xl font-bold">{index + 1}</span>
      </div>
      <div class="flex-1 flex flex-col items-start justify-center mr-4">
        <h2 class="text-lg font-bold">{server.name}</h2>
        <p>{server.version}</p>
      </div>
      <div class="flex-1 flex flex-col mr-4">
        <img src={server.banner} alt="Server banner" width={468} height={60} class="object-cover rounded-lg mb-2" />
        <div class="bg-white flex items-center border p-1 rounded w-full">
          <span class="flex-grow">{server.ip}</span>
          <button class="bg-gray-300 h-full">
            Copy IP
          </button>
        </div>
      </div>
      <div class="flex-1 flex flex-wrap">
        {server.tags.map((tag: string, i: number) => (
          <span key={i} class="inline-block bg-gray-500 rounded-full px-2 py-1 text-xs font-semibold text-white mr-2 mb-2">{tag}</span>
        ))}
      </div>
      <div class="w-40 flex flex-col items-start justify-between h-full">
        <div class="flex-1 flex items-start justify-start flex-col">
          <p class="text-sm">Players:</p>
          <p class="text-center text-lg">{server.players}/{server.maxPlayers}</p>
        </div>
        <div class="flex-1 flex items-start justify-start flex-col">
          <p class="text-sm">Status:</p>
          <p class={`text-lg font-bold ${server.onlineStatus.toLowerCase() === 'online' ? 'text-green-500' : 'text-red-500'}`}>
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