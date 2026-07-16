import { component$ } from '@qwik.dev/core';
import { SocialButtons } from './Nav';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();

  return (
    <footer class="bg-lum-card-bg border-t-lum-border/10 relative mt-20 flex w-full flex-col items-center justify-center gap-1 border-t p-6 text-center">
      <div class="mb-2 flex gap-1">
        <SocialButtons />
      </div>
      <span class="max-w-6xl text-center text-sm">
        Copyright © 2025 Birdflop. All rights reserved. Birdflop is a registered
        501(c)(3) nonprofit organization (EIN: 93-2401009).
        <br />
        By using this site, you agree to our{' '}
        <a href="/terms" class="text-lum-accent hover:underline">
          {t('nav.termsofService@@Terms of Service')}
        </a>{' '}
        and{' '}
        <a href="/privacy" class="text-lum-accent hover:underline">
          {t('nav.privacyPolicy@@Privacy Policy')}
        </a>
        . Items marked with an asterisk (*) are a reminder that our{' '}
        {t('nav.termsofService@@Terms of Service')} apply.
      </span>
    </footer>
  );
});
