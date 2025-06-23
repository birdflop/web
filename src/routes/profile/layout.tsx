import { component$, Slot } from '@builder.io/qwik';

import { useSession, useSignIn, useSignOut } from '../plugin@auth';
import { Form, RequestHandler, useLocation } from '@builder.io/qwik-city';
import { LogIn, LogOut } from 'lucide-icons-qwik';
import { LogoBirdflop } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { ThemeToggle } from '~/components/ThemeToggle';

export const onGet: RequestHandler = ({ cacheControl }) => {
  cacheControl({
    public: false,
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
  });
};

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
          <LogoBirdflop confused size={100} fillGradient={['#f77272', '#fab775', '#ffff6e', '#7dfa7d', '#7a7aff', '#bb77ed', '#ca3eed']} />
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
        <div class="flex items-center">
          <h1 class="flex gap-4 items-center my-3! flex-1">
            {session.value.user.image &&
              <img src={session.value.user.image} width={70} height={70} class="rounded-full! w-17 h-17" />
            }
            {t('nav.profile.hey@@Hey')}, {session.value.user?.name || 'User'}!
          </h1>
          <div class="flex items-center gap-4">
            <ThemeToggle variant='full' />
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
          </div>
        </div>
        <hr />
        <main>
          <Slot />
        </main>
      </div>
    </section>
  );
});