import { createContextId, $, Signal } from '@builder.io/qwik';
import { Cookie, server$ } from '@builder.io/qwik-city';
export type ThemeName = keyof typeof themes;

/**
 * Get the theme preference
 * @returns ThemeName | undefined
 */
export const getThemePreference = server$(function (c?: Cookie): ThemeName | undefined {
  const cookie = this.cookie || c;
  const cookieVal = cookie.get('theme-preference');
  const value = cookieVal?.value as ThemeName | undefined;
  return value;
});

/**
 * Set the theme preference
 * @param theme - ThemeName
 */
export const setThemePreference = server$(function (theme: ThemeName, c?: Cookie) {
  const cookie = this.cookie || c;
  return cookie.set('theme-preference', theme);
});

const defaultTheme = {
  '--color-bg': 'var(--color-gray-900)',
  '--color-nav-bg': 'color-mix(in oklab, var(--color-sky-950), transparent 30%)',
  '--color-text': 'var(--color-gray-200)',
  '--color-lum-border': '#dfdfdfaa',
  '--color-lum-card-bg': 'var(--color-gray-900)',
  '--color-lum-input-bg': 'var(--color-gray-800)',
  '--color-lum-input-hover-bg': 'var(--color-gray-700)',
  '--color-lum-accent': 'var(--color-blue-500)',
  '--color-lum-text': 'var(--color-gray-100)',
  '--color-lum-text-secondary': 'var(--color-gray-400)',
  '--lum-default-alpha': '70',
  '--lum-border-radius': '0.625rem',
};

export const themes = {
  dark: defaultTheme,
  light: {
    '--color-bg': 'var(--color-blue-200)',
    '--color-nav-bg': 'color-mix(in oklab, var(--color-blue-300), transparent 5%)',
    '--color-text': 'var(--color-gray-900)',
    '--color-lum-border': 'var(--color-gray-600)',
    '--color-lum-card-bg': 'var(--color-blue-200)',
    '--color-lum-input-bg': 'var(--color-blue-300)',
    '--color-lum-input-hover-bg': 'var(--color-blue-300)',
    '--color-lum-accent': 'var(--color-blue-500)',
    '--color-lum-text': 'var(--color-gray-900)',
    '--color-lum-text-secondary': 'var(--color-gray-600)',
    '--lum-default-alpha': '70',
    '--lum-border-radius': '0.625rem',
  },
  auto: defaultTheme,
};

export interface ThemeContextType {
  currentTheme: ThemeName;
  isDark: boolean;
  css: {
    [key: string]: string;
  }
}

export const ThemeContext = createContextId<ThemeContextType>('theme-context');

// Apply theme to CSS variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applyTheme = $((themeName: ThemeName, isDark: Signal<boolean>) => {
  if (typeof document === 'undefined') return;

  let effectiveTheme = themeName;
  if (themeName === 'auto') {
    effectiveTheme = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  const themeColors = themes[effectiveTheme];
  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Update data attributes for additional styling hooks
  root.setAttribute('data-theme', effectiveTheme);
  root.setAttribute('data-theme-variant', themeName);

  isDark.value = effectiveTheme === 'dark' ||
    (themeName === 'auto' && (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches));
});

/**
 * Generate CSS variables string for server-side theme injection
 * This prevents theme flashing by applying theme styles immediately during SSR
 * @param themeName - The theme name to apply
 * @param userAgent - Optional user agent string for auto theme detection
 * @returns CSS variables string to inject into the document
 */
export function getCSSString(themeName: ThemeName): string {
  const css = themes[themeName];

  // Generate CSS custom properties
  const cssString = Object.entries(css)
    .map(([cssVarName, value]) => `${cssVarName}: ${value};`)
    .join('\n    ');

  return cssString;
}

/**
 * Get the effective theme name (resolves 'auto' to actual theme)
 * @param themeName - The theme name (including 'auto')
 * @param userAgent - Optional user agent string for auto theme detection
 * @returns The effective theme name ('dark' or 'light' etc.)
 */
export function getEffectiveTheme(themeName: ThemeName): Exclude<ThemeName, 'auto'> {
  if (themeName === 'auto') {
    // Server-side auto theme detection fallback
    return 'dark'; // Default fallback
  }
  return themeName;
}
