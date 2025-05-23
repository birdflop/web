import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { SelectMenu, Toggle, SelectMenuRaw } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import type { flagsSchema } from '~/util/flags/generateResult';
import { generateResult } from '~/util/flags/generateResult';
import type { AvailableFlags } from '~/util/flags/flags';
import { extraFlags as extFlags } from '~/util/flags/flags';
import { serverType as srvType } from '~/util/flags/environment/serverType';
import { isBrowser } from '@builder.io/qwik/build';
import { Box, Code, CircleHelp, RefreshCw, SquareTerminal } from 'lucide-icons-qwik';

const defaults: flagsSchema = {
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
};

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'parsed', url.searchParams) as {
    cookies: any,
    errors: string[]
  };
});

export default component$(() => {
  const t = inlineTranslate();

  const flagOptions = [
    {
      name: t('flags.flags.none@@None'),
      value: 'none',
    },
    {
      name: t('flags.flags.aikars@@Aikar\'s Flags'),
      value: 'aikars',
    },
    {
      name: t('flags.flags.meowice@@MeowIce\'s Flags'),
      value: 'meowice',
    },
    {
      name: t('flags.flags.benchmarked@@Benchmarked'),
      value: 'benchmarked',
    },
    {
      name: t('flags.flags.hillttys@@hilltty\'s Flags'),
      value: 'hillttys',
    },
    {
      name: t('flags.flags.obyduxs@@Obydux\'s Flags'),
      value: 'obyduxs',
    },
    {
      name: t('flags.flags.etils@@Etil\'s Flags'),
      value: 'etils',
    },
  ];

  const environmentOptions = [
    {
      name: t('flags.environment.linux@@Linux'),
      value: 'linux',
    },
    {
      name: t('flags.environment.windows@@Windows'),
      value: 'windows',
    },
    {
      name: t('flags.environment.macos@@macOS'),
      value: 'macos',
    },
    {
      name: t('flags.environment.pterodactyl@@Pterodactyl'),
      value: 'pterodactyl',
    },
    {
      name: t('flags.environment.command@@Command'),
      value: 'command',
    },
  ];

  const softwareOptions = [
    {
      name: t('flags.serverType.paper@@Paper'),
      value: 'paper',
    },
    {
      name: t('flags.serverType.purpur@@Purpur'),
      value: 'purpur',
    },
    //{
    //  name: t('flags.serverType.forge@@Forge'),
    //  value: 'forge',
    //},
    //{
    //  name: t('flags.serverType.fabric@@Fabric'),
    //  value: 'fabric',
    //},
    {
      name: t('flags.serverType.velocity@@Velocity'),
      value: 'velocity',
    },
    {
      name: t('flags.serverType.waterfall@@Waterfall'),
      value: 'waterfall',
    },
  ];

  const configOptions = {
    gui: {
      label: <>
        <SquareTerminal class="w-6 h-6"/> {t('flags.gui.label@@No GUI')}
      </>,
      description: t('flags.gui.description@@Whether to display the built-in server management GUI.'),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    variables: {
      label: <>
        <Code class="w-6 h-6" /> {t('flags.variables.label@@Use Variables')}
      </>,
      description: t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'),
      disable: [] as string[],
    },
    autoRestart: {
      label: <>
        <RefreshCw class="w-6 h-6" /> {t('flags.autoRestart.label@@Auto-restart')}
      </>,
      description: t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.'),
      disable: [] as string[],
    },
  };

  const extraFlagsOptions = {
    vectors: {
      label: <>
        <Box class="w-6 h-6" /> {t('flags.extraFlags.vectors.label@@Modern Vectors')}
      </>,
      description: t('flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.'),
    },
    benchmarkedGraalVM: {
      label: <>
        <Box class="w-6 h-6" /> {t('flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)')}
      </>,
      description: t('flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.'),
    },
    meowiceGraalVM: {
      label: <>
        <Box class="w-6 h-6" /> {t('flags.extraFlags.meowiceGraalVM.label@@MeowIce\'s Flags (GraalVM)')}
      </>,
      description: t('flags.extraFlags.meowiceGraalVM.description@@Additional performance flags for MeowIce\'s Flags exclusive to GraalVM users.'),
    },
  };

  const cookies = useCookies().value;
  const flagsStore = useStore({
    ...defaults,
    ...cookies,
  }, { deep: true });

  useTask$(({ track }) => {
    if (isBrowser) setCookies('parsed', flagsStore);
    (Object.keys(flagsStore) as Array<keyof typeof flagsStore>).forEach((key) => {
      track(() => flagsStore[key]);
    });
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.flags.title@@Flags Generator')}
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags')}
        </h2>

        <div class="flex [&>*]:flex-1 flex-wrap gap-4 justify-between my-6">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <label for="input">
                {t('flags.fileName.label@@File Name')}
              </label>
              <input class="lum-input" id="input" value={flagsStore.fileName} placeholder="server.jar" onChange$={(e, el) => {
                if (el.value.replace(/ /g, '') == '') return;
                if (!el.value.endsWith('.jar')) { el.value += '.jar'; }
                flagsStore.fileName = el.value;
              }}/>
              <p class="text-gray-400 text-sm">
                {t('flags.fileName.description@@The name of the file that will be used to start your server.')}
              </p>
            </div>
            <div class="flex gap-2">
              <div class="flex flex-col gap-1">
                <SelectMenu id="os" class={{ 'w-full': true }} onChange$={(e, el) => {
                  flagsStore.operatingSystem = el.value;
                }} values={environmentOptions} value={flagsStore.operatingSystem}>
                  {t('flags.environment.label@@Environment')}
                </SelectMenu>
                <p class="text-gray-400 text-sm">
                  {t('flags.environment.description@@The operating system that the server runs on.')}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <SelectMenu id="software" class={{ 'w-full': true }} onChange$={(e, el) => {
                  flagsStore.serverType = el.value;
                }} values={softwareOptions} value={flagsStore.serverType}>
                  {t('flags.software.label@@Software')}
                </SelectMenu>
                <p class="text-gray-400 text-sm">
                  {t('flags.software.description@@The software in which your Minecraft server will run on.')}
                </p>
              </div>
            </div>
            <div>
              <label for="labels-range-input">
                {t('flags.memory.label@@Memory')}
              </label>
              <div class="group relative w-full h-2 lum-bg-gray-800 hover:lum-bg-gray-700 select-none rounded-lg my-2">
                <div class="h-2 lum-bg-blue-800 group-hover:lum-bg-blue-700 rounded-lg" style={{ width: `${flagsStore.memory / 32 * 100}%` }} />
                <div class="absolute w-full top-1 flex justify-between">
                  <span class="text-left">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-center">|</span>
                  <span class="text-right">|</span>
                </div>
                <div class="absolute -top-1 flex flex-col gap-4 items-center" style={{ left: `calc(${flagsStore.memory / 32 * 100}% - 48px)` }}>
                  <div class="w-4 h-4 lum-bg-blue-700 group-hover:lum-bg-blue-600 rounded-full" />
                  <div class="lum-bg-gray-900 lum-btn-p-2 text-center w-24 rounded-md opacity-0 group-hover:opacity-100 transition-all z-50">
                    {flagsStore.memory} GB
                  </div>
                </div>
                <input id="labels-range-input" type="range" min="0" max="32" step="0.5" value={flagsStore.memory} class="absolute top-0 h-2 w-full opacity-0 cursor-pointer" onInput$={(e, el) => {
                  flagsStore.memory = Number(el.value);
                }} />
              </div>
              <p class="text-gray-400 text-sm mt-6">
                {t('flags.memory.description@@The amount of memory (RAM) to allocate to your server.')}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 w-full">
              <div class="flex items-end gap-2">
                <SelectMenu id="flags" class={{ 'w-full': true }} onChange$={(e, el) => {
                  flagsStore.flags = el.value as AvailableFlags;
                }} values={flagOptions} value={flagsStore.flags}>
                  {t('flags.flags.label@@Flags')}
                </SelectMenu>
                <SelectMenuRaw id="flagshelp" onChange$={(e, el) => {
                  flagsStore.flags = el.value as AvailableFlags;
                }} customDropdown>
                  <CircleHelp size={24} q:slot='dropdown'/>
                  <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://docs.papermc.io/paper/aikars-flags" target="_blank">
                    {t('flags.flags.aikars@@Aikar\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://github.com/MeowIce/meowice-flags" target="_blank">
                    {t('flags.flags.meowice@@MeowIce\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks" target="_blank">
                    {t('flags.flags.benchmarked@@Benchmarked')}
                  </a>
                  <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md" target="_blank">
                    {t('flags.flags.hillttys@@hilltty\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent" q:slot='extra-buttons' href="https://github.com/Obydux/Minecraft-GraalVM-Flags" target="_blank">
                    {t('flags.flags.obyduxs@@Obydux\'s Flags')}
                  </a>
                </SelectMenuRaw>
              </div>
              <p class="text-gray-400 text-sm">
                {t('flags.description@@The collection of start arguments that typically optimize the server\'s performance')}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <p>
                {t('flags.config.label@@Config')}<br/>
                <span class="text-gray-400 text-sm">
                  {t('flags.config.description@@The various additions and modifications that can be made to your start script.')}
                </span>
              </p>
              {(Object.entries(configOptions) as [keyof typeof configOptions, typeof configOptions[keyof typeof configOptions]][]).filter(([,option]) => {
                return !option.disable?.includes(flagsStore.operatingSystem) && !option.disable?.includes(flagsStore.serverType);
              }).map(([id, option]) => <div key={id} class="flex flex-col gap-1">
                <Toggle label={option.label} checked={flagsStore[id]} onClick$={(e, el) => {
                  flagsStore[id] = el.checked;
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </div>)}
              {(Object.entries(extraFlagsOptions) as [keyof typeof extraFlagsOptions, typeof extraFlagsOptions[keyof typeof extraFlagsOptions]][]).filter(([id]) => {
                return extFlags[id].supports.includes(flagsStore.flags) && srvType[flagsStore.serverType].extraFlags?.includes(id);
              }).map(([id, option]) => <>
                <Toggle key={id} label={option.label} checked={flagsStore.extraFlags.includes(id)} onClick$={(e, el) => {
                  if (el.checked) {
                    flagsStore.extraFlags.push(id);
                  } else {
                    flagsStore.extraFlags.splice(flagsStore.extraFlags.indexOf(id), 1);
                  }
                }} />
                {option.description && <p class="text-gray-400 text-sm">{option.description}</p>}
              </>)}
            </div>
          </div>
        </div>

        <label for="Output" class="text-gray-50">
          {t('flags.script.label@@Script')}
        </label>
        <p class="text-gray-400 text-sm mb-2">
          {t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!', { fileName: flagsStore.fileName })}
        </p>
        <textarea class={{ 'lum-input h-96 font-mono mt-2 w-full whitespace-pre-wrap break-all': true }} id="Output" value={generateResult(flagsStore).script}/>
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
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};