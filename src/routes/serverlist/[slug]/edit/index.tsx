import { component$ } from '@qwik.dev/core';
import { routeLoader$, Link } from '@qwik.dev/router';
import { eq } from 'drizzle-orm';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import ArrowLeft from 'lucide-icons-qwik/icons/ArrowLeft';
import ShieldAlert from 'lucide-icons-qwik/icons/ShieldAlert';
import { generateHead } from '~/root';
import { getDB, servers } from '~/util/db';
import { checkAdmin } from '~/routes/layout';
import ServerForm from '~/components/ServerList/ServerForm';

export const useEditServer = routeLoader$(async (event) => {
  const db = getDB();
  const server = await db
    .select()
    .from(servers)
    .where(eq(servers.slug, event.params.slug))
    .get();
  if (!server) throw event.error(404, 'Server not found');

  const session = event.sharedMap.get('session');
  const canManage =
    checkAdmin(event) ||
    (!!session?.user?.id && session.user.id === server.ownerId);

  return { server, canManage };
});

export default component$(() => {
  const { server, canManage } = useEditServer().value;

  return (
    <section class="mx-auto flex min-h-svh max-w-3xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Pencil size={32} />
        Edit {server.name}
      </h1>
      <Link
        href={`/serverlist/${server.slug}`}
        class="text-lum-text-secondary hover:text-lum-accent mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft size={16} /> Back to listing
      </Link>

      {canManage ? (
        <ServerForm mode="edit" initial={server} />
      ) : (
        <p class="lum-card lum-bg-red/20 flex items-center gap-2">
          <ShieldAlert size={20} class="text-red-400" />
          You don't have permission to edit this listing.
        </p>
      )}
    </section>
  );
});

export const head = generateHead({
  title: 'Edit server - Birdflop Server List',
});
