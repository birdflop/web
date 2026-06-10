import { component$, useContext } from '@builder.io/qwik';
import { Bold, Italic, Strikethrough, Underline, Wand2 } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { selectionContext } from './Input';

export default component$(() => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const selection = useContext(selectionContext);

  const getFormatLabel = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'obfuscate') => {
    if (rgbStore.colorFormat.char) {
      const formatMap = { bold: 'l', italic: 'o', underline: 'n', strikethrough: 'm', obfuscate: 'k' };
      return ` - ${rgbStore.colorFormat.char}${formatMap[formatType]}`;
    }

    const formatValue = rgbStore.colorFormat[formatType];
    if (formatValue) {
      return ` - ${formatValue.replace('$t', '')}`;
    }

    return '';
  };

  const selectedFormatting = rgbStore.formatting.find((f) => f.start == selection.value?.start && f.end == selection.value?.end);
  const formatting = selectedFormatting || rgbStore.defaultFormatting;

  return (
    <div class={{
      'lum-card p-1 flex-row gap-1 items-center justify-evenly transition-colors duration-200': true,
      '*:lum-btn *:lum-bg-transparent *:p-2 *:group *:rounded-lum-1': true,
      'lum-bg-blue/20': !!selection.value,
    }}
    id="formatting">
      <button type="button" id="bold"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.bold,
        }}
        aria-pressed={formatting.bold} title={t('rgb.formatting.bold@@Bold')}
        onClick$={() => {
          if (selection.value && !selectedFormatting) {
            rgbStore.formatting.push({ start: selection.value.start, end: selection.value.end, ...formatting });
          }
          formatting.bold = !formatting.bold;
        }}
      >
        <Bold size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.bold@@Bold')}{getFormatLabel('bold')}
        </span>
      </button>
      <button type="button" id="italic"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.italic,
        }}
        aria-pressed={formatting.italic} title={t('rgb.formatting.italic@@Italic')}
        onClick$={() => {
          if (selection.value && !selectedFormatting) {
            rgbStore.formatting.push({ start: selection.value.start, end: selection.value.end, ...formatting });
          }
          formatting.italic = !formatting.italic;
        }}>
        <Italic size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.italic@@Italic')}{getFormatLabel('italic')}
        </span>
      </button>
      <button type="button" id="underline"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.underline,
        }}
        aria-pressed={formatting.underline} title={t('rgb.formatting.underline@@Underline')}
        onClick$={() => {
          if (selection.value && !selectedFormatting) {
            rgbStore.formatting.push({ start: selection.value.start, end: selection.value.end, ...formatting });
          }
          formatting.underline = !formatting.underline;
        }}>
        <Underline size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.underline@@Underline')}{getFormatLabel('underline')}
        </span>
      </button>
      <button type="button" id="strikethrough"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.strikethrough,
        }}
        aria-pressed={formatting.strikethrough} title={t('rgb.formatting.strikethrough@@Strikethrough')}
        onClick$={() => {
          if (selection.value && !selectedFormatting) {
            rgbStore.formatting.push({ start: selection.value.start, end: selection.value.end, ...formatting });
          }
          formatting.strikethrough = !formatting.strikethrough;
        }}>
        <Strikethrough size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.strikethrough@@Strikethrough')}{getFormatLabel('strikethrough')}
        </span>
      </button>
      <button type="button" id="obfuscate"
        class={{
          'lum-grad-bg-lum-accent/100!': formatting.obfuscate,
        }}
        aria-pressed={formatting.obfuscate} title={t('rgb.formatting.obfuscate@@Obfuscate')}
        onClick$={() => {
          if (selection.value && !selectedFormatting) {
            rgbStore.formatting.push({ start: selection.value.start, end: selection.value.end, ...formatting });
          }
          formatting.obfuscate = !formatting.obfuscate;
        }}>
        <Wand2 size={16} />
        <span class="absolute left-1/2 -translate-x-1/2 top-[-105%] transition-all duration-200 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 lum-card/100 lum-btn-p-1 whitespace-nowrap z-50">
          {t('rgb.formatting.obfuscate@@Obfuscate')}{getFormatLabel('obfuscate')}
        </span>
      </button>
    </div>
  );
});