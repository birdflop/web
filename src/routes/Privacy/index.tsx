import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import {
  $translate as t,
  Speak,
} from 'qwik-speak';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 space-y-3 min-h-[60px]">
        <Speak assets={['privacypolicy']}>
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-12" dangerouslySetInnerHTML={t('privacypolicy.title@@Privacy Policy for <span class="text-purple-500">SimplyMC</span>')}/>

          <p dangerouslySetInnerHTML={t('privacypolicy.1')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.2')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.3')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.4')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.5')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.6')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.7')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.8')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.9')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.10')} />
          <p dangerouslySetInnerHTML={t('privacypolicy.11')} />
        </Speak>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Privacy Policy',
  meta: [
    {
      name: 'description',
      content: 'View our Privacy Policy',
    },
    {
      name: 'og:description',
      content: 'View our Privacy Policy',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};