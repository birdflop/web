import { createContextId } from '@builder.io/qwik';
export type ThemeName = keyof typeof themes | 'auto';

const darkTheme = {
  '--color-bg': 'var(--color-gray-900)',
  '--color-nav-bg': 'color-mix(in oklab, var(--color-sky-950), transparent 30%)',
  '--color-green': 'var(--color-green-900)',
  '--color-red': 'var(--color-red-900)',
  '--color-orange': 'var(--color-orange-900)',
  '--color-yellow': 'var(--color-yellow-900)',
  '--color-blue': 'var(--color-blue-900)',
  '--color-violet': 'var(--color-violet-900)',
  '--color-pink': 'var(--color-pink-900)',
  '--color-purple': 'var(--color-purple-900)',
  '--color-cyan': 'var(--color-cyan-900)',
  '--color-lime': 'var(--color-lime-900)',
  '--color-teal': 'var(--color-teal-900)',
  '--color-lum-border': '#dfdfdfaa',
  '--color-lum-card-bg': 'var(--color-gray-900)',
  '--color-lum-input-bg': 'var(--color-gray-800)',
  '--color-lum-input-hover-bg': 'var(--color-gray-700)',
  '--color-lum-accent': 'var(--color-blue-500)',
  '--color-lum-text': 'var(--color-gray-100)',
  '--color-lum-text-secondary': 'var(--color-gray-400)',
  '--lum-border-radius': '0.625rem',
};

const lightTheme = {
  ...darkTheme,
  '--color-bg': 'var(--color-white)',
  '--color-nav-bg': 'color-mix(in oklab, var(--color-blue-300), transparent 70%)',
  '--color-green': 'var(--color-green-500)',
  '--color-red': 'var(--color-red-500)',
  '--color-orange': 'var(--color-orange-500)',
  '--color-yellow': 'var(--color-yellow-500)',
  '--color-blue': 'var(--color-blue-500)',
  '--color-violet': 'var(--color-violet-500)',
  '--color-pink': 'var(--color-pink-500)',
  '--color-purple': 'var(--color-purple-500)',
  '--color-cyan': 'var(--color-cyan-500)',
  '--color-lime': 'var(--color-lime-500)',
  '--color-teal': 'var(--color-teal-500)',
  '--color-lum-border': 'var(--color-gray-100)',
  '--color-lum-card-bg': 'var(--color-blue-200)',
  '--color-lum-input-bg': 'var(--color-gray-200)',
  '--color-lum-input-hover-bg': 'var(--color-gray-100)',
  '--color-lum-text': 'var(--color-gray-900)',
  '--color-lum-text-secondary': 'var(--color-gray-700)',
};

export const themes = {
  dark: darkTheme,
  black: {
    ...darkTheme,
    '--color-bg': 'var(--color-black)',
    '--color-nav-bg': 'color-mix(in oklab, var(--color-black), transparent 30%)',
    '--color-lum-card-bg': 'var(--color-black)',
    '--color-lum-input-bg': 'var(--color-neutral-900)',
    '--color-lum-input-hover-bg': 'var(--color-neutral-800)',
    '--color-lum-accent': 'var(--color-blue-900)',
  },
  light: lightTheme,
};

export interface ThemeContextType {
  currentTheme: ThemeName;
  isDark?: boolean;
  css?: {
    [key: string]: string;
  }
  cssString?: string;
}

export const ThemeContext = createContextId<ThemeContextType>('theme-context');

/**
 * Generate CSS variables string for server-side theme injection
 * This prevents theme flashing by applying theme styles immediately during SSR
 * @param themeName - The theme name to apply
 * @param userAgent - Optional user agent string for auto theme detection
 * @returns CSS variables string to inject into the document
 */
export function getCSSString(themeName: Exclude<ThemeName, 'auto'>): string {
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
