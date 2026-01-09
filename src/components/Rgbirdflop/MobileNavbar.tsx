import { component$, useContext } from '@builder.io/qwik';
import { Blend, Clipboard, FileJson, Palette, Settings, Sparkles } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

export default component$(({ animtab }: {
  animtab?: boolean;
}) => {
  const t = inlineTranslate();
  const openItemsStore = useContext(openItemsContext);
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class="sm:hidden lum-card flex-row gap-1 *:lum-btn *:rounded-lum-1 p-1 my-2 min-w-0 w-full overflow-auto">
      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('colors')
          ? openItemsStore.items.filter(item => item !== 'colors')
          : ['colors'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('colors'),
      }}>
        <Palette />
        {t('rgb.colors.title@@Colors')}
      </button>
      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('output')
          ? openItemsStore.items.filter(item => item !== 'output')
          : ['output'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('output'),
      }}>
        <Clipboard />
        {t('rgb.output.title@@Output')}
      </button>
      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('options')
          ? openItemsStore.items.filter(item => item !== 'options')
          : ['options'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('options'),
      }}>
        <Settings />
        {t('rgb.options@@Options')}
      </button>
      {rgbStore.customFormat && (
        <button onClick$={() => {
          openItemsStore.items = openItemsStore.items.includes('formatoptions')
            ? openItemsStore.items.filter(item => item !== 'formatoptions')
            : ['formatoptions'];
        }} class={{
          'lum-bg-blue!': openItemsStore.items.includes('formatoptions'),
        }}>
          <Settings />
          {t('rgb.formatting.options@@Format Options')}
        </button>
      )}
      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('textshadow')
          ? openItemsStore.items.filter(item => item !== 'textshadow')
          : ['textshadow'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('textshadow'),
      }}>
        <Blend />
        {t('rgb.colors.shadow.title@@Text Shadow')}
      </button>
      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('decode')
          ? openItemsStore.items.filter(item => item !== 'decode')
          : ['decode'];
      }} class={{
        'lum-bg-blue!': openItemsStore.items.includes('decode'),
      }}>
        <Sparkles />
        {t('rgb.decode.title@@Decode')}
        <span class='lum-bg-blue/50 text-xs py-1 px-2 rounded-lum-1'>
          {t('rgb.decode.experimental@@experimental')}
        </span>
      </button>
      {animtab &&
        <button onClick$={() => {
          openItemsStore.items = openItemsStore.items.includes('outputformat')
            ? openItemsStore.items.filter(item => item !== 'outputformat')
            : ['outputformat'];
        }} class={{
          'lum-bg-blue!': openItemsStore.items.includes('outputformat'),
        }}>
          <FileJson />
          {t('animtab.outputFormat.title@@Output Format')}
        </button>
      }
    </div>
  );
});