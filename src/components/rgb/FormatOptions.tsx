import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[500px] opacity-100 pointer-events-auto': !hidden,
    }} id="formatoptions">
      {(rgbStore.format.char != undefined && !rgbStore.format.bold && !rgbStore.format.italic && !rgbStore.format.underline && !rgbStore.format.strikethrough) && <>
        <label for="format-char">
          {t('rgb.formatting.character@@Format Character')}
        </label>
        <input class="lum-input" id="format-char" value={rgbStore.format.char} placeholder="&" onInput$={(e, el) => { rgbStore.format.char = el.value; }}/>
      </>}
      {!rgbStore.format.char &&
        <>
          <label for="format-bold">
            {t('rgb.formatting.bold@@Bold')}
          </label>
          <input class="lum-input" id="format-bold" value={rgbStore.format.bold} placeholder="<bold>$t</bold>" onInput$={(e, el) => { rgbStore.format.bold = el.value; }}/>
          <label for="format-italic">
            {t('rgb.formatting.italic@@Italic')}
          </label>
          <input class="lum-input" id="format-italic" value={rgbStore.format.italic} placeholder="<italic>$t</italic>" onInput$={(e, el) => { rgbStore.format.italic = el.value; }}/>
          <label for="format-underline">
            {t('rgb.formatting.underline@@Underline')}
          </label>
          <input class="lum-input" id="format-underline" value={rgbStore.format.underline} placeholder="<underlined>$t</underlined>" onInput$={(e, el) => { rgbStore.format.underline = el.value; }}/>
          <label for="format-strikethrough">
            {t('rgb.formatting.strikethrough@@Strikethrough')}
          </label>
          <input class="lum-input" id="format-strikethrough" value={rgbStore.format.strikethrough} placeholder="<strikethrough>$t</strikethrough>" onInput$={(e, el) => { rgbStore.format.strikethrough = el.value; }}/>
          <label for="format-obfuscate">
            {t('rgb.formatting.obfuscate@@Obfuscate')}
          </label>
          <input class="lum-input" id="format-obfuscate" value={rgbStore.format.obfuscate} placeholder="<obfuscated>$t</obfuscated>" onInput$={(e, el) => { rgbStore.format.obfuscate = el.value; }}/>
          <div class="py-3 font-mono">
            <p>{t('rgb.formatting.placeholders@@Placeholders')}</p>
            <p>$t = Output Text</p>
          </div>
        </>
      }
    </div>
  );
});