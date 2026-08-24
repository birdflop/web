// Live status fetching via @birdflop/mc-status (direct socket ping with in-memory caching).

import {
  pingJava,
  pingBedrock,
  type ServerMotd,
  type ServerStatus,
} from '@birdflop/mc-status';
import type { Server } from '~/util/db';

export type { ServerMotd, ServerStatus };

const STATUS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface CachedStatus {
  timestamp: number;
  status: ServerStatus;
}

const statusCache = new Map<string, CachedStatus>();

function getCacheKey(
  edition: 'java' | 'bedrock',
  host: string,
  port: number | null
): string {
  const defaultPort = edition === 'java' ? 25565 : 19132;
  return `${edition}:${host.toLowerCase()}:${port ?? defaultPort}`;
}

export function clearStatusCache(): void {
  statusCache.clear();
}

export async function fetchStatus(
  edition: 'java' | 'bedrock',
  host: string,
  port: number | null = null
): Promise<ServerStatus> {
  const cacheKey = getCacheKey(edition, host, port);
  const now = Date.now();
  const cached = statusCache.get(cacheKey);

  if (cached && now - cached.timestamp < STATUS_CACHE_TTL_MS) {
    return cached.status;
  }

  const fallback: ServerStatus = {
    online: false,
    players: { online: 0, max: 0 },
    version: null,
    motd: null,
    icon: null,
    edition,
    host,
    port,
  };

  try {
    const portNum = port ?? (edition === 'java' ? 25565 : 19132);
    const result =
      edition === 'java'
        ? await pingJava(host, portNum, { timeout: 4000 })
        : await pingBedrock(host, portNum, { timeout: 4000 });

    if (!result.online) {
      statusCache.set(cacheKey, { timestamp: now, status: fallback });
      return fallback;
    }

    const status: ServerStatus = {
      online: true,
      players: {
        online: result.players.online,
        max: result.players.max,
      },
      version: result.version.name || null,
      motd: result.motd
        ? {
            raw: result.motd.raw,
            clean: result.motd.clean,
            html: result.motd.html,
          }
        : null,
      icon: result.edition === 'java' ? result.favicon : null,
      edition,
      host,
      port,
    };

    statusCache.set(cacheKey, { timestamp: now, status });
    return status;
  } catch {
    statusCache.set(cacheKey, { timestamp: now, status: fallback });
    return fallback;
  }
}

/**
 * Resolve the live status for a stored server using @birdflop/mc-status.
 * For "both" listings we ping Java first and fall back to Bedrock.
 */
export async function getServerStatus(
  server: Pick<
    Server,
    'edition' | 'javaHost' | 'javaPort' | 'bedrockHost' | 'bedrockPort'
  >
): Promise<ServerStatus | null> {
  const wantsJava = server.edition === 'java' || server.edition === 'both';
  const wantsBedrock =
    server.edition === 'bedrock' || server.edition === 'both';

  if (wantsJava && server.javaHost) {
    const status = await fetchStatus(
      'java',
      server.javaHost,
      server.javaPort ?? null
    );
    if (status.online || !wantsBedrock || !server.bedrockHost) return status;
  }

  if (wantsBedrock && server.bedrockHost) {
    return fetchStatus(
      'bedrock',
      server.bedrockHost,
      server.bedrockPort ?? null
    );
  }

  return null;
}
