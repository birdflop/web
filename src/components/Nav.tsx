import { component$, $, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

import { LogoDiscord, LogoGithub, GlobeOutline, ChevronDown, Menu, CafeOutline, CloseOutline, SquareOutline, RemoveOutline } from 'qwik-ionicons';
// @ts-ignore
import logoAVIF from '~/images/logo.png?format=avif';
// @ts-ignore
import logoWEBP from '~/images/logo.png?format=webp';
// @ts-ignore
import logo from '~/images/logo.png?metadata';
import type { SpeakLocale } from 'qwik-speak';
import { useSpeakContext } from 'qwik-speak';
import { $translate as t, $inlineTranslate as it, useSpeakConfig, Speak } from 'qwik-speak';

import { languages } from '~/speak-config';
import { version } from '~/../package.json';

import Luminescent from './icons/Luminescent';
import LoadingIcon from './icons/LoadingIcon';

import { appWindow } from '@tauri-apps/plugin-window';

export default component$(({ tauriVersion }: any) => {
  const ctx = useSpeakContext();

  return (
    <Nav tauriVersion={tauriVersion}>
      <Speak assets={['app']}>
        <MainNav>
          <Dropdown name={it('nav.gradients@@Gradients', ctx)} extraClass="hidden sm:flex gap-3">
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
          <Dropdown name={it('nav.analysis@@Analysis', ctx)} extraClass="hidden sm:flex gap-3">
            <NavButton href="/SparkProfile">
              {t('nav.sparkProfile@@Spark Profile')}
            </NavButton>
            <NavButton href="/PaperTimings">
              {t('nav.paperTimings@@Paper Timings')}
            </NavButton>
          </Dropdown>
          <Dropdown name={it('nav.misc@@Misc', ctx)} extraClass="hidden lg:flex gap-3">
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
          <NavButton href="/Privacy" extraClass="hidden xl:flex gap-3">
            {t('nav.privacyPolicy@@Privacy Policy')}
          </NavButton>
          <button class="group transition ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg items-center flex">
            v{version} {tauriVersion && `(${tauriVersion})`}
          </button>
          <LangPicker />
          <NavButton external icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub" extraClass="hidden xl:flex">
            <LogoGithub width="24" class="fill-green-100" />
          </NavButton>
          <NavButton external icon href="https://discord.simplymc.art" title="Discord" extraClass="hidden xl:flex">
            <LogoDiscord width="24" class="fill-indigo-200" />
          </NavButton>
          <NavButton external icon href="https://ko-fi.com/akiradev" title="Ko-fi" extraClass="hidden xl:flex">
            <CafeOutline width="24" class="fill-pink-200 text-pink-200" />
          </NavButton>
          <NavButton external icon href="https://luminescent.dev" title="Luminescent" extraClass="hidden xl:flex justify-center w-10 h-10">
            <div style={{ filter: 'drop-shadow(0 0 0 #DD6CFF)' }}>
              <div style={{ filter: 'drop-shadow(0 0 1rem #CB6CE6)' }} class="w-10 h-10">
                <Luminescent/>
              </div>
            </div>
          </NavButton>
          <button id="mobile-menu-button" type="button" title="Menu" onClick$={() => {
            const classList = document.getElementById('mobile-menu')?.classList;
            if (classList?.contains('hidden')) classList.replace('hidden', 'flex');
            else classList?.replace('flex', 'hidden');
          }} class="transition ease-in-out hover:bg-gray-800 hover:text-white p-2 rounded-lg text-3xl xl:hidden">
            <Menu width="24" />
          </button>
          { tauriVersion && <>
            <button title="Minimize" class="transition ease-in-out hover:bg-gray-800 hover:text-white p-1 rounded-lg text-3xl" onClick$={() => {
              appWindow.minimize();
            }}>
              <RemoveOutline width="24" />
            </button>
            <button title="Maximize" class="transition ease-in-out hover:bg-gray-800 hover:text-white p-2 rounded-lg text-3xl" onClick$={() => {
              appWindow.toggleMaximize();
            }}>
              <SquareOutline width="20" />
            </button>
            <button title="Close" class="transition ease-in-out hover:bg-gray-800 hover:text-white p-1 rounded-lg text-3xl" onClick$={() => {
              appWindow.close();
            }}>
              <CloseOutline width="24" />
            </button>
          </> }
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
          <div class="flex justify-evenly">
            <NavButton external mobile icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub" extraClass="flex xl:hidden">
              <LogoGithub width="24" class="fill-green-100" />
            </NavButton>
            <NavButton external mobile icon href="https://discord.simplymc.art" title="Discord" extraClass="flex xl:hidden">
              <LogoDiscord width="24" class="fill-indigo-200" />
            </NavButton>
            <NavButton external mobile icon href="https://ko-fi.com/akiradev" title="Ko-fi" extraClass="flex xl:hidden">
              <CafeOutline width="24" class="fill-pink-200 text-pink-200" />
            </NavButton>
            <NavButton external mobile icon href="https://luminescent.dev" title="Luminescent" extraClass="flex xl:hidden justify-center w-10 h-10">
              <div style={{ filter: 'drop-shadow(0 0 0 #DD6CFF)' }}>
                <div style={{ filter: 'drop-shadow(0 0 1rem #CB6CE6)' }} class="w-10 h-10">
                  <Luminescent/>
                </div>
              </div>
            </NavButton>
          </div>
        </MobileNav>
      </Speak>
    </Nav>
  );
});

export const Nav = component$(({ tauriVersion }: any) => {
  return (
    <nav class={{
      'z-20 fixed top-0 w-screen backdrop-blur-xl': true,
      'py-2 bg-gray-900/70': !tauriVersion,
      'bg-violet-900/20': tauriVersion,
    }}>
      <div class={{
        'mx-auto max-w-7xl px-4 lg:px-6': !tauriVersion,
        'px-3': tauriVersion,
      }}>
        <Slot />
      </div>
    </nav>
  );
});

export const Brand = component$(() => {
  const location = useLocation();
  return (
    <div class="flex items-center justify-start">
      <Link href="/" class="transition ease-in-out text-gray-300 hover:bg-gray-800 hover:text-white drop-shadow-2xl px-3 pt-3 pb-2 rounded-lg text-lg flex gap-2 items-center whitespace-nowrap">
        <picture>
          <source srcSet={logoAVIF} type="image/avif" />
          <source srcSet={logoWEBP} type="image/webp" />
          <img
            src={logo}
            class="h-8"
            height={32}
            width={130}
            alt="SimplyMC Logo"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div class={`${location.isNavigating ? '' : '-ml-10 opacity-0'} transition-all`}>
          <LoadingIcon/>
        </div>
      </Link>
    </div>
  );
});

export const MainNav = component$(() => {
  return (
    <div class="relative flex h-16 items-center justify-between" data-tauri-drag-region>
      <Brand/>
      <div class="flex flex-1 items-center justify-end" data-tauri-drag-region>
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

export const NavButton = component$(({ href, title, icon, external, extraClass, style }: any) => {
  return <>
    {external &&
      <a href={href} title={title} style={style} class={`group transition ease-in-out hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg items-center ${extraClass}`}>
        <Slot />
      </a>
    }
    {!external &&
      <Link href={href} onClick$={async () => { document.getElementById('mobile-menu')?.classList.replace('flex', 'hidden'); }} title={title} style={style} class={`group transition ease-in-out hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg items-center ${extraClass}`}>
        <Slot />
      </Link>
    }
  </>;
});

export const Dropdown = component$(({ name, extraClass }: any) => {
  return (
    <div class={`cursor-pointer transition ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg items-center gap-4`}>
      <div class="px-4 py-2 flex gap-2 items-center">
        {name}
        <ChevronDown width="24" class="transform group-hover:-rotate-180 transition ease-in-out text-2xl" />
      </div>
      <div class="absolute top-8 left-0 z-10 hidden group-hover:flex pt-4 text-base">
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
    <div class="cursor-pointer transition ease-in-out flex hover:bg-gray-800 hover:text-white drop-shadow-2xl group rounded-lg text-3xl items-center gap-4">
      <div class="p-2">
        <GlobeOutline width="24" class="transform group-hover:rotate-180 group-hover:text-white transition ease-in-out" />
      </div>
      <div class="absolute top-8 left-0 z-10 hidden group-hover:flex pt-4 text-base">
        <div class="bg-black rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          {config.supportedLocales.map(value => (
            <div key={value.lang} onClick$={async () => await changeLocale$(value)} class="transition ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg flex items-center">
              {languages[value.lang as keyof typeof languages]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});