import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import { routeLoader$, Link } from '@qwik.dev/router';
import { eq } from 'drizzle-orm';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import ArrowLeft from 'lucide-icons-qwik/icons/ArrowLeft';
import ShieldAlert from 'lucide-icons-qwik/icons/ShieldAlert';
import SendHorizonal from 'lucide-icons-qwik/icons/SendHorizonal';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import CircleX from 'lucide-icons-qwik/icons/CircleX';
import { generateHead } from '~/root';
import { getDB, servers } from '~/util/db';
import { checkAdmin } from '~/routes/layout';
import ServerForm from '~/components/ServerList/ServerForm';
import { Session } from '@auth/qwik';
import { testVote } from '~/util/serverlist/actions';
import { Notification, NotificationContext } from '~/util/Notification';

export const useEditServer = routeLoader$(async (event) => {
  const db = getDB();
  const server = await db
    .select()
    .from(servers)
    .where(eq(servers.slug, event.params.slug))
    .get();
  if (!server) throw event.error(404, 'Server not found');

  const session = event.sharedMap.get('session') as Session | undefined;
  const canManage =
    checkAdmin(event) ||
    (!!session?.user?.id && session.user.id === server.ownerId);

  // Only owners/admins receive the row — it carries the Votifier token, and
  // loader payloads are readable regardless of what the page renders.
  return {
    server: canManage ? server : null,
    slug: event.params.slug,
    canManage,
  };
});

export default component$(() => {
  const { server, slug, canManage } = useEditServer().value;
  const notifications = useContext(NotificationContext);
  const testing = useSignal(false);

  const handleTestVote = $(async () => {
    if (!server) return;
    testing.value = true;
    const result = await testVote(server.id);
    testing.value = false;

    if (result.success) {
      notifications.push(
        new Notification()
          .setTitle('Test vote delivered!')
          .setDescription(
            'NuVotifier accepted the packet. Check your server console for the vote event.'
          )
          .setBgColor('lum-grad-bg-green/50')
          .toJSON()
      );
    } else {
      notifications.push(
        new Notification()
          .setTitle('Test vote failed')
          .setDescription(result.error ?? 'Unknown error.')
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true)
          .toJSON()
      );
    }
  });

  return (
    <section class="relative mx-auto flex min-h-svh w-full justify-center gap-8 px-6 pt-20">
      <div class="min-h-15 max-w-6xl">
        <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
          <Pencil size={32} />
          Edit {server ? server.name : 'server'}
        </h1>
        <Link
          href={`/serverlist/${slug}`}
          class="text-lum-text-secondary hover:text-lum-accent mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={16} /> Back to listing
        </Link>

        {canManage && server ? (
          <>
            <ServerForm mode="edit" initial={server} />

            {/* Votifier test section */}
            <div class="lum-card lum-bg-lum-input-bg/30 mt-6 flex flex-col gap-3">
              <h2 class="flex items-center gap-2 text-base font-semibold">
                <SendHorizonal size={18} /> Test Votifier Connection
              </h2>
              <p class="text-lum-text-secondary text-sm">
                Sends a real Votifier v2 packet to your configured host / port
                using your saved token. Your in-game vote reward should trigger.
                Save your listing first if you just updated the Votifier
                settings.
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  id="test-vote-btn"
                  class="lum-btn lum-bg-lum-input-bg/60 hover:lum-bg-lum-input-bg lum-btn-p-1 flex items-center gap-2 text-sm disabled:opacity-50"
                  disabled={
                    testing.value ||
                    !server.votifierHost ||
                    !server.votifierToken
                  }
                  onClick$={handleTestVote}
                >
                  <SendHorizonal size={14} />
                  {testing.value ? 'Sending…' : 'Send test vote'}
                </button>
                {(!server.votifierHost || !server.votifierToken) && (
                  <span class="text-lum-text-secondary flex items-center gap-1 text-xs">
                    <CircleX size={13} class="text-red-400" />
                    Fill in Votifier host and token above first
                  </span>
                )}
                {server.votifierHost && server.votifierToken && (
                  <span class="text-lum-text-secondary flex items-center gap-1 text-xs">
                    <CheckCircle size={13} class="text-green-400" />
                    Votifier configured — ready to test
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <p class="lum-card lum-bg-red/20 flex items-center gap-2">
            <ShieldAlert size={20} class="text-red-400" />
            You don't have permission to edit this listing.
          </p>
        )}
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Edit server - Birdflop Server List',
});
