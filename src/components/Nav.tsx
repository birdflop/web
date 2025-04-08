import { component$ } from '@builder.io/qwik';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import { LogoBirdflop, LogoDiscord, Nav, DropdownRaw } from '@luminescent/ui-qwik';

import { Box, Globe, LogIn, Github, Server } from 'lucide-icons-qwik';

import { inlineTranslate, useSpeakConfig } from 'qwik-speak';
import { useSession, useSignIn, useSignOut } from '~/routes/plugin@auth';

import { languages } from '~/speak-config';

export default component$(() => {
  const t = inlineTranslate();

  const config = useSpeakConfig();
  const loc = useLocation();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const session = useSession();

  return (
    <Nav fixed colorClass="lum-bg-gray-800/40 !border-t-0 !border-x-0">
      <Link q:slot="start" href="/" class="lum-btn lum-bg-transparent">
        <LogoBirdflop width={32} fillGradient={['#54daf4', '#545eb6']} />
        <span class="font-bold -ml-1">Birdflop</span>
        <div class={{
          'transition-all': true,
          '-ml-6 opacity-0': !loc.isNavigating,
        }}>
          <div class="lum-loading w-4 h-4" />
        </div>
      </Link>

      <DropdownRaw id="nav-hosting" q:slot='end' hover
        display={<div class="flex items-center gap-3"><Server size={24} />{t('nav.hosting.title@@Hosting')}</div>}
        class={{ 'lum-bg-transparent hidden sm:flex': true }}>
        <a q:slot="extra-buttons" class="lum-btn lum-bg-transparent" href="https://panel.birdflop.com/">
          {t('nav.hosting.panel@@Panel')}
        </a>
        <Link q:slot="extra-buttons" href="/plans" class="lum-btn lum-bg-transparent">
          {t('nav.hosting.plans@@Plans')}
        </Link>
        <a q:slot="extra-buttons" href="https://client.birdflop.com/" class="lum-btn lum-bg-transparent">
          {t('nav.hosting.billing@@Billing')}
        </a>
        <Link q:slot="extra-buttons" href="/node-stats" class="lum-btn lum-bg-transparent">
          {t('nav.hosting.nodeStats@@Node Stats')}
        </Link>
      </DropdownRaw>
      <DropdownRaw id="nav-resources" q:slot='end' hover
        display={<div class="flex items-center gap-3"><Box size={24} />{t('nav.resources.title@@Resources')}</div>}
        class={{ 'lum-bg-transparent hidden sm:flex': true }}>
        <Link q:slot="extra-buttons" href="/resources/rgb" class="lum-btn lum-bg-transparent">
          {t('nav.resources.hexGradient@@RGBirdflop')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/animtab" class="lum-btn lum-bg-transparent">
          {t('nav.resources.animatedTAB@@Animated TAB')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/sparkprofile" class="lum-btn lum-bg-transparent">
          {t('nav.resources.sparkProfile@@Spark Profile')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/flags" class="lum-btn lum-bg-transparent">
          {t('nav.resources.flags@@Flags')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources" class="lum-btn lum-bg-transparent">
          {t('nav.resources.more@@More Resources')}
        </Link>
      </DropdownRaw>
      <DropdownRaw q:slot='end' class={{ 'hidden': !loc.url.pathname.includes('resources'), 'lum-bg-transparent lum-pad-equal-xs': true }} id="lang-picker"
        display={<Globe size={24} />} values={config.supportedLocales.map(value => (
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

      <Form action={session.value ? signOut : signIn} q:slot='end' class="relative">
        <input type="hidden" name="providerId" value="discord" />
        <input
          type="hidden"
          name="options.redirectTo"
          value={loc.url.pathname + loc.url.search}
        />
        <button class="lum-btn lum-bg-transparent w-full justify-end fill-current lum-pad-equal-xs">
          {session.value && session.value.user?.image ?
            <>
              <div class="flex gap-3 pr-7 items-center">
                <span>{session.value.user?.name}</span>
                <img src={session.value.user.image} width={28} height={28} class="rounded-full" />
              </div>
            </>
            : <LogIn size={28} />
          }
        </button>
      </Form>

      <h3 q:slot="mobile" class="flex items-center gap-3 mx-4 py-3 text-gray-200 font-semibold border-b border-gray-700">
        <Server size={24} /> {t('nav.hosting.title@@Hosting')}
      </h3>
      <a q:slot="mobile" href="https://panel.birdflop.com/" class="lum-btn lum-bg-transparent">
        {t('nav.hosting.panel@@Panel')}
      </a>
      <Link q:slot="mobile" href="/plans" class="lum-btn lum-bg-transparent">
        {t('nav.hosting.plans@@Plans')}
      </Link>
      <a q:slot="mobile" href="https://client.birdflop.com/" class="lum-btn lum-bg-transparent">
        {t('nav.hosting.billing@@Billing')}
      </a>
      <Link q:slot="mobile" href="/node-stats" class="lum-btn lum-bg-transparent">
        {t('nav.hosting.nodeStats@@Node Stats')}
      </Link>
      <h3 q:slot="mobile" class="flex items-center gap-3 mx-4 py-3 text-gray-200 font-semibold border-b border-gray-700">
        <Box size={24} /> {t('nav.resources.title@@Resources')}
      </h3>
      <Link q:slot="mobile" href="/resources/rgb" class="lum-btn lum-bg-transparent">
        {t('nav.resources.hexGradient@@RGBirdflop')}
      </Link>
      <Link q:slot="mobile" href="/resources/animtab" class="lum-btn lum-bg-transparent">
        {t('nav.resources.animatedTAB@@Animated TAB')}
      </Link>
      <Link q:slot="mobile" href="/resources/sparkprofile" class="lum-btn lum-bg-transparent">
        {t('nav.resources.sparkProfile@@Spark Profile')}
      </Link>
      <Link q:slot="mobile" href="/resources/flags" class="lum-btn lum-bg-transparent">
        {t('nav.resources.flags@@Flags')}
      </Link>
      <Link q:slot="mobile" href="/resources" class="lum-btn lum-bg-transparent">
        {t('nav.resources.more@@More Resources')}
      </Link>
      <div q:slot='mobile' class="flex justify-evenly">
        <SocialButtons />
      </div>

    </Nav>
  );
});

export const SocialButtons = component$(() => {
  return <>
    <a href="https://github.com/birdflop/web" title="GitHub" class="lum-btn lum-bg-transparent fill-current lum-pad-equal-sm">
      <Github size={24} />
    </a>
    <a href="https://discord.gg/nmgtX5z" title="Discord" class="lum-btn lum-bg-transparent fill-current lum-pad-equal-sm">
      <LogoDiscord width={24} />
    </a>
  </>;
});
