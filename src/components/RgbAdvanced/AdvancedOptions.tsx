import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { colorFormats } from '@birdflop/rgbirdflop';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';

export default component$(({ hidden }: { hidden?: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

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
        <SelectMenu id="adv-format" value={rgbStore.customFormat ? 'custom' : JSON.stringify(rgbStore.colorFormat)}
          class={{ 'w-full': true }}
          onChange$={(e, el) => {
            if (el.value == 'custom') {
              rgbStore.customFormat = true;
            } else {
              rgbStore.customFormat = false;
              rgbStore.colorFormat = JSON.parse(el.value);
            }
          }}
          values={[
            ...(!rgbStore.customFormat && !colorFormats.find((f) => f.color == rgbStore.colorFormat.color)
              ? [{ name: formatName(rgbStore.colorFormat.color), value: JSON.stringify(rgbStore.colorFormat) }]
              : []),
            ...colorFormats.map((format) => ({ name: formatName(format.color), value: JSON.stringify(format) })),
            {
              name: rgbStore.customFormat
                ? `${t('rgb.colors.customFormat@@Custom Format')}: ${formatName(rgbStore.colorFormat.color)}`
                : t('rgb.colors.customFormat@@Custom Format'),
              value: 'custom',
            },
          ]}>
          {t('rgb.colors.format@@Color Format')}
        </SelectMenu>

        <div class="flex flex-col gap-1">
          <label for="adv-prefixsuffix">{t('rgb.prefixsuffix@@Prefix/Suffix')}</label>
          <input class="lum-input" id="adv-prefixsuffix" value={rgbStore.prefixSuffix} placeholder={'/nick $t'}
            onInput$={(e, el) => { rgbStore.prefixSuffix = el.value; }} />
        </div>

        {rgbStore.customFormat &&
          <div id="adv-customformat" class="flex flex-col gap-2 col-span-2">
            <label for="adv-customformat-input">{t('rgb.colors.customFormat@@Custom Format')}</label>
            <input class="lum-input" id="adv-customformat-input" value={rgbStore.colorFormat.color} placeholder="&#$1$2$3$4$5$6$f$c"
              onInput$={(e, el) => { rgbStore.colorFormat = { ...rgbStore.colorFormat, color: el.value }; }} />
            <div class="font-mono text-sm">
              <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
              <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
              <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
              <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
              <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
              <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
              <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
              {rgbStore.colorFormat.char && <p>$f = {t('rgb.formatting.title@@Formatting')}</p>}
              <p>$c = {t('rgb.colors.character@@Character')}</p>
            </div>
          </div>
        }

        {rgbStore.colorFormat.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="adv-trimspaces" checked={rgbStore.trimSpaces}
              onChange$={(e, el) => { rgbStore.trimSpaces = el.checked; }}>
              {t('rgb.colors.trimSpaces.title@@Trim colors from spaces')}
            </Toggle>
            <p class="text-xs text-lum-text-secondary">
              {t('rgb.colors.trimSpaces.description@@Turn this off if you\'re using empty underlines / strikethroughs')}
            </p>
          </div>
        }

        {rgbStore.colorFormat.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="adv-lowercase" checked={rgbStore.lowercase}
              onChange$={(e, el) => { rgbStore.lowercase = el.checked; }}>
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
