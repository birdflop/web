import { component$, Slot } from '@qwik.dev/core';

import { useSession, useSignIn, useSignOut } from './plugin@auth';
import { Form, Link, useLocation } from '@qwik.dev/router';
import AppWindow from 'lucide-icons-qwik/icons/AppWindow';
import CircleUserRound from 'lucide-icons-qwik/icons/CircleUserRound';
import LogOut from 'lucide-icons-qwik/icons/LogOut';
import Settings from 'lucide-icons-qwik/icons/Settings';
import { Birdflop } from '@luminescent/icons-qwik';
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

  if (!session.value || !session.value.user) {
    return (
      <Layout>
        <div class="text-red-400">
          <Birdflop confused size={100} fillGradient={['#54daf4', '#545eb6']} />
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
        </div>
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
            Your ID is: {session.value.user.id}
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
