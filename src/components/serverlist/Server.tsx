import { component$ } from '@builder.io/qwik';

export default component$(({ ...props }: any) => {
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