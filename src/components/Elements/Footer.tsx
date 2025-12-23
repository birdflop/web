import { component$ } from '@builder.io/qwik';
import { SocialButtons } from './Nav';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <footer class="relative flex flex-col gap-1 items-center justify-center text-center w-full z-10 bg-lum-card-bg border-t border-t-lum-border/10 p-6">
      <div class="flex gap-1 mb-2">
        <SocialButtons />
      </div>
      <span class="text-sm max-w-6xl text-center">
        Copyright © 2025 Birdflop. All rights reserved. Birdflop is a registered 501(c)(3) nonprofit organization (EIN: 93-2401009).<br />
        By using this site, you agree to our{' '}
        <a href="/terms" class="text-blue-400 hover:underline">{t('nav.termsofService@@Terms of Service')}</a>{' '}
        and{' '}
        <a href="/privacy" class="text-blue-400 hover:underline">{t('nav.privacyPolicy@@Privacy Policy')}</a>.{' '}
        Items marked with an asterisk (*) are a reminder that our {t('nav.termsofService@@Terms of Service')} apply.
      </span>
    </footer>
  );
});