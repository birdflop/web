// Fetches the current user's own Server List listings, enriched with live status.
//
// Kept out of actions.ts on purpose: this pulls in getServerStatus -> @birdflop/mc-status,
// whose bedrock protocol module references Node's Buffer at module scope. actions.ts is
// imported directly by client-side closures (e.g. updateServerPlugins in useTask$), and since
// getUserServersData isn't itself a $()-wrapped boundary, Qwik's optimizer can't segment it
// away from actions.ts's client chunk - it would drag @birdflop/mc-status into the browser
// and crash on load with "ReferenceError: Buffer is not defined".

import { eq } from 'drizzle-orm';
import { getDB, servers } from '~/util/db';
import { getServerStatus } from './status';
import { Session } from '@auth/qwik';
import type { RequestEventBase } from '@qwik.dev/router';

export async function getUserServersData(
  sharedMap: RequestEventBase['sharedMap']
) {
  const session = sharedMap.get('session') as Session | undefined;
  const db = getDB();
  if (!session?.user?.id || !db) return [];

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
    .where(eq(servers.ownerId, session.user.id))
    .all();

  return await Promise.all(
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
        try {
          const status = await getServerStatus({
            edition,
            javaHost,
            javaPort,
            bedrockHost,
            bedrockPort,
          });
          icon = status?.icon ?? null;
        } catch {
          icon = null;
        }
        return { ...rest, icon };
      }
    )
  );
}
