import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BATCH_REF_LIMIT,
  chunkRefs,
  claimServersPulseLink,
  diffMissingRefs,
  fetchServersPulseLinkState,
  isKnownServersPulseStatus,
  isValidServersPulseLinkCode,
  isValidServersPulseListingRef,
  normalizeServersPulseLinkCode,
  toPublicServersPulseStats,
  type ServersPulseListing,
} from '../serverspulse';
import type { ServersPulseLink } from '~/util/db';

function makeLink(overrides: Partial<ServersPulseLink> = {}): ServersPulseLink {
  const now = new Date();
  return {
    serverId: 1,
    listingRef: '6b1f'.repeat(8),
    linkToken: 'sptok_secret',
    consumerName: 'birdflop.com',
    slug: 'alpha-realm',
    linkStatus: 'active',
    linkedAt: now,
    lastCheckedAt: now,
    lastSuccessAt: now,
    lastStateCheckAt: null,
    lastPayload: makeListing(),
    lastError: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeListing(
  overrides: Partial<ServersPulseListing> = {}
): ServersPulseListing {
  return {
    slug: 'alpha-realm',
    ref: '6b1f'.repeat(8),
    name: 'Alpha Realm',
    description: 'A friendly survival server',
    // The owner opted in to publishing the address — it must STILL never
    // appear in the public projection on our side.
    address: 'play.alpharealm.net',
    ownerVerified: true,
    observed: {
      status: 'healthy',
      onlinePlayers: 42,
      maxPlayers: 100,
      lastCheckedAt: '2026-08-02T22:31:00Z',
      platform: 'Paper',
      mcVersion: '1.21.11',
      uptime7dPct: 99.82,
    },
    activity: {
      playersOverTime: {
        from: '2026-08-01T23:00:00Z',
        stepMinutes: 60,
        avg: [24, 28, null, 18],
        peak: [24, 29, null, 18],
      },
      hourlyAverageUtc: Array.from({ length: 24 }, (_, i) => i / 2),
      peakHourUtc: 19,
      profileDays: 28,
      coverageDays: 26.4,
    },
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ServersPulse link codes and refs', () => {
  it('accepts well-formed single-use link codes', () => {
    expect(isValidServersPulseLinkCode('splink_9f2c41a08b7d6e3f5a1c0b94')).toBe(
      true
    );
  });

  it('rejects malformed codes (a typed-in slug is never a claim)', () => {
    expect(isValidServersPulseLinkCode('hypixel')).toBe(false);
    expect(isValidServersPulseLinkCode('splink_')).toBe(false);
    expect(isValidServersPulseLinkCode('splink_9f2c41a08b7d6e3f5a1c0b9')).toBe(
      false
    ); // 23 hex
    expect(
      isValidServersPulseLinkCode('splink_9f2c41a08b7d6e3f5a1c0b944')
    ).toBe(false); // 25 hex
    expect(isValidServersPulseLinkCode('sptok_9f2c41a08b7d6e3f5a1c0b94')).toBe(
      false
    );
    expect(isValidServersPulseLinkCode('')).toBe(false);
  });

  it('normalizes pasted codes (whitespace, case)', () => {
    expect(
      normalizeServersPulseLinkCode('  SPLINK_9F2C41A08B7D6E3F5A1C0B94  ')
    ).toBe('splink_9f2c41a08b7d6e3f5a1c0b94');
  });

  it('validates 32-hex listing refs', () => {
    expect(isValidServersPulseListingRef('6b1f'.repeat(8))).toBe(true);
    expect(isValidServersPulseListingRef('6b1f'.repeat(8).toUpperCase())).toBe(
      false
    );
    expect(isValidServersPulseListingRef('6b1f')).toBe(false);
    expect(isValidServersPulseListingRef('alpha-realm')).toBe(false);
  });
});

describe('batch helpers', () => {
  it('chunks refs at the 48-ref API limit', () => {
    const refs = Array.from({ length: 100 }, (_, i) => `ref${i}`);
    const chunks = chunkRefs(refs);
    expect(chunks.map((c) => c.length)).toEqual([48, 48, 4]);
    expect(chunks.flat()).toEqual(refs);
    expect(BATCH_REF_LIMIT).toBe(48);
  });

  it('diffs requested refs against returned items', () => {
    const a = 'aa'.repeat(16);
    const b = 'bb'.repeat(16);
    const c = 'cc'.repeat(16);
    expect(diffMissingRefs([a, b, c], [{ ref: a }, { ref: c }])).toEqual([b]);
    expect(diffMissingRefs([a], [])).toEqual([a]);
    expect(diffMissingRefs([], [{ ref: a }])).toEqual([]);
  });
});

describe('claimServersPulseLink', () => {
  const CODE = 'splink_9f2c41a08b7d6e3f5a1c0b94';

  it('returns the claim on 201 and sends code + consumer', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse(201, {
          linkToken: 'sptok_abc',
          listingRef: '6b1f'.repeat(8),
          consumer: 'birdflop.com',
          status: 'active',
          listing: makeListing(),
        })
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await claimServersPulseLink(CODE, 'birdflop.com');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.claim.linkToken).toBe('sptok_abc');
      expect(result.claim.listingRef).toBe('6b1f'.repeat(8));
    }
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      'https://api.serverspulse.com/api/v1/discover/links/claim'
    );
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      code: CODE,
      consumer: 'birdflop.com',
    });
  });

  it.each([
    [404, /not found/i],
    [400, /expired/i],
    [409, /already been used/i],
    [422, /rejected/i],
  ])('maps HTTP %i to its own distinct message', async (status, pattern) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(status)))
    );
    const result = await claimServersPulseLink(CODE, 'birdflop.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(pattern);
  });

  it('produces four different messages for the four failure modes', async () => {
    const messages = new Set<string>();
    for (const status of [404, 400, 409, 422]) {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(jsonResponse(status)))
      );
      const result = await claimServersPulseLink(CODE, 'birdflop.com');
      if (!result.ok) messages.add(result.error);
    }
    expect(messages.size).toBe(4);
  });

  it('rejects a 201 with a malformed token/ref instead of storing garbage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(201, { linkToken: '', listingRef: 'not-a-ref' })
        )
      )
    );
    const result = await claimServersPulseLink(CODE, 'birdflop.com');
    expect(result.ok).toBe(false);
  });

  it('fails soft when ServersPulse is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down')))
    );
    const result = await claimServersPulseLink(CODE, 'birdflop.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/could not reach/i);
  });
});

describe('fetchServersPulseLinkState', () => {
  it('passes the token via X-Link-Token and returns the status', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(jsonResponse(200, { status: 'unpublished' }))
    );
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchServersPulseLinkState('sptok_abc');
    expect(result).toEqual({ ok: true, status: 'unpublished' });
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect((init.headers as Record<string, string>)['X-Link-Token']).toBe(
      'sptok_abc'
    );
  });

  it('treats a 401 (unknown token) as revoked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(401)))
    );
    expect(await fetchServersPulseLinkState('sptok_gone')).toEqual({
      ok: true,
      status: 'revoked',
    });
  });

  it('reports transport failures without inventing a status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('timeout')))
    );
    const result = await fetchServersPulseLinkState('sptok_abc');
    expect(result.ok).toBe(false);
  });
});

describe('status enum validation', () => {
  it('accepts baseline statuses without options', () => {
    expect(isKnownServersPulseStatus('healthy', null)).toBe(true);
    expect(isKnownServersPulseStatus('offline', null)).toBe(true);
  });

  it('accepts new statuses declared by /discover/options without a deploy', () => {
    expect(isKnownServersPulseStatus('maintenance', null)).toBe(false);
    expect(
      isKnownServersPulseStatus('maintenance', { statuses: ['maintenance'] })
    ).toBe(true);
  });
});

describe('toPublicServersPulseStats', () => {
  it('projects the cached payload without ever exposing the address', () => {
    const stats = toPublicServersPulseStats(makeLink());
    expect(stats).not.toBeNull();
    expect(stats!.status).toBe('healthy');
    expect(stats!.onlinePlayers).toBe(42);
    expect(stats!.uptime7dPct).toBe(99.82);
    expect(stats!.activity?.peakHourUtc).toBe(19);
    expect(JSON.stringify(stats)).not.toContain('play.alpharealm.net');
    expect('address' in (stats as object)).toBe(false);
  });

  it('never exposes the link token', () => {
    const stats = toPublicServersPulseStats(makeLink());
    expect(JSON.stringify(stats)).not.toContain('sptok');
  });

  it('returns null for unpublished and revoked links (not connected)', () => {
    expect(
      toPublicServersPulseStats(makeLink({ linkStatus: 'unpublished' }))
    ).toBe(null);
    expect(toPublicServersPulseStats(makeLink({ linkStatus: 'revoked' }))).toBe(
      null
    );
  });

  it('returns null for never-polled links', () => {
    expect(
      toPublicServersPulseStats(
        makeLink({ lastPayload: null, lastSuccessAt: null })
      )
    ).toBe(null);
  });

  it('returns null when the listing has never reported telemetry (e.g. Bedrock)', () => {
    expect(
      toPublicServersPulseStats(
        makeLink({
          lastPayload: makeListing({ observed: undefined, activity: null }),
        })
      )
    ).toBe(null);
  });

  it('hides payloads that have been stale for over a week', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(
      toPublicServersPulseStats(makeLink({ lastSuccessAt: eightDaysAgo }))
    ).toBe(null);
  });

  it('preserves null telemetry fields instead of substituting values', () => {
    const stats = toPublicServersPulseStats(
      makeLink({
        lastPayload: makeListing({
          observed: {
            status: 'offline',
            onlinePlayers: null,
            maxPlayers: null,
            lastCheckedAt: null,
            platform: null,
            mcVersion: null,
            uptime7dPct: null,
          },
          activity: null,
        }),
      })
    );
    expect(stats).not.toBeNull();
    expect(stats!.status).toBe('offline');
    expect(stats!.onlinePlayers).toBe(null);
    // null uptime means "not enough coverage" — never 0 or 100.
    expect(stats!.uptime7dPct).toBe(null);
    expect(stats!.activity).toBe(null);
  });

  it('keeps null activity points as null — a silent server is not an empty one', () => {
    const stats = toPublicServersPulseStats(makeLink());
    expect(stats!.activity?.playersOverTime?.avg).toEqual([24, 28, null, 18]);
  });

  it('passes through unknown status values for neutral rendering', () => {
    const stats = toPublicServersPulseStats(
      makeLink({
        lastPayload: makeListing({
          observed: { status: 'maintenance', onlinePlayers: 1 },
        }),
      })
    );
    expect(stats!.status).toBe('maintenance');
  });
});
