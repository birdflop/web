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
import { pollServersPulseLinks } from './util/serverlist/serverspulse';
import render from './entry.ssr';

declare global {
  type QwikRouterPlatform = PlatformCloudflarePages;
}

const fetch = createQwikRouter({ render });

// Cron (every minute, wrangler.jsonc `triggers.crons`): refresh the cached
// ServersPulse payloads so page loaders only ever read our database and
// never block on — or get taken down by — the ServersPulse API.
const scheduled = async (
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
) => {
  try {
    await pollServersPulseLinks(drizzle(env.DB));
  } catch (err) {
    console.error('ServersPulse poll run failed:', err);
  }
};

export { fetch, scheduled };
