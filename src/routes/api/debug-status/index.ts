// TEMPORARY debug route to isolate whether getServerStatus behaves
// differently when called via plain HTTP vs. a server$ RPC call.
// Remove after diagnosing the plugin-updater tab icon issue.
import type { RequestHandler } from '@qwik.dev/router';
import { getDB, servers } from '~/util/db';
import { eq } from 'drizzle-orm';
import { getServerStatus } from '~/util/serverlist/status';

export const onGet: RequestHandler = async ({ json, query }) => {
  const ownerId = query.get('ownerId');
  if (ownerId) {
    const db = getDB();
    const userServers = await db
      .select({
        id: servers.id,
        name: servers.name,
        slug: servers.slug,
        plugins: servers.plugins,
        edition: servers.edition,
        javaHost: servers.javaHost,
        javaPort: servers.javaPort,
        bedrockHost: servers.bedrockHost,
        bedrockPort: servers.bedrockPort,
      })
      .from(servers)
      .where(eq(servers.ownerId, ownerId))
      .all();

    const withIcons = await Promise.all(
      userServers.map(
        async ({
          edition,
          javaHost,
          javaPort,
          bedrockHost,
          bedrockPort,
          ...rest
        }) => {
          let icon: string | null = null;
          let innerError: string | null = null;
          try {
            const status = await getServerStatus({
              edition,
              javaHost,
              javaPort,
              bedrockHost,
              bedrockPort,
            });
            icon = status?.icon ?? null;
          } catch (e) {
            innerError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
          }
          return { ...rest, iconLength: icon?.length ?? 0, innerError };
        }
      )
    );

    throw json(200, { via: 'inline-replica-of-getUserServers', ownerId, withIcons });
  }

  const id = Number(query.get('id') ?? '1');
  const db = getDB();
  const server = await db
    .select({
      id: servers.id,
      name: servers.name,
      edition: servers.edition,
      javaHost: servers.javaHost,
      javaPort: servers.javaPort,
      bedrockHost: servers.bedrockHost,
      bedrockPort: servers.bedrockPort,
    })
    .from(servers)
    .where(eq(servers.id, id))
    .get();

  if (!server) throw json(404, { error: 'not found' });

  const start = Date.now();
  let status;
  let error: string | null = null;
  try {
    status = await getServerStatus(server);
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }
  const elapsedMs = Date.now() - start;

  throw json(200, {
    server,
    elapsedMs,
    error,
    online: status?.online ?? null,
    hasIcon: !!status?.icon,
    iconLength: status?.icon?.length ?? 0,
  });
};
