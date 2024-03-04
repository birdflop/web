/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useStore } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Header, Dropdown, TextArea, TextInput, Toggle } from '@luminescent/ui';
import { CodeWorkingOutline, CubeOutline, RefreshCircleOutline, TerminalOutline } from 'qwik-ionicons';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { getCookies } from '~/components/util/SharedUtils';
import { generateResult } from '~/components/util/flags/generateResult';
import { extraFlags as extFlags } from '~/data/flags';
import { serverType as srvType } from '~/data/environment/serverType';

const flagTypes = {
  'none': 'none',
  'aikars': 'Aikar\'s Flags',
  'benchmarkedG1GC': 'Benchmarked (G1GC)',
  'benchmarkedZGC': 'Benchmarked (ZGC)',
  'benchmarkedShenandoah': 'Benchmarked (Shenandoah)',
  'hillttys': 'hilltty\'s Flags',
  'obyduxs': 'Obydux\'s Flags',
  'etils': 'Etil\'s Flags',
  'proxy': 'Proxy',
};

export const setCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    const existingCookie = cookie[key];
    if (existingCookie === json[key]) return;
    if (key == 'parsed') {
      document.cookie = `${key}=${encodeURIComponent(JSON.stringify(json[key]))}; path=/`;
    } else {
      document.cookie = `${key}=${encodeURIComponent(json[key])}; path=/`;
    }
  });
});

const defaults = {
  parsed: {
    operatingSystem: 'linux',
    serverType: 'paper',
    gui: false,
    variables: false,
    autoRestart: false,
    extraFlags: [],
    fileName: 'server.jar',
    flags: 'aikars',
    withResult: true,
    withFlags: false,
    memory: 0,
  },
};

export const useCookies = routeLoader$(async ({ cookie, url }) => {
  return await getCookies(cookie, Object.keys(defaults), url.searchParams) as typeof defaults;
});

export default component$(() => {
  useSpeak({ assets: ['flags'] });
  const t = inlineTranslate();

  const environmentOptions = [
    {
      name: t('flags.environments.linux.label@@Linux'),
      value: 'linux',
    },
    {
      name: t('flags.environments.windows.label@@Windows'),
      value: 'windows',
    },
    {
      name: t('flags.environments.macos.label@@macOS'),
      value: 'macos',
    },
    {
      name: t('flags.environments.pterodactyl.label@@Pterodactyl'),
      value: 'pterodactyl',
    },
    {
      name: t('flags.environments.command.label@@Command'),
      value: 'command',
    },
  ];

  const softwareOptions = [
    {
      name: t('flags.serverType.paper.label@@Paper'),
      value: 'paper',
    },
    {
      name: t('flags.serverType.purpur.label@@Purpur'),
      value: 'purpur',
    },
    //{
    //  name: t('flags.serverType.forge.label@@Forge'),
    //  value: 'forge',
    //},
    //{
    //  name: t('flags.serverType.fabric.label@@Fabric'),
    //  value: 'fabric',
    //},
    {
      name: t('flags.serverType.velocity.label@@Velocity'),
      value: 'velocity',
    },
    {
      name: t('flags.serverType.waterfall.label@@Waterfall'),
      value: 'waterfall',
    },
  ];

  const configOptions = [
    {
      id: 'gui',
      label: <>
        <TerminalOutline class="w-6 h-6"/> {t('flags.gui.label@@Use GUI')}
      </>,
      description: t('flags.gui.description@@Whether to display the built-in server management GUI.'),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    {
      id: 'variables',
      label: <>
        <CodeWorkingOutline class="w-6 h-6" /> {t('flags.variables.label@@Use Variables')}
      </>,
      description: t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'),
    },
    {
      id: 'autoRestart',
      label: <>
        <RefreshCircleOutline class="w-6 h-6" /> {t('flags.autoRestart.label@@Auto-restart')}
      </>,
      description: t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.'),
    },
  ];

  const extraFlagsOptions = [
    {
      id: 'vectors',
      label: <>
        <CubeOutline class="w-6 h-6" /> {t('flags.extraFlags.vectors.label@@Modern Vectors')}
      </>,
      description: t('flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.'),
    },
    {
      id: 'benchmarkedGraalVM',
      label: <>
        <CubeOutline class="w-6 h-6" /> {t('flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)')}
      </>,
      description: t('flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.'),
    },
  ];

  const cookies = useCookies().value;
  const store: any = useStore({
    ...defaults,
    ...cookies,
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-5xl px-6 justify-center min-h-[calc(100svh)] pt-[72px]">
      <div class="w-full my-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
          {t('flags.title@@Flags Generator')}
        </h1>
        <h2 class="text-gray-50 text-base sm:text-xl mb-6">
          {t('flags.subtitle@@A simple script generator to start your Minecraft servers with optimal flags.')}
        </h2>

        <div class="flex [&>*]:flex-1 flex-wrap gap-4 justify-between my-6 fill-current">
          <div class="flex flex-col gap-4">
            <TextInput id="input" value={store.parsed.fileName} placeholder="server.jar" onChange$={(event: any) => {
              if (event.target!.value.replace(/ /g, '') == '') return;
              if (!event.target!.value.endsWith('.jar')) { event.target!.value += '.jar'; }
              store.parsed.fileName = event.target!.value;
              setCookie(JSON.stringify(store));
            }}>
              <Header subheader={t('flags.fileName.description@@The name of the file that will be used to start your server.')}>
                {t('flags.fileName.label@@File Name')}
              </Header>
            </TextInput>
            <Dropdown id="os" class={{ 'w-full': true }} onChange$={(event: any) => {
              store.parsed.operatingSystem = event.target!.value; setCookie(JSON.stringify(store));
            }} values={environmentOptions} value={store.parsed.operatingSystem}>
              <Header subheader={t('flags.enviroments.description@@The operating system that the server runs on.')}>
                {t('flags.environment.label@@Environment')}
              </Header>
            </Dropdown>
            <Dropdown id="software" class={{ 'w-full': true }} onChange$={(event: any) => {
              store.parsed.serverType = event.target!.value;
              if (!srvType[store.parsed.serverType].flags.includes(event.target!.value)) {
                store.parsed.flags = srvType[store.parsed.serverType].flags[1];
              }
              setCookie(JSON.stringify(store));
            }} values={softwareOptions} value={store.parsed.flags}>
              <Header subheader={t('flags.software.description@@The software in which your Minecraft server will run on.')}>
                {t('flags.software.label@@Software')}
              </Header>
            </Dropdown>
            <div>
              <Header subheader={t('flags.memory.description@@The amount of memory (RAM) to allocate to your server.')}>
                {t('flags.memory.label@@Memory')}
              </Header>
              <div class="group relative w-full h-2 bg-gray-800 hover:bg-gray-700 select-none rounded-lg my-2">
                <div class="h-2 bg-blue-800 group-hover:bg-blue-700 rounded-lg" style={{ width: `${store.parsed.memory / 32 * 100}%` }} />
                <div class="absolute w-full top-1 flex justify-between">
                  <span class="text-left">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-right">|</span>
                </div>
                <div class="absolute -top-1 flex flex-col gap-4 items-center" style={{ left: `calc(${store.parsed.memory / 32 * 100}% - 48px)` }}>
                  <div class="w-4 h-4 bg-blue-700 group-hover:bg-blue-600 rounded-full" />
                  <div class="opacity-0 group-hover:opacity-100 w-24 py-2 bg-gray-800 rounded-lg flex justify-center transition-all z-50">
                    {store.parsed.memory} GB
                  </div>
                </div>
                <input id="labels-range-input" type="range" min="0" max="32" step="0.5" value={store.parsed.memory} class="absolute top-0 h-2 w-full opacity-0 cursor-pointer" onInput$={(event: any) => {
                  store.parsed.memory = event.target!.value;
                  setCookie(JSON.stringify(store));
                }} />
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <Dropdown id="preset" class={{ 'w-full': true }} onChange$={(event: any) => {
              store.parsed.flags = event.target!.value; setCookie(JSON.stringify(store));
            }} values={Object.keys(flagTypes).map((flag: string) => ({
              name: flagTypes[flag as keyof typeof flagTypes],
              value: flag,
            }))} value={store.parsed.flags}>
              <Header subheader={t('flags.flags.description@@The collection of start arguments that typically optimize the server\'s performance')}>
                {t('flags.flags.label@@Flags')}
              </Header>
            </Dropdown>
            <div class="flex flex-col gap-2">
              <Header subheader={t('flags.config.description@@The various additions and modifications that can be made to your start script.')}>
                {t('flags.config.label@@Config')}
              </Header>
              {configOptions.filter((option) => {
                return !option.disable?.includes(store.parsed['operatingSystem']) && !option.disable?.includes(store.parsed['serverType']);
              }).map((option) => <>
                <Toggle key={option.id} label={option.label} checked={store.parsed[option.id as keyof typeof store]} onClick$={(event: any) => {
                  (store.parsed as any)[option.id] = event.target!.checked;
                  setCookie(JSON.stringify(store));
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </>)}
              {extraFlagsOptions.filter((option) => {
                return extFlags[option.id].supports.includes(store.parsed.flags) && srvType[store.parsed.serverType].extraFlags?.includes(option.id);
              }).map((option) => <>
                <Toggle key={option.id} label={option.label} checked={store.parsed.extraFlags.includes(option.id)} onClick$={(event: any) => {
                  if (event.target!.checked) {
                    store.parsed.extraFlags.push(option.id);
                  } else {
                    store.parsed.extraFlags.splice(store.parsed.extraFlags.indexOf(option.id), 1);
                  }
                  setCookie(JSON.stringify(store));
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </>)}
            </div>
          </div>
        </div>

        {/* charlimit={256} */}
        <TextArea output class={{ 'h-96 mt-2': true }} id="Output" value={((p: any) => generateResult(p).script)(store.parsed)}>
          <Header subheader={t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!', { fileName: store.parsed.fileName })}>
            {t('flags.script.label@@Script')}
          </Header>
        </TextArea>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Flags Generator - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};