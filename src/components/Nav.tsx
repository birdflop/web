import { $, Slot, component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { Button, ButtonAnchor, LoadingIcon, LogoBirdflop, LogoDiscord, Nav } from '@luminescent/ui';

import { ChevronDown, CubeOutline, GlobeOutline, LogoGithub, ServerOutline } from 'qwik-ionicons';

import type { SpeakLocale } from 'qwik-speak';
import { inlineTranslate, useSpeakConfig } from 'qwik-speak';

import { languages } from '~/speak-config';

export default component$(() => {
  const t = inlineTranslate();
  const location = useLocation();

  return (
    <Nav fixed>
      <Link q:slot="start" href="/">
        <Button color="transparent">
          <LogoBirdflop width={32} fillGradient={['#54daf4', '#545eb6']} />
          <span class="font-bold -ml-1">Birdflop</span>
          <div class={{
            'transition-all': true,
            '-ml-6 opacity-0': !location.isNavigating,
          }}>
            <LoadingIcon width={16} speed="0.4s" />
          </div>
        </Button>
      </Link>

      <Dropdown q:slot='end' name='Hosting' Icon={ServerOutline} extraClass={{ 'hidden sm:flex': true }}>
        <ButtonAnchor color="transparent" href="https://panel.birdflop.com/">
          Panel
        </ButtonAnchor>
        <ButtonAnchor color="transparent" href="https://client.birdflop.com/">
          Billing
        </ButtonAnchor>
        <Link href="/node-stats">
          <Button color="transparent" class={{ 'w-full': true }}>
            Node Stats
          </Button>
        </Link>
      </Dropdown>
      <Dropdown q:slot='end' name="Resources" Icon={CubeOutline} extraClass={{ 'hidden sm:flex': true }}>
        <Link href="/resources/rgb">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.hexGradient@@RGBirdflop')}
          </Button>
        </Link>
        <Link href="/resources/animtab">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.animatedTAB@@Animated TAB')}
          </Button>
        </Link>
        <Link href="/resources/sparkprofile">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.sparkProfile@@Spark Profile')}
          </Button>
        </Link>
        <Link href="/resources/flags">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.flags@@Flags')}
          </Button>
        </Link>
        <Link href="/resources">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.more@@More Resources')}
          </Button>
        </Link>
      </Dropdown>
      <LangPicker q:slot='end' extraClass={{ 'hidden': !location.url.pathname.includes('resources') }} />
      <div q:slot='end' class="hidden sm:flex gap-2">
        <SocialButtons />
      </div>

      <ButtonAnchor q:slot='mobile' color="transparent" href="https://panel.birdflop.com/">
        Panel
      </ButtonAnchor>
      <ButtonAnchor q:slot='mobile' color="transparent" href="https://client.birdflop.com/">
        Billing
      </ButtonAnchor>
      <Link q:slot='mobile' href="/node-stats">
        <Button color="transparent" class={{ 'w-full': true }}>
          Node Stats
        </Button>
      </Link>
      <Link q:slot='mobile' href="/resources/rgb">
        <Button color="transparent" class={{ 'w-full': true }}>
          {t('nav.hexGradient@@RGBirdflop')}
        </Button>
      </Link>
      <Link q:slot='mobile' href="/resources/animtab">
        <Button color="transparent" class={{ 'w-full': true }}>
          {t('nav.animatedTAB@@Animated TAB')}
        </Button>
      </Link>
      <Link q:slot='mobile' href="/resources/sparkprofile">
        <Button color="transparent" class={{ 'w-full': true }}>
          {t('nav.sparkProfile@@Spark Profile')}
        </Button>
      </Link>
      <Link q:slot='mobile' href="/resources/flags">
        <Button color="transparent" class={{ 'w-full': true }}>
          {t('nav.flags@@Flags')}
        </Button>
      </Link>
      <Link q:slot='mobile' href="/resources">
        <Button color="transparent" class={{ 'w-full': true }}>
          {t('nav.more@@More Resources')}
        </Button>
      </Link>
      <div q:slot='mobile' class="flex justify-evenly">
        <SocialButtons />
      </div>

    </Nav>
  );
});

export const Dropdown = component$(({ name, Icon, extraClass }: any) => {
  return (
    <div class={{
      'flex transition ease-in-out gap-3 hover:bg-blue-700/20 hover:text-white drop-shadow-2xl group rounded-lg items-center': true,
      ...extraClass,
    }}>
      <div class="px-4 py-2 flex gap-2.5 items-center">
        {Icon && <Icon width="24" />}
        {name}
        <ChevronDown width="16" class="transform group-hover:-rotate-180 transition ease-in-out" />
      </div>
      <div class="absolute top-8 z-10 hidden group-hover:flex pt-8 text-base">
        <div class="bg-gray-900 border border-gray-800 rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          <Slot />
        </div>
      </div>
    </div>
  );
});

export const LangPicker = component$(({ extraClass }: any) => {
  const config = useSpeakConfig();

  const changeLocale$ = $(async (newLocale: SpeakLocale) => {
    document.cookie = `locale=${JSON.stringify(newLocale)};max-age=86400;path=/`;
    location.reload();
  });

  return (
    <div class={{
      'cursor-pointer transition ease-in-out flex hover:bg-blue-700/20 hover:text-white drop-shadow-2xl group rounded-lg text-3xl items-center gap-4': true,
      ...extraClass,
    }}>
      <div class="p-3">
        <GlobeOutline width="24" class="transform group-hover:rotate-180 group-hover:text-white transition ease-in-out" />
      </div>
      <div class={'absolute top-8 z-10 hidden group-hover:flex pt-5 text-base right-0'}>
        <div class="bg-gray-900 border border-gray-800 rounded-xl px-3 py-4 flex flex-col gap-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          {config.supportedLocales.map(value => (
            <Button color="transparent" key={value.lang} onClick$={async () => await changeLocale$(value)}>
              {languages[value.lang as keyof typeof languages]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

export const SocialButtons = component$(() => {
  return <>
    <ButtonAnchor color="transparent" square href="https://github.com/birdflop/web" title="GitHub">
      <LogoGithub width="24" />
    </ButtonAnchor>
    <ButtonAnchor color="transparent" square href="https://discord.gg/nmgtX5z" title="Discord">
      <LogoDiscord width="24" />
    </ButtonAnchor>
  </>;
});