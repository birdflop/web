import { component$, useContext } from '@builder.io/qwik';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { Bird, Cookie, Settings } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from 'qwik-speak';
import { ThemeToggle } from '~/components/Elements/ThemeToggle';
import { defaultDescription, generateHead } from '~/root';
import { languages } from '~/speak-config';
import { SettingsContext } from '../layout';
import { setCookies, setUserData } from '~/util/dataUtils';

export default component$(() => {
  const t = inlineTranslate();
  const config = useSpeakConfig();
  const locale = useSpeakLocale();
  const settingsStore = useContext(SettingsContext);

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <Settings size={32} />
        {t('nav.settings.title@@Settings')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.settings.description@@Manage your settings and preferences here.')}
      </p>

      <div class="grid sm:grid-cols-3 gap-2">
        <SelectMenu id="lang-picker"
          values={config.supportedLocales.map(value => (
            {
              name: languages[value.lang as keyof typeof languages],
              value: value.lang,
            }
          ))}
          value={locale.lang}
          onChange$={async (e, el) => {
            settingsStore.locale = el.value as keyof typeof languages;
            setCookies('settings', settingsStore);
            await setUserData({ settings: settingsStore });
            location.reload();
          }}>
          {t('settings.language@@Language')}
        </SelectMenu>

        <div class="flex flex-col gap-1">
          <label for="theme">
            {t('settings.theme@@Theme Preference')}
          </label>
          <ThemeToggle variant="full" showLabel />
        </div>

        <div class="flex flex-col gap-1">
          <Toggle id="cookies-toggle" checked={settingsStore.cookies} onChange$={async (e, el) => {
            settingsStore.cookies = el.checked;
            setCookies('settings', settingsStore);
            await setUserData({ settings: settingsStore });
          }}>
            <Cookie />
            {t('settings.cookies.title@@Enable Cookies')}
          </Toggle>
          <p>
            {t('settings.cookies.description@@Allow Birdflop to use cookies for personalization and improved user experience.')}
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <Toggle id="flopbird-toggle" checked={settingsStore.flopbird?.toggle} onChange$={async (e, el) => {
            settingsStore.flopbird = {
              ...settingsStore.flopbird,
              toggle: el.checked,
            };
            setCookies('settings', settingsStore);
            await setUserData({ settings: settingsStore });
          }}>
            <Bird />
            {t('settings.flopbird.enable@@Enable Flopbird')}
          </Toggle>
          <p>
            {t('settings.flopbird.description@@Our cute little mascot sitting in the corner of the screen, guiding you with helpful information about the page you\'re on. Experimental')}
          </p>
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Settings - Birdflop',
  description: 'Manage your Birdflop settings and preferences. ' + defaultDescription,
});