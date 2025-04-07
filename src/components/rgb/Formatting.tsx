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

  const getFormatLabel = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    if (rgbStore.format.char) {
      const formatMap = { bold: 'l', italic: 'o', underline: 'n', strikethrough: 'm' };
      return ` - ${rgbStore.format.char}${formatMap[formatType]}`;
    }

    const formatValue = rgbStore.format[formatType];
    if (formatValue) {
      return ` - ${formatValue.replace('$t', '')}`;
    }

    return '';
  };

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="formatting">
      <Toggle id="bold" checked={rgbStore.bold}
        onChange$={(e, el) => { rgbStore.bold = el.checked; }}
        label={`${t('color.bold@@Bold')}${getFormatLabel('bold')}`} />
      <Toggle id="italic" checked={rgbStore.italic}
        onChange$={(e, el) => { rgbStore.italic = el.checked; }}
        label={`${t('color.italic@@Italic')}${getFormatLabel('italic')}`} />
      <Toggle id="underline" checked={rgbStore.underline}
        onChange$={(e, el) => { rgbStore.underline = el.checked; }}
        label={`${t('color.underline@@Underline')}${getFormatLabel('underline')}`} />
      <Toggle id="strikethrough" checked={rgbStore.strikethrough}
        onChange$={(e, el) => { rgbStore.strikethrough = el.checked; }}
        label={`${t('color.strikethrough@@Strikethrough')}${getFormatLabel('strikethrough')}`} />
    </div>
  );
});