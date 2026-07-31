import { describe, expect, it } from 'vitest';
import { validateServerInput, formatVersionRange } from '../validation';

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
