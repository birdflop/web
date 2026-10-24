/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for Cloudflare Pages when building for production.
 *
 * Learn more about the Cloudflare Pages integration here:
 * - https://qwik.dev/docs/deployments/cloudflare-pages/
 *
 * Besides the Qwik `fetch` handler it also exports the Worker `scheduled`
 * handler behind the cron trigger in wrangler.jsonc (both are re-exported by
 * public/_worker.js, which overrides the adapter's generated stub).
 */
import {
  createQwikRouter,
  type PlatformCloudflarePages,
} from '@qwik.dev/router/middleware/cloudflare-pages';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../drizzle/schema';
import { pollServersPulseLinks } from './util/serverlist/serverspulse';
import { refreshStoredStatuses } from './util/serverlist/status';
import render from './entry.ssr';

declare global {
  type QwikRouterPlatform = PlatformCloudflarePages;
}

const fetch = createQwikRouter({ render });

// Cron (every minute, wrangler.jsonc `triggers.crons`):
// - refresh the cached ServersPulse payloads, and
// - ping a small batch of the stalest server-list listings into the
//   `serverStatus` table (list pages filter/sort on it instead of pinging).
// Page loaders only read our database and never block on — or get taken
// down by — upstream servers or APIs.
const scheduled = async (
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
) => {
  const db = drizzle(env.DB, { schema });
  const [pulse, status] = await Promise.allSettled([
    pollServersPulseLinks(db),
    // ServersPulse holds one connection; keep the total within Workers'
    // ~6 simultaneous outbound connections.
    refreshStoredStatuses(db, { concurrency: 5 }),
  ]);
  if (pulse.status === 'rejected')
    console.error('ServersPulse poll run failed:', pulse.reason);
  if (status.status === 'rejected')
    console.error('Server status refresh failed:', status.reason);
};

export { fetch, scheduled };
