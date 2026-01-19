import { component$ } from '@builder.io/qwik';
import { SelectMenu } from '@luminescent/ui-qwik';
import { Settings } from 'lucide-icons-qwik';
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from 'qwik-speak';
import { ThemeToggle } from '~/components/Elements/ThemeToggle';
import { defaultDescription, generateHead } from '~/root';
import { languages } from '~/speak-config';

export default component$(() => {
  const t = inlineTranslate();
  const config = useSpeakConfig();
  const locale = useSpeakLocale();

  return (
    <section class="flex mx-auto max-w-xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-15 w-full">
        <h1 class='flex gap-3 text-2xl! items-center my-2!'>
          <Settings size={32} />
          {t('nav.settings.title@@Settings')}
        </h1>
        <p class="mb-4 border-b border-lum-border/10 pb-4">
          {t('nav.settings.description@@Manage your settings and preferences here.')}
        </p>

        <div class="flex flex-col gap-2">
          <SelectMenu id="lang-picker" panelClass='lum-bg-nav-bg'
            values={config.supportedLocales.map(value => (
              {
                name: languages[value.lang as keyof typeof languages],
                value: value.lang,
              }
            ))}
            value={locale.lang}
            onChange$={(e, el) => {
              document.cookie = `locale=${JSON.stringify(config.supportedLocales.find(locale => locale.lang == el.value))};max-age=86400;path=/`;
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
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Resources - Free Minecraft Resources by Birdflop',
  description: 'Public resources developed by Birdflop. ' + defaultDescription,
});