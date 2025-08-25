import { component$, Slot } from '@builder.io/qwik';

import { useSession, useSignIn, useSignOut } from '../plugin@auth';
import { Form, useLocation } from '@builder.io/qwik-city';
import { LogIn, LogOut } from 'lucide-icons-qwik';
import { LogoBirdflop } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { ThemeToggle } from '~/components/Elements/ThemeToggle';

export default component$(() => {
  const t = inlineTranslate();
  const session = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const loc = useLocation();

  if (!session.value || !session.value.user) {
    return (
      <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-svh" >
        <div class="text-red-400">
          <LogoBirdflop confused size={100} fillGradient={['#54daf4', '#545eb6']} />
          <h1>
            {t('nav.profile.notLoggedIn.title@@You are not logged in!')}
          </h1>
          <h4 class="text-lum-text-secondary">
            {t('nav.profile.notLoggedIn.description@@Click below to login')}
          </h4>
          <div class="flex mt-4">
            <Form action={signIn}>
              <input type="hidden" name="providerId" value="discord" />
              <input
                type="hidden"
                name="options.redirectTo"
                value={loc.url.pathname + loc.url.search}
              />
              <button class="lum-btn lum-btn-p-4 lum-bg-blue/60 hover:lum-bg-blue text-white">
                <LogIn size={20} /> {t('nav.profile.login@@Login')}
              </button>
            </Form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="min-h-[60px] w-full">
        <div class="lum-card flex-row items-center lum-btn-p-3 lum-bg-lum-card-bg">
          <div class="my-3! flex-1">
            <h3 class="flex gap-4 items-center mt-0! mb-1!">
              {session.value.user.image &&
                <img src={session.value.user.image} width={36} height={36} class="rounded-full! w-9 h-9" />
              }
              {t('nav.profile.hey@@Hey')}, {session.value.user?.name || 'User'}!
            </h3>
            <p>
              Your ID is: {session.value.user.id}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <ThemeToggle variant='full' />
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
        </div>
        <main>
          <Slot />
        </main>
      </div>
    </section>
  );
});