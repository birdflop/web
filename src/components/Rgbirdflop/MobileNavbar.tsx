import { component$, Slot, useContext } from '@builder.io/qwik';
import { Clipboard, Palette, Save, Settings, Sparkles } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

export default component$(() => {
  const t = inlineTranslate();
  const openItems = useContext(openItemsContext);
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class="sm:hidden lum-card flex-row gap-1 *:lum-btn *:rounded-lum-1 p-1 my-2 min-w-0 w-full overflow-auto">
      <button onClick$={() => {
        openItems.value = openItems.value.includes('colors')
          ? openItems.value.filter(item => item !== 'colors')
          : ['colors'];
      }} class={{
        'lum-grad-bg-blue!': openItems.value.includes('colors'),
      }}>
        <Palette />
        {t('rgb.colors.title@@Colors')}
      </button>
      <button onClick$={() => {
        openItems.value = openItems.value.includes('output')
          ? openItems.value.filter(item => item !== 'output')
          : ['output'];
      }} class={{
        'lum-grad-bg-blue!': openItems.value.includes('output'),
      }}>
        <Clipboard />
        {t('rgb.output.title@@Output')}
      </button>
      <button onClick$={() => {
        openItems.value = openItems.value.includes('options')
          ? openItems.value.filter(item => item !== 'options')
          : ['options'];
      }} class={{
        'lum-grad-bg-blue!': openItems.value.includes('options'),
      }}>
        <Settings />
        {t('rgb.options@@Options')}
      </button>
      <button onClick$={() => {
        openItems.value = openItems.value.includes('presets')
          ? openItems.value.filter(item => item !== 'presets')
          : ['presets'];
      }} class={{
        'lum-grad-bg-blue!': openItems.value.includes('presets'),
      }}>
        <Save />
        {t('rgb.presets.title@@Presets')}
      </button>
      {rgbStore.customFormat && (
        <button onClick$={() => {
          openItems.value = openItems.value.includes('formatoptions')
            ? openItems.value.filter(item => item !== 'formatoptions')
            : ['formatoptions'];
        }} class={{
          'lum-grad-bg-blue!': openItems.value.includes('formatoptions'),
        }}>
          <Settings />
          {t('rgb.formatting.options@@Format Options')}
        </button>
      )}
      <Slot />
      <button onClick$={() => {
        openItems.value = openItems.value.includes('decode')
          ? openItems.value.filter(item => item !== 'decode')
          : ['decode'];
      }} class={{
        'lum-grad-bg-blue!': openItems.value.includes('decode'),
      }}>
        <Sparkles />
        {t('rgb.decode.title@@Decode')}
        <span class="lum-grad-bg-blue/50 text-xs py-1 px-2 rounded-lum-1">
          {t('nav.experimental@@experimental')}
        </span>
      </button>
    </div>
  );
});