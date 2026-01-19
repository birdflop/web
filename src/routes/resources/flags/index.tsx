import { component$, useStore, useTask$, isBrowser } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { SelectMenu, Toggle, SelectMenuRaw, RangeInput } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import type { flagsSchema } from '~/util/flags/generateResult';
import { generateResult } from '~/util/flags/generateResult';
import type { AvailableFlags } from '~/util/flags/flags';
import { extraFlags as extFlags } from '~/util/flags/flags';
import { serverType as srvType } from '~/util/flags/environment/serverType';
import { Box, Code, CircleHelp, RefreshCw, SquareTerminal, Flag } from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';

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

const environmentOptions = [
  {
    name: 'Linux',
    value: 'linux',
  },
  {
    name: 'Windows',
    value: 'windows',
  },
  {
    name: 'macOS',
    value: 'macos',
  },
  {
    name: 'Pterodactyl',
    value: 'pterodactyl',
  },
  {
    name: 'Command',
    value: 'command',
  },
];

const softwareOptions = [
  {
    name: 'Paper',
    value: 'paper',
  },
  {
    name: 'Purpur',
    value: 'purpur',
  },
  //{
  //  name: 'Forge',
  //  value: 'forge',
  //},
  //{
  //  name: 'Fabric',
  //  value: 'fabric',
  //},
  {
    name: 'Velocity',
    value: 'velocity',
  },
  {
    name: 'Waterfall',
    value: 'waterfall',
  },
];

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
      name: 'Aikar\'s Flags',
      value: 'aikars',
    },
    {
      name: 'MeowIce\'s Flags',
      value: 'meowice',
    },
    {
      name: 'Benchmarked',
      value: 'benchmarked',
    },
    {
      name: 'hilltty\'s Flags',
      value: 'hillttys',
    },
    {
      name: 'Obydux\'s Flags',
      value: 'obyduxs',
    },
    {
      name: 'Etil\'s Flags',
      value: 'etils',
    },
  ];

  const configOptions = {
    gui: {
      icon: SquareTerminal,
      label: t('flags.gui.label@@No GUI'),
      description: t('flags.gui.description@@Whether to display the built-in server management GUI.'),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    variables: {
      icon: Code,
      label: t('flags.variables.label@@Use Variables'),
      description: t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'),
      disable: [] as string[],
    },
    autoRestart: {
      icon: RefreshCw,
      label: t('flags.autoRestart.label@@Auto-restart'),
      description: t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.'),
      disable: [] as string[],
    },
  };

  const extraFlagsOptions = {
    vectors: {
      icon: Box,
      label: t('flags.extraFlags.vectors.label@@Modern Vectors'),
      description: t('flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.'),
    },
    benchmarkedGraalVM: {
      icon: Box,
      label: t('flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)'),
      description: t('flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.'),
    },
    meowiceGraalVM: {
      icon: Box,
      label: t('flags.extraFlags.meowiceGraalVM.label@@MeowIce\'s Flags (GraalVM)'),
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
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-15 w-full">
        <h1 class='flex gap-3 text-2xl! items-center my-2!'>
          <Flag size={32} />
          {t('nav.resources.flags.title@@Flags Generator')}
        </h1>
        <p class="mb-4 border-b border-lum-border/10 pb-4">
          {t('nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags')}
        </p>

        <div class="flex *:flex-1 flex-wrap gap-4 justify-between my-6">
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
              <p class="text-lum-text-secondary text-sm">
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
                <p class="text-lum-text-secondary text-sm">
                  {t('flags.environment.description@@The operating system that the server runs on.')}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <SelectMenu id="software" class={{ 'w-full': true }} onChange$={(e, el) => {
                  flagsStore.serverType = el.value;
                }} values={softwareOptions} value={flagsStore.serverType}>
                  {t('flags.software.label@@Software')}
                </SelectMenu>
                <p class="text-lum-text-secondary text-sm">
                  {t('flags.software.description@@The software in which your Minecraft server will run on.')}
                </p>
              </div>
            </div>
            <div>
              <RangeInput id='memory' min={0} max={32} step={0.5} value={flagsStore.memory} onInput$={(e, el) => {
                flagsStore.memory = Number(el.value);
              }}>
                {t('flags.memory.label@@Memory')} (GiB)
              </RangeInput>
              <p class="text-lum-text-secondary text-sm mt-2">
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
                  <a class="lum-btn lum-bg-transparent rounded-lum-1" q:slot='extra-buttons' href="https://docs.papermc.io/paper/aikars-flags" target="_blank">
                    {t('flags.flags.aikars@@Aikar\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent rounded-lum-1" q:slot='extra-buttons' href="https://github.com/MeowIce/meowice-flags" target="_blank">
                    {t('flags.flags.meowice@@MeowIce\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent rounded-lum-1" q:slot='extra-buttons' href="https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks" target="_blank">
                    {t('flags.flags.benchmarked@@Benchmarked')}
                  </a>
                  <a class="lum-btn lum-bg-transparent rounded-lum-1" q:slot='extra-buttons' href="https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md" target="_blank">
                    {t('flags.flags.hillttys@@hilltty\'s Flags')}
                  </a>
                  <a class="lum-btn lum-bg-transparent rounded-lum-1" q:slot='extra-buttons' href="https://github.com/Obydux/Minecraft-GraalVM-Flags" target="_blank">
                    {t('flags.flags.obyduxs@@Obydux\'s Flags')}
                  </a>
                </SelectMenuRaw>
              </div>
              <p class="text-lum-text-secondary text-sm">
                {t('flags.description@@The collection of start arguments that typically optimize the server\'s performance')}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <p>
                {t('flags.config.label@@Config')}<br/>
                <span class="text-lum-text-secondary text-sm">
                  {t('flags.config.description@@The various additions and modifications that can be made to your start script.')}
                </span>
              </p>
              {(Object.entries(configOptions) as [keyof typeof configOptions, typeof configOptions[keyof typeof configOptions]][]).filter(([,option]) => {
                return !option.disable?.includes(flagsStore.operatingSystem) && !option.disable?.includes(flagsStore.serverType);
              }).map(([id, option]) => <div key={id} class="flex flex-col gap-1">
                <Toggle checked={flagsStore[id]} onClick$={(e, el) => {
                  flagsStore[id] = el.checked;
                }}>
                  <option.icon size={24} class="min-w-6 min-h-6" />
                  {option.label}
                </Toggle>
                <div class="flex gap-2">
                  {option.description && <p class="text-lum-text-secondary text-sm">{option.description}</p>}
                </div>
              </div>)}
              {(Object.entries(extraFlagsOptions) as [keyof typeof extraFlagsOptions, typeof extraFlagsOptions[keyof typeof extraFlagsOptions]][]).filter(([id]) => {
                return extFlags[id].supports.includes(flagsStore.flags) && srvType[flagsStore.serverType].extraFlags?.includes(id);
              }).map(([id, option]) => <>
                <Toggle key={id} checked={flagsStore.extraFlags.includes(id)} onClick$={(e, el) => {
                  if (el.checked) flagsStore.extraFlags.push(id);
                  else flagsStore.extraFlags.splice(flagsStore.extraFlags.indexOf(id), 1);
                }}>
                  <option.icon size={24} class="min-w-6 min-h-6" />
                  {option.label}
                </Toggle>
                <div class="flex gap-2">
                  {option.description && <p class="text-lum-text-secondary text-sm">{option.description}</p>}
                </div>
              </>)}
            </div>
          </div>
        </div>

        <label for="Output">
          {t('flags.script.label@@Script')}
        </label>
        <p class="text-lum-text-secondary text-sm mb-2">
          {t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!', { fileName: flagsStore.fileName })}
        </p>
        <textarea class={{ 'lum-input h-96 font-mono mt-2 w-full whitespace-pre-wrap break-all': true }} id="Output" value={generateResult(flagsStore).script}/>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Flags Generator - Birdflop',
  description: 'A simple script generator to start your Minecraft servers with optimal flags. ' + defaultDescription,
});