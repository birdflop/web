// TEMPORARY debug route to isolate whether getServerStatus behaves
// differently when called via plain HTTP vs. a server$ RPC call.
// Remove after diagnosing the plugin-updater tab icon issue.
import type { RequestHandler } from '@qwik.dev/router';
import { getDB, servers } from '~/util/db';
import { eq } from 'drizzle-orm';
import { getServerStatus } from '~/util/serverlist/status';
import { getUserServers } from '~/util/serverlist/actions';

export const onGet: RequestHandler = async ({ json, query }) => {
  const ownerId = query.get('ownerId');
  if (ownerId) {
    const fakeThis = { sharedMap: new Map([['session', { user: { id: ownerId } }]]) };
    let result: unknown;
    let callError: string | null = null;
    try {
      result = await getUserServers.call(fakeThis as never);
    } catch (e) {
      callError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
    throw json(200, { via: 'direct-call-of-getUserServers', result, callError });
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
