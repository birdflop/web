// Auto-detection of Birdflop-hosted listings.
//
// Instead of hardcoding node IPs (which would rot and expose dedicated IPs in
// the repo), the authoritative set is pulled from the Pterodactyl panel's
// Application API (node FQDNs + allocation IPs/aliases) and cached in D1.
// Submitted hosts are resolved server-side over DNS-over-HTTPS and compared
// against that set; only the resulting boolean ever reaches clients.
//
// Config:
//   PANEL_API_KEY - Pterodactyl Application API key (Workers secret). When
//                   unset, detection is disabled and stored badge values are
//                   left untouched (local/dev-friendly, like Turnstile).
//   PANEL_URL     - Panel base URL. Defaults to https://panel.birdflop.com.

import { eq } from 'drizzle-orm';
import {
  birdflopIpCache,
  servers,
  type AppDatabase,
  type Server,
} from '~/util/db';

const DEFAULT_PANEL_URL = 'https://panel.birdflop.com';
const DOH_URL = 'https://cloudflare-dns.com/dns-query';

// Node/allocation churn is rare; refresh the panel IP set at most every 6h.
const IP_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// Listings are lazily re-verified (on detail views) at most once per day so
// the badge follows a server that migrates on or off Birdflop.
const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface EnvGetter {
  get(key: string): string | undefined;
}

// ---------- DNS resolution (Workers have no raw DNS; use Cloudflare DoH) ----

const DNS_TYPE = { A: 1, AAAA: 28, SRV: 33 } as const;

interface DohAnswer {
  type: number;
  data: string;
}

async function dohQuery(
  name: string,
  type: keyof typeof DNS_TYPE
): Promise<DohAnswer[]> {
  try {
    const res = await fetch(
      `${DOH_URL}?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { accept: 'application/dns-json' } }
    );
    if (!res.ok) return [];
    const body: { Answer?: DohAnswer[] } = await res.json();
    return (body.Answer ?? []).filter((a) => a.type === DNS_TYPE[type]);
  } catch (err) {
    console.error(`DoH ${type} lookup failed for ${name}:`, err);
    return [];
  }
}

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function isIpLiteral(value: string): boolean {
  return IPV4_RE.test(value) || value.includes(':');
}

// Private/reserved addresses never identify a Birdflop machine to the public
// internet, so they are excluded from the matching set.
function isPublicIp(ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase();
    return !(
      v6 === '::' ||
      v6 === '::1' ||
      v6.startsWith('fe80') ||
      v6.startsWith('fc') ||
      v6.startsWith('fd')
    );
  }
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o > 255))
    return false;
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  return true;
}

async function resolveAddressRecords(name: string): Promise<string[]> {
  const [a, aaaa] = await Promise.all([
    dohQuery(name, 'A'),
    dohQuery(name, 'AAAA'),
  ]);
  return [...a, ...aaaa].map((r) => r.data.toLowerCase());
}

/**
 * Resolve a listing host to the IPs a client would actually connect to.
 * Java hosts also honor the `_minecraft._tcp` SRV record.
 */
async function resolveHostIps(
  host: string,
  javaSrv: boolean
): Promise<string[]> {
  if (isIpLiteral(host)) return [host.toLowerCase()];

  const ips = new Set(await resolveAddressRecords(host));
  if (javaSrv) {
    const srv = await dohQuery(`_minecraft._tcp.${host}`, 'SRV');
    // SRV rdata is "priority weight port target."
    const targets = new Set(
      srv
        .map((r) => r.data.trim().split(/\s+/)[3]?.replace(/\.$/, ''))
        .filter((t): t is string => !!t)
    );
    const resolved = await Promise.all(
      [...targets].map((t) => resolveAddressRecords(t))
    );
    for (const list of resolved) for (const ip of list) ips.add(ip);
  }
  return [...ips];
}

// ---------- Panel API -> public node IP set ----------

interface PanelNodesPage {
  data?: {
    attributes?: {
      fqdn?: string;
      relationships?: {
        allocations?: {
          data?: { attributes?: { ip?: string; alias?: string | null } }[];
        };
      };
    };
  }[];
  meta?: { pagination?: { total_pages?: number } };
}

/**
 * Pull every public node/allocation IP from the panel. Returns null on any
 * API failure so callers can fall back to the last cached set.
 */
async function fetchPanelIps(
  panelUrl: string,
  apiKey: string
): Promise<string[] | null> {
  const ips = new Set<string>();
  const hostnames = new Set<string>();

  const collect = (value: string | null | undefined) => {
    const v = value?.trim().toLowerCase();
    if (!v) return;
    if (isIpLiteral(v)) {
      if (isPublicIp(v)) ips.add(v);
    } else {
      hostnames.add(v);
    }
  };

  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(
      `${panelUrl.replace(/\/+$/, '')}/api/application/nodes?include=allocations&per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      }
    );
    if (!res.ok) {
      console.error(`Panel nodes request failed (${res.status})`);
      return null;
    }
    const body: PanelNodesPage = await res.json();
    for (const node of body.data ?? []) {
      collect(node.attributes?.fqdn);
      for (const alloc of node.attributes?.relationships?.allocations?.data ??
        []) {
        collect(alloc.attributes?.ip);
        collect(alloc.attributes?.alias);
      }
    }
    totalPages = body.meta?.pagination?.total_pages ?? 1;
    page += 1;
  }

  // Node FQDNs and hostname aliases resolve to public IPs too.
  const resolved = await Promise.all(
    [...hostnames].map((h) => resolveAddressRecords(h))
  );
  for (const list of resolved)
    for (const ip of list) if (isPublicIp(ip)) ips.add(ip);

  return [...ips];
}

async function getBirdflopIps(
  db: AppDatabase,
  apiKey: string,
  panelUrl: string
): Promise<Set<string> | null> {
  const cached = await db
    .select()
    .from(birdflopIpCache)
    .where(eq(birdflopIpCache.id, 1))
    .get();
  if (cached && Date.now() - cached.fetchedAt.getTime() < IP_CACHE_TTL_MS)
    return new Set(cached.ips);

  let fetched: string[] | null = null;
  try {
    fetched = await fetchPanelIps(panelUrl, apiKey);
  } catch (err) {
    console.error('Failed to fetch panel IPs:', err);
  }
  // Panel unreachable (or implausibly empty) -> serve the stale set rather
  // than flapping badges off and on.
  if (!fetched || fetched.length === 0)
    return cached ? new Set(cached.ips) : null;

  await db
    .insert(birdflopIpCache)
    .values({ id: 1, ips: fetched, fetchedAt: new Date() })
    .onConflictDoUpdate({
      target: birdflopIpCache.id,
      set: { ips: fetched, fetchedAt: new Date() },
    });
  return new Set(fetched);
}

// ---------- Detection ----------

/**
 * Determine whether a listing's address(es) point at a Birdflop machine.
 * Returns null when detection is unavailable (no API key, panel/DNS failure)
 * so callers keep the previous value instead of clearing the badge.
 */
export async function detectBirdflopHosted(
  db: AppDatabase,
  env: EnvGetter,
  server: Pick<Server, 'edition' | 'javaHost' | 'bedrockHost'>
): Promise<boolean | null> {
  const apiKey = env.get('PANEL_API_KEY');
  if (!apiKey) return null;

  try {
    const birdflopIps = await getBirdflopIps(
      db,
      apiKey,
      env.get('PANEL_URL') || DEFAULT_PANEL_URL
    );
    if (!birdflopIps || birdflopIps.size === 0) return null;

    const lookups: Promise<string[]>[] = [];
    if (server.edition !== 'bedrock' && server.javaHost)
      lookups.push(resolveHostIps(server.javaHost, true));
    if (server.edition !== 'java' && server.bedrockHost)
      lookups.push(resolveHostIps(server.bedrockHost, false));

    const resolved = (await Promise.all(lookups)).flat();
    // Nothing resolved -> unknown (DNS hiccup or dead host), keep as-is.
    if (resolved.length === 0) return null;
    return resolved.some((ip) => birdflopIps.has(ip));
  } catch (err) {
    console.error('Birdflop host detection failed:', err);
    return null;
  }
}

export function birdflopCheckIsStale(
  server: Pick<Server, 'birdflopCheckedAt'>
): boolean {
  return (
    !server.birdflopCheckedAt ||
    Date.now() - server.birdflopCheckedAt.getTime() > RECHECK_INTERVAL_MS
  );
}

/**
 * Re-verify a stored listing and persist the result (used lazily on detail
 * views — no cron needed). Never throws; returns the value to render.
 */
export async function refreshBirdflopHosted(
  db: AppDatabase,
  env: EnvGetter,
  server: Server
): Promise<boolean> {
  const detected = await detectBirdflopHosted(db, env, server);
  if (detected === null) return server.birdflopHosted;
  try {
    await db
      .update(servers)
      .set({ birdflopHosted: detected, birdflopCheckedAt: new Date() })
      .where(eq(servers.id, server.id));
  } catch (err) {
    console.error('Failed to persist Birdflop badge refresh:', err);
  }
  return detected;
}
