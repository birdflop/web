// LuminescentDev Navbar Component Dec 11

import { component$, $, Slot, useStore } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

import { LogoDiscord, LogoGithub, GlobeOutline, ChevronDown, Menu, CafeOutline, CloseOutline, SquareOutline, RemoveOutline } from 'qwik-ionicons';

import Logo from '~/images/logo.png?jsx';

import type { SpeakLocale } from 'qwik-speak';
import { inlineTranslate, useSpeakConfig } from 'qwik-speak';

import { languages } from '~/speak-config';
import { version } from '~/../package.json';

import Luminescent from './icons/Birdflop';
import LoadingIcon from './icons/LoadingIcon';

// @ts-ignore
import { Window } from '@tauri-apps/api/window';
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import Birdflop from './icons/Birdflop';

export default component$(({ tauriVersion }: any) => {
  const t = inlineTranslate();
  const store = useStore({ mobilemenu: false });

  return (
    <Nav>
      <MainNav tauriVersion={tauriVersion} store={store}>
        <Dropdown name={t('nav.gradients@@Gradients')} extraClass={{ 'hidden sm:flex': true }}>
          <NavButton href="/gradients">
            {t('nav.hexGradient@@Hex Gradients')}
          </NavButton>
          <NavButton href="/animtab">
            {t('nav.animatedTAB@@Animated TAB')}
          </NavButton>
          <NavButton href="/animpreview">
            {t('nav.tabAnimationPreviewer@@TAB Animation Previewer')}
          </NavButton>
        </Dropdown>
        <Dropdown name={t('nav.analysis@@Analysis')} extraClass={{ 'hidden xl:flex': true }}>
          <NavButton href="/sparkprofile">
            {t('nav.sparkProfile@@Spark Profile')}
          </NavButton>
          <NavButton href="/papertimings">
            {t('nav.paperTimings@@Paper Timings')}
          </NavButton>
        </Dropdown>
        <NavButton href="/flags" extraClass={{ 'hidden md:flex': true }}>
          {t('nav.flags@@Flags')}
        </NavButton>
        <Dropdown name={t('nav.more@@More')} extraClass={{ 'hidden sm:flex': true }}>
          <NavButton href="/animtexture">
            {t('nav.animatedTextures@@Animated Textures')}
          </NavButton>
          <NavButton href="/colorstrip">
            {t('nav.colorCodeStripper@@Color Code Stripper')}
          </NavButton>
          <NavButton href="/presettools">
            {t('nav.presetTools@@Preset Tools')}
          </NavButton>
        </Dropdown>
        <NavButton href="/privacy" extraClass={{ 'hidden xl:flex': true }}>
          {t('nav.privacyPolicy@@Privacy Policy')}
        </NavButton>
        <NavButton type="div" onClick$={async () => {
          if (tauriVersion) {
            const perm = await isPermissionGranted();
            if (!perm) await requestPermission();
            try {
              sendNotification({
                title: 'SimplyMC',
                body: 'Hello Tauri!',
              });
            }
            catch (e) {
              console.error(e);
            }
          }
        }} extraClass={{ 'hidden lg:flex': true }}>
          v{version} {tauriVersion && `(${tauriVersion})`}
        </NavButton>
        <LangPicker tauriVersion={tauriVersion} />
        <NavButton type="external" icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub" extraClass={{ 'hidden lg:flex': true }}>
          <LogoGithub width="24" class="fill-green-100" />
        </NavButton>
        <NavButton type="external" icon href="https://discord.simplymc.art" title="Discord" extraClass={{ 'hidden lg:flex': true }}>
          <LogoDiscord width="24" class="fill-indigo-200" />
        </NavButton>
        <NavButton type="external" icon href="https://ko-fi.com/akiradev" title="Ko-fi" extraClass={{ 'hidden lg:flex': true }}>
          <CafeOutline width="24" class="fill-pink-200 text-pink-200" />
        </NavButton>
        {!tauriVersion &&
          <NavButton type="div" icon title="Menu" onClick$={() => { store.mobilemenu = !store.mobilemenu; }} extraClass={{ 'flex sm:hidden': true }}>
            <Menu width="24" class="fill-current" />
          </NavButton>
        }
        {tauriVersion && <>
          <NavButton type="div" icon title="Minimize" onClick$={() => {
            Window.getCurrent().minimize();
          }}>
            <RemoveOutline width="24" />
          </NavButton>
          <NavButton type="div" icon title="Maximize" onClick$={() => {
            Window.getCurrent().toggleMaximize();
          }}>
            <SquareOutline width="20" />
          </NavButton>
          <NavButton type="div" icon title="Close" onClick$={() => {
            Window.getCurrent().close();
          }}>
            <CloseOutline width="24" />
          </NavButton>
        </>}
      </MainNav>
      <MobileNav store={store}>
        <NavButton store={store} href="/gradients">
          {t('nav.hexGradient@@Hex Gradients')}
        </NavButton>
        <NavButton store={store} href="/animtab">
          {t('nav.animatedTAB@@Animated TAB')}
        </NavButton>
        <NavButton store={store} href="/animpreview">
          {t('nav.tabAnimationPreview@@TAB Animation Previewer')}
        </NavButton>
        <NavButton store={store} href="/sparkprofile">
          {t('nav.sparkProfile@@Spark Profile')}
        </NavButton>
        <NavButton store={store} href="/papertimings">
          {t('nav.paperTimings@@Paper Timings')}
        </NavButton>
        <NavButton store={store} href="/flags">
          {t('nav.flags@@Flags')}
        </NavButton>
        <NavButton store={store} href="/animtexture">
          {t('nav.animatedTextures@@Animated Textures')}
        </NavButton>
        <NavButton store={store} href="/colorstrip">
          {t('nav.colorCodeStripper@@Color Code Stripper')}
        </NavButton>
        <NavButton store={store} href="/privacy">
          {t('nav.privacyPolicy@@Privacy Policy')}
        </NavButton>
        <div class="flex justify-evenly">
          <NavButton type="external" icon href="https://github.com/LuminescentDev/SimplyMC" title="GitHub">
            <LogoGithub width="24" class="fill-green-100" />
          </NavButton>
          <NavButton type="external" icon href="https://discord.simplymc.art" title="Discord">
            <LogoDiscord width="24" class="fill-indigo-200" />
          </NavButton>
          <NavButton type="external" icon href="https://ko-fi.com/akiradev" title="Ko-fi">
            <CafeOutline width="24" class="fill-pink-200 text-pink-200" />
          </NavButton>
        </div>
      </MobileNav>
    </Nav>
  );
});

export const Nav = component$(() => {
  return (
    <nav class="z-20 fixed top-0 w-screen backdrop-blur-xl">
      <div class="transition-all">
        <Slot />
      </div>
    </nav>
  );
});

export const Brand = component$(() => {
  const location = useLocation();
  return (
    <div class="flex items-center justify-start">
      <Link href="/" class="transition ease-in-out text-gray-300 hover:bg-blue-700/20 hover:text-white drop-shadow-2xl px-3 pb-3 pt-3 rounded-lg text-lg flex tracking-wider items-center">
        <Birdflop width={32} />
        <span class="ml-3 font-mc">Birdflop</span>
        <div class={{
          'transition-all': true,
          '-ml-7 opacity-0': !location.isNavigating,
        }}>
          <LoadingIcon />
        </div>
      </Link>
    </div>
  );
});

export const MainNav = component$(({ tauriVersion, store }: any) => {
  return (
    <div class={{
      'bg-blue-700/20 py-2': true,
      'px-4 lg:px-6': !tauriVersion,
      'px-2': tauriVersion,
    }} data-tauri-drag-region>
      <div class={{
        'mx-auto relative flex items-center justify-between': true,
        'max-w-7xl': !tauriVersion,
      }}>
        {tauriVersion &&
          <NavButton type="div" icon title="Menu" onClick$={() => { store.mobilemenu = !store.mobilemenu; }} extraClass={{ 'flex sm:hidden': true }}>
            <Menu width="24" class="fill-current" />
          </NavButton>
        }
        <Brand />
        <div class="flex flex-1 items-center justify-end" data-tauri-drag-region>
          <div class="flex gap-1 text-gray-300 whitespace-nowrap">
            <Slot />
          </div>
        </div>
      </div>
    </div>
  );
});

export const MobileNav = component$(({ store }: any) => {
  return (
    <div id="mobile-menu" class={{
      'gap-2 px-3 flex flex-col sm:hidden transition-all duration-300 bg-blue-700/20 ': true,
      'opacity-100 max-h-screen pt-2 pb-8': store.mobilemenu,
      'opacity-0 max-h-0 py-0 pointer-events-none': !store.mobilemenu,
    }}>
      <Slot />
    </div>
  );
});

export const NavButton = component$(({ href, title, icon, type, extraClass, style, store, onClick$ }: any) => {
  const _class = {
    'group transition ease-in-out hover:bg-blue-700/20 hover:text-white py-3 rounded-lg items-center cursor-pointer': true,
    'text-3xl px-3': icon,
    'px-4 flex gap-3': !icon,
    ...extraClass,
  };

  return <>
    {type == 'external' &&
      <a href={href} title={title} style={style} class={_class}>
        <Slot />
      </a>
    }
    {type == 'div' &&
      <div title={title} style={style} class={_class} onClick$={onClick$}>
        <Slot />
      </div>
    }
    {!type &&
      <Link href={href} title={title} style={style} class={_class} onClick$={() => { store ? store.mobilemenu = false : undefined; }}>
        <Slot />
      </Link>
    }
  </>;
});

export const Dropdown = component$(({ name, extraClass }: any) => {
  return (
    <div class={{
      'cursor-pointer transition ease-in-out gap-3 hover:bg-blue-700/20 hover:text-white drop-shadow-2xl group rounded-lg items-center': true,
      ...extraClass,
    }}>
      <div class="px-4 py-2 flex gap-2 items-center">
        {name}
        <ChevronDown width="24" class="transform group-hover:-rotate-180 transition ease-in-out text-2xl" />
      </div>
      <div class="absolute top-8 left-0 z-10 hidden group-hover:flex pt-5 text-base">
        <div class="bg-gray-900 border border-gray-800 rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          <Slot />
        </div>
      </div>
    </div>
  );
});

export const LangPicker = component$(({ tauriVersion }: any) => {
  const config = useSpeakConfig();

  const changeLocale$ = $(async (newLocale: SpeakLocale) => {
    document.cookie = `locale=${JSON.stringify(newLocale)};max-age=86400;path=/`;
    location.reload();
  });

  return (
    <div class="cursor-pointer transition ease-in-out flex hover:bg-blue-700/20 hover:text-white drop-shadow-2xl group rounded-lg text-3xl items-center gap-4">
      <div class="p-3">
        <GlobeOutline width="24" class="transform group-hover:rotate-180 group-hover:text-white transition ease-in-out" />
      </div>
      <div class={{
        'absolute top-8 z-10 hidden group-hover:flex pt-5 text-base': true,
        '-right-20': tauriVersion,
        'right-0': !tauriVersion,
      }}>
        <div class="bg-gray-900 border border-gray-800 rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          {config.supportedLocales.map(value => (
            <NavButton type="div" key={value.lang} onClick$={async () => await changeLocale$(value)}>
              {languages[value.lang as keyof typeof languages]}
            </NavButton>
          ))}
        </div>
      </div>
    </div>
  );
});