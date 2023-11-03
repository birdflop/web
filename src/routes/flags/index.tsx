import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { CafeOutline, CodeWorkingOutline, LogoApple, LogoTux, LogoWindows, RefreshCircleOutline, TerminalOutline, CubeOutline, CodeOutline, CheckmarkCircleOutline, EllipseOutline, MenuOutline, ArrowForward } from 'qwik-ionicons';

import { useTranslate, Speak, inlineTranslate as it, useSpeakContext } from 'qwik-speak';
import { Button } from '~/components/elements/Button';
import Card, { CardHeader } from '~/components/elements/Card';
import OutputField from '~/components/elements/OutputField';
import SelectInput from '~/components/elements/SelectInput';
import TextInput from '~/components/elements/TextInput';
import Toggle from '~/components/elements/Toggle';
import Pterodactyl from '~/components/icons/Pterodactyl';
import Fabric from '~/components/icons/fabric';
import Forge from '~/components/icons/forge';
import Paper from '~/components/icons/paper';
import Purpur from '~/components/icons/purpur';
import Velocity from '~/components/icons/velocity';
import Waterfall from '~/components/icons/waterfall';
import { generateResult } from '~/components/util/flags/generateResult';

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

export default component$(() => {
  const t = useTranslate();
  const ctx = useSpeakContext();

  const environmentOptions = [
    {
      color: 'yellow',
      environment: 'linux',
      tabIcon: <LogoTux class="w-5 h-5" />,
      cardIcon: <LogoTux class="w-10 h-10" />,
      label: t('flags.environments.linux.label@@Linux'),
      description: t('flags.environments.linux.description@@The most common operating system used for servers'),
    },
    {
      color: 'blue',
      environment: 'windows',
      tabIcon: <LogoWindows class="w-5 h-5" />,
      cardIcon: <LogoWindows class="w-10 h-10" />,
      label: t('flags.environments.windows.label@@Windows'),
      description: t('flags.environments.windows.description@@The most common operating system used for home desktops'),
    },
    {
      color: 'gray',
      environment: 'macos',
      tabIcon: <LogoApple class="w-5 h-5" />,
      cardIcon: <LogoApple class="w-10 h-10" />,
      label: t('flags.environments.macos.label@@macOS'),
      description: t('flags.environments.macos.description@@Apple\'s operating system'),
    },
    {
      color: 'orange',
      environment: 'pterodactyl',
      tabIcon: <Pterodactyl extraClass="w-5 h-5" />,
      cardIcon: <Pterodactyl extraClass="w-10 h-10" />,
      label: t('flags.environments.pterodactyl.label@@Pterodactyl'),
      description: t('flags.environments.pterodactyl.description@@Web-based server management platform used by most hosts'),
    },
    {
      color: 'red',
      environment: 'command',
      tabIcon: <CafeOutline class="w-5 h-5" />,
      cardIcon: <CafeOutline class="w-10 h-10" />,
      label: t('flags.environments.command.label@@Command'),
      description: t('flags.environments.command.description@@Only the Java command required to start the server'),
    },
  ];

  const softwareOptions = [
    {
      color: 'gray',
      software: 'paper',
      tabIcon: <Paper extraClass="w-5 h-5" />,
      cardIcon: <Paper extraClass="w-10 h-10" />,
      label: t('flags.serverType.paper.label@@Paper'),
      description: t('flags.serverType.paper.description@@Bukkit-based plugin loader'),
    },
    {
      color: 'purple',
      software: 'purpur',
      tabIcon: <Purpur extraClass="w-5 h-5" />,
      cardIcon: <Purpur extraClass="w-10 h-10" />,
      label: t('flags.serverType.purpur.label@@Purpur'),
      description: t('flags.serverType.purpur.description@@Bukkit-based plugin loader but more'),
    },
    {
      color: 'red',
      software: 'forge',
      tabIcon: <Forge extraClass="w-5 h-5" />,
      cardIcon: <Forge extraClass="w-10 h-10" />,
      label: t('flags.serverType.forge.label@@Forge'),
      description: t('flags.serverType.forge.description@@Mod loader'),
    },
    {
      color: 'orange',
      software: 'fabric',
      tabIcon: <Fabric extraClass="w-5 h-5" />,
      cardIcon: <Fabric extraClass="w-10 h-10" />,
      label: t('flags.serverType.fabric.label@@Fabric'),
      description: t('flags.serverType.fabric.description@@Better mod loader'),
    },
    {
      color: 'yellow',
      software: 'velocity',
      tabIcon: <Velocity extraClass="w-5 h-5" />,
      cardIcon: <Velocity extraClass="w-10 h-10" />,
      label: t('flags.serverType.velocity.label@@Velocity'),
      description: t('flags.serverType.velocity.description@@Proxy with plugin loader'),
    },
    {
      color: 'blue',
      software: 'waterfall',
      tabIcon: <Waterfall extraClass="w-5 h-5" />,
      cardIcon: <Waterfall extraClass="w-10 h-10" />,
      label: t('flags.serverType.waterfall.label@@Waterfall'),
      description: t('flags.serverType.waterfall.description@@Deprecated proxy'),
    },
  ];

  const configOptions = [
    {
      color: 'gray',
      id: 'gui',
      cardIcon: <TerminalOutline class="w-10 h-10" />,
      label: t('flags.gui.label@@Use GUI'),
      description: t('flags.gui.description@@Whether to display the built-in server management GUI.'),
    },
    {
      color: 'gray',
      id: 'variables',
      cardIcon: <CodeWorkingOutline class="w-10 h-10" />,
      label: t('flags.variables.label@@Use Variables'),
      description: t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.'),
    },
    {
      color: 'gray',
      id: 'autorestarts',
      cardIcon: <RefreshCircleOutline class="w-10 h-10" />,
      label: t('flags.autoRestart.label@@Auto-restart'),
      description: t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.'),
    },
  ];

  const store = useStore({
    step: 1,
    parsed: {
      operatingSystem: '',
      serverType: '',
      gui: false,
      variables: false,
      autoRestart: false,
      extraFlags: [],
      fileName: '',
      flags: 'aikars',
      withResult: true,
      withFlags: false,
      memory: 0,
    },
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 min-h-[calc(100lvh-68px)]">
      <Speak assets={['flags']}>
        <div class="w-full my-10 min-h-[60px]">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('flags.title@@Flags generator')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-6">
            {t('flags.subtitle@@A simple script generator to start your Minecraft servers with optimal flags.')}
          </h2>
          <div class="flex">
            <div class="flex-1">
              <button class="flex items-center justify-center sm:justify-normal gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full" onClick$={() => {
                store.step = 1;
              }}>
                {environmentOptions.find(option => option.environment === store.parsed.operatingSystem)?.tabIcon
                  ?? <CubeOutline class="w-5 h-5" />}
                <span class="hidden sm:flex">
                  {t('flags.environment.label@@Environment')}
                </span>
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.parsed.operatingSystem == ''} class="flex items-center justify-center sm:justify-normal gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full disabled:opacity-50" onClick$={() => {
                store.step = 2;
              }}>
                {softwareOptions.find(option => option.software === store.parsed.serverType)?.tabIcon
                  ?? <TerminalOutline class="w-5 h-5" />}
                <span class="hidden sm:flex">
                  {t('flags.software.label@@Software')}
                </span>
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.parsed.serverType == ''} class="flex items-center justify-center sm:justify-normal gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full disabled:opacity-50" onClick$={() => {
                store.step = 3;
              }}>
                <CodeOutline class="w-5 h-5" />
                <span class="hidden sm:flex">
                  {t('flags.config.label@@Configuration')}
                </span>
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.parsed.fileName == ''} class="flex items-center justify-center sm:justify-normal gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full disabled:opacity-50" onClick$={() => {
                store.step = 4;
              }}>
                <CheckmarkCircleOutline class="w-5 h-5" />
                <span class="hidden sm:flex">
                  {t('flags.result.label@@Result')}
                </span>
              </button>
            </div>
          </div>
          <div class={{
            'h-0.5 bg-gray-700 w-full -mb-0.5': true,
          }} />
          <div class={{
            'h-0.5 mb-4 transition-all ease-in-out bg-gradient-to-r': true,
            'w-1/4': store.step == 1,
            'w-2/4': store.step == 2,
            'w-3/4': store.step == 3,
            'w-full': store.step == 4,
          }}
          style={{
            background: store.step == 1 ? 'linear-gradient(to right, rgb(185 28 28), rgb(185 28 28))'
              : store.step == 2 ? 'linear-gradient(to right, rgb(185 28 28), rgb(161 98 7))'
                : store.step == 3 ? 'linear-gradient(to right, rgb(185 28 28), rgb(161 98 7), rgb(21 128 61))'
                  : store.step == 4 ? 'linear-gradient(to right, rgb(185 28 28), rgb(161 98 7), rgb(21 128 61), rgb(29 78 216))' : '',
          }} />
          {
            store.step == 1 &&
            <div>
              <h1 class="flex sm:hidden text-xl font-bold">
                {t('flags.environment.label@@Environment')}
              </h1>
              <h2 class="text-gray-300 text-base sm:text-xl mb-6">
                {t('flags.enviroments.description@@The operating system that the server runs on.')}
              </h2>
              <div class="flex flex-wrap gap-3 justify-center fill-current">
                {environmentOptions.map((option, index) => (
                  <Card color={option.color} onClick$={() => {
                    store.parsed.operatingSystem = option.environment;
                    store.step = 2;
                  }} key={index}>
                    <CardHeader>
                      <div class="flex flex-col items-center w-full gap-6 py-5">
                        {option.cardIcon}
                        {option.label}
                      </div>
                    </CardHeader>
                    <p class="min-w-[16rem] text-center">
                      {option.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          }
          {
            store.step == 2 &&
            <div>
              <h1 class="flex sm:hidden text-xl font-bold">
                {t('flags.software.label@@Software')}
              </h1>
              <h2 class="text-gray-300 text-base sm:text-xl mb-6">
                {t('flags.software.description@@The software in which your Minecraft server will run on.')}
              </h2>
              <div class="flex flex-wrap gap-3 justify-center fill-current">
                {softwareOptions.map((option, index) => (
                  <Card color={option.color} onClick$={() => {
                    store.parsed.serverType = option.software;
                    store.step = 3;
                  }} key={index}>
                    <CardHeader>
                      <div class="flex flex-col items-center w-full gap-6 py-5">
                        {option.cardIcon}
                        {option.label}
                      </div>
                    </CardHeader>
                    <p class="min-w-[16rem] text-center">
                      {option.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          }
          {
            store.step == 3 &&
            <div>
              <h1 class="flex sm:hidden text-xl font-bold">
                {t('flags.config.label@@Configuration')}
              </h1>
              <div class="flex items-center mb-6">
                <h2 class="flex-1 text-gray-300 text-base sm:text-xl">
                  {t('flags.config.description@@The various additions and modifications that can be made to your start script.')}
                </h2>
                <Button small color="primary" disabled={store.parsed.fileName == ''} onClick$={() => {
                  store.step = 4;
                }}>
                  {t('flags.result@@Result')}
                  <ArrowForward class="w-5 h-5" />
                </Button>
              </div>
              <div>
                <div class="flex flex-wrap gap-3 justify-center fill-current">
                  <TextInput id="input" value={store.parsed.fileName} placeholder="server.jar" onInput$={(event: any) => { store.parsed.fileName = event.target!.value; }}>
                    <CardHeader>
                      {t('flags.fileName.label@@File Name')}
                    </CardHeader>
                    {t('flags.fileName.description@@The name of the file that will be used to start your server.')}
                  </TextInput>
                  <SelectInput id="preset" value={store.parsed.flags} label={it('flags.flags.label@@Flags', ctx)} onChange$={(event: any) => { store.parsed.flags = event.target!.value; }} >
                    {Object.keys(flagTypes).map((flag: string) => (
                      <option key={flag} value={flag}>
                        {flagTypes[flag as keyof typeof flagTypes] }
                      </option>
                    ))}
                  </SelectInput>
                  <input type="range" class="w-full" min="1" max="32" step="1" onChange$={(event: any) => { store.parsed.memory = event.target!.value; }} />
                </div>
                <div class="flex flex-wrap gap-3 justify-center fill-current">
                  {configOptions.map((option, index) => (
                    <Card color={option.color} key={index}>
                      <CardHeader>
                        <div class="flex flex-col items-center w-full gap-6 py-5">
                          {option.cardIcon}
                          {option.label}
                        </div>
                      </CardHeader>
                      <p class="min-w-[16rem] text-center mb-10">
                        {option.description}
                      </p>
                      <div class="absolute bottom-5 w-full -mx-8">
                        <Toggle checked={store[option.id as keyof typeof store]} nolabel center onClick$={(event: any) => {
                          (store as any)[option.id] = event.target!.checked;
                        }} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          }
          {
            store.step == 4 &&
              <div>
                <h1 class="flex sm:hidden text-xl font-bold">
                  {t('flags.result.label@@Result')}
                </h1>
                <OutputField extraClass={'h-60'} id="Output" value={generateResult(store.parsed).script}>
                  <h1 class="font-bold text-xl sm:text-3xl mb-2">
                    {t('flags.script.label@@Script')}
                  </h1>
                  <span class="text-sm sm:text-base pb-4">
                    {t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!')}
                  </span>
                </OutputField>
              </div>
          }
        </div>
      </Speak>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Flags generator',
  meta: [
    {
      name: 'description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags.',
    },
    {
      name: 'og:description',
      content: 'A simple script generator to start your Minecraft servers with optimal flags.',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};