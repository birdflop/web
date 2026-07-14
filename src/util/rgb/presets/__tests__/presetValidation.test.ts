import { describe, it, expect } from 'vite-plus/test';
import { validatePreset, validatePresetSubmission } from '../presetValidation';

describe('presetValidation', () => {
  describe('validatePreset', () => {
    it('should validate standard colors correctly', () => {
      const preset = {
        colors: [
          { hex: '#FF0000', pos: 0 },
          { hex: '#00FF00', pos: 100 },
        ],
      };
      const errors = validatePreset(preset);
      expect(errors).toHaveLength(0);
    });

    it('should fail if colors array is missing or empty', () => {
      const errorsMissing = validatePreset({});
      expect(errorsMissing[0].message).toContain('colors array');

      const errorsEmpty = validatePreset({ colors: [] });
      expect(errorsEmpty[0].message).toContain('at least one color');
    });

    it('should fail if colors array has more than 20 colors', () => {
      const colors = Array.from({ length: 21 }, (_, i) => ({
        hex: '#FFFFFF',
        pos: i,
      }));
      const errors = validatePreset({ colors });
      expect(errors[0].message).toContain('cannot have more than 20 colors');
    });

    it('should fail if color has invalid hex or invalid pos', () => {
      const preset = {
        colors: [{ hex: 'invalid', pos: -10 }],
      };
      const errors = validatePreset(preset);
      expect(errors.some((e) => e.message.includes('Invalid hex color'))).toBe(
        true
      );
      expect(
        errors.some((e) =>
          e.message.includes('position must be between 0 and 100')
        )
      ).toBe(true);
    });

    it('should fail on duplicate positions', () => {
      const preset = {
        colors: [
          { hex: '#FFFFFF', pos: 50 },
          { hex: '#000000', pos: 50 },
        ],
      };
      const errors = validatePreset(preset);
      expect(
        errors.some((e) =>
          e.message.includes('Multiple colors at the same position')
        )
      ).toBe(true);
    });
  });

  describe('validatePresetSubmission', () => {
    it('should fail on invalid name or description length bounds', async () => {
      const submissionShort = {
        name: 'ab',
        description: 'short',
        preset: {
          colors: [{ hex: '#FFFFFF', pos: 0 }],
        },
      };
      const result = await validatePresetSubmission(submissionShort, false);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
      expect(result.errors.some((e) => e.field === 'description')).toBe(true);
    });

    it('should succeed on valid submission metadata and preset', async () => {
      const submission = {
        name: 'My Valid Preset',
        description:
          'This is a description of my valid preset that is long enough.',
        preset: {
          colors: [{ hex: '#FFFFFF', pos: 0 }],
        },
      };
      const result = await validatePresetSubmission(submission, false);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
