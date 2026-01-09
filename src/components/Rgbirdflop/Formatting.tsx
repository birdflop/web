import { component$, useContext } from '@builder.io/qwik';
import { Bold, Italic, Strikethrough, Underline, Wand2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

export default component$(() => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  const getFormatLabel = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'obfuscate') => {
    if (rgbStore.format.char) {
      const formatMap = { bold: 'l', italic: 'o', underline: 'n', strikethrough: 'm', obfuscate: 'k' };
      return ` - ${rgbStore.format.char}${formatMap[formatType]}`;
    }

    const formatValue = rgbStore.format[formatType];
    if (formatValue) {
      return ` - ${formatValue.replace('$t', '')}`;
    }

    return '';
  };

  return (
    <div class="lum-card p-1 flex-row gap-1 items-center *:lum-btn *:lum-bg-transparent *:p-2 *:group *:rounded-lum-1 justify-evenly" id="formatting">
      <button type="button" id="bold" class={{
        'lum-bg-blue! hover:lum-bg-blue/50!': rgbStore.bold,
      }} aria-pressed={rgbStore.bold} title={t('rgb.formatting.bold@@Bold')}
      onClick$={() => { rgbStore.bold = !rgbStore.bold; }}>
        <Bold size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 -top-[105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card lum-bg-lum-input-bg/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.bold@@Bold')}{getFormatLabel('bold')}
        </span>
      </button>
      <button type="button" id="italic" class={{
        'lum-bg-blue! hover:lum-bg-blue/50!': rgbStore.italic,
      }} aria-pressed={rgbStore.italic} title={t('rgb.formatting.italic@@Italic')}
      onClick$={() => { rgbStore.italic = !rgbStore.italic; }}>
        <Italic size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 -top-[105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card lum-bg-lum-input-bg/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.italic@@Italic')}{getFormatLabel('italic')}
        </span>
      </button>
      <button type="button" id="underline" class={{
        'lum-bg-blue! hover:lum-bg-blue/50!': rgbStore.underline,
      }} aria-pressed={rgbStore.underline} title={t('rgb.formatting.underline@@Underline')}
      onClick$={() => { rgbStore.underline = !rgbStore.underline; }}>
        <Underline size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 -top-[105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card lum-bg-lum-input-bg/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.underline@@Underline')}{getFormatLabel('underline')}
        </span>
      </button>
      <button type="button" id="strikethrough" class={{
        'lum-bg-blue! hover:lum-bg-blue/50!': rgbStore.strikethrough,
      }} aria-pressed={rgbStore.strikethrough} title={t('rgb.formatting.strikethrough@@Strikethrough')}
      onClick$={() => { rgbStore.strikethrough = !rgbStore.strikethrough; }}>
        <Strikethrough size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 -top-[105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card lum-bg-lum-input-bg/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.strikethrough@@Strikethrough')}{getFormatLabel('strikethrough')}
        </span>
      </button>
      <button type="button" id="obfuscate" class={{
        'lum-bg-blue! hover:lum-bg-blue/50!': rgbStore.obfuscate,
      }} aria-pressed={rgbStore.obfuscate} title={t('rgb.formatting.obfuscate@@Obfuscate')}
      onClick$={() => { rgbStore.obfuscate = !rgbStore.obfuscate; }}>
        <Wand2 size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 -top-[105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card lum-bg-lum-input-bg/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.obfuscate@@Obfuscate')}{getFormatLabel('obfuscate')}
        </span>
      </button>
    </div>
  );
});