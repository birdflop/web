import { component$ } from '@qwik.dev/core';
import { routeLoader$, Link } from '@qwik.dev/router';
import { eq } from 'drizzle-orm';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import ArrowLeft from 'lucide-icons-qwik/icons/ArrowLeft';
import ShieldAlert from 'lucide-icons-qwik/icons/ShieldAlert';
import { generateHead } from '~/root';
import { getDB, servers, serverspulseLinks } from '~/util/db';
import { checkAdmin } from '~/routes/layout';
import ServerForm from '~/components/ServerList/ServerForm';
import ServersPulseLinkPanel from '~/components/ServerList/ServersPulseLinkPanel';
import { Session } from '@auth/qwik';

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

  const spLink = canManage
    ? await db
        .select({
          slug: serverspulseLinks.slug,
          verificationToken: serverspulseLinks.verificationToken,
          verifiedAt: serverspulseLinks.verifiedAt,
        })
        .from(serverspulseLinks)
        .where(eq(serverspulseLinks.serverId, server.id))
        .get()
    : undefined;

  // Only owners/admins receive the row — it carries the Votifier token, and
  // loader payloads are readable regardless of what the page renders.
  return {
    server: canManage ? server : null,
    serverspulse:
      canManage && spLink
        ? {
            slug: spLink.slug,
            token: spLink.verificationToken,
            verified: !!spLink.verifiedAt,
          }
        : null,
    slug: event.params.slug,
    canManage,
  };
});

export default component$(() => {
  const { server, serverspulse, slug, canManage } = useEditServer().value;

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
          <ArrowLeft size={16} />
          Back to listing
        </Link>

        {canManage && server ? (
          <>
            <ServerForm mode="edit" initial={server} />

            <ServersPulseLinkPanel
              serverId={server.id}
              initial={serverspulse}
            />
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
