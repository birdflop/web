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
});
