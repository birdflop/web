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

const themeOptions: Array<{
  value: ThemeName;
  name: string;
  icon: typeof Sparkles;
  description: string;
  gradient: string;
}> = [
  {
    value: 'auto',
    name: 'Auto',
    icon: Sparkles,
    description: 'Follows system preference',
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    value: 'dark',
    name: 'Dark',
    icon: Moon,
    description: 'Classic dark theme',
    gradient: 'from-gray-800 to-gray-900',
  },
  {
    value: 'light',
    name: 'Light',
    icon: Sun,
    description: 'Clean light theme',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    value: 'black',
    name: 'Black',
    icon: Battery,
    description: 'Full black theme for OLED',
    gradient: 'from-black to-gray-900',
  },
  {
    value: 'simplymc',
    name: 'SimplyMC',
    icon: Smile,
    description: 'SimplyMC dark theme for the nostalgia',
    gradient: 'from-purple-600 to-purple-900',
  },
];

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
          title={`Current theme: ${CurrentThemeOption.name}. Click to cycle themes.`}
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
            <span class="ml-2 text-sm">{CurrentThemeOption.name}</span>
          )}
        </button>
      );
    }
    // Dropdown variant - full theme selector
    return (
      <div class={`relative ${className}`}>
        <SelectMenu
          btnProps={{
            class: 'p-2',
          }}
          id="theme-toggle-dropdown"
          values={themeOptions.map((option) => ({
            name: option.name,
            value: option.value,
          }))}
          value={CurrentThemeOption.value}
          onChange$={async (e, el) => {
            await handleThemeChange(el.value as ThemeName);
          }}
        >
          <span
            q:slot="dropdown-before"
            class="relative flex items-center gap-2"
          >
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
                  ? 'absolute bottom-4 left-4'
                  : ''
              }
            />
          </span>
          {themeOptions.map((Option) => (
            <span
              key={Option.value}
              q:slot={`before-${Option.value}`}
              class={{
                'rounded-full bg-linear-to-br p-2': true,
                [Option.gradient]: true,
              }}
            >
              <Option.icon size={16} />
            </span>
          ))}
          {themeOptions.map((Option) => (
            <span
              key={Option.value}
              q:slot={`after-${Option.value}`}
              class="text-lum-text-secondary text-sm"
            >
              {Option.description}
            </span>
          ))}
        </SelectMenu>
      </div>
    );
  }
);
