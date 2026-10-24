import { describe, expect, it } from 'vite-plus/test';
import {
  validateServerInput,
  formatVersionRange,
  isServerSoftware,
  isValidMcUsername,
  sanitizeRgbPreset,
  sanitizeServerPlugins,
} from '../validation';

describe('serverlist validation', () => {
  it('validates minVersion and maxVersion within limits', () => {
    const validResult = validateServerInput({
      name: 'Test Server',
      description: 'A cool test server',
      javaHost: 'play.example.com',
      minVersion: '1.8',
      maxVersion: '1.21.4',
    });

    expect(validResult.valid).toBe(true);
    expect(validResult.data?.minVersion).toBe('1.8');
    expect(validResult.data?.maxVersion).toBe('1.21.4');
  });

  it('rejects version strings exceeding length limits', () => {
    const invalidResult = validateServerInput({
      name: 'Test Server',
      description: 'A cool test server',
      javaHost: 'play.example.com',
      minVersion: 'a'.repeat(9),
    });

    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toContain(
      'Minimum version must be 8 characters or fewer.'
    );
  });

  it('trims empty version strings to null', () => {
    const result = validateServerInput({
      name: 'Test Server',
      description: 'A cool test server',
      javaHost: 'play.example.com',
      minVersion: '   ',
      maxVersion: '',
    });

    expect(result.valid).toBe(true);
    expect(result.data?.minVersion).toBeNull();
    expect(result.data?.maxVersion).toBeNull();
  });

  it('parses valid rgbPreset JSON string', () => {
    const presetJSON = JSON.stringify({
      colors: [
        { hex: 'ff0000', pos: 0 },
        { hex: '0000ff', pos: 100 },
      ],
    });
    const result = validateServerInput({
      name: 'Test Server',
      description: 'A cool test server',
      javaHost: 'play.example.com',
      rgbPreset: presetJSON,
    });

    expect(result.valid).toBe(true);
    expect(result.data?.rgbPreset).toBeDefined();
  });

  it('rejects invalid rgbPreset JSON', () => {
    const result = validateServerInput({
      name: 'Test Server',
      description: 'A cool test server',
      javaHost: 'play.example.com',
      rgbPreset: '{ invalid json ',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid RGBirdflop preset JSON.');
  });
});

describe('formatVersionRange', () => {
  it('formats single version when min and max are equal', () => {
    expect(formatVersionRange('1.21', '1.21')).toBe('1.21');
  });

  it('formats range when min and max differ', () => {
    expect(formatVersionRange('1.8', '1.21.4')).toBe('1.8 - 1.21.4');
  });

  it('formats min-only version with +', () => {
    expect(formatVersionRange('1.20', null)).toBe('1.20+');
  });

  it('formats max-only version with Up to prefix', () => {
    expect(formatVersionRange(null, '1.21.4')).toBe('Up to 1.21.4');
  });

  it('falls back to status version when min and max are empty', () => {
    expect(formatVersionRange(null, null, '1.20.1')).toBe('1.20.1');
  });

  it('returns null when all inputs are empty', () => {
    expect(formatVersionRange(null, null, null)).toBeNull();
  });
});

describe('rgbPreset validation', () => {
  const base = {
    name: 'Test Server',
    description: 'A cool test server',
    javaHost: 'play.example.com',
  };

  it('accepts a well-formed preset object', () => {
    const preset = { colors: [{ hex: '#ff0000', pos: 0 }] };
    const result = validateServerInput({ ...base, rgbPreset: preset });
    expect(result.valid).toBe(true);
    expect(result.data?.rgbPreset).toEqual(preset);
  });

  it('rejects malformed or oversized preset objects', () => {
    for (const bad of [
      { colors: 'nope' },
      { colors: [] },
      { colors: [{ hex: 'red', pos: 0 }] },
      { colors: [{ hex: '#fff', pos: 500 }] },
      { colors: [{ hex: '#fff', pos: 0 }], colorFormat: 'x' },
      { colors: [{ hex: '#fff', pos: 0 }], junk: 'x'.repeat(5000) },
      ['array'],
    ]) {
      const result = validateServerInput({
        ...base,
        rgbPreset: bad as never,
      });
      expect(result.valid).toBe(false);
    }
  });

  it('sanitizeRgbPreset returns null for garbage', () => {
    expect(sanitizeRgbPreset('{ bad json')).toBeNull();
    expect(sanitizeRgbPreset(42)).toBeNull();
    expect(sanitizeRgbPreset({})).toBeNull();
  });
});

describe('isValidMcUsername', () => {
  it('accepts Java names and Floodgate-prefixed Bedrock names', () => {
    for (const name of [
      'Notch',
      'abc',
      'a_b_c_123456789_',
      '.BedrockGuy',
      '*Bedrock_1',
    ])
      expect(isValidMcUsername(name)).toBe(true);
  });

  it('rejects bad charset and lengths', () => {
    for (const name of [
      '',
      'ab',
      'a'.repeat(17),
      'has space',
      'bad-dash',
      '..double',
      '<b>',
      'é_name',
    ])
      expect(isValidMcUsername(name)).toBe(false);
  });
});

describe('sanitizeServerPlugins', () => {
  it('keeps valid plugins and only their persisted fields', () => {
    const result = sanitizeServerPlugins({
      '123': { id: 123, type: 'spigot', extra: 'x' },
      lp: { id: 'luckperms', type: 'modrinth' },
      misc1: {
        id: 'abc',
        type: 'misc',
        name: 'Thing',
        url: 'https://example.com',
        iconUrl: 'https://example.com/i.png',
        currentVersion: { id: 1, name: '1.0', releaseDate: '2024-01-01' },
      },
    });
    expect('plugins' in result).toBe(true);
    if (!('plugins' in result)) return;
    expect(Object.keys(result.plugins)).toEqual(['123', 'lp', 'misc1']);
    expect(result.plugins['123']).toEqual({ id: 123, type: 'spigot' });
    expect(result.plugins.misc1.url).toBe('https://example.com');
    expect(result.plugins.misc1.currentVersion?.name).toBe('1.0');
  });

  it('drops unsafe URLs, bad types and bogus ids', () => {
    const result = sanitizeServerPlugins({
      a: { id: 'x', type: 'misc', url: 'javascript:alert(1)' },
      b: { id: 'x', type: 'evil' },
      c: { id: 'not-a-number', type: 'spigot' },
      d: { id: 'bad id/../', type: 'modrinth' },
      e: 'string',
    });
    if (!('plugins' in result)) throw new Error('expected plugins');
    expect(Object.keys(result.plugins)).toEqual(['a']);
    expect(result.plugins.a.url).toBeUndefined();
  });

  it('caps the plugin count and rejects non-objects', () => {
    const many = Object.fromEntries(
      Array.from({ length: 501 }, (_, i) => [
        String(i + 1),
        { id: i + 1, type: 'spigot' },
      ])
    );
    expect('error' in sanitizeServerPlugins(many)).toBe(true);
    expect('error' in sanitizeServerPlugins([])).toBe(true);
    expect('error' in sanitizeServerPlugins(null)).toBe(true);
  });
});

describe('isServerSoftware', () => {
  it('accepts plugin updater software options', () => {
    expect(isServerSoftware('paper')).toBe(true);
    expect(isServerSoftware('velocity')).toBe(true);
  });

  it('rejects unknown values and inherited keys', () => {
    expect(isServerSoftware('bukkit')).toBe(false);
    expect(isServerSoftware('toString')).toBe(false);
    expect(isServerSoftware(1)).toBe(false);
  });
});
