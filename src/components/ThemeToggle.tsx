import { component$, useVisibleTask$, $, useContext } from '@builder.io/qwik';
import { type ThemeName, themes, setThemePreference, ThemeContext } from '~/util/theme-store';
import { Moon, Sun, Sparkles, Bomb, Battery } from 'lucide-icons-qwik';
import { SelectMenuRaw } from '@luminescent/ui-qwik';

export interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'dropdown';
  showLabel?: boolean;
  class?: string;
}

export const ThemeToggle = component$<ThemeToggleProps>(
  ({ variant = 'compact', showLabel = false, class: className = '' }) => {
    const themeStore = useContext(ThemeContext);

    // Update current theme from DOM
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      if (typeof document !== 'undefined') {
        const updateCurrentTheme = () => {
          const themeVariant = document.documentElement.getAttribute(
            'data-theme-variant',
          ) as ThemeName;
          if (themeVariant) {
            themeStore.currentTheme = themeVariant;
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
        value: 'white',
        label: 'White',
        icon: Bomb,
        description: 'Flashbang',
        gradient: 'from-gray-200 to-gray-500',
      },
      {
        value: 'black',
        label: 'Black',
        icon: Battery,
        description: 'Full black theme for OLED',
        gradient: 'from-black to-gray-900',
      },
    ];

    const CurrentThemeOption =
      themeOptions.find((option) => option.value === themeStore.currentTheme) ||
      themeOptions[0];
    const handleThemeChange = $((newTheme: ThemeName) => {
      // Apply theme changes directly without reload
      if (typeof document !== 'undefined') {
        void (async () => {
          // Save to cookie
          await setThemePreference(newTheme);

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
        })();
      }
    });
    const handleCycleTheme = $(async () => {
      // Get current theme from DOM attribute instead of context to avoid serialization
      const currentTheme =
        (document.documentElement.getAttribute(
          'data-theme-variant',
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
          class={`lum-btn lum-bg-transparent group p-2 relative ${className}`}
          title={`Current theme: ${CurrentThemeOption.label}. Click to cycle themes.`}
        >
          {CurrentThemeOption.value === 'auto' && <>
            <Moon size={20} class="hidden dark:flex" />
            <Sun size={20} class="dark:hidden flex" />
          </>}
          <IconComponent size={
            CurrentThemeOption.value === 'auto'
              ? 10
              : 20
          }
          class={
            CurrentThemeOption.value === 'auto'
              ? 'absolute top-1 right-1'
              : ''
          } />
          {showLabel && (
            <span class="ml-2 text-sm">
              {CurrentThemeOption.label}
            </span>
          )}
        </button>
      );
    }
    // Dropdown variant - full theme selector
    return (
      <div class={`relative z-50 ${className}`}
        style={
          // To do: Add custom styles for dropdown on luminescent ui
          {
            '--lum-default-alpha': 100,
          }
        }>
        <SelectMenuRaw id="theme-toggle-dropdown" customDropdown>
          <div q:slot="dropdown" class="flex items-center gap-2">
            {CurrentThemeOption.value === 'auto' && <>
              <Moon size={20} class="hidden dark:flex" />
              <Sun size={20} class="dark:hidden flex" />
            </>}
            <CurrentThemeOption.icon size={
              CurrentThemeOption.value === 'auto'
                ? 10
                : 20
            }
            class={
              CurrentThemeOption.value === 'auto'
                ? 'absolute top-2 left-7'
                : ''
            } />
            {(variant === 'full' || showLabel) && (
              <span class="text-sm">
                {CurrentThemeOption.label}
              </span>
            )}
          </div>
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive = themeStore.currentTheme === option.value;
            const value = option.value;

            return (
              <button q:slot="extra-buttons"
                key={value}
                onClick$={() => handleThemeChange(value)}
                class={`lum-btn lum-bg-transparent text-left rounded-lum-1 ${
                  isActive
                    ? 'bg-gradient-to-br from-theme-accent-primary to-theme-accent-secondary border-theme-accent-primary/40 border'
                    : 'hover:bg-white/10'
                }`}
              >
                <div
                  class={`h-8 w-8 rounded-full bg-gradient-to-r ${option.gradient} flex items-center justify-center`}
                >
                  <IconComponent class="h-4 w-4 text-white" />
                </div>
                <div class="flex-1">
                  <div class="text-theme-text-primary text-sm font-medium">
                    {option.label}
                    {isActive && (
                      <span class="text-theme-accent-primary ml-2 text-xs">✓</span>
                    )}
                  </div>
                  <div class="text-theme-text-muted text-xs">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </SelectMenuRaw>
      </div>
    );
  },
);
