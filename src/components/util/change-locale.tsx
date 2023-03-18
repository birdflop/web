import { component$, $ } from '@builder.io/qwik';
import { ChevronDownIcon } from 'qwik-feather-icons';
import { changeLocale, $translate as t, useSpeakContext, useSpeakConfig, SpeakLocale } from 'qwik-speak';

export default component$(() => {
  const ctx = useSpeakContext();
  const config = useSpeakConfig();

  const changeLocale$ = $(async (newLocale: SpeakLocale) => {
    await changeLocale(newLocale, ctx);

    document.cookie = `locale=${JSON.stringify(newLocale)};max-age=86400;path=/`;
  });

  return (
    <button class="cursor-pointer transition duration-200 ease-in-out hidden sm:flex bg-gray-900 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl border-2 border-gray-900 hover:border-gray-700 group rounded-lg text-md items-center gap-4">
      <div class="px-4 py-3 flex gap-4 items-center">
        {t('nav.changeLocale@@Change locale')}
        <ChevronDownIcon class="transform group-hover:-rotate-180 transition duration-300 ease-in-out" />
      </div>
      <div class="absolute top-0 left-0 z-10 hidden group-hover:flex pt-16">
        <div class="bg-black/50 rounded-xl px-3 py-4 flex flex-col space-y-2 font-medium whitespace-nowrap overflow-y-auto max-h-[calc(100svh-128px)]">
          {config.supportedLocales.map(value => <>
            <div onClick$={async () => await changeLocale$(value)}>
              {value.lang}
            </div>
          </>)}
        </div>
      </div>
    </button>
  );
});
// <div>
//   <div>{t('app.changeLocale@@Change locale')}</div>
//   {config.supportedLocales.map(value => (
//     <button onClick$={async () => await changeLocale$(value)}>
//       {value.lang}
//     </button>
//   ))}
// </div>