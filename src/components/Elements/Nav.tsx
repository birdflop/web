import { component$, Fragment, useContext } from '@qwik.dev/core';
import { Form, Link, useLocation } from '@qwik.dev/router';
import { Dropdown, Nav, SelectMenu } from '@luminescent/ui-qwik';
import { Birdflop } from '@luminescent/icons-qwik';
import SiGithub from 'simple-icons-qwik/icons/SiGithub';
import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';

import Box from 'lucide-icons-qwik/icons/Box';
import Globe from 'lucide-icons-qwik/icons/Globe';
import Server from 'lucide-icons-qwik/icons/Server';
import Book from 'lucide-icons-qwik/icons/Book';
import LogOut from 'lucide-icons-qwik/icons/LogOut';
import User from 'lucide-icons-qwik/icons/User';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Zap from 'lucide-icons-qwik/icons/Zap';
import Flag from 'lucide-icons-qwik/icons/Flag';
import Presentation from 'lucide-icons-qwik/icons/Presentation';
import Ellipsis from 'lucide-icons-qwik/icons/Ellipsis';
import ShoppingCart from 'lucide-icons-qwik/icons/ShoppingCart';
import DollarSign from 'lucide-icons-qwik/icons/DollarSign';
import Activity from 'lucide-icons-qwik/icons/Activity';
import AppWindow from 'lucide-icons-qwik/icons/AppWindow';
import Settings from 'lucide-icons-qwik/icons/Settings';
import Loader2 from 'lucide-icons-qwik/icons/Loader2';
import Gamepad2 from 'lucide-icons-qwik/icons/Gamepad2';

import { inlineTranslate, useSpeakConfig, useSpeakLocale } from 'qwik-speak';
import { useSession, useSignIn, useSignOut } from '~/routes/plugin@auth';

import { languages } from '~/speak-config';
import { SettingsContext } from '~/routes/layout';
import { setCookies, setUserData } from '~/util/dataUtils';

// Links used in multiple places, defined here to avoid duplication and potential inconsistencies
export const donateLink =
  'https://www.paypal.com/US/fundraiser/charity/5036975';
export const discordLink = 'https://discord.gg/nmgtX5z';

export default component$(() => {
  const t = inlineTranslate();

  const config = useSpeakConfig();
  const locale = useSpeakLocale();
  const loc = useLocation();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const session = useSession();

  const settingsStore = useContext(SettingsContext);

  return (
    <Nav
      fixed
      nohamburger
      colorClass="lum-grad-bg-nav-bg sm:border-b-lum-border/10 sm:shadow-lg"
      mobileNavProps={{
        style: {
          '--lum-border-radius': '1.5rem',
        },
      }}
    >
      <Link
        q:slot="start"
        href="/"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg p-2"
      >
        <Birdflop size={24} fillGradient={['#54daf4', '#545eb6']} />
        <span class="-ml-1 font-semibold">Birdflop</span>
        <div
          class={{
            'transition-all': true,
            '-ml-6 opacity-0': !loc.isNavigating,
          }}
        >
          <Loader2 size={16} class="animate-spin" />
        </div>
      </Link>
      <Link
        q:slot="end"
        href="/docs"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg hidden sm:flex"
      >
        <Book size={20} /> {t('nav.docs@@Docs')}
      </Link>
      <Dropdown
        id="nav-hosting"
        q:slot="end"
        hover
        panelProps={{
          class: 'lum-grad-bg-nav-bg',
        }}
        class="lum-bg-transparent hover:lum-bg-nav-bg hidden sm:flex"
      >
        <Fragment q:slot="dropdown">
          <Birdflop size={20} /> {t('nav.hosting.title@@Hosting')}
        </Fragment>
        <a
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
          href="https://panel.birdflop.com/"
        >
          <AppWindow size={20} /> {t('nav.hosting.panel@@Panel')}
        </a>
        <Link
          href="/plans"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <ShoppingCart size={20} /> {t('nav.hosting.plans@@Plans')}
        </Link>
        <a
          href="https://client.birdflop.com/"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <DollarSign size={20} /> {t('nav.hosting.billing@@Billing')}
        </a>
        <Link
          href="/node-stats"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Activity size={20} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </Link>
      </Dropdown>
      <Dropdown
        id="nav-resources"
        q:slot="end"
        hover
        panelProps={{
          class: 'lum-grad-bg-nav-bg',
        }}
        class="lum-bg-transparent hover:lum-bg-nav-bg hidden sm:flex"
      >
        <Fragment q:slot="dropdown">
          <Box size={20} /> {t('nav.resources.title@@Resources')}
        </Fragment>
        <Link
          href="/resources/rgb"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Palette size={20} />{' '}
          {t('nav.resources.hexGradient.title@@RGBirdflop')}
        </Link>
        <Link
          href="/resources/animtab"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Rainbow size={20} />{' '}
          {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </Link>
        <Link
          href="/resources/analyze"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Zap size={20} /> {t('nav.resources.analyze.title@@Analyze')}
        </Link>
        <Link
          href="/resources/flags"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Flag size={20} /> {t('nav.resources.flags.title@@Flags Generator')}
        </Link>
        <Link
          href="/resources/banner"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Presentation size={20} />{' '}
          {t('nav.resources.banner.title@@Banner Generator')}
        </Link>
        <Link
          href="/resources"
          class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
        >
          <Ellipsis size={20} /> {t('nav.resources.more@@More Resources')}
        </Link>
      </Dropdown>
      <Link
        q:slot="end"
        href="/serverlist"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg"
      >
        <Gamepad2 size={20} />{' '}
        {t('nav.resources.serverList.title@@Server List')}
      </Link>
      <SelectMenu
        align="right"
        q:slot="end"
        class={{
          hidden: !loc.url.pathname.includes('resources'),
          'lum-bg-transparent hover:lum-bg-nav-bg gap-1 p-2': true,
        }}
        id="lang-picker"
        customDropdownButton
        panelProps={{
          class: 'lum-grad-bg-nav-bg',
        }}
        values={config.supportedLocales.map((value) => ({
          name: languages[value.lang as keyof typeof languages],
          value: value.lang,
        }))}
        onChange$={async (e, el) => {
          settingsStore.locale = el.value as keyof typeof languages;
          setCookies('settings', settingsStore);
          await setUserData({ settings: settingsStore });
          window.location.reload();
        }}
      >
        <span
          class="lum-grad-bg-nav-bg absolute top-0 left-5 rounded-sm px-0.5 text-[10px]"
          q:slot="dropdown"
        >
          {locale.lang.split('-')[0]}
        </span>
        <Globe size={20} q:slot="dropdown" />
      </SelectMenu>
      <Link
        q:slot="end"
        href="/settings"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg p-2"
        aria-label={t('nav.settings.title@@Settings')}
        title={t('nav.settings.title@@Settings')}
      >
        <Settings size={20} aria-hidden="true" />
      </Link>
      <div q:slot="end" class="hidden gap-2 sm:flex">
        <SocialButtons />
      </div>
      {session.value && session.value.user && (
        <Dropdown
          align="right"
          q:slot="end"
          class="lum-bg-transparent hover:lum-bg-nav-bg gap-1 p-2"
          id="profile"
          panelProps={{
            class: 'lum-grad-bg-nav-bg',
          }}
        >
          <span q:slot="dropdown" class="text-lum-text flex items-center gap-2">
            {session.value.user.image && (
              <img
                alt={session.value.user.name || 'User'}
                src={session.value.user.image}
                width={20}
                height={20}
                class="h-5 min-w-5 rounded-full!"
              />
            )}
            {session.value.user?.name || 'User'}
          </span>
          <Link
            href="/profile"
            class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1"
          >
            <User size={20} /> {t('nav.profile.title@@Profile')}
          </Link>
          <Form action={signOut}>
            <input type="hidden" name="providerId" value="discord" />
            <input
              type="hidden"
              name="options.redirectTo"
              value={loc.url.pathname + loc.url.search}
            />
            <button class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-1">
              <LogOut size={20} /> {t('nav.profile.logout@@Logout')}
            </button>
          </Form>
        </Dropdown>
      )}
      {!session.value && (
        <Form action={signIn} q:slot="end">
          <input type="hidden" name="providerId" value="discord" />
          <input
            type="hidden"
            name="options.redirectTo"
            value={loc.url.pathname + loc.url.search}
          />
          <button class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg p-2">
            {t('nav.profile.login@@Login')}
          </button>
        </Form>
      )}

      <Link
        q:slot="mobile"
        href="/docs"
        class="hover:lum-bg-nav-bg! flex-col gap-1! p-1! text-[0.65rem]!"
      >
        <Book size={20} /> {t('nav.docs@@Docs')}
      </Link>
      <Dropdown
        q:slot="mobile"
        id="nav-hosting"
        noChevron
        top
        align="center"
        panelProps={{
          class: 'lum-grad-bg-nav-bg/100 rounded-lum-1',
        }}
        class="hover:lum-bg-nav-bg! lum-bg-transparent rounded-lum-1 flex-col! gap-1! p-1! text-[0.65rem]!"
      >
        <Fragment q:slot="dropdown">
          <Server size={20} q:slot="dropdown" />
          {t('nav.hosting.title@@Hosting')}
        </Fragment>
        <a
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
          href="https://panel.birdflop.com/"
        >
          <AppWindow size={20} /> {t('nav.hosting.panel@@Panel')}
        </a>
        <Link
          href="/plans"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <ShoppingCart size={20} /> {t('nav.hosting.plans@@Plans')}
        </Link>
        <a
          href="https://client.birdflop.com/"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <DollarSign size={20} /> {t('nav.hosting.billing@@Billing')}
        </a>
        <Link
          href="/node-stats"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <Activity size={20} /> {t('nav.hosting.nodeStats.title@@Node Stats')}
        </Link>
      </Dropdown>
      <Link
        q:slot="mobile"
        href="/resources/rgb"
        class="hover:lum-bg-nav-bg! flex-col gap-1! p-1! text-[0.65rem]!"
      >
        <Palette size={20} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
      </Link>
      <Link
        q:slot="mobile"
        href="/resources/analyze"
        class="hover:lum-bg-nav-bg! flex-col gap-1! p-1! text-[0.65rem]!"
      >
        <Zap size={20} /> {t('nav.resources.analyze.title@@Analyze')}
      </Link>
      <Dropdown
        q:slot="mobile"
        id="nav-hosting"
        noChevron
        top
        align="right"
        panelProps={{
          class: 'lum-grad-bg-nav-bg/100 rounded-lum-1',
        }}
        class="hover:lum-bg-nav-bg! lum-bg-transparent rounded-lum-1 flex-col! gap-1! p-1! text-[0.65rem]!"
      >
        <Fragment q:slot="dropdown">
          <Box size={20} /> {t('nav.resources.title@@Resources')}
        </Fragment>
        <Link
          href="/resources/animtab"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <Rainbow size={20} />{' '}
          {t('nav.resources.animatedTAB.title@@Animated TAB')}
        </Link>
        <Link
          href="/resources/flags"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <Flag size={20} /> {t('nav.resources.flags.title@@Flags Generator')}
        </Link>
        <Link
          href="/resources/banner"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <Presentation size={20} />{' '}
          {t('nav.resources.banner.title@@Banner Generator')}
        </Link>
        <Link
          href="/resources"
          class="lum-btn lum-btn-p-1! lum-bg-transparent hover:lum-bg-nav-bg rounded-lum-2"
        >
          <Ellipsis size={20} /> {t('nav.resources.more@@More Resources')}
        </Link>
      </Dropdown>
    </Nav>
  );
});

export const SocialButtons = component$(() => {
  return (
    <>
      <a
        href="https://github.com/birdflop/web"
        title="GitHub"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg fill-current p-2"
      >
        <SiGithub size={20} />
      </a>
      <a
        href={discordLink}
        title="Discord"
        class="lum-btn lum-bg-transparent hover:lum-bg-nav-bg fill-current p-2"
        data-umami-event="discord-link"
        data-umami-source="nav"
      >
        <SiDiscord size={20} />
      </a>
    </>
  );
});
