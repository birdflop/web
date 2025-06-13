import { component$, useContext } from '@builder.io/qwik';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import { LogoBirdflop, LogoDiscord, Nav, SelectMenuRaw } from '@luminescent/ui-qwik';

import { Box, Globe, LogIn, Github, Server, Book, LogOut, User, Palette, Rainbow, Zap, Flag, Presentation, Ellipsis, ShoppingCart, DollarSign, Activity, AppWindow } from 'lucide-icons-qwik';

import { inlineTranslate, useSpeakConfig } from 'qwik-speak';
import { useSession, useSignIn, useSignOut } from '~/routes/plugin@auth';

import { languages } from '~/speak-config';
import Accordion from './Accordion';
import { openItemsContext } from '~/routes/layout';

export default component$(() => {
  const t = inlineTranslate();

  const config = useSpeakConfig();
  const loc = useLocation();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const session = useSession();

  const openItemsStore = useContext(openItemsContext);

  return (
    <Nav fixed colorClass="lum-bg-gray-800/40 !border-t-0 !border-x-0">
      <Link q:slot="start" href="/" class="lum-btn lum-bg-transparent p-2">
        <LogoBirdflop size={24} fillGradient={['#f77272', '#fab775', '#ffff6e', '#7dfa7d', '#7a7aff', '#bb77ed', '#ca3eed']} />
        <span class="font-semibold -ml-1 text-blue-50">Birdflop</span>
        <div class={{
          'transition-all': true,
          '-ml-6 opacity-0': !loc.isNavigating,
        }}>
          <div class="lum-loading w-4 h-4" />
        </div>
      </Link>
      <Link q:slot="end" href="/docs" class="lum-btn lum-bg-transparent hidden sm:flex">
        <Book size={20} /> {t('nav.docs@@Docs')}
      </Link>
      <SelectMenuRaw id="nav-hosting" q:slot='end' hover customDropdown
        class={{ 'lum-bg-transparent hidden sm:flex': true }}>
        <div q:slot="dropdown" class="flex items-center gap-2">
          <Server size={20} /> {t('nav.hosting.title@@Hosting')}
        </div>
        <a q:slot="extra-buttons" class="lum-btn lum-bg-transparent rounded-lum-1" href="https://panel.birdflop.com/">
          <AppWindow size={20} /> {t('nav.hosting.panel@@Panel')}
        </a>
        <Link q:slot="extra-buttons" href="/plans" class="lum-btn lum-bg-transparent rounded-lum-1">
          <ShoppingCart size={20} /> {t('nav.hosting.plans@@Plans')}
        </Link>
        <a q:slot="extra-buttons" href="https://client.birdflop.com/" class="lum-btn lum-bg-transparent rounded-lum-1">
          <DollarSign size={20} /> {t('nav.hosting.billing@@Billing')}
        </a>
        <Link q:slot="extra-buttons" href="/node-stats" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Activity size={20} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </Link>
      </SelectMenuRaw>
      <SelectMenuRaw id="nav-resources" q:slot='end' hover customDropdown
        class={{ 'lum-bg-transparent hidden sm:flex': true }}>
        <div q:slot="dropdown" class="flex items-center gap-2">
          <Box size={20} /> {t('nav.resources.title@@Resources')}
        </div>
        <Link q:slot="extra-buttons" href="/resources/rgb" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/animtab" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/sparkprofile" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Zap size={20} /> {t('nav.resources.sparkProfile.title@@Spark Profile')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/flags" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Flag size={20} /> {t('nav.resources.flags.title@@Flags Generator')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources/banner" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Presentation size={20} /> {t('nav.resources.banner.title@@Banner Generator')}
        </Link>
        <Link q:slot="extra-buttons" href="/resources" class="lum-btn lum-bg-transparent rounded-lum-1">
          <Ellipsis size={20} /> {t('nav.resources.more@@More Resources')}
        </Link>
      </SelectMenuRaw>
      <SelectMenuRaw q:slot='end' class={{ 'hidden': !loc.url.pathname.includes('resources'), 'p-2 lum-bg-transparent gap-1': true }} id="lang-picker" customDropdown
        values={config.supportedLocales.map(value => (
          {
            name: languages[value.lang as keyof typeof languages],
            value: value.lang,
          }
        ))} onChange$={(e, el) => {
          document.cookie = `locale=${JSON.stringify(config.supportedLocales.find(locale => locale.lang == el.value))};max-age=86400;path=/`;
          location.reload();
        }}>
        <Globe size={20} q:slot='dropdown' />
      </SelectMenuRaw>
      <div q:slot='end' class="hidden sm:flex gap-2">
        <SocialButtons />
      </div>
      {session.value && session.value.user &&
        <SelectMenuRaw q:slot='end' class={{ 'p-2 lum-bg-transparent gap-1': true }} id="profile" customDropdown>
          <p q:slot='dropdown' class="flex items-center gap-2">
            {session.value.user.image &&
              <img src={session.value.user.image} width={20} height={20} class="rounded-full! min-w-5 h-5" />
            }
            {session.value.user?.name || 'User'}
          </p>
          <Link q:slot="extra-buttons" href="/profile" class="lum-btn lum-bg-transparent rounded-lum-1">
            <User size={20} /> {t('nav.profile.title@@Profile')}
          </Link>
          <Form action={signOut} q:slot="extra-buttons">
            <input type="hidden" name="providerId" value="discord" />
            <input
              type="hidden"
              name="options.redirectTo"
              value={loc.url.pathname + loc.url.search}
            />
            <button class="lum-btn lum-bg-transparent rounded-lum-1">
              <LogOut size={20} /> {t('nav.profile.logout@@Logout')}
            </button>
          </Form>
        </SelectMenuRaw>
      }
      {!session.value &&
        <Form action={signIn} q:slot='end'>
          <input type="hidden" name="providerId" value="discord" />
          <input
            type="hidden"
            name="options.redirectTo"
            value={loc.url.pathname + loc.url.search}
          />
          <button class="lum-btn p-2 lum-bg-transparent">
            <LogIn size={20} />
          </button>
        </Form>
      }

      <Link q:slot="mobile" href="/docs" class="lum-btn lum-bg-transparent">
        <Book size={20} /> {t('nav.docs@@Docs')}
      </Link>
      <Accordion q:slot="mobile" sectionName="nav-hosting" class={{
        'lum-bg-transparent': true,
      }}>
        <Server size={20} /> {t('nav.hosting.title@@Hosting')}
      </Accordion>
      <div class={{
        'transition-all duration-200 overflow-hidden': true,
        'max-h-0 opacity-0 scale-98': !openItemsStore.items.includes('nav-hosting'),
        'max-h-screen opacity-100 mt-1': openItemsStore.items.includes('nav-hosting'),
      }} q:slot='mobile'>
        <a href="https://panel.birdflop.com/" class="lum-btn lum-bg-transparent">
          <AppWindow size={20} /> {t('nav.hosting.panel@@Panel')}
        </a>
        <Link href="/plans" class="lum-btn lum-bg-transparent">
          <ShoppingCart size={20} /> {t('nav.hosting.plans@@Plans')}
        </Link>
        <a href="https://client.birdflop.com/" class="lum-btn lum-bg-transparent">
          <DollarSign size={20} /> {t('nav.hosting.billing@@Billing')}
        </a>
        <Link href="/node-stats" class="lum-btn lum-bg-transparent">
          <Activity size={20} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </Link>
      </div>
      <Accordion q:slot="mobile" sectionName="nav-resources" class={{
        'lum-bg-transparent': true,
      }}>
        <Box size={20} /> {t('nav.resources.title@@Resources')}
      </Accordion>
      <div class={{
        'transition-all duration-200 overflow-hidden': true,
        'max-h-0 opacity-0 scale-98': !openItemsStore.items.includes('nav-resources'),
        'max-h-screen opacity-100 mt-1': openItemsStore.items.includes('nav-resources'),
      }} q:slot='mobile'>
        <Link href="/resources/rgb" class="lum-btn lum-bg-transparent">
          <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </Link>
        <Link href="/resources/animtab" class="lum-btn lum-bg-transparent">
          <Rainbow size={20} /> {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </Link>
        <Link href="/resources/sparkprofile" class="lum-btn lum-bg-transparent">
          <Zap size={20} /> {t('nav.resources.sparkProfile.title@@Spark Profile')}
        </Link>
        <Link href="/resources/flags" class="lum-btn lum-bg-transparent">
          <Flag size={20} /> {t('nav.resources.flags.title@@Flags Generator')}
        </Link>
        <Link href="/resources/banner" class="lum-btn lum-bg-transparent">
          <Presentation size={20} /> {t('nav.resources.banner.title@@Banner Generator')}
        </Link>
        <Link href="/resources" class="lum-btn lum-bg-transparent">
          <Ellipsis size={20} /> {t('nav.resources.more@@More Resources')}
        </Link>
      </div>

      <div q:slot='mobile' class="flex justify-evenly">
        <SocialButtons />
      </div>

    </Nav>
  );
});

export const SocialButtons = component$(() => {
  return <>
    <a href="https://github.com/birdflop/web" title="GitHub" class="lum-btn p-2 lum-bg-transparent">
      <Github size={20} />
    </a>
    <a href="https://discord.gg/nmgtX5z" title="Discord" class="lum-btn p-2 lum-bg-transparent">
      <LogoDiscord size={20} />
    </a>
  </>;
});
