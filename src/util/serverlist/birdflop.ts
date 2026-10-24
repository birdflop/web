// Auto-detection of Birdflop-hosted listings.
//
// Instead of hardcoding node IPs (which would rot and expose dedicated IPs in
// the repo), the authoritative set is pulled from the Pterodactyl panel's
// Application API and cached in D1: every ASSIGNED allocation as an ip:port
// endpoint (allocation IP/alias, or the node FQDN's IPs when the allocation
// is bound to a private/wildcard IP). Submitted hosts are resolved
// server-side over DNS-over-HTTPS and their ip:port compared against that
// set; only the resulting boolean ever reaches clients.
//
// Matching on ip:port (not just ip) means pointing a listing at a Birdflop
// node's IP isn't enough; the port must be a server allocation actually in
// use. It does not prove the listing owner owns that server: node
// allocations carry no server/user link, so tying the badge to the owner
// would need the servers endpoint plus a reliable panel-user <-> site-user
// mapping, which we don't have.
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
import { DEFAULT_BEDROCK_PORT, DEFAULT_JAVA_PORT } from './constants';

const DEFAULT_PANEL_URL = 'https://panel.birdflop.com';
const DOH_URL = 'https://cloudflare-dns.com/dns-query';

// Node/allocation churn is rare; refresh the panel IP set at most every 6h.
const IP_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// Listings are lazily re-verified (on detail views) at most once per day so
// the badge follows a server that migrates on or off Birdflop.
const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Cache entries are "ip|port". The separator can't appear in an IPv4/IPv6
// literal, and its absence identifies a cache row from the old IP-only
// format, which is treated as stale.
const endpointKey = (ip: string, port: number) => `${ip.toLowerCase()}|${port}`;
const isEndpointKey = (value: string) => /^[^|]+\|\d{1,5}$/.test(value);

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

async function resolveHost(host: string): Promise<string[]> {
  return isIpLiteral(host)
    ? [host.toLowerCase()]
    : await resolveAddressRecords(host);
}

/**
 * Resolve a listing host:port to the ip:port endpoints a client would
 * actually connect to. Java hosts also honor the `_minecraft._tcp` SRV record
 * (target and port).
 */
async function resolveHostEndpoints(
  host: string,
  port: number,
  javaSrv: boolean
): Promise<string[]> {
  const endpoints = new Set(
    (await resolveHost(host)).map((ip) => endpointKey(ip, port))
  );
  if (javaSrv && !isIpLiteral(host)) {
    const srv = await dohQuery(`_minecraft._tcp.${host}`, 'SRV');
    // SRV rdata is "priority weight port target."
    const targets = srv
      .map((r) => r.data.trim().split(/\s+/))
      .map(([, , srvPort, target]) => ({
        port: Number(srvPort),
        target: target?.replace(/\.$/, ''),
      }))
      .filter(
        (t): t is { port: number; target: string } =>
          !!t.target && Number.isInteger(t.port) && t.port > 0
      );
    const resolved = await Promise.all(
      targets.map(async (t) => ({
        port: t.port,
        ips: await resolveAddressRecords(t.target),
      }))
    );
    for (const { port: srvPort, ips } of resolved)
      for (const ip of ips) endpoints.add(endpointKey(ip, srvPort));
  }
  return [...endpoints];
}

// ---------- Panel API -> public node IP set ----------

interface PanelNodesPage {
  data?: {
    attributes?: {
      fqdn?: string;
      relationships?: {
        allocations?: {
          data?: {
            attributes?: {
              ip?: string;
              alias?: string | null;
              port?: number;
              assigned?: boolean;
            };
          }[];
        };
      };
    };
  }[];
  meta?: { pagination?: { total_pages?: number } };
}

/**
 * Pull every assigned allocation from the panel as public ip:port endpoint
 * keys. Returns null on any API failure so callers can fall back to the last
 * cached set.
 */
async function fetchPanelEndpoints(
  panelUrl: string,
  apiKey: string
): Promise<string[] | null> {
  // Each host (IP literal or hostname) maps to the ports assigned on it;
  // hostnames are resolved once at the end.
  const hostPorts = new Map<string, Set<number>>();
  const add = (host: string | null | undefined, port: number) => {
    const h = host?.trim().toLowerCase();
    if (!h || (isIpLiteral(h) && !isPublicIp(h))) return false;
    let ports = hostPorts.get(h);
    if (!ports) hostPorts.set(h, (ports = new Set()));
    ports.add(port);
    return true;
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
      for (const alloc of node.attributes?.relationships?.allocations?.data ??
        []) {
        const { ip, alias, port, assigned } = alloc.attributes ?? {};
        // Unassigned allocations aren't running anything, so a listing
        // pointing at one proves nothing.
        if (!assigned || !Number.isInteger(port)) continue;
        const reachable = [add(ip, port!), add(alias, port!)].some(Boolean);
        // Bound to a private/wildcard IP with no public alias: players reach
        // it through the node's own FQDN.
        if (!reachable) add(node.attributes?.fqdn, port!);
      }
    }
    totalPages = body.meta?.pagination?.total_pages ?? 1;
    page += 1;
  }

  const endpoints = new Set<string>();
  await Promise.all(
    [...hostPorts].map(async ([host, ports]) => {
      for (const ip of await resolveHost(host))
        if (isPublicIp(ip))
          for (const port of ports) endpoints.add(endpointKey(ip, port));
    })
  );
  return [...endpoints];
}

async function getBirdflopEndpoints(
  db: AppDatabase,
  apiKey: string,
  panelUrl: string
): Promise<Set<string> | null> {
  const row = await db
    .select()
    .from(birdflopIpCache)
    .where(eq(birdflopIpCache.id, 1))
    .get();
  // A row from the old IP-only format can't be matched against ports.
  const cached =
    row && row.ips.length > 0 && row.ips.every(isEndpointKey) ? row : null;
  if (cached && Date.now() - cached.fetchedAt.getTime() < IP_CACHE_TTL_MS)
    return new Set(cached.ips);

  let fetched: string[] | null = null;
  try {
    fetched = await fetchPanelEndpoints(panelUrl, apiKey);
  } catch (err) {
    console.error('Failed to fetch panel allocations:', err);
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
 * Determine whether a listing's address(es) point at an assigned Birdflop
 * allocation (ip:port). Returns null when detection is unavailable (no API
 * key, panel/DNS failure) so callers keep the previous value instead of
 * clearing the badge.
 */
export async function detectBirdflopHosted(
  db: AppDatabase,
  env: EnvGetter,
  server: Pick<
    Server,
    'edition' | 'javaHost' | 'javaPort' | 'bedrockHost' | 'bedrockPort'
  >
): Promise<boolean | null> {
  const apiKey = env.get('PANEL_API_KEY');
  if (!apiKey) return null;

  try {
    const birdflopEndpoints = await getBirdflopEndpoints(
      db,
      apiKey,
      env.get('PANEL_URL') || DEFAULT_PANEL_URL
    );
    if (!birdflopEndpoints || birdflopEndpoints.size === 0) return null;

    const lookups: Promise<string[]>[] = [];
    if (server.edition !== 'bedrock' && server.javaHost)
      lookups.push(
        resolveHostEndpoints(
          server.javaHost,
          server.javaPort ?? DEFAULT_JAVA_PORT,
          true
        )
      );
    if (server.edition !== 'java' && server.bedrockHost)
      lookups.push(
        resolveHostEndpoints(
          server.bedrockHost,
          server.bedrockPort ?? DEFAULT_BEDROCK_PORT,
          false
        )
      );

    const resolved = (await Promise.all(lookups)).flat();
    // Nothing resolved -> unknown (DNS hiccup or dead host), keep as-is.
    if (resolved.length === 0) return null;
    return resolved.some((endpoint) => birdflopEndpoints.has(endpoint));
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
  try {
    // The check time is recorded even when detection was inconclusive
    // (null keeps the stored badge), otherwise every public view of the
    // listing would retry the panel API and DoH lookups.
    await db
      .update(servers)
      .set({
        ...(detected === null ? {} : { birdflopHosted: detected }),
        birdflopCheckedAt: new Date(),
      })
      .where(eq(servers.id, server.id));
  } catch (err) {
    console.error('Failed to persist Birdflop badge refresh:', err);
  }
  return detected ?? server.birdflopHosted;
}
