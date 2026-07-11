import { describe, it, expect } from 'vitest';
import { getEffectiveTheme, getCSSString } from '../themeUtil';

describe('themeUtil', () => {
  describe('getEffectiveTheme', () => {
    it('should return dark for auto theme', () => {
      expect(getEffectiveTheme('auto')).toBe('dark');
    });

    it('should return the theme name directly for non-auto themes', () => {
      expect(getEffectiveTheme('dark')).toBe('dark');
      expect(getEffectiveTheme('light')).toBe('light');
      expect(getEffectiveTheme('black')).toBe('black');
    });
  });

  describe('getCSSString', () => {
    it('should return CSS variables formatted string', () => {
      const cssString = getCSSString('dark');
      expect(cssString).toContain('--color-bg: var(--color-gray-900)');
      expect(cssString).toContain(
        '--color-nav-bg: color-mix(in oklab, var(--color-sky-950), transparent 30%)'
      );
    });
  });
});
