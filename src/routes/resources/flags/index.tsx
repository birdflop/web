import { component$, useStore, useTask$, isBrowser } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  SelectMenu,
  Toggle,
  SelectMenuRaw,
  RangeInput,
  LogoPaper,
  LogoPurpur,
  LogoWaterfall,
  LogoForge,
  LogoFabric,
} from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import { flagsDefaults, generateResult } from '~/util/flags/generateResult';
import type { AvailableFlags } from '~/util/flags/flags';
import { extraFlags as extFlags } from '~/util/flags/flags';
import { serverType as srvType } from '~/util/flags/environment/serverType';
import {
  Box,
  Code,
  CircleHelp,
  RefreshCw,
  SquareTerminal,
  Flag,
  MemoryStick,
  Computer,
  Terminal,
} from 'lucide-icons-qwik';
import { defaultDescription, generateHead } from '~/root';
import {
  SiApple,
  SiLinux,
  SiPterodactyl,
  SiSpigotmc,
  SiVelocity,
} from 'simple-icons-qwik';
import { deepTrack } from '~/util/track';
import Output from '~/components/Elements/Output';

const Linux = component$(() => (
  <span class="flex items-center gap-2">
    <SiLinux class="fill-current" size={20} /> Linux
  </span>
));

const Windows = component$(() => (
  <span class="flex items-center gap-2">
    <Computer size={20} /> Windows
  </span>
));

const MacOS = component$(() => (
  <span class="flex items-center gap-2">
    <SiApple class="fill-current" size={20} /> MacOS
  </span>
));

const Pterodactyl = component$(() => (
  <span class="flex items-center gap-2">
    <SiPterodactyl class="fill-current" size={20} /> Pterodactyl
  </span>
));

const Command = component$(() => (
  <span class="flex items-center gap-2">
    <Terminal size={20} /> Command
  </span>
));

const environmentOptions = [
  { name: <Linux />, value: 'linux' },
  { name: <Windows />, value: 'windows' },
  { name: <MacOS />, value: 'macos' },
  { name: <Pterodactyl />, value: 'pterodactyl' },
  { name: <Command />, value: 'command' },
];

const Spigot = component$(() => (
  <span class="flex items-center gap-2">
    <SiSpigotmc class="fill-current" size={20} /> Spigot
  </span>
));

const Paper = component$(() => (
  <span class="flex items-center gap-2">
    <LogoPaper size={20} /> Paper
  </span>
));

const Purpur = component$(() => (
  <span class="flex items-center gap-2">
    <LogoPurpur size={20} /> Purpur
  </span>
));

const Velocity = component$(() => (
  <span class="flex items-center gap-2">
    <SiVelocity class="fill-current" size={20} /> Velocity
  </span>
));

const Waterfall = component$(() => (
  <span class="flex items-center gap-2">
    <LogoWaterfall size={20} /> Waterfall
  </span>
));

const Forge = component$(() => (
  <span class="flex items-center gap-2">
    <LogoForge size={20} /> Forge
  </span>
));

const Fabric = component$(() => (
  <span class="flex items-center gap-2">
    <LogoFabric size={20} /> Fabric
  </span>
));

const softwareOptionsFlags = [
  { name: <Paper />, value: 'paper' },
  { name: <Purpur />, value: 'purpur' },
  { name: <Velocity />, value: 'velocity' },
  { name: <Waterfall />, value: 'waterfall' },
];

export const softwareOptions = [
  ...softwareOptionsFlags,
  { name: <Spigot />, value: 'spigot' },
  { name: <Forge />, value: 'forge' },
  { name: <Fabric />, value: 'fabric' },
];

export const useCookies = routeLoader$(({ cookie, url }) => {
  const cookies: {
    cookies: any;
    errors: string[];
  } = getCookies(cookie, 'parsed', url.searchParams);
  return cookies;
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
      name: 'Benchmarked (G1GC)',
      value: 'benchmarkedG1GC',
    },
    {
      name: 'Benchmarked (ZGC, Java 25+)',
      value: 'benchmarkedZGC',
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
      description: t(
        'flags.gui.description@@Whether to display the built-in server management GUI.',
      ),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    variables: {
      icon: Code,
      label: t('flags.variables.label@@Use Variables'),
      description: t(
        'flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.',
      ),
      disable: [] as string[],
    },
    autoRestart: {
      icon: RefreshCw,
      label: t('flags.autoRestart.label@@Auto-restart'),
      description: t(
        'flags.autoRestart.description@@Whether to automatically restart after it is stopped.',
      ),
      disable: [] as string[],
    },
  };

  const extraFlagsOptions = {
    vectors: {
      icon: Box,
      label: t('flags.extraFlags.vectors.label@@Modern Vectors'),
      description: t(
        'flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.',
      ),
    },
    benchmarkedGraalVM: {
      icon: Box,
      label: t(
        'flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)',
      ),
      description: t(
        'flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.',
      ),
    },
    meowiceGraalVM: {
      icon: Box,
      label: t(
        'flags.extraFlags.meowiceGraalVM.label@@MeowIce\'s Flags (GraalVM)',
      ),
      description: t(
        'flags.extraFlags.meowiceGraalVM.description@@Additional performance flags for MeowIce\'s Flags exclusive to GraalVM users.',
      ),
    },
  };

  const cookies = useCookies().value;
  const flagsStore = useStore(
    {
      ...flagsDefaults,
      ...cookies,
    },
    { deep: true },
  );

  useTask$(({ track }) => {
    if (isBrowser) setCookies('parsed', flagsStore);
    deepTrack(track, flagsStore);
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Flag size={32} />
        {t('nav.resources.flags.title@@Flags Generator')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags',
        )}
      </p>

      <div class="my-6 flex flex-wrap justify-between gap-4 *:flex-1">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <label for="input">{t('flags.fileName.label@@File Name')}</label>
            <input
              class="lum-input"
              id="input"
              value={flagsStore.fileName}
              placeholder="server.jar"
              onChange$={(e, el) => {
                if (el.value.replace(/ /g, '') == '') return;
                if (!el.value.endsWith('.jar')) {
                  el.value += '.jar';
                }
                flagsStore.fileName = el.value;
              }}
            />
            <p class="text-lum-text-secondary text-sm">
              {t(
                'flags.fileName.description@@The name of the file that will be used to start your server.',
              )}
            </p>
          </div>
          <div class="flex gap-2">
            <div class="flex flex-col gap-1">
              <SelectMenu
                id="os"
                class={{ 'w-full': true }}
                onChange$={(e, el) => {
                  flagsStore.operatingSystem = el.value;
                }}
                values={environmentOptions}
                value={flagsStore.operatingSystem}
              >
                {t('flags.environment.label@@Environment')}
              </SelectMenu>
              <p class="text-lum-text-secondary text-sm">
                {t(
                  'flags.environment.description@@The operating system that the server runs on.',
                )}
              </p>
            </div>
            <div class="flex flex-col gap-1">
              <SelectMenu
                id="software"
                class={{ 'w-full': true }}
                onChange$={(e, el) => {
                  flagsStore.serverType = el.value;
                }}
                values={softwareOptionsFlags}
                value={flagsStore.serverType}
              >
                {t('flags.software.label@@Software')}
              </SelectMenu>
              <p class="text-lum-text-secondary text-sm">
                {t(
                  'flags.software.description@@The software in which your Minecraft server will run on.',
                )}
              </p>
            </div>
          </div>
          <div>
            <RangeInput
              id="memory"
              min={1}
              max={32}
              step={0.5}
              value={flagsStore.memory}
              onInput$={(e, el) => {
                flagsStore.memory = Number(el.value);
              }}
            >
              {t('flags.memory.label@@Memory')} ({flagsStore.memory} GiB)
            </RangeInput>
            <p class="text-lum-text-secondary mt-2 text-sm">
              {t(
                'flags.memory.description@@The amount of memory (RAM) to allocate to your server.',
              )}
            </p>
            <div class="mt-3 flex flex-col gap-1">
              <Toggle
                id="calcOverhead"
                checked={flagsStore.calcOverhead}
                onClick$={(e, el) => {
                  flagsStore.calcOverhead = el.checked;
                }}
              >
                <MemoryStick />
                {t('flags.memory.calcOverhead.title@@Calculate Overhead')}
              </Toggle>
              <p class="text-sm whitespace-pre-wrap">
                {t(
                  'flags.memory.calcOverhead.description@@This is recommended to avoid out-of-memory issues on your server.\nThe formula used is 11x ÷ 12 - 1200 where x is the amount of RAM.',
                )}
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex w-full flex-col gap-1">
            <div class="flex items-end gap-2">
              <SelectMenu
                id="flags"
                class={{ 'w-full': true }}
                onChange$={(e, el) => {
                  flagsStore.flags = el.value as AvailableFlags;
                }}
                values={flagOptions}
                value={flagsStore.flags}
              >
                {t('flags.flags.label@@Flags')}
              </SelectMenu>
              <SelectMenuRaw
                id="flagshelp"
                onChange$={(e, el) => {
                  flagsStore.flags = el.value as AvailableFlags;
                }}
                customDropdown
              >
                <CircleHelp size={24} q:slot="dropdown" />
                <a
                  class="lum-btn lum-bg-transparent rounded-lum-1"
                  q:slot="extra-buttons"
                  href="https://docs.papermc.io/paper/aikars-flags"
                  target="_blank"
                >
                  {t('flags.flags.aikars@@Aikar\'s Flags')}
                </a>
                <a
                  class="lum-btn lum-bg-transparent rounded-lum-1"
                  q:slot="extra-buttons"
                  href="https://github.com/MeowIce/meowice-flags"
                  target="_blank"
                >
                  {t('flags.flags.meowice@@MeowIce\'s Flags')}
                </a>
                <a
                  class="lum-btn lum-bg-transparent rounded-lum-1"
                  q:slot="extra-buttons"
                  href="https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks"
                  target="_blank"
                >
                  {t('flags.flags.benchmarked@@Benchmarked')}
                </a>
                <a
                  class="lum-btn lum-bg-transparent rounded-lum-1"
                  q:slot="extra-buttons"
                  href="https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md"
                  target="_blank"
                >
                  {t('flags.flags.hillttys@@hilltty\'s Flags')}
                </a>
                <a
                  class="lum-btn lum-bg-transparent rounded-lum-1"
                  q:slot="extra-buttons"
                  href="https://github.com/Obydux/Minecraft-GraalVM-Flags"
                  target="_blank"
                >
                  {t('flags.flags.obyduxs@@Obydux\'s Flags')}
                </a>
              </SelectMenuRaw>
            </div>
            <p class="text-lum-text-secondary text-sm">
              {t(
                'flags.description@@The collection of start arguments that typically optimize the server\'s performance',
              )}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <p>
              {t('flags.config.label@@Config')}
              <br />
              <span class="text-lum-text-secondary text-sm">
                {t(
                  'flags.config.description@@The various additions and modifications that can be made to your start script.',
                )}
              </span>
            </p>
            {(
              Object.entries(configOptions) as [
                keyof typeof configOptions,
                (typeof configOptions)[keyof typeof configOptions],
              ][]
            )
              .filter(([, option]) => {
                return (
                  !option.disable?.includes(flagsStore.operatingSystem) &&
                  !option.disable?.includes(flagsStore.serverType)
                );
              })
              .map(([id, option]) => (
                <div key={id} class="flex flex-col gap-1">
                  <Toggle
                    id={id}
                    checked={flagsStore[id]}
                    onClick$={(e, el) => {
                      flagsStore[id] = el.checked;
                    }}
                  >
                    <option.icon />
                    {option.label}
                  </Toggle>
                  {option.description && (
                    <p class="text-lum-text-secondary text-sm">
                      {option.description}
                    </p>
                  )}
                </div>
              ))}
            {(
              Object.entries(extraFlagsOptions) as [
                keyof typeof extraFlagsOptions,
                (typeof extraFlagsOptions)[keyof typeof extraFlagsOptions],
              ][]
            )
              .filter(([id]) => {
                return (
                  extFlags[id].supports.includes(flagsStore.flags) &&
                  srvType[flagsStore.serverType].extraFlags?.includes(id)
                );
              })
              .map(([id, option]) => (
                <>
                  <Toggle
                    key={id}
                    id={id}
                    checked={flagsStore.extraFlags.includes(id)}
                    onClick$={(e, el) => {
                      if (el.checked) flagsStore.extraFlags.push(id);
                      else
                        flagsStore.extraFlags.splice(
                          flagsStore.extraFlags.indexOf(id),
                          1,
                        );
                    }}
                  >
                    <option.icon />
                    {option.label}
                  </Toggle>
                  {option.description && (
                    <p class="text-lum-text-secondary text-sm">
                      {option.description}
                    </p>
                  )}
                </>
              ))}
          </div>
        </div>
      </div>

      <Output
        class="h-96 font-mono break-all"
        value={generateResult(flagsStore).script ?? ''}
      >
        <span q:slot="label" class="text-lum-text-secondary text-sm">
          {t(
            'flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!',
            { fileName: flagsStore.fileName },
          )}
        </span>
      </Output>
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Flags Generator - Birdflop',
  description:
    'A simple script generator to start your Minecraft servers with optimal flags. ' +
    defaultDescription,
});
