import { describe, it, expect } from 'vitest';
import { presetToVector } from '../vectorize';

describe('presetToVector', () => {
  it('should return a vector of 75 zeros for an empty gradient preset', () => {
    const preset = {
      colors: [],
    };
    const vector = presetToVector(preset);
    expect(vector).toHaveLength(75);
    expect(vector.every((val) => val === 0)).toBe(true);
  });

  it('should handle single color gradient by filling all 25 samples with that color oklab representation', () => {
    const preset = {
      colors: [{ hex: '#FF0000', pos: 0 }],
    };
    const vector = presetToVector(preset);
    expect(vector).toHaveLength(75);
    // Samples 0 to 24 should all be the same oklab values
    const oklabL = vector[0];
    const oklaba = vector[1];
    const oklabb = vector[2];

    for (let i = 0; i < 25; i++) {
      expect(vector[i * 3]).toBeCloseTo(oklabL);
      expect(vector[i * 3 + 1]).toBeCloseTo(oklaba);
      expect(vector[i * 3 + 2]).toBeCloseTo(oklabb);
    }
  });

  it('should interpolate colors for multi-color gradients correctly', () => {
    const preset = {
      colors: [
        { hex: '#000000', pos: 0 },
        { hex: '#FFFFFF', pos: 100 },
      ],
    };
    const vector = presetToVector(preset);
    expect(vector).toHaveLength(75);

    // The first sample (0%) should match #000000 oklab
    expect(vector[0]).toBeCloseTo(0); // L
    expect(vector[1]).toBeCloseTo(0); // a
    expect(vector[2]).toBeCloseTo(0); // b

    // The last sample (100%) should match #FFFFFF oklab (L = 1)
    expect(vector[72]).toBeCloseTo(1); // L
    expect(vector[73]).toBeCloseTo(0); // a
    expect(vector[74]).toBeCloseTo(0); // b
  });
});
