import { component$, useStore, useTask$, isBrowser } from '@qwik.dev/core';
import { routeLoader$ } from '@qwik.dev/router';
import { Toggle, SelectMenu, RangeInput, Label } from '@luminescent/ui-qwik';
import {
  Paper as LogoPaper,
  Purpur as LogoPurpur,
  Waterfall as LogoWaterfall,
  Forge as LogoForge,
  Fabric as LogoFabric,
} from '@luminescent/icons-qwik';

import { inlineTranslate } from 'qwik-speak';
import { getCookies, setCookies } from '~/util/dataUtils';
import { flagsDefaults, generateResult } from '~/util/flags/generateResult';
import type { AvailableFlags } from '~/util/flags/flags';
import { extraFlags as extFlags } from '~/util/flags/flags';
import { serverType as srvType } from '~/util/flags/environment/serverType';
import Box from 'lucide-icons-qwik/icons/Box';
import Code from 'lucide-icons-qwik/icons/Code';
import CircleHelp from 'lucide-icons-qwik/icons/CircleHelp';
import RefreshCw from 'lucide-icons-qwik/icons/RefreshCw';
import SquareTerminal from 'lucide-icons-qwik/icons/SquareTerminal';
import Flag from 'lucide-icons-qwik/icons/Flag';
import MemoryStick from 'lucide-icons-qwik/icons/MemoryStick';
import Computer from 'lucide-icons-qwik/icons/Computer';
import Terminal from 'lucide-icons-qwik/icons/Terminal';
import { defaultDescription, generateHead } from '~/root';
import SiApple from 'simple-icons-qwik/icons/SiApple';
import SiLinux from 'simple-icons-qwik/icons/SiLinux';
import SiPterodactyl from 'simple-icons-qwik/icons/SiPterodactyl';
import SiSpigotmc from 'simple-icons-qwik/icons/SiSpigotmc';
import SiVelocity from 'simple-icons-qwik/icons/SiVelocity';
import { deepTrack } from '~/util/track';
import Output from '~/components/Elements/Output';
import PencilLine from 'lucide-icons-qwik/icons/PencilLine';
import HardDrive from 'lucide-icons-qwik/icons/HardDrive';

export const environmentOptions = {
  linux: { name: 'Linux', icon: SiLinux },
  windows: { name: 'Windows', icon: Computer },
  macos: { name: 'MacOS', icon: SiApple },
  pterodactyl: { name: 'Pterodactyl', icon: SiPterodactyl },
  command: { name: 'Command', icon: Terminal },
};

export const softwareOptionsFlags = {
  paper: { name: 'Paper', icon: LogoPaper },
  purpur: { name: 'Purpur', icon: LogoPurpur },
  velocity: { name: 'Velocity', icon: SiVelocity },
  waterfall: { name: 'Waterfall', icon: LogoWaterfall },
};

export const softwareOptions = {
  ...softwareOptionsFlags,
  spigot: { name: 'Spigot', icon: SiSpigotmc },
  forge: { name: 'Forge', icon: LogoForge },
  fabric: { name: 'Fabric', icon: LogoFabric },
};

const flagOptions = [
  {
    translatedName: 'flags.flags.none@@None',
    value: 'none',
  },
  {
    name: "Aikar's Flags",
    value: 'aikars',
    help: 'https://docs.papermc.io/paper/aikars-flags',
  },
  {
    name: "MeowIce's Flags",
    value: 'meowice',
    help: 'https://github.com/MeowIce/meowice-flags',
  },
  {
    name: 'Benchmarked (G1GC)',
    value: 'benchmarkedG1GC',
    help: 'https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks',
  },
  {
    name: 'Benchmarked (ZGC, Java 25+)',
    value: 'benchmarkedZGC',
    help: 'https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks',
  },
  {
    name: "hilltty's Flags",
    value: 'hillttys',
    help: 'https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md',
  },
  {
    name: "Obydux's Flags",
    value: 'obyduxs',
    help: 'https://github.com/Obydux/Minecraft-GraalVM-Flags',
  },
  {
    name: "Etil's Flags",
    value: 'etils',
    help: 'https://github.com/etil2jz/etil-minecraft-flags',
  },
];

export const useCookies = routeLoader$(({ cookie, url }) => {
  const cookies = getCookies(cookie, 'parsed', url.searchParams);
  return cookies;
});

export default component$(() => {
  const t = inlineTranslate();

  const configOptions = {
    gui: {
      icon: SquareTerminal,
      label: t('flags.gui.label@@No GUI'),
      description: t(
        'flags.gui.description@@Whether to display the built-in server management GUI.'
      ),
      disable: ['pterodactyl', 'velocity', 'waterfall'],
    },
    variables: {
      icon: Code,
      label: t('flags.variables.label@@Use Variables'),
      description: t(
        'flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'
      ),
      disable: [] as string[],
    },
    autoRestart: {
      icon: RefreshCw,
      label: t('flags.autoRestart.label@@Auto-restart'),
      description: t(
        'flags.autoRestart.description@@Whether to automatically restart after it is stopped.'
      ),
      disable: [] as string[],
    },
  };

  const extraFlagsOptions = {
    vectors: {
      icon: Box,
      label: t('flags.extraFlags.vectors.label@@Modern Vectors'),
      description: t(
        'flags.extraFlags.vectors.description@@Enables SIMD operations to optimize map item rendering on Pufferfish and its forks.'
      ),
    },
    benchmarkedGraalVM: {
      icon: Box,
      label: t(
        'flags.extraFlags.benchmarkedGraalVM.label@@Benchmarked (GraalVM)'
      ),
      description: t(
        'flags.extraFlags.benchmarkedGraalVM.description@@Additional performance flags for Benchmarked (G1GC) exclusive to GraalVM users.'
      ),
    },
    meowiceGraalVM: {
      icon: Box,
      label: t(
        "flags.extraFlags.meowiceGraalVM.label@@MeowIce's Flags (GraalVM)"
      ),
      description: t(
        "flags.extraFlags.meowiceGraalVM.description@@Additional performance flags for MeowIce's Flags exclusive to GraalVM users."
      ),
    },
  };

  const cookies = useCookies().value;
  const flagsStore = useStore(
    {
      ...flagsDefaults,
      ...cookies,
    },
    { deep: true }
  );

  useTask$(({ track }) => {
    if (isBrowser) setCookies('parsed', flagsStore);
    deepTrack(track, flagsStore);
  });
  const CurrentSoftware = softwareOptions[flagsStore.serverType];
  const CurrentEnvironment = environmentOptions[flagsStore.operatingSystem];

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Flag size={32} />
        {t('nav.resources.flags.title@@Flags Generator')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.flags.description@@A simple script generator to start your Minecraft servers with optimal flags'
        )}
      </p>

      <div class="my-6 flex flex-wrap justify-between gap-4 *:flex-1">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <Label for="file-name" label={t('flags.fileName.label@@File Name')}>
              <PencilLine size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="file-name"
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
            </Label>
            <p class="text-lum-text-secondary text-sm">
              {t(
                'flags.fileName.description@@The name of the file that will be used to start your server.'
              )}
            </p>
          </div>
          <div class="flex gap-2">
            <div class="flex flex-col gap-1">
              <Label for="os" label={t('flags.environment.label@@Environment')}>
                <HardDrive size={16} q:slot="before-label" />
                <SelectMenu
                  id="os"
                  class="flex w-full items-center"
                  onChange$={(e, el) => {
                    flagsStore.operatingSystem =
                      el.value as typeof flagsStore.operatingSystem;
                  }}
                  values={Object.entries(environmentOptions).map(
                    ([key, option]) => ({
                      name: option.name,
                      value: key,
                    })
                  )}
                  value={flagsStore.operatingSystem}
                >
                  {Object.entries(environmentOptions).map(([key, Option]) => (
                    <Option.icon key={key} size={20} q:slot={`before-${key}`} />
                  ))}
                  <CurrentEnvironment.icon size={20} q:slot="dropdown-before" />
                </SelectMenu>
              </Label>
              <p class="text-lum-text-secondary text-sm">
                {t(
                  'flags.environment.description@@The operating system that the server runs on.'
                )}
              </p>
            </div>
            <div class="flex flex-col gap-1">
              <Label for="software" label={t('flags.software.label@@Software')}>
                <Box size={16} q:slot="before-label" />
                <SelectMenu
                  id="software"
                  class="w-full"
                  onChange$={(e, el) => {
                    flagsStore.serverType =
                      el.value as typeof flagsStore.serverType;
                  }}
                  values={Object.entries(softwareOptions).map(
                    ([key, option]) => ({
                      name: option.name,
                      value: key,
                    })
                  )}
                  value={flagsStore.serverType}
                >
                  {Object.entries(softwareOptions).map(([key, Option]) => (
                    <Option.icon key={key} size={20} q:slot={`before-${key}`} />
                  ))}
                  <CurrentSoftware.icon size={20} q:slot="dropdown-before" />
                </SelectMenu>
              </Label>
              <p class="text-lum-text-secondary text-sm">
                {t(
                  'flags.software.description@@The software in which your Minecraft server will run on.'
                )}
              </p>
            </div>
          </div>
          <div>
            <Label
              for="memory"
              label={`${t('flags.memory.label@@Memory')} (${flagsStore.memory} GiB)`}
            >
              <MemoryStick size={16} q:slot="before-label" />
              <RangeInput
                id="memory"
                min={1}
                max={32}
                step={0.5}
                value={flagsStore.memory}
                onInput$={(e, el) => {
                  flagsStore.memory = Number(el.value);
                }}
              />
            </Label>
            <p class="text-lum-text-secondary mt-2 text-sm">
              {t(
                'flags.memory.description@@The amount of memory (RAM) to allocate to your server.'
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
                  'flags.memory.calcOverhead.description@@This is recommended to avoid out-of-memory issues on your server.\nThe formula used is 11x ÷ 12 - 1200 where x is the amount of RAM.'
                )}
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex w-full flex-col gap-1">
            <div class="flex items-end gap-2">
              <Label for="flags" label={t('flags.flags.label@@Flags')}>
                <Flag size={16} q:slot="before-label" />
                <SelectMenu
                  id="flags"
                  class="w-full"
                  onChange$={(e, el) =>
                    (flagsStore.flags = el.value as AvailableFlags)
                  }
                  values={flagOptions.map((option) => ({
                    name: option.name ?? t(option.translatedName),
                    value: option.value,
                  }))}
                  value={flagsStore.flags}
                />
              </Label>
              <SelectMenu
                id="flagshelp"
                onChange$={(e, el) =>
                  (flagsStore.flags = el.value as AvailableFlags)
                }
                customDropdown
              >
                <CircleHelp size={24} q:slot="dropdown" />
                {flagOptions.map((option) => {
                  if (!option.help) return null;
                  return (
                    <a
                      key={option.value}
                      class="lum-btn lum-bg-transparent rounded-lum-1"
                      q:slot="extra-content"
                      href={option.help}
                      target="_blank"
                    >
                      {option.name}
                    </a>
                  );
                })}
              </SelectMenu>
            </div>
            <p class="text-lum-text-secondary text-sm">
              {t(
                "flags.description@@The collection of start arguments that typically optimize the server's performance"
              )}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <p>
              {t('flags.config.label@@Config')}
              <br />
              <span class="text-lum-text-secondary text-sm">
                {t(
                  'flags.config.description@@The various additions and modifications that can be made to your start script.'
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
                          1
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
            { fileName: flagsStore.fileName }
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
