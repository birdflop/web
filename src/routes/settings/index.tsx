import { component$, useContext } from "@qwik.dev/core";
import { SelectMenu, Toggle } from "@luminescent/ui-qwik";
import Bird from "lucide-icons-qwik/icons/Bird";
import Cookie from "lucide-icons-qwik/icons/Cookie";
import Settings from "lucide-icons-qwik/icons/Settings";
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from "qwik-speak";
import { ThemeToggle } from "~/components/Elements/ThemeToggle";
import { defaultDescription, generateHead } from "~/root";
import { languages } from "~/speak-config";
import { SettingsContext } from "../layout";
import { setCookies, setUserData } from "~/util/dataUtils";

export default component$(() => {
  const t = inlineTranslate();
  const config = useSpeakConfig();
  const locale = useSpeakLocale();
  const settingsStore = useContext(SettingsContext);

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Settings size={32} />
        {t("nav.settings.title@@Settings")}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          "nav.settings.description@@Manage your settings and preferences here.",
        )}
      </p>

      <div class="grid gap-2 sm:grid-cols-3">
        <SelectMenu
          id="lang-picker"
          values={config.supportedLocales.map((value) => ({
            name: languages[value.lang as keyof typeof languages],
            value: value.lang,
          }))}
          value={locale.lang}
          onChange$={async (e, el) => {
            settingsStore.locale = el.value as keyof typeof languages;
            setCookies("settings", settingsStore);
            await setUserData({ settings: settingsStore });
            location.reload();
          }}
        >
          {t("settings.language@@Language")}
        </SelectMenu>

        <div class="flex flex-col gap-1">
          <label for="theme">{t("settings.theme@@Theme Preference")}</label>
          <ThemeToggle variant="full" showLabel />
        </div>

        <div class="flex flex-col gap-1">
          <Toggle
            id="cookies-toggle"
            checked={settingsStore.cookies}
            onChange$={async (e, el) => {
              settingsStore.cookies = el.checked;
              setCookies("settings", settingsStore);
              await setUserData({ settings: settingsStore });
            }}
          >
            <Cookie />
            {t("settings.cookies.title@@Enable Cookies")}
          </Toggle>
          <p>
            {t(
              "settings.cookies.description@@Allow Birdflop to use cookies for personalization and improved user experience.",
            )}
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <Toggle
            id="flopbird-toggle"
            checked={settingsStore.flopbird?.toggle}
            onChange$={async (e, el) => {
              settingsStore.flopbird = {
                ...settingsStore.flopbird,
                toggle: el.checked,
              };
              setCookies("settings", settingsStore);
              await setUserData({ settings: settingsStore });
            }}
          >
            <Bird />
            {t("settings.flopbird.enable@@Enable Flopbird")}
          </Toggle>
          <p>
            {t(
              "settings.flopbird.description@@Our cute little mascot sitting in the corner of the screen, guiding you with helpful information about the page you're on. Experimental",
            )}
          </p>
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: "Settings - Birdflop",
  description:
    "Manage your Birdflop settings and preferences. " + defaultDescription,
});
