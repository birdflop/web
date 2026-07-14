import { component$, useVisibleTask$, $, useContext } from '@qwik.dev/core';
import { type ThemeName, themes, ThemeContext } from '~/util/themeUtil';
import Moon from 'lucide-icons-qwik/icons/Moon';
import Sun from 'lucide-icons-qwik/icons/Sun';
import Sparkles from 'lucide-icons-qwik/icons/Sparkles';
import Battery from 'lucide-icons-qwik/icons/Battery';
import Smile from 'lucide-icons-qwik/icons/Smile';
import { SelectMenu } from '@luminescent/ui-qwik';
import { SettingsContext } from '~/routes/layout';
import { setCookies, setUserData } from '~/util/dataUtils';

export interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'dropdown';
  showLabel?: boolean;
  class?: string;
}

export const ThemeToggle = component$<ThemeToggleProps>(
  ({ variant = 'compact', showLabel = false, class: className = '' }) => {
    const themeStore = useContext(ThemeContext);
    const settingsStore = useContext(SettingsContext);

    // Update current theme from DOM
    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      if (typeof document !== 'undefined') {
        const updateCurrentTheme = () => {
          const themeVariant = document.documentElement.getAttribute(
            'data-theme-variant'
          ) as ThemeName;
          if (themeVariant) {
            themeStore.currentTheme = themeVariant;
            settingsStore.theme = themeVariant;
          }
        };

        // Update immediately
        updateCurrentTheme();

        // Set up observer for changes
        const observer = new MutationObserver(updateCurrentTheme);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme-variant'],
        });

        return () => observer.disconnect();
      }
    });

    const themeOptions: Array<{
      value: ThemeName;
      label: string;
      icon: typeof Sparkles;
      description: string;
      gradient: string;
    }> = [
      {
        value: 'auto',
        label: 'Auto',
        icon: Sparkles,
        description: 'Follows system preference',
        gradient: 'from-gray-500 to-gray-600',
      },
      {
        value: 'dark',
        label: 'Dark',
        icon: Moon,
        description: 'Classic dark theme',
        gradient: 'from-gray-800 to-gray-900',
      },
      {
        value: 'light',
        label: 'Light',
        icon: Sun,
        description: 'Clean light theme',
        gradient: 'from-yellow-400 to-orange-500',
      },
      {
        value: 'black',
        label: 'Black',
        icon: Battery,
        description: 'Full black theme for OLED',
        gradient: 'from-black to-gray-900',
      },
      {
        value: 'simplymc',
        label: 'SimplyMC',
        icon: Smile,
        description: 'SimplyMC dark theme for the nostalgia',
        gradient: 'from-purple-600 to-purple-900',
      },
    ];

    const CurrentThemeOption =
      themeOptions.find((option) => option.value === themeStore.currentTheme) ||
      themeOptions[0];

    const handleThemeChange = $(async (newTheme: ThemeName) => {
      // Apply theme changes directly without reload
      if (typeof document !== 'undefined') {
        settingsStore.theme = newTheme;
        setCookies('settings', settingsStore);
        await setUserData({ settings: settingsStore });

        // Apply theme immediately
        const root = document.documentElement;
        let effectiveTheme = newTheme;
        if (newTheme === 'auto') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)')
            .matches
            ? 'dark'
            : 'light';
        }

        const css = themes[effectiveTheme as keyof typeof themes];
        Object.entries(css).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });

        root.setAttribute('data-theme', effectiveTheme);
        root.setAttribute('data-theme-variant', newTheme);
      }
    });

    const handleCycleTheme = $(async () => {
      // Get current theme from DOM attribute instead of context to avoid serialization
      const currentTheme =
        (document.documentElement.getAttribute(
          'data-theme-variant'
        ) as ThemeName) || 'dark';
      const mainThemes: ThemeName[] = ['auto', 'dark', 'light'];
      const currentIndex = mainThemes.indexOf(currentTheme);
      const nextTheme = mainThemes[(currentIndex + 1) % mainThemes.length];
      await handleThemeChange(nextTheme);
    });
    // Compact variant - just the current theme icon
    if (variant === 'compact') {
      const IconComponent = CurrentThemeOption.icon;
      return (
        <button
          onClick$={handleCycleTheme}
          class={`lum-btn lum-bg-transparent group relative p-2 ${className}`}
          title={`Current theme: ${CurrentThemeOption.label}. Click to cycle themes.`}
        >
          {CurrentThemeOption.value === 'auto' && (
            <>
              <Moon size={20} class="hidden dark:flex" />
              <Sun size={20} class="flex dark:hidden" />
            </>
          )}
          <IconComponent
            size={CurrentThemeOption.value === 'auto' ? 10 : 20}
            class={
              CurrentThemeOption.value === 'auto'
                ? 'absolute top-1 right-1'
                : ''
            }
          />
          {showLabel && (
            <span class="ml-2 text-sm">{CurrentThemeOption.label}</span>
          )}
        </button>
      );
    }
    // Dropdown variant - full theme selector
    return (
      <div class={`relative ${className}`}>
        <SelectMenu id="theme-toggle-dropdown" customDropdown>
          <span q:slot="dropdown" class="flex items-center gap-2">
            {CurrentThemeOption.value === 'auto' && (
              <>
                <Moon size={24} class="hidden dark:flex" />
                <Sun size={24} class="flex dark:hidden" />
              </>
            )}
            <CurrentThemeOption.icon
              size={CurrentThemeOption.value === 'auto' ? 12 : 24}
              class={
                CurrentThemeOption.value === 'auto'
                  ? 'absolute top-1.5 left-8'
                  : ''
              }
            />
            {(variant === 'full' || showLabel) && (
              <span>{CurrentThemeOption.label}</span>
            )}
          </span>
          <div q:slot="extra-buttons">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive = themeStore.currentTheme === option.value;
              const value = option.value;

              return (
                <button
                  key={value}
                  onClick$={() => handleThemeChange(value)}
                  class={{
                    'lum-btn rounded-lum-1 p-2 pr-4 text-left': true,
                    [`bg-linear-to-br ${option.gradient} border-lum-accent border`]:
                      isActive,
                    'lum-bg-transparent': !isActive,
                  }}
                >
                  <span
                    class={{
                      'rounded-lum-1 flex items-center justify-center p-2': true,
                      [`bg-linear-to-r ${option.gradient}`]: !isActive,
                    }}
                  >
                    <IconComponent class="h-4 w-4 text-white" />
                  </span>
                  <span class="flex flex-col">
                    <span class="text-theme-text-primary text-sm font-medium">
                      {option.label}
                    </span>
                    <span class="text-theme-text-muted text-lum-text-secondary text-xs">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </SelectMenu>
      </div>
    );
  }
);
