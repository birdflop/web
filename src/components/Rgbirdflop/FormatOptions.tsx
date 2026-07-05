import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-200': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-125 opacity-100': !hidden,
      }}
      id="formatoptions"
    >
      {rgbStore.colorFormat.char != undefined &&
        !rgbStore.colorFormat.bold &&
        !rgbStore.colorFormat.italic &&
        !rgbStore.colorFormat.underline &&
        !rgbStore.colorFormat.strikethrough && (
        <>
          <label for="format-char">
            {t('rgb.formatting.character@@Format Character')}
          </label>
          <input
            class="lum-input"
            id="format-char"
            value={rgbStore.colorFormat.char}
            placeholder="&"
            onInput$={(e, el) => {
              rgbStore.colorFormat.char = el.value;
            }}
          />
        </>
      )}
      {!rgbStore.colorFormat.char && (
        <>
          <label for="format-bold">{t('rgb.formatting.bold@@Bold')}</label>
          <input
            class="lum-input"
            id="format-bold"
            value={rgbStore.colorFormat.bold}
            placeholder="<bold>$t</bold>"
            onInput$={(e, el) => {
              rgbStore.colorFormat.bold = el.value;
            }}
          />
          <label for="format-italic">
            {t('rgb.formatting.italic@@Italic')}
          </label>
          <input
            class="lum-input"
            id="format-italic"
            value={rgbStore.colorFormat.italic}
            placeholder="<italic>$t</italic>"
            onInput$={(e, el) => {
              rgbStore.colorFormat.italic = el.value;
            }}
          />
          <label for="format-underline">
            {t('rgb.formatting.underline@@Underline')}
          </label>
          <input
            class="lum-input"
            id="format-underline"
            value={rgbStore.colorFormat.underline}
            placeholder="<underlined>$t</underlined>"
            onInput$={(e, el) => {
              rgbStore.colorFormat.underline = el.value;
            }}
          />
          <label for="format-strikethrough">
            {t('rgb.formatting.strikethrough@@Strikethrough')}
          </label>
          <input
            class="lum-input"
            id="format-strikethrough"
            value={rgbStore.colorFormat.strikethrough}
            placeholder="<strikethrough>$t</strikethrough>"
            onInput$={(e, el) => {
              rgbStore.colorFormat.strikethrough = el.value;
            }}
          />
          <label for="format-obfuscate">
            {t('rgb.formatting.obfuscate@@Obfuscate')}
          </label>
          <input
            class="lum-input"
            id="format-obfuscate"
            value={rgbStore.colorFormat.obfuscate}
            placeholder="<obfuscated>$t</obfuscated>"
            onInput$={(e, el) => {
              rgbStore.colorFormat.obfuscate = el.value;
            }}
          />
          <div class="py-3 font-mono">
            <p>{t('rgb.formatting.placeholders@@Placeholders')}</p>
            <p>$t = Output Text</p>
          </div>
        </>
      )}
    </div>
  );
});
