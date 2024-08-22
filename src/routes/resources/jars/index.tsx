import { component$, useStore, useSignal } from '@builder.io/qwik';
import { Card, Header, TextInput, ButtonAnchor, Button } from '@luminescent/ui-qwik';
import { CloseOutline } from 'qwik-ionicons';

async function fetchLatestPurpurVersion() {
  const response = await fetch('https://api.purpurmc.org/v2/purpur');
  const data = await response.json();
  const versions = data.versions;
  const latestVersion = versions[versions.length - 1];
  return `https://api.purpurmc.org/v2/purpur/${latestVersion}/latest/download`;
}

async function fetchLatestPaperVersion() {
  const response = await fetch('https://papermc.io/api/v2/projects/paper');
  const data = await response.json();
  const versions = data.versions;
  const latestVersion = versions[versions.length - 1];
  const buildResponse = await fetch(`https://papermc.io/api/v2/projects/paper/versions/${latestVersion}`);
  const buildData = await buildResponse.json();
  const latestBuild = buildData.builds[buildData.builds.length - 1];
  const downloadResponse = await fetch(`https://papermc.io/api/v2/projects/paper/versions/${latestVersion}/builds/${latestBuild}`);
  const downloadData = await downloadResponse.json();
  const downloadName = downloadData.downloads.application.name;
  return `https://papermc.io/api/v2/projects/paper/versions/${latestVersion}/builds/${latestBuild}/downloads/${downloadName}`;
}

async function fetchLatestPufferfishVersion() {
  const response = await fetch('https://ci.pufferfish.host/job/Pufferfish-1.20/api/json?tree=builds[number,status,timestamp,id,result,changeSet[items[comment,commitId]],artifacts[*]]');
  const data = await response.json();
  const latestBuild = data.builds[0];
  const latestBuildNumber = latestBuild.number;
  const artifact = latestBuild.artifacts.find((a: any) => a.fileName.endsWith('.jar'));
  return `https://ci.pufferfish.host/job/Pufferfish-1.20/${latestBuildNumber}/artifact/${artifact.relativePath}`;
}

function getDownloadLink(jarName: string) {
  switch (jarName) {
  case 'PurpurMC':
    return fetchLatestPurpurVersion();
  case 'PaperMC':
    return fetchLatestPaperVersion();
  case 'Pufferfish':
    return fetchLatestPufferfishVersion();
  default:
    return '';
  }
}

const serverJars = [
  {
    name: 'PurpurMC',
    website: 'https://purpurmc.org/',
    logo: 'https://purpurmc.org/docs/images/purpur-small.png',
    description: 'Purpur aims to provide a high-performance, stable!',
    longDescription: 'PurpurMC provides additional enhancements and features on top of the PaperMC server. Includes advanced configuration options, additional commands, and more control over server performance.',
  },
  {
    name: 'PaperMC',
    website: 'https://papermc.io/',
    logo: 'https://docs.papermc.io/assets/images/papermc-logomark-512-f125384f3367cd4d9291ca983fcb7334.png',
    description: 'PaperMC is designed to improve performance and customization!',
    longDescription: 'PaperMC is a high performance Minecraft server that is compatible with the Vanilla Minecraft server. It is designed to be lightweight and fast, providing a smooth experience for players.',
  },
  {
    name: 'Pufferfish',
    website: 'https://pufferfish.host',
    logo: 'https://pufferfish.host/_next/static/images/pufferfish-mark-610a2bf4c7063641b6d396a5e9d0760f.svg',
    description: 'A highly optimized Paper fork designed for large servers!',
    longDescription: 'Pufferfish is a Minecraft server software that is designed to be lightweight and easy to use. It is compatible with the Vanilla Minecraft server and provides additional features and enhancements.',
  },
];

export default component$(() => {
  const store = useStore({
    searchTerm: '',
    selectedJar: null as typeof serverJars[number] | null,
    latestVersion: '',
    downloadLink: '',
  });

  const filteredJars = serverJars.filter((jar) =>
    jar.name.toLowerCase().includes(store.searchTerm.toLowerCase()),
  );

  const modalRef = useSignal<HTMLDialogElement>();

  return (
    <div class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh pt-[72px]">
      <div class="w-full max-w-2xl flex flex-col items-center space-y-4 p-4">
        <h1 class="text-3xl font-bold mb-4 text-center">Jarflop - The Minecraft Server Jar Hub!</h1>
        <div class="w-full mb-6">
          <TextInput
            id="search-input"
            placeholder="Search for a version..."
            value={store.searchTerm}
            onInput$={(e, el) => store.searchTerm = el.value}
          />
        </div>
        <div class="w-full relative">
          <div
            class="space-y-4 overflow-y-auto max-h-96"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            {filteredJars.length > 0 ? (
              filteredJars.map((jar, index) => (
                <Card key={index} hover="clickable" onClick$={async () => {
                  try {
                    store.selectedJar = jar;
                    modalRef.value?.showModal();
                    store.downloadLink = await getDownloadLink(jar.name);
                  }
                  catch (error) {
                    console.error('Error fetching download link:', error);
                  }
                }}>
                  <div class="flex items-center">
                    <img src={jar.logo} alt={`${jar.name} logo`} class="w-12 h-12 mr-4" height="1" width="1" />
                    <div>
                      <Header id={`header-${index}`} subheader={jar.description}>
                        {jar.name}
                      </Header>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p class="text-center text-gray-400">No results found. If you are wanting a new server jar added please contact us!</p>
            )}
          </div>
        </div>
      </div>
      <dialog ref={modalRef} class="bg-gray-800 text-white p-6 rounded-lg shadow-lg relative max-w-lg w-full transform transition-transform duration-300 ease-out scale-100">
        <div class="flex items-center mb-4">
          <img src={store.selectedJar?.logo} alt={`${store.selectedJar?.name} logo`} class="w-12 h-12 mr-4" height="1" width="1"/>
          <h2 class="text-2xl font-bold flex-1">{store.selectedJar?.name}</h2>
          <Button square onClick$={() => modalRef.value?.close()}>
            <CloseOutline width="24" style={{ color: 'white' }} />
          </Button>
        </div>
        <p class="mb-4">{store.selectedJar?.longDescription}</p>
        <ButtonAnchor href={store.downloadLink}>
          Download Latest Version
        </ButtonAnchor>
      </dialog>
    </div>
  );
});