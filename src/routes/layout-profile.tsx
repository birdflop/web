import {
  $,
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik';

import { useSession, useSignIn, useSignOut } from './plugin@auth';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import {
  AppWindow,
  CircleUserRound,
  Copy,
  LogOut,
  Settings,
} from 'lucide-icons-qwik';
import { getAnonymousId } from '~/util/umami';
import { LogoBirdflop } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

import Layout, { useIsAdmin } from './layout';

// Re-export route loaders used by Layout component
export * from './layout';

export default component$(() => {
  const t = inlineTranslate();
  const session = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const loc = useLocation();
  const isAdmin = useIsAdmin().value;

  const debugId = useSignal('');
  const copied = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!session.value?.user) debugId.value = getAnonymousId();
  });

  const copyId = $((id: string) => {
    void navigator.clipboard.writeText(id);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });

  if (!session.value || !session.value.user) {
    return (
      <Layout>
        <div class="text-red-400">
          <LogoBirdflop
            confused
            size={100}
            fillGradient={['#54daf4', '#545eb6']}
          />
          <h1 class="my-6 text-5xl font-extrabold">
            {t('nav.profile.notLoggedIn.title@@You are not logged in!')}
          </h1>
          <h4 class="text-lum-text-secondary">
            {t('nav.profile.notLoggedIn.description@@Click below to login')}
          </h4>
          <div class="mt-4 flex">
            <Form action={signIn}>
              <input type="hidden" name="providerId" value="discord" />
              <input
                type="hidden"
                name="options.redirectTo"
                value={loc.url.pathname + loc.url.search}
              />
              <button class="lum-btn lum-btn-p-4 lum-grad-bg-blue/60 hover:lum-bg-blue text-white">
                <CircleUserRound size={20} /> {t('nav.profile.login@@Login')}
              </button>
            </Form>
          </div>
          {debugId.value && (
            <p class="text-lum-text-secondary mt-6 text-sm">
              {t('nav.profile.debugId@@Your debug ID is')}:{' '}
              <button
                class="inline-flex cursor-pointer items-center gap-1 align-middle font-mono underline decoration-dotted"
                onClick$={() => copyId(debugId.value)}
                title={t('nav.profile.clickToCopy@@Click to copy')}
              >
                {copied.value
                  ? t('nav.profile.copied@@Copied!')
                  : debugId.value}
                <Copy size={14} />
              </button>
            </p>
          )}
        </div>
        <Slot />
      </Layout>
    );
  }

  return (
    <Layout>
      <section class="border-lum-border/10 mx-auto flex max-w-6xl justify-center border-b px-6 pt-20 pb-6">
        <div class="flex-1">
          <h1 class="mb-2 flex items-center gap-4 text-3xl font-extrabold">
            {session.value.user.image && (
              <img
                src={session.value.user.image}
                width={36}
                height={36}
                class="h-9 w-9 rounded-full!"
              />
            )}
            {t('nav.profile.hey@@Hey')}, {session.value.user?.name || 'User'}!
            {isAdmin && (
              <Link href="/admin" class="lum-btn">
                <AppWindow />
                Admin Panel
              </Link>
            )}
          </h1>
          <p class="text-lum-text-secondary">
            Your ID is:{' '}
            <button
              class="inline-flex cursor-pointer items-center gap-1 align-middle font-mono underline decoration-dotted"
              onClick$={() => copyId(session.value.user!.id!)}
              title={t('nav.profile.clickToCopy@@Click to copy')}
            >
              {copied.value
                ? t('nav.profile.copied@@Copied!')
                : session.value.user.id}
              <Copy size={14} />
            </button>
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Link href="/settings" class="lum-btn lum-bg-transparent">
            <Settings />
            {t('nav.settings.title@@Settings')}
          </Link>
          <Form action={signOut} q:slot="extra-buttons">
            <input type="hidden" name="providerId" value="discord" />
            <input
              type="hidden"
              name="options.redirectTo"
              value={loc.url.pathname + loc.url.search}
            />
            <button class="lum-btn lum-bg-transparent">
              <LogOut size={20} /> {t('nav.profile.logout@@Logout')}
            </button>
          </Form>
        </div>
      </section>
      <Slot />
    </Layout>
  );
});
