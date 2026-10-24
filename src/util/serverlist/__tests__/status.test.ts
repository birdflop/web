import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  STATUS_CACHE_MAX_ENTRIES,
  STORED_STATUS_MAX_AGE_MS,
  clearStatusCache,
  fetchBedrockStatus,
  fetchStatus,
  mapWithConcurrency,
  statusCacheSize,
  storedRowToStatus,
} from '../status';
import { escapeLike } from '../queries';
import type { StoredServerStatus } from '~/util/db';

afterEach(() => {
  vi.unstubAllGlobals();
  clearStatusCache();
});

function mockFetch(body: unknown, ok = true) {
  const fn = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), { status: ok ? 200 : 500 })
    )
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('Bedrock via mcstatus.io', () => {
  it('maps an online response to the ServerStatus shape', async () => {
    const fetchMock = mockFetch({
      online: true,
      version: { name: '1.21.50' },
      players: { online: 12, max: 100 },
      motd: { raw: '§aHive §lGames', clean: 'Hive Games' },
    });
    const status = await fetchBedrockStatus('geo.hivebedrock.network', 19133);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.mcstatus.io/v2/status/bedrock/geo.hivebedrock.network:19133',
      expect.anything()
    );
    expect(status).toMatchObject({
      online: true,
      edition: 'bedrock',
      players: { online: 12, max: 100 },
      version: '1.21.50',
      port: 19133,
    });
    expect(status.motd?.clean).toBe('Hive Games');
  });

  it('reports offline on an offline response or API failure', async () => {
    mockFetch({ online: false });
    expect((await fetchBedrockStatus('a.example', null)).online).toBe(false);
    mockFetch({}, false);
    expect((await fetchBedrockStatus('a.example', null)).online).toBe(false);
    vi.stubGlobal('fetch', () => Promise.reject(new Error('boom')));
    expect((await fetchBedrockStatus('a.example', null)).online).toBe(false);
  });
});

describe('live status cache', () => {
  it('is size-capped for arbitrary user-supplied hosts', async () => {
    mockFetch({ online: false });
    for (let i = 0; i < STATUS_CACHE_MAX_ENTRIES + 25; i++) {
      await fetchStatus('bedrock', `host${i}.example`);
    }
    expect(statusCacheSize()).toBe(STATUS_CACHE_MAX_ENTRIES);
  });

  it('serves repeated lookups from the cache', async () => {
    const fetchMock = mockFetch({ online: false });
    await fetchStatus('bedrock', 'same.example');
    await fetchStatus('bedrock', 'SAME.example');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('storedRowToStatus', () => {
  const row = (over: Partial<StoredServerStatus> = {}): StoredServerStatus => ({
    serverId: 1,
    online: true,
    players: 5,
    maxPlayers: 50,
    version: 'Paper 1.21',
    motd: '§#FF54A1§lHello',
    icon: null,
    edition: 'java',
    host: 'play.example.com',
    port: null,
    checkedAt: new Date(),
    ...over,
  });

  it('maps a fresh online row', () => {
    expect(storedRowToStatus(row())).toMatchObject({
      online: true,
      players: { online: 5, max: 50 },
      motd: { raw: '§#FF54A1§lHello', clean: 'Hello' },
    });
  });

  it('treats stale online rows as offline', () => {
    const stale = row({
      checkedAt: new Date(Date.now() - STORED_STATUS_MAX_AGE_MS - 1),
    });
    expect(storedRowToStatus(stale)?.online).toBe(false);
  });

  it('returns null for listings that were never polled', () => {
    expect(storedRowToStatus(undefined)).toBeNull();
  });
});

describe('mapWithConcurrency', () => {
  it('never runs more than the limit at once and keeps order', async () => {
    let active = 0;
    let peak = 0;
    const out = await mapWithConcurrency(
      Array.from({ length: 20 }, (_, i) => i),
      6,
      async (n) => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 1));
        active--;
        return n * 2;
      }
    );
    expect(peak).toBeLessThanOrEqual(6);
    expect(out).toEqual(Array.from({ length: 20 }, (_, i) => i * 2));
  });
});

describe('escapeLike', () => {
  it('escapes LIKE wildcards and the escape char', () => {
    expect(escapeLike('100%_off\\')).toBe('100\\%\\_off\\\\');
  });
});
