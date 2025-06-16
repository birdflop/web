import { createContextId, useContext, useContextProvider, useSignal, useVisibleTask$, $, QRL, Signal } from '@builder.io/qwik';
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

export interface ThemeColors {
  [key: string]: string | number;
}

const defaultTheme = {
  '--color-bg': 'var(--color-gray-950)',
  '--color-nav-bg': 'color-mix(in oklab, var(--color-sky-950), transparent 30%)',
  '--color-text': 'var(--color-gray-200)',
  '--color-lum-border': '#dfdfdfaa',
  '--color-lum-card-bg': 'var(--color-gray-900)',
  '--color-lum-input-bg': 'var(--color-gray-800)',
  '--color-lum-input-hover-bg': 'var(--color-gray-700)',
  '--color-lum-accent': 'var(--color-blue-500)',
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
    '--lum-default-alpha': '70',
    '--lum-border-radius': '0.625rem',
  },
  auto: defaultTheme,
};

export interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: QRL<(theme: ThemeName) => void>;
  isDark: boolean;
  themeColors: ThemeColors;
}

export const ThemeContext = createContextId<ThemeContextType>('theme-context');

// Apply theme to CSS variables
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

export const useThemeProvider = () => {
  const currentTheme = useSignal<ThemeName>('dark');
  const isDark = useSignal(true);

  const setTheme = $(async (theme: ThemeName) => {
    currentTheme.value = theme;
    await applyTheme(theme, isDark);
    await setThemePreference(theme);
  });

  // Load saved theme on initialization
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Check if theme is already applied server-side
    const root = document.documentElement;
    const serverTheme = root.getAttribute('data-theme-variant');

    let initialTheme: ThemeName;

    if (serverTheme && themes[serverTheme as ThemeName]) {
      // Use server-side theme if available
      initialTheme = serverTheme as ThemeName;
      currentTheme.value = initialTheme;
    } else {
      // Fallback to cookie-based theme detection
      const savedTheme = await getThemePreference();
      initialTheme = savedTheme || 'auto';
      currentTheme.value = initialTheme;
    }

    // Apply theme (this will update if needed)
    await applyTheme(initialTheme, isDark);

    // Listen for system theme changes when using auto theme
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (currentTheme.value === 'auto') {
          void applyTheme('auto', isDark);
        }
      };
      mediaQuery.addEventListener('change', handleChange);

      // Cleanup function
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  });

  const contextValue: ThemeContextType = {
    currentTheme: currentTheme.value,
    setTheme,
    isDark: isDark.value,
    themeColors: themes[currentTheme.value],
  };

  useContextProvider(ThemeContext, contextValue);

  return {
    currentTheme,
    setTheme,
    isDark,
    get themeColors() { return themes[currentTheme.value]; },
  };
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

/**
 * Generate CSS variables string for server-side theme injection
 * This prevents theme flashing by applying theme styles immediately during SSR
 * @param themeName - The theme name to apply
 * @param userAgent - Optional user agent string for auto theme detection
 * @returns CSS variables string to inject into the document
 */
export function generateThemeCSS(themeName: ThemeName): string {
  let effectiveTheme = themeName;

  // Handle auto theme detection on server-side
  if (themeName === 'auto') {
    // Basic server-side dark mode detection (fallback to dark)
    // In a real implementation, you might want to detect this differently
    effectiveTheme = 'dark'; // Default fallback for server-side
  }

  const themeColors = themes[effectiveTheme];

  // Generate CSS custom properties
  const cssVars = Object.entries(themeColors)
    .map(([key, value]) => {
      const cssVarName = `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      return `${cssVarName}: ${value};`;
    })
    .join('\n    ');

  return cssVars;
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
