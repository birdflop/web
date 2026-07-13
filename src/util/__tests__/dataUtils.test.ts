import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseParams,
  getCookies,
  getClientCookies,
  setCookies,
} from '../dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';

// Mock document.cookie behavior
let mockCookieStore = '';
const mockDocument = {
  get cookie() {
    return mockCookieStore;
  },
  set cookie(val: string) {
    const parts = val.split(';');
    const firstPart = parts[0].trim();
    const eqIndex = firstPart.indexOf('=');
    if (eqIndex === -1) return;

    const key = firstPart.substring(0, eqIndex).trim();
    const value = firstPart.substring(eqIndex + 1).trim();

    // Parse existing cookies
    const cookies: Record<string, string> = {};
    if (mockCookieStore) {
      mockCookieStore.split(';').forEach((pair) => {
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          const k = pair.substring(0, eqIdx).trim();
          const v = pair.substring(eqIdx + 1).trim();
          if (k) cookies[k] = v;
        }
      });
    }

    // Update or delete
    if (val.includes('expires=Thu, 01 Jan 1970')) {
      delete cookies[key];
    } else {
      cookies[key] = value;
    }

    // Serialize back
    mockCookieStore = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  },
};

const originalDocument = (globalThis as any).document;

describe('dataUtils', () => {
  beforeEach(() => {
    mockCookieStore = '';
    (globalThis as any).document = mockDocument;
  });

  afterEach(() => {
    if (originalDocument) {
      (globalThis as any).document = originalDocument;
    } else {
      delete (globalThis as any).document;
    }
  });

  describe('parseParams', () => {
    it('should parse standard number, boolean and JSON parameters correctly', () => {
      const params = {
        colorLength: '5',
        disperse: 'true',
        colors: JSON.stringify([{ hex: '#ff0000', pos: 0 }]),
        invalidParam: 'test', // Should be filtered out
      };

      const result = parseParams(params, 'rgb');
      expect(result.errors).toHaveLength(0);
      expect(result.params.colorLength).toBe(5);
      expect(result.params.disperse).toBe(true);
      expect(result.params.colors).toEqual([{ hex: '#ff0000', pos: 0 }]);
      expect(result.params.invalidParam).toBeUndefined(); // Deleted because not in defaults
    });

    it('should catch parsing errors for invalid JSON', () => {
      const params = {
        colors: '{invalid-json',
      };
      const result = parseParams(params, 'rgb');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Error parsing the colors value');
    });
  });

  describe('getClientCookies', () => {
    it('should parse cookie string into key-value pairs', () => {
      document.cookie = 'name1=value1';
      document.cookie = 'name2=value2';

      const cookies = getClientCookies();
      expect(cookies.name1).toBe('value1');
      expect(cookies.name2).toBe('value2');
    });
  });

  describe('getCookies', () => {
    it('should parse valid Qwik City cookie values and clean them', () => {
      const mockCookie = {
        get: (name: string) => {
          if (name === 'rgb') {
            return {
              value: JSON.stringify({ colorLength: 5, disperse: true }),
            };
          }
          return null;
        },
        set: vi.fn(),
      } as any;

      const { cookies, errors } = getCookies<Partial<typeof rgbDefaults>>(
        mockCookie,
        'rgb'
      );
      expect(errors).toHaveLength(0);
      expect(cookies.colorLength).toBe(5);
      expect(cookies.disperse).toBe(true);
    });

    it('should reset numbers lower than 1 to 1', () => {
      const mockCookie = {
        get: (name: string) => {
          if (name === 'rgb') {
            return { value: JSON.stringify({ colorLength: 0 }) };
          }
          return null;
        },
        set: vi.fn(),
      } as any;

      const { cookies, errors } = getCookies<Partial<typeof rgbDefaults>>(
        mockCookie,
        'rgb'
      );
      expect(errors.length).toBeGreaterThan(0);
      expect(cookies.colorLength).toBe(1); // Reset to 1
    });
  });

  describe('setCookies', () => {
    it('should delete values matching defaults before writing to cookie to optimize size', () => {
      // First set cookies: cookies = true in settings to allow writing
      document.cookie =
        'settings=' + encodeURIComponent(JSON.stringify({ cookies: true }));

      const inputCookies = {
        version: rgbDefaults.version,
        text: 'Birdflop', // Default
        colorLength: 10, // Non-default
      };

      setCookies('rgb', inputCookies);

      const parsedCookies = getClientCookies();
      expect(parsedCookies.rgb).toBeDefined();
      const rgbCookieVal = JSON.parse(decodeURIComponent(parsedCookies.rgb));

      expect(rgbCookieVal.colorLength).toBe(10);
      expect(rgbCookieVal.text).toBeUndefined(); // Deleted because it is default
      expect(rgbCookieVal.version).toBe(rgbDefaults.version); // version is preserved
    });
  });
});
