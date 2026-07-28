// On-demand live status fetching via mcstatus.io, with short edge caching.
//
// We deliberately avoid a background cron: ranking is derived from the votes
// table (see queries.ts) and status is only needed when a listing is actually
// rendered. Cloudflare's fetch cache (cf.cacheTtl) keeps us well within
// mcstatus.io rate limits even under load.

import type { Server } from '~/util/db';

const API_BASE = 'https://api.mcstatus.io/v2/status';
const CACHE_TTL_SECONDS = 120;

export interface ServerStatus {
  online: boolean;
  players: { online: number; max: number };
  version: string | null;
  motd: string | null;
  icon: string | null;
  // Which edition this status reflect (a "both" server is pinged as Java first).
  edition: 'java' | 'bedrock';
  host: string;
  port: number | null;
}

interface McStatusResponse {
  online: boolean;
  host?: string;
  port?: number;
  players?: { online?: number; max?: number } | null;
  version?: { name_clean?: string; name?: string } | null;
  motd?: { clean?: string } | null;
  icon?: string | null;
}

function buildAddress(host: string, port: number | null): string {
  return port ? `${host}:${port}` : host;
}

async function fetchStatus(
  edition: 'java' | 'bedrock',
  host: string,
  port: number | null,
): Promise<ServerStatus> {
  const url = `${API_BASE}/${edition}/${encodeURIComponent(buildAddress(host, port))}`;

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
    const res = await fetch(url, {
      headers: { 'User-Agent': 'birdflop.com server list' },
      // Cloudflare-specific edge caching so repeated views are cheap and we
      // stay friendly to mcstatus.io rate limits.
      cf: { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true },
    });

    if (!res.ok) return fallback;

    const data: McStatusResponse = await res.json();

    return {
      online: Boolean(data.online),
      players: {
        online: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
      },
      version: data.version?.name_clean ?? data.version?.name ?? null,
      motd: data.motd?.clean ?? null,
      icon: data.icon ?? null,
      edition,
      host,
      port,
    };
  } catch (err) {
    console.error(`Failed to fetch ${edition} status for ${host}:`, err);
    return fallback;
  }
}

/**
 * Resolve the live status for a stored server. For "both" listings we prefer
 * the Java endpoint (it returns a favicon/MOTD) and fall back to Bedrock.
 */
export async function getServerStatus(
  server: Pick<Server, 'edition' | 'javaHost' | 'javaPort' | 'bedrockHost' | 'bedrockPort'>,
): Promise<ServerStatus | null> {
  const wantsJava = server.edition === 'java' || server.edition === 'both';
  const wantsBedrock = server.edition === 'bedrock' || server.edition === 'both';

  if (wantsJava && server.javaHost) {
    const status = await fetchStatus('java', server.javaHost, server.javaPort ?? null);
    if (status.online || !wantsBedrock || !server.bedrockHost) return status;
  }

  if (wantsBedrock && server.bedrockHost) {
    return fetchStatus('bedrock', server.bedrockHost, server.bedrockPort ?? null);
  }

  return null;
}
