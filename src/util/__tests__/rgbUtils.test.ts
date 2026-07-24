import { describe, it, expect } from 'vite-plus/test';
import {
  generateOutput,
  rgbDefaults,
  colorFormats,
} from '@birdflop/rgbirdflop';

describe('MiniMessage formatting', () => {
  it('should not duplicate bold tags when base bold formatting is active', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      baseFormatting: { bold: true },
      text: 'PETS',
      colors: [
        { hex: '#F97E9C', pos: 0 },
        { hex: '#F9F9F9', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toBe('<b><gradient:#F97E9C:#F9F9F9>PETS</gradient></b>');
  });

  it('should format selective bold correctly without outer wrapper', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      baseFormatting: {},
      formatting: [{ start: 0, end: 2, bold: true }],
      text: 'PETS',
      colors: [
        { hex: '#F97E9C', pos: 0 },
        { hex: '#F9F9F9', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toBe('<gradient:#F97E9C:#F9F9F9><b>PE</b>TS</gradient>');
  });

  it('should handle single color base bold correctly without duplicate tags', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      baseFormatting: { bold: true },
      text: 'PETS',
      colors: [{ hex: '#F97E9C', pos: 0 }],
    };

    const output = generateOutput(options);
    expect(output).toBe('<b><color:#F97E9C>PETS</color></b>');
  });

  it('should format dispersed 3-color MiniMessage gradient as a single gradient tag', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      text: 'TESTING',
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#00FF00', pos: 50 },
        { hex: '#0000FF', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toBe('<gradient:#FF0000:#00FF00:#0000FF>TESTING</gradient>');
  });

  it('should format non-dispersed (uneven) 3-color MiniMessage gradient as multiple gradient tags', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      text: '1234567890',
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#00FF00', pos: 20 },
        { hex: '#0000FF', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toBe(
      '<gradient:#FF0000:#00FF00>12</gradient><gradient:#00FF00:#0000FF>34567890</gradient>'
    );
  });
});

describe('Line break formatting', () => {
  it('should convert newlines to \\n in MiniMessage output', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[0], // MiniMessage
      text: 'FIRST\nSECOND',
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#0000FF', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toBe('<gradient:#FF0000:#0000FF>FIRST\\nSECOND</gradient>');
  });

  it('should convert newlines to \\n in legacy template format output', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[1], // &#$1$2$3$4$5$6$f$c
      text: 'A\nB',
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#0000FF', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toContain('\\n');
    expect(output).not.toContain('\n');
  });

  it('should convert newlines to \\n in JSON output', () => {
    const options = {
      ...rgbDefaults,
      colorFormat: colorFormats[2], // JSON
      text: 'HELLO\nWORLD',
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#0000FF', pos: 100 },
      ],
    };

    const output = generateOutput(options);
    expect(output).toContain('\\n');
    expect(output).not.toContain('\n');
  });
});
