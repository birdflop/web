import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { CafeOutline, CodeWorkingOutline, LogoApple, LogoTux, LogoWindows, RefreshCircleOutline, TerminalOutline, CubeOutline, CodeOutline, CheckmarkCircleOutline } from 'qwik-ionicons';

import { useTranslate, Speak, inlineTranslate as it, useSpeakContext } from 'qwik-speak';
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

const flagTypes = {
  'Aikars': 'Aikar\'s Flags',
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

  const store = useStore({
    step: 1,
    environment: '',
    software: '',
    gui: false,
    variables: false,
    autorestarts: false,
    filename: '',
    flags: 'aikars',
  }, { deep: true });

  return (
    <section class="flex mx-auto max-w-7xl px-6 min-h-[calc(100lvh-68px)]">
      <Speak assets={['flags']}>
        <div class="my-10 min-h-[60px]">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('flags.title@@Flags generator')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-6">
            {t('flags.subtitle@@A simple script generator to start your Minecraft servers with optimal flags.')}
          </h2>
          <div class="flex">
            <div class="flex-1">
              <button class="flex gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full" onClick$={() => {
                store.step = 1;
              }}>
                {store.environment == '' && <CubeOutline class="w-5 h-5" />}
                {store.environment == 'linux' && <LogoTux class="w-5 h-5" />}
                {store.environment == 'windows' && <LogoWindows class="w-5 h-5" />}
                {store.environment == 'macos' && <LogoApple class="w-5 h-5" />}
                {store.environment == 'pterodactyl' && <Pterodactyl extraClass="w-5 h-5" />}
                {store.environment == 'command' && <CafeOutline class="w-5 h-5" />}
                {t('flags.environment.label@@Environment')}
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.environment == ''} class="flex gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full" onClick$={() => {
                store.step = 2;
              }}>
                {store.software == '' && <TerminalOutline class="w-5 h-5" />}
                {store.software == 'paper' && <Paper extraClass="w-5 h-5" />}
                {store.software == 'purpur' && <Purpur extraClass="w-5 h-5" />}
                {store.software == 'forge' && <Forge extraClass="w-5 h-5" />}
                {store.software == 'fabric' && <Fabric extraClass="w-5 h-5" />}
                {store.software == 'velocity' && <Velocity extraClass="w-5 h-5" />}
                {store.software == 'waterfall' && <Waterfall extraClass="w-5 h-5" />}
                {t('flags.software.label@@Software')}
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.software == ''} class="flex gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full" onClick$={() => {
                store.step = 3;
              }}>
                <CodeOutline class="w-5 h-5" />
                {t('flags.config.label@@Configuration')}
              </button>
            </div>
            <div class="flex-1">
              <button disabled={store.software == ''} class="flex gap-3 fill-current py-2 px-3 hover:bg-gray-800 transition-all w-full" onClick$={() => {
                store.step = 4;
              }}>
                <CheckmarkCircleOutline class="w-5 h-5" />
                {t('flags.result@@Result')}
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
              : store.step == 2 ? 'linear-gradient(to right, rgb(185 28 28), rgb(194 65 12))'
                : store.step == 3 ? 'linear-gradient(to right, rgb(185 28 28), rgb(194 65 12), rgb(161 98 7))'
                  : store.step == 4 ? 'linear-gradient(to right, rgb(185 28 28), rgb(194 65 12), rgb(161 98 7), rgb(21 128 61))' : '',
          }} />
          {
            store.step == 1 &&
            <div>
              <h2 class="text-gray-300 text-base sm:text-xl mb-6">
                {t('flags.enviroments.description@@The operating system that the server runs on.')}
              </h2>
              <div class="flex flex-wrap gap-3 justify-center fill-current">
                <Card color="yellow" onClick$={() => {
                  store.environment = 'linux';
                  store.step = 2;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <LogoTux class="w-10 h-10" />
                      {t('flags.enviroment.linux.label@@Linux')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.environments.linux.description@@The most common operating system used for servers')}
                  </p>
                </Card>
                <Card color="blue" onClick$={() => {
                  store.environment = 'windows';
                  store.step = 2;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <LogoWindows class="w-10 h-10" />
                      {t('flags.environments.windows.label@@Windows')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.environments.windows.description@@The most common operating system used for home desktops')}
                  </p>
                </Card>
                <Card color="gray" onClick$={() => {
                  store.environment = 'macos';
                  store.step = 2;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <LogoApple class="w-10 h-10" />
                      {t('flags.environments.macos.label@@macOS')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.environments.macos.description@@Apple\'s operating system')}
                  </p>
                </Card>
                <Card color="orange" onClick$={() => {
                  store.environment = 'pterodactyl';
                  store.step = 2;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Pterodactyl extraClass="w-10 w-10" />
                      {t('flags.environments.pterodactyl.label@@Pterodactyl')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.environments.pterodactyl.description@@Web-based server management platform used by most hosts')}
                  </p>
                </Card>
                <Card color="red" onClick$={() => {
                  store.environment = 'command';
                  store.step = 2;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <CafeOutline class="w-10 h-10" />
                      {t('flags.environments.command.label@@Command')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.environments.command.description@@Only the java command required to start the server')}
                  </p>
                </Card>
              </div>
            </div>
          }
          {
            store.step == 2 &&
            <div>
              <h2 class="text-gray-300 text-base sm:text-xl mb-6">
                {t('flags.software.description@@The software in which your Minecraft server will run on.')}
              </h2>
              <div class="flex flex-wrap gap-3 justify-center fill-current">
                <Card color="gray" onClick$={() => {
                  store.software = 'paper';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Paper extraClass="w-10 h-10" />
                      {t('flags.serverType.paper.label@@Paper')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.paper.description@@Bukkit-based plugin loader')}
                  </p>
                </Card>
                <Card color="purple" onClick$={() => {
                  store.software = 'purpur';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Purpur extraClass="w-10 h-10" />
                      {t('flags.serverType.purpur.label@@Purpur')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.purpur.description@@Bukkit-based plugin loader but more')}
                  </p>
                </Card>
                <Card color="red" onClick$={() => {
                  store.software = 'forge';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Forge extraClass="w-10 h-10" />
                      {t('flags.serverType.forge.label@@Forge')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.forge.description@@Mod loader')}
                  </p>
                </Card>
                <Card color="orange" onClick$={() => {
                  store.software = 'fabric';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Fabric extraClass="w-10 h-10" />
                      {t('flags.serverType.fabric.label@@Fabric')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.fabric.description@@Better mod loader')}
                  </p>
                </Card>
                <Card color="yellow" onClick$={() => {
                  store.software = 'velocity';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Velocity extraClass="w-10 h-10" />
                      {t('flags.serverType.velocity.label@@Velocity')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.velocity.description@@Proxy with plugin loader')}
                  </p>
                </Card>
                <Card color="blue" onClick$={() => {
                  store.software = 'waterfall';
                  store.step = 3;
                }}>
                  <CardHeader>
                    <div class="flex flex-col items-center w-full gap-6 py-5">
                      <Waterfall extraClass="w-10 h-10" />
                      {t('flags.serverType.waterfall.label@@Waterfall')}
                    </div>
                  </CardHeader>
                  <p class="min-w-[16rem] text-center">
                    {t('flags.serverType.waterfall.description@@Deprecated proxy')}
                  </p>
                </Card>
              </div>
            </div>
          }
          {
            store.step == 3 &&
            <div>
              <h2 class="text-gray-300 text-base sm:text-xl mb-6">
                {t('flags.config.description@@The various additions and modifications that can be made to your start script.')}
              </h2>
              <div>
                <div class="flex flex-wrap gap-3 justify-center fill-current">
                  <Card color="gray">
                    <div>
                      <CardHeader>
                        <div class="flex flex-col items-center w-full gap-6 py-5">
                          <TerminalOutline class="w-10 h-10" />
                          {t('flags.gui.label@@Use GUI')}
                        </div>
                      </CardHeader>
                      <p class="min-w-[16rem] text-center mb-10">
                        {t('flags.gui.description@@Whether to display the built-in server management GUI.')}
                      </p>
                      <div class="absolute bottom-5 w-full -mx-8">
                        <Toggle checked={store.gui} nolabel center />
                      </div>
                    </div>
                  </Card>
                  <Card color="gray">
                    <CardHeader>
                      <div class="flex flex-col items-center w-full gap-6 py-5">
                        <CodeWorkingOutline class="w-10 h-10" />
                        {t('flags.variables.label@@Use Variables')}
                      </div>
                    </CardHeader>
                    <p class="min-w-[16rem] text-center mb-10">
                      {t('flags.variables.description@@Whether to use environment variables within the script to define memory, file name, and other commonly changed elements.')}
                    </p>
                    <div class="absolute bottom-5 w-full -mx-8">
                      <Toggle checked={store.variables} nolabel center />
                    </div>
                  </Card>
                  <Card color="gray">
                    <CardHeader>
                      <div class="flex flex-col items-center w-full gap-6 py-5">
                        <RefreshCircleOutline class="w-10 h-10" />
                        {t('flags.autoRestart.label@@Auto-restart')}
                      </div>
                    </CardHeader>
                    <p class="min-w-[16rem] text-center mb-10">
                      {t('flags.autoRestart.description@@Whether to automatically restart after it is stopped.')}
                    </p>
                    <div class="absolute bottom-5 w-full -mx-8">
                      <Toggle checked={store.autorestarts} nolabel center />
                    </div>
                  </Card>
                </div>
              </div>
              <div class="flex flex-wrap gap-3 justify-center fill-current">
                <TextInput id="input" value={store.filename} placeholder="server.jar" onInput$={(event: any) => { store.filename = event.target!.value; }}>
                  <CardHeader>
                    {t('flags.fileName.label@@File Name')}
                  </CardHeader>
                  {t('flags.fileName.description@@The name of the file that will be used to start your server.')}
                </TextInput>
                <SelectInput id="preset" label={it('flags.flags.label.colorPreset@@Color Preset', ctx)} onChange$={(event: any) => { store.flags = event.target!.value; }} >
                  <option value={'none'}>
                    None
                  </option>
                  {Object.keys(flagTypes).map((flag: string) => (
                    <option key={flag} value={flag}>
                      {flagTypes[flag as keyof typeof flagTypes] }
                    </option>
                  ))}
                </SelectInput>
                <input type="range" class="w-full" min="1" max="32" step="1" />
              </div>
            </div>
          }
          {
            store.step == 4 &&
            <div class="flex flex-wrap gap-3 justify-center fill-current">
              <div>
                <OutputField extraClass={'h-60'} id="Output">
                  <h1 class="font-bold text-xl sm:text-3xl mb-2">
                    {t('flags.script.label@@Script')}
                  </h1>
                  <span class="text-sm sm:text-base pb-4">
                    {t('flags.script.description@@The resulting script that can be used to start your server. Place this file in the same location as {{fileName}}, then execute it!')}
                  </span>
                </OutputField>
              </div>
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