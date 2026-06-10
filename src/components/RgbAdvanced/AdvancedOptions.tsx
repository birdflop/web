import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { colorFormats } from '@birdflop/rgbirdflop';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: { hidden?: boolean }) => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);

  const formatName = (color: string) =>
    color
      .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
      .replace('$f', '').replace('$c', '');

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-120 opacity-100 pointer-events-auto': !hidden,
    }}>
      <div class="flex flex-col md:grid grid-cols-2 gap-2">
        <SelectMenu id="adv-format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)}
          class={{ 'w-full': true }}
          onChange$={(e, el) => {
            if (el.value == 'custom') {
              store.customFormat = true;
            } else {
              store.customFormat = false;
              store.format = JSON.parse(el.value);
            }
          }}
          values={[
            ...(!store.customFormat && !colorFormats.find((f) => f.color == store.format.color)
              ? [{ name: formatName(store.format.color), value: JSON.stringify(store.format) }]
              : []),
            ...colorFormats.map((format) => ({ name: formatName(format.color), value: JSON.stringify(format) })),
            {
              name: store.customFormat
                ? `${t('rgb.colors.customFormat@@Custom Format')}: ${formatName(store.format.color)}`
                : t('rgb.colors.customFormat@@Custom Format'),
              value: 'custom',
            },
          ]}>
          {t('rgb.colors.format@@Color Format')}
        </SelectMenu>

        <div class="flex flex-col gap-1">
          <label for="adv-prefixsuffix">{t('rgb.prefixsuffix@@Prefix/Suffix')}</label>
          <input class="lum-input" id="adv-prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'}
            onInput$={(e, el) => { store.prefixsuffix = el.value; }} />
        </div>

        {store.customFormat &&
          <div id="adv-customformat" class="flex flex-col gap-2 col-span-2">
            <label for="adv-customformat-input">{t('rgb.colors.customFormat@@Custom Format')}</label>
            <input class="lum-input" id="adv-customformat-input" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c"
              onInput$={(e, el) => { store.format = { ...store.format, color: el.value }; }} />
            <div class="font-mono text-sm">
              <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
              <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
              <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
              <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
              <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
              <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
              <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
              {store.format.char && <p>$f = {t('rgb.formatting.title@@Formatting')}</p>}
              <p>$c = {t('rgb.colors.character@@Character')}</p>
            </div>
          </div>
        }

        {store.format.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="adv-trimspaces" checked={store.trimspaces}
              onChange$={(e, el) => { store.trimspaces = el.checked; }}>
              {t('rgb.colors.trimSpaces.title@@Trim colors from spaces')}
            </Toggle>
            <p class="text-xs text-lum-text-secondary">
              {t('rgb.colors.trimSpaces.description@@Turn this off if you\'re using empty underlines / strikethroughs')}
            </p>
          </div>
        }

        {store.format.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="adv-lowercase" checked={store.lowercase}
              onChange$={(e, el) => { store.lowercase = el.checked; }}>
              {t('rgb.colors.lowercase.title@@Lowercase Hex Codes')}
            </Toggle>
            <p class="text-xs text-lum-text-secondary">
              {t('rgb.colors.lowercase.description@@Turn this on if you want to use lowercase hex codes.')}
            </p>
          </div>
        }
      </div>
    </div>
  );
});
