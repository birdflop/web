import { component$ } from '@builder.io/qwik';
import { Toggle } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';

export default component$(({ store, hidden }: {
  store: typeof rgbDefaults;
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="formatting">
      <Toggle id="bold" checked={store.bold}
        onChange$={(e, el) => { store.bold = el.checked; }}
        label={`${t('color.bold@@Bold')} - ${store.format.char ? `${store.format.char}l` : store.format.bold?.replace('$t', '')}`} />
      <Toggle id="italic" checked={store.italic}
        onChange$={(e, el) => { store.italic = el.checked; }}
        label={`${t('color.italic@@Italic')} - ${store.format.char ? `${store.format.char}o` : store.format.italic?.replace('$t', '')}`} />
      <Toggle id="underline" checked={store.underline}
        onChange$={(e, el) => { store.underline = el.checked; }}
        label={`${t('color.underline@@Underline')} - ${store.format.char ? `${store.format.char}n` : store.format.underline?.replace('$t', '')}`} />
      <Toggle id="strikethrough" checked={store.strikethrough}
        onChange$={(e, el) => { store.strikethrough = el.checked; }}
        label={`${t('color.strikethrough@@Strikethrough')} - ${store.format.char ? `${store.format.char}m` : store.format.strikethrough?.replace('$t', '')}`} />
    </div>
  );
});