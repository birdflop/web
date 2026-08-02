import { describe, expect, it } from 'vitest';
import {
  generateVerificationToken,
  isValidServersPulseSlug,
  normalizeServersPulseSlug,
  tokenAppearsInListing,
  toPublicServersPulseStats,
  VERIFICATION_TOKEN_PREFIX,
  type ServersPulseListing,
} from '../serverspulse';
import type { ServersPulseLink } from '~/util/db';

function makeLink(overrides: Partial<ServersPulseLink> = {}): ServersPulseLink {
  const now = new Date();
  return {
    serverId: 1,
    slug: 'alpha-realm',
    verificationToken: null,
    verifiedAt: now,
    lastCheckedAt: now,
    lastSuccessAt: now,
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

describe('ServersPulse slug handling', () => {
  it('accepts valid Discover slugs', () => {
    expect(isValidServersPulseSlug('alpha-realm')).toBe(true);
    expect(isValidServersPulseSlug('a1')).toBe(true);
    expect(isValidServersPulseSlug('my-server-2')).toBe(true);
  });

  it('rejects malformed slugs the API would silently drop', () => {
    expect(isValidServersPulseSlug('Alpha-Realm')).toBe(false);
    expect(isValidServersPulseSlug('has space')).toBe(false);
    expect(isValidServersPulseSlug('under_score')).toBe(false);
    expect(isValidServersPulseSlug('a')).toBe(false);
    expect(isValidServersPulseSlug('')).toBe(false);
    expect(isValidServersPulseSlug('-leading')).toBe(false);
    expect(isValidServersPulseSlug('trailing-')).toBe(false);
    expect(isValidServersPulseSlug('a'.repeat(65))).toBe(false);
  });

  it('normalizes pasted URLs and mixed case to a slug candidate', () => {
    expect(
      normalizeServersPulseSlug('https://serverspulse.com/discover/Alpha-Realm')
    ).toBe('alpha-realm');
    expect(normalizeServersPulseSlug('  alpha-realm  ')).toBe('alpha-realm');
    expect(normalizeServersPulseSlug('alpha-realm?utm=x#top')).toBe(
      'alpha-realm'
    );
  });
});

describe('ServersPulse reverse verification', () => {
  it('generates prefixed random tokens', () => {
    const token = generateVerificationToken();
    expect(token.startsWith(VERIFICATION_TOKEN_PREFIX)).toBe(true);
    expect(token.length).toBe(VERIFICATION_TOKEN_PREFIX.length + 16);
    expect(generateVerificationToken()).not.toBe(token);
  });

  it('finds the token in description or website URL', () => {
    const token = 'birdflop-verify-a8f3c21e';
    expect(
      tokenAppearsInListing({ description: `hello ${token}` }, token)
    ).toBe(true);
    expect(
      tokenAppearsInListing(
        { websiteUrl: `https://example.com/?v=${token}` },
        token
      )
    ).toBe(true);
    expect(
      tokenAppearsInListing({ description: 'nope', websiteUrl: null }, token)
    ).toBe(false);
    expect(tokenAppearsInListing({ description: 'anything' }, '')).toBe(false);
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

  it('returns null for unverified or never-fetched links', () => {
    expect(toPublicServersPulseStats(makeLink({ verifiedAt: null }))).toBe(
      null
    );
    expect(
      toPublicServersPulseStats(
        makeLink({ lastPayload: null, lastSuccessAt: null })
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

  it('defaults to offline when the server has never reported', () => {
    const stats = toPublicServersPulseStats(
      makeLink({ lastPayload: makeListing({ observed: null }) })
    );
    expect(stats!.status).toBe('offline');
  });
});
