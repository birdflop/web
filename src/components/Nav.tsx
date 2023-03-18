import { component$, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

import { InDiscord, InGithub, InGlobe, InNavArrowDown, InMenu } from '@qwikest/icons/iconoir';
// @ts-ignore
import logoAVIF from '~/images/logo.png?avif';
// @ts-ignore
import logoWEBP from '~/images/logo.png?webp';
// @ts-ignore
import { src as logoPlaceholder } from '~/images/logo.png?metadata';
import { changeLocale, $translate as t, useSpeakContext, useSpeakConfig, SpeakLocale, Speak } from 'qwik-speak';

export default component$(() => {
  const ctx = useSpeakContext();
  const config = useSpeakConfig();

  const changeLocale$ = $(async (newLocale: SpeakLocale) => {
    await changeLocale(newLocale, ctx);

    document.cookie = `locale=${JSON.stringify(newLocale)};max-age=86400;path=/`;
  });

  return (
    <Speak assets={['app']}>
      <nav class="z-20 fixed top-0 w-screen py-2 bg-gray-900/70 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-4 lg:px-6">
          <div class="relative flex h-16 items-center justify-between">
            <div class="flex flex-1 items-center justify-start">
              <Link href="/" class="transition duration-200 ease-in-out text-gray-300 hover:bg-gray-800 hover:text-white drop-shadow-2xl px-3 pt-3 pb-2 rounded-lg text-lg flex items-center whitespace-nowrap">
                <picture>
                  <source srcSet={logoAVIF} type="image/avif" />
                  <source srcSet={logoWEBP} type="image/webp" />
                  <img
                    src={logoPlaceholder}
                    class="h-8"
                    height={32}
                    width={130}
                    alt="SimplyMC Logo"
                    loading="eager"
                    decoding="async"
                  />
                </picture>
              </Link>
            </div>
            <div class="flex flex-1 items-center justify-end">
              <div class="flex gap-2 text-gray-300 whitespace-nowrap">
                <button class="cursor-pointer transition duration-200 ease-in-out hidden sm:flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg items-center gap-4">
                  <div class="px-4 py-3 flex gap-2 items-center">
                    {t('nav.gradients@@Gradients')}
                    <InNavArrowDown class="transform group-hover:-rotate-180 transition duration-300 ease-in-out text-2xl" />
                  </div>
                  <div class="absolute top-0 right-0 z-10 hidden group-hover:flex pt-16">
                    <div class="bg-black rounded-xl px-3 py-4 flex flex-col space-y-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
                      <Link href="/Gradients" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.hexGradient@@Hex Gradients')}
                      </Link>
                      <Link href="/AnimTab" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.animatedTAB@@Animated TAB')}
                      </Link>
                      <Link href="/AnimPreview" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.tabAnimationPreviewer@@TAB Animation Previewer')}
                      </Link>
                    </div>
                  </div>
                </button>
                <button class="cursor-pointer transition duration-200 ease-in-out hidden sm:flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg items-center gap-4">
                  <div class="px-4 py-3 flex gap-2 items-center">
                    {t('nav.analysis@@Analysis')}
                    <InNavArrowDown class="transform group-hover:-rotate-180 transition duration-300 ease-in-out text-2xl" />
                  </div>
                  <div class="absolute top-0 left-0 z-10 hidden group-hover:flex pt-16">
                    <div class="bg-black rounded-xl px-3 py-4 flex flex-col space-y-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
                      <Link href="/SparkProfile" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.sparkProfile@@Spark Profile')}
                      </Link>
                      <Link href="/PaperTimings" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.paperTimings@@Paper Timings')}
                      </Link>
                    </div>
                  </div>
                </button>
                <button class="cursor-pointer transition duration-200 ease-in-out hidden xl:flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg items-center gap-4">
                  <div class="px-4 py-3 flex gap-2 items-center">
                    {t('nav.misc@@Misc')}
                    <InNavArrowDown class="transform group-hover:-rotate-180 transition duration-300 ease-in-out text-2xl" />
                  </div>
                  <div class="absolute top-0 left-0 z-10 hidden group-hover:flex pt-16">
                    <div class="bg-black rounded-xl px-3 py-4 flex flex-col space-y-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
                      <Link href="/AnimTexture" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.animatedTextures@@Animated Textures')}
                      </Link>
                      <Link href="/RamCalc" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.ramCalculator@@RAM Caolculator')}
                      </Link>
                      <Link href="/ColorStrip" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.colorCodeStripper@@Color Code Stripper')}
                      </Link>
                      <Link href="/PresetTools" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                        {t('nav.presetTools@@Preset Tools')}
                      </Link>
                    </div>
                  </div>
                </button>
                <Link href="/Privacy" class="transition duration-200 ease-in-out hidden hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg lg:flex items-center">
                  {t('nav.privacyPolicy@@Privacy Policy')}
                </Link>
                <button class="cursor-pointer transition duration-200 ease-in-out flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg text-3xl items-center gap-4">
                  <div class="px-4 py-3">
                    <InGlobe class="transform group-hover:rotate-180 transition duration-300 ease-in-out" />
                  </div>
                  <div class="absolute top-0 left-0 z-10 hidden group-hover:flex pt-16 text-base">
                    <div class="bg-black rounded-xl px-3 py-4 flex flex-col space-y-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
                      {config.supportedLocales.map(value => <>
                        <div onClick$={async () => await changeLocale$(value)} class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
                          {value.lang}
                        </div>
                      </>)}
                    </div>
                  </div>
                </button>
                <a href="https://github.com/AkiraDevelopment/SimplyMC" class="group transition duration-200 ease-in-out hidden hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg text-3xl xl:flex items-center">
                  <InGithub />
                </a>
                <a href="https://discord.simplymc.art/" class="group transition duration-200 ease-in-out hidden hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg text-3xl xl:flex items-center">
                  <InDiscord />
                </a>
                <button id="mobile-menu-button" onClick$={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')} class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg text-3xl xl:hidden">
                  <InMenu />
                </button>
              </div>
            </div>
          </div>

          <div id="mobile-menu" class="space-y-4 py-4 px-3 justify-center items-center bg-black rounded-lg mt-2 hidden">
            <Link href="/Gradients" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex sm:hidden items-center">
              {t('nav.hexGradient@@Hex Gradients')}
            </Link>
            <Link href="/AnimTab" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex sm:hidden items-center">
              {t('nav.animatedTAB@@Animated TAB')}
            </Link>
            <Link href="/AnimPreview" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex sm:hidden items-center">
              {t('nav.tabAnimationPreview@@TAB Animation Previewer')}
            </Link>
            <Link href="/SparkProfile" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex sm:hidden items-center">
              {t('nav.sparkProfile@@Spark Profile')}
            </Link>
            <Link href="/PaperTimings" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex sm:hidden items-center">
              {t('nav.paperTimings@@Paper Timings')}
            </Link>
            <Link href="/AnimTexture" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex lg:hidden items-center">
              {t('nav.animatedTextures@@Animated Textures')}
            </Link>
            <Link href="/RAMCalc" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex lg:hidden items-center">
              {t('nav.ramCalculator@@RAM Caolculator')}
            </Link>
            <Link href="/ColorStrip" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex lg:hidden items-center">
              {t('nav.colorCodeStripper@@Color Code Stripper')}
            </Link>
            <Link href="/Privacy" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex lg:hidden items-center">
              {t('nav.privacyPolicy@@Privacy Policy')}
            </Link>
            <a href="https://github.com/AkiraDevelopment/SimplyMC" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex xl:hidden items-center">
              GitHub
            </a>
            <a href="https://discord.simplymc.art/" class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex xl:hidden items-center">
              Discord
            </a>
          </div>
        </div>
      </nav>
    </Speak>
  );
});