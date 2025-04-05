import { component$, useContext } from '@builder.io/qwik';
import { Toggle } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="formatting">
      <Toggle id="bold" checked={rgbStore.bold}
        onChange$={(e, el) => { rgbStore.bold = el.checked; }}
        label={`${t('color.bold@@Bold')} - ${rgbStore.format.char ? `${rgbStore.format.char}l` : rgbStore.format.bold?.replace('$t', '')}`} />
      <Toggle id="italic" checked={rgbStore.italic}
        onChange$={(e, el) => { rgbStore.italic = el.checked; }}
        label={`${t('color.italic@@Italic')} - ${rgbStore.format.char ? `${rgbStore.format.char}o` : rgbStore.format.italic?.replace('$t', '')}`} />
      <Toggle id="underline" checked={rgbStore.underline}
        onChange$={(e, el) => { rgbStore.underline = el.checked; }}
        label={`${t('color.underline@@Underline')} - ${rgbStore.format.char ? `${rgbStore.format.char}n` : rgbStore.format.underline?.replace('$t', '')}`} />
      <Toggle id="strikethrough" checked={rgbStore.strikethrough}
        onChange$={(e, el) => { rgbStore.strikethrough = el.checked; }}
        label={`${t('color.strikethrough@@Strikethrough')} - ${rgbStore.format.char ? `${rgbStore.format.char}m` : rgbStore.format.strikethrough?.replace('$t', '')}`} />
    </div>
  );
});