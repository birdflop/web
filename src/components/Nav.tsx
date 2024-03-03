import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { Button, ButtonAnchor, LoadingIcon, LogoBirdflop, LogoDiscord, Nav, DropdownRaw } from '@luminescent/ui';

import { CubeOutline, GlobeOutline, LogoGithub, ServerOutline } from 'qwik-ionicons';

import { inlineTranslate, useSpeakConfig } from 'qwik-speak';

import { languages } from '~/speak-config';

export default component$(() => {
  const config = useSpeakConfig();
  const t = inlineTranslate();
  const loc = useLocation();

  return (
    <Nav fixed floating>
      <Link q:slot="start" href="/">
        <Button color="transparent">
          <LogoBirdflop width={32} fillGradient={['#54daf4', '#545eb6']} />
          <span class="font-bold -ml-1">Birdflop</span>
          <div class={{
            'transition-all': true,
            '-ml-6 opacity-0': !loc.isNavigating,
          }}>
            <LoadingIcon width={16} speed="0.4s" />
          </div>
        </Button>
      </Link>

      <DropdownRaw id="nav-hosting" q:slot='end' size="md" color="transparent"
        display={<div class="flex items-center gap-3"><ServerOutline width={24} />Hosting</div>}
        class={{ 'hidden sm:flex': true }}>
        <ButtonAnchor q:slot="extra-buttons" color="transparent" href="https://panel.birdflop.com/">
          Panel
        </ButtonAnchor>
        <ButtonAnchor q:slot="extra-buttons" color="transparent" href="https://client.birdflop.com/">
          Billing
        </ButtonAnchor>
        <Link q:slot="extra-buttons" href="/node-stats">
          <Button color="transparent" class={{ 'w-full': true }}>
            Node Stats
          </Button>
        </Link>
      </DropdownRaw>
      <DropdownRaw id="nav-resources" q:slot='end' size="md" color="transparent"
        display={<div class="flex items-center gap-3"><CubeOutline width={24} />Resources</div>}
        class={{ 'hidden sm:flex': true }}>
        <Link q:slot="extra-buttons" href="/resources/rgb">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.hexGradient@@RGBirdflop')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/animtab">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.animatedTAB@@Animated TAB')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/sparkprofile">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.sparkProfile@@Spark Profile')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/flags">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.flags@@Flags')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.more@@More Resources')}
          </Button>
        </Link>
      </DropdownRaw>
      <DropdownRaw q:slot='end' class={{ 'hidden': !loc.url.pathname.includes('resources') }} id="lang-picker" color="transparent" display={<GlobeOutline width="24" />} size="md" values={config.supportedLocales.map(value => (
        {
          name: languages[value.lang as keyof typeof languages],
          value: value.lang,
        }
      ))} onChange$={(e, el) => {
        document.cookie = `locale=${JSON.stringify(config.supportedLocales.find(locale => locale.lang == el.value))};max-age=86400;path=/`;
        location.reload();
      }}>
      </DropdownRaw>
      <div q:slot='end' class="hidden sm:flex gap-2">
        <SocialButtons />
      </div>

      <DropdownRaw id="nav-hosting" q:slot='mobile' size="md" color="transparent"
        display={<div class="flex items-center gap-3"><ServerOutline width={24} />Hosting</div>}>
        <ButtonAnchor q:slot="extra-buttons" color="transparent" href="https://panel.birdflop.com/">
          Panel
        </ButtonAnchor>
        <ButtonAnchor q:slot="extra-buttons" color="transparent" href="https://client.birdflop.com/">
          Billing
        </ButtonAnchor>
        <Link q:slot="extra-buttons" href="/node-stats">
          <Button color="transparent" class={{ 'w-full': true }}>
            Node Stats
          </Button>
        </Link>
      </DropdownRaw>
      <DropdownRaw id="nav-resources" q:slot='mobile' size="md" color="transparent"
        display={<div class="flex items-center gap-3"><CubeOutline width={24} />Resources</div>}>
        <Link q:slot="extra-buttons" href="/resources/rgb">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.hexGradient@@RGBirdflop')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/animtab">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.animatedTAB@@Animated TAB')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/sparkprofile">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.sparkProfile@@Spark Profile')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources/flags">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.flags@@Flags')}
          </Button>
        </Link>
        <Link q:slot="extra-buttons" href="/resources">
          <Button color="transparent" class={{ 'w-full': true }}>
            {t('nav.more@@More Resources')}
          </Button>
        </Link>
      </DropdownRaw>
      <div q:slot='mobile' class="flex justify-evenly">
        <SocialButtons />
      </div>

    </Nav>
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