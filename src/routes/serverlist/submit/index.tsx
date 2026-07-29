import { component$ } from '@qwik.dev/core';
import { Form } from '@qwik.dev/router';
import Plus from 'lucide-icons-qwik/icons/Plus';
import Lock from 'lucide-icons-qwik/icons/Lock';
import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';
import { generateHead } from '~/root';
import { useSession, useSignIn } from '~/routes/plugin@auth';
import ServerForm from '~/components/ServerList/ServerForm';

export default component$(() => {
  const session = useSession();
  const signIn = useSignIn();

  return (
    <section class="relative mx-auto flex min-h-svh w-full justify-center gap-8 px-6 pt-20">
      <div class="min-h-15 max-w-6xl">
        <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
          <Plus size={32} />
          Add your server
        </h1>
        <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
          List your Minecraft server for free. Your listing goes live
          immediately and you can edit it any time.
        </p>

        {session.value?.user ? (
          <ServerForm mode="create" />
        ) : (
          <div class="lum-card items-start gap-3">
            <p class="flex items-center gap-2">
              <Lock size={18} class="text-lum-text-secondary shrink-0" />
              You need to be logged in to add a server, so you can manage your
              listing later.
            </p>
            <Form action={signIn}>
              <input type="hidden" name="providerId" value="discord" />
              <input
                type="hidden"
                name="options.redirectTo"
                value="/serverlist/submit"
              />
              <button class="lum-btn lum-bg-blue hover:lum-bg-blue/80 flex items-center gap-2">
                <SiDiscord size={18} /> Login with Discord
              </button>
            </Form>
          </div>
        )}
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Add your server - Birdflop Server List',
  description: 'List your Minecraft server on Birdflop for free.',
});
