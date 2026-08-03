// Worker entry used by wrangler (main: ./dist/_worker.js). This file is
// copied from public/ into dist/ by the client build, which makes the
// cloudflare-pages adapter skip generating its default stub (it only writes
// dist/_worker.js when the file doesn't already exist) — the default stub
// exports only `fetch`, and we also need the `scheduled` cron handler that
// polls ServersPulse (see src/entry.cloudflare-pages.tsx).
import { fetch, scheduled } from '../server/entry.cloudflare-pages';
export default { fetch, scheduled };
