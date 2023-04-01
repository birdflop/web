import { component$, $, Slot } from '@builder.io/qwik';
import { Link, useNavigate } from '@builder.io/qwik-city';

import { InDiscord, InGithub, InGlobe, InNavArrowDown, InMenu, InCoffeeCup } from '@qwikest/icons/iconoir';
// @ts-ignore
import logoAVIF from '~/images/logo.png?avif';
// @ts-ignore
import logoWEBP from '~/images/logo.png?webp';
// @ts-ignore
import { src as logoPlaceholder } from '~/images/logo.png?metadata';
import { $translate as t, useSpeakConfig, SpeakLocale, Speak } from 'qwik-speak';

import { languages } from '~/speak-config';
import { version } from '~/../package.json';

export default component$(() => {
  return (
    <Nav>
      <Speak assets={['app']}>
        <MainNav>
          <Dropdown name={t('nav.gradients@@Gradients')} extraClass="hidden sm:flex">
            <NavButton href="/Gradients">
              {t('nav.hexGradient@@Hex Gradients')}
            </NavButton>
            <NavButton href="/AnimTab">
              {t('nav.animatedTAB@@Animated TAB')}
            </NavButton>
            <NavButton href="/AnimPreview">
              {t('nav.tabAnimationPreviewer@@TAB Animation Previewer')}
            </NavButton>
          </Dropdown>
          <Dropdown name={t('nav.analysis@@Analysis')} extraClass="hidden sm:flex">
            <NavButton href="/SparkProfile">
              {t('nav.sparkProfile@@Spark Profile')}
            </NavButton>
            <NavButton href="/PaperTimings">
              {t('nav.paperTimings@@Paper Timings')}
            </NavButton>
          </Dropdown>
          <Dropdown name={t('nav.misc@@Misc')} extraClass="hidden lg:flex">
            <NavButton href="/AnimTexture">
              {t('nav.animatedTextures@@Animated Textures')}
            </NavButton>
            <NavButton href="/RamCalc">
              {t('nav.ramCalculator@@RAM Calculator')}
            </NavButton>
            <NavButton href="/ColorStrip">
              {t('nav.colorCodeStripper@@Color Code Stripper')}
            </NavButton>
            <NavButton href="/PresetTools">
              {t('nav.presetTools@@Preset Tools')}
            </NavButton>
          </Dropdown>
          <NavButton href="/Privacy" extraClass="hidden xl:flex">
            {t('nav.privacyPolicy@@Privacy Policy')}
          </NavButton>
          <NavButton href="/">
            v{version}
          </NavButton>
          <LangPicker />
          <NavButton external icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub" extraClass="hidden xl:flex">
            <InGithub />
          </NavButton>
          <NavButton external icon href="https://discord.simplymc.art" title="Discord" extraClass="hidden xl:flex">
            <InDiscord />
          </NavButton>
          <NavButton external icon href="https://ko-fi.com/akiradev" title="Ko-fi" extraClass="hidden xl:flex">
            <InCoffeeCup />
          </NavButton>
          <button id="mobile-menu-button" type="button" title="Menu" onClick$={() => {
            const classList = document.getElementById('mobile-menu')?.classList;
            if (classList?.contains('hidden')) classList.replace('hidden', 'flex');
            else classList?.replace('flex', 'hidden');
          }} class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg text-3xl xl:hidden">
            <InMenu />
          </button>
        </MainNav>
        <MobileNav>
          <NavButton mobile href="/Gradients" extraClass="flex sm:hidden">
            {t('nav.hexGradient@@Hex Gradients')}
          </NavButton>
          <NavButton mobile href="/AnimTab" extraClass="flex sm:hidden">
            {t('nav.animatedTAB@@Animated TAB')}
          </NavButton>
          <NavButton mobile href="/AnimPreview" extraClass="flex sm:hidden">
            {t('nav.tabAnimationPreview@@TAB Animation Previewer')}
          </NavButton>
          <NavButton mobile href="/SparkProfile" extraClass="flex sm:hidden">
            {t('nav.sparkProfile@@Spark Profile')}
          </NavButton>
          <NavButton mobile href="/PaperTimings" extraClass="flex sm:hidden">
            {t('nav.paperTimings@@Paper Timings')}
          </NavButton>
          <NavButton mobile href="/AnimTexture" extraClass="flex lg:hidden">
            {t('nav.animatedTextures@@Animated Textures')}
          </NavButton>
          <NavButton mobile href="/RamCalc" extraClass="flex lg:hidden">
            {t('nav.ramCalculator@@RAM Caolculator')}
          </NavButton>
          <NavButton mobile href="/ColorStrip" extraClass="flex lg:hidden">
            {t('nav.colorCodeStripper@@Color Code Stripper')}
          </NavButton>
          <NavButton mobile href="/Privacy" extraClass="flex xl:hidden">
            {t('nav.privacyPolicy@@Privacy Policy')}
          </NavButton>
          <div class="flex flex-row">
            <NavButton external mobile icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub" extraClass="flex xl:hidden">
              <InGithub />
            </NavButton>
            <NavButton external mobile icon href="https://discord.simplymc.art" title="Discord" extraClass="flex xl:hidden">
              <InDiscord />
            </NavButton>
            <NavButton external mobile icon href="https://ko-fi.com/akiradev" title="Ko-fi" extraClass="flex xl:hidden">
              <InCoffeeCup />
            </NavButton>
          </div>
        </MobileNav>
      </Speak>
    </Nav>
  );
});

export const Nav = component$(() => {
  return (
    <nav class="z-20 fixed top-0 w-screen py-2 bg-gray-900/70 backdrop-blur-xl">
      <div class="mx-auto max-w-7xl px-4 lg:px-6">
        <Slot />
      </div>
    </nav>
  );
});

export const Brand = component$(() => {
  return (
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
  );
});

export const MainNav = component$(() => {
  return (
    <div class="relative flex h-16 items-center justify-between">
      <Brand/>
      <div class="flex flex-1 items-center justify-end">
        <div class="flex gap-2 text-gray-300 whitespace-nowrap">
          <Slot/>
        </div>
      </div>
    </div>
  );
});

export const MobileNav = component$(() => {
  return (
    <div id="mobile-menu" class="gap-4 py-4 px-3 bg-black rounded-lg mt-2 hidden flex-col xl:hidden">
      <Slot />
    </div>
  );
});

export const NavButton = component$(({ href, title, icon, external, extraClass }: any) => {
  const nav = useNavigate();
  return <>
    {external &&
      <a href={href} title={title} class={`group transition duration-200 ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg ${icon ? 'text-3xl' : ''} items-center`}>
        <Slot />
      </a>
    }
    {!external &&
      <button onClick$={() => { document.getElementById('mobile-menu')?.classList.replace('flex', 'hidden'); nav(href); }} title={title} class={`group transition duration-200 ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg ${icon ? 'text-3xl' : ''} items-center`}>
        <Slot />
      </button>
    }
  </>;
});

export const Dropdown = component$(({ name, extraClass }: any) => {
  return (
    <div class={`cursor-pointer transition duration-200 ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg items-center gap-4`}>
      <div class="px-4 py-3 flex gap-2 items-center">
        {name}
        <InNavArrowDown class="transform group-hover:-rotate-180 transition duration-300 ease-in-out text-2xl" />
      </div>
      <div class="absolute top-12 left-0 z-10 hidden group-hover:flex pt-4 text-base">
        <div class="bg-black rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          <Slot/>
        </div>
      </div>
    </div>
  );
});

export const LangPicker = component$(() => {
  const config = useSpeakConfig();

  const changeLocale$ = $(async (newLocale: SpeakLocale) => {
    document.cookie = `locale=${JSON.stringify(newLocale)};max-age=86400;path=/`;
    location.reload();
  });

  return (
    <div class="cursor-pointer transition duration-200 ease-in-out flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg text-3xl items-center gap-4">
      <div class="px-4 py-3">
        <InGlobe class="transform group-hover:rotate-180 group-hover:text-white transition duration-300 ease-in-out" />
      </div>
      <div class="absolute top-12 left-0 z-10 hidden group-hover:flex pt-4 text-base">
        <div class="bg-black rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          {config.supportedLocales.map(value => (
            <div key={value.lang} onClick$={async () => await changeLocale$(value)} class="transition duration-200 ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
              {languages[value.lang as keyof typeof languages]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});