import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseParams,
  getCookies,
  setCookies,
  getClientCookies,
} from '../dataUtils';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import type { Cookie } from '@qwik.dev/router';

let mockCookieStore = '';

const mockDocument = {
  get cookie() {
    return mockCookieStore;
  },
  set cookie(val: string) {
    if (!val) {
      mockCookieStore = '';
      return;
    }
    const [cookiePair] = val.split(';');
    const [key, value] = cookiePair.split('=');
    const cookies: Record<string, string> = {};

    if (mockCookieStore) {
      mockCookieStore.split('; ').forEach((c) => {
        const [k, v] = c.split('=');
        if (k && v) cookies[k] = v;
      });
    }

    if (val.includes('expires=Thu, 01 Jan 1970')) {
      delete cookies[key.trim()];
    } else {
      cookies[key.trim()] = value ? value.trim() : '';
    }

    mockCookieStore = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  },
};

const globalThisRef = globalThis as unknown as { document?: unknown };
const originalDocument = globalThisRef.document;

describe('dataUtils', () => {
  beforeEach(() => {
    mockCookieStore = '';
    globalThisRef.document = mockDocument;
  });

  afterEach(() => {
    if (originalDocument) {
      globalThisRef.document = originalDocument;
    } else {
      delete globalThisRef.document;
    }
  });

  describe('parseParams', () => {
    it('should parse standard number, boolean and JSON parameters correctly', () => {
      const params = {
        colorLength: '5',
        disperse: 'true',
        colors: JSON.stringify([{ hex: '#ff0000', pos: 0 }]),
      };

      const { params: parsed, errors } = parseParams(params, 'rgb');
      expect(errors).toHaveLength(0);
      expect(parsed.colorLength).toBe(5);
      expect(parsed.disperse).toBe(true);
      expect(parsed.colors).toEqual([{ hex: '#ff0000', pos: 0 }]);
    });

    it('should catch invalid types and record validation errors', () => {
      const params = {
        colorLength: 'not-a-number',
      };

      const { params: parsed, errors } = parseParams(params, 'rgb');
      expect(errors.length).toBeGreaterThan(0);
      expect(parsed.colorLength).toBe(rgbDefaults.colorLength);
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
      } as unknown as Cookie;

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
      } as unknown as Cookie;

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
      const rgbCookieVal = JSON.parse(
        decodeURIComponent(parsedCookies.rgb)
      ) as Record<string, unknown>;

      expect(rgbCookieVal.colorLength).toBe(10);
      expect(rgbCookieVal.text).toBeUndefined(); // Deleted because it is default
      expect(rgbCookieVal.version).toBe(rgbDefaults.version); // version is preserved
    });
  });
});
