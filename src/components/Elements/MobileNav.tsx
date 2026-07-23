import { component$, Fragment } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';

import Book from 'lucide-icons-qwik/icons/Book';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Zap from 'lucide-icons-qwik/icons/Zap';
import Ellipsis from 'lucide-icons-qwik/icons/Ellipsis';
import ShoppingCart from 'lucide-icons-qwik/icons/ShoppingCart';
import DollarSign from 'lucide-icons-qwik/icons/DollarSign';
import AppWindow from 'lucide-icons-qwik/icons/AppWindow';
import Server from 'lucide-icons-qwik/icons/Server';

import { inlineTranslate } from 'qwik-speak';
import { ButtonContainer } from './ButtonContainer';
import { Dropdown } from '@luminescent/ui-qwik';
import Activity from 'lucide-icons-qwik/icons/Activity';
import Box from 'lucide-icons-qwik/icons/Box';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Flag from 'lucide-icons-qwik/icons/Flag';
import Presentation from 'lucide-icons-qwik/icons/Presentation';

// Links used in multiple places, defined here to avoid duplication and potential inconsistencies
export const donateLink =
  'https://www.paypal.com/US/fundraiser/charity/5036975';
export const discordLink = 'https://discord.gg/nmgtX5z';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <ButtonContainer
      class="lum-grad-bg-nav-bg/20 fixed right-0 bottom-0 left-0 z-100 mx-2 mb-1 flex backdrop-blur-xl sm:hidden"
      style={{
        '--lum-border-radius': '1.5rem',
        '--lum-btn-p-x': '2.5',
      }}
    >
      <Link
        href="/docs"
        class="lum-btn-p-1! hover:lum-bg-nav-bg! flex-col text-xs!"
      >
        <Book size={16} /> {t('nav.docs@@Docs')}
      </Link>
      <Dropdown
        id="nav-hosting"
        noChevron
        top
        align="center"
        panelProps={{
          class: 'lum-grad-bg-nav-bg/100 rounded-lum-1',
        }}
        class="lum-btn-p-1! hover:lum-bg-nav-bg! lum-bg-transparent rounded-lum-1 flex-col! text-xs!"
      >
        <Fragment q:slot="dropdown">
          <Server size={16} q:slot="dropdown" />
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
        href="/resources/rgb"
        class="lum-btn-p-1! hover:lum-bg-nav-bg! flex-col text-xs!"
      >
        <Palette size={16} /> {t('nav.resources.hexGradient.title@@RGBirdflop')}
      </Link>
      <Link
        href="/resources/analyze"
        class="lum-btn-p-1! hover:lum-bg-nav-bg! flex-col text-xs!"
      >
        <Zap size={16} /> {t('nav.resources.analyze.title@@Analyze')}
      </Link>
      <Dropdown
        id="nav-hosting"
        noChevron
        top
        align="right"
        panelProps={{
          class: 'lum-grad-bg-nav-bg/100 rounded-lum-1',
        }}
        class="lum-btn-p-1! hover:lum-bg-nav-bg! lum-bg-transparent rounded-lum-1 flex-col! text-xs!"
      >
        <Fragment q:slot="dropdown">
          <Box size={16} /> {t('nav.resources.title@@Resources')}
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
    </ButtonContainer>
  );
});
