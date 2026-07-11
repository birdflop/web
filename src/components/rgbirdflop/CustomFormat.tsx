import { component$, useContext } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div
      class={{
        'grid grid-cols-2 gap-2 transition-all duration-200': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-125 opacity-100': !hidden,
      }}
      id="customformat"
    >
      <div
        class={{
          'flex flex-col gap-2': true,
        }}
      >
        <label for="customformat">
          {t('rgb.colors.customFormat@@Custom Format')}
        </label>
        <input
          class="lum-input"
          id="customformat"
          value={rgbStore.colorFormat.color}
          placeholder="&#$1$2$3$4$5$6$f$c"
          onInput$={(e, el) => {
            rgbStore.colorFormat.color = el.value;
          }}
        />
        <div class="font-mono text-sm">
          <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
          <p>
            $1 = <strong class="text-red-400">R</strong>RGGBB
          </p>
          <p>
            $2 = R<strong class="text-red-400">R</strong>GGBB
          </p>
          <p>
            $3 = RR<strong class="text-green-400">G</strong>GBB
          </p>
          <p>
            $4 = RRG<strong class="text-green-400">G</strong>BB
          </p>
          <p>
            $5 = RRGG<strong class="text-blue-400">B</strong>B
          </p>
          <p>
            $6 = RRGGB<strong class="text-blue-400">B</strong>
          </p>
          {rgbStore.colorFormat.char && (
            <p>$f = {t('rgb.formatting.title@@Formatting')}</p>
          )}
          <p>$c = {t('rgb.colors.character@@Character')}</p>
        </div>
      </div>
      <div
        class={{
          'flex flex-col gap-2': true,
        }}
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
            <div class="font-mono text-sm">
              <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
              <p>$t = Output Text</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
