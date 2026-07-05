import { component$, Slot, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflopBase';
import { colorFormats, GRADIENT_TYPES, type GradientType } from '@birdflop/rgbirdflop';
import { SelectMenu, Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-120 opacity-100 pointer-events-auto': !hidden,
    }}>
      <div class="flex flex-col md:grid grid-cols-2 gap-2">
        <Slot />
        <SelectMenu id="format" value={rgbStore.customFormat ? 'custom' : JSON.stringify(rgbStore.colorFormat)} class={{ 'w-full': true }} onChange$={
          (e, el) => {
            if (el.value == 'custom') {
              rgbStore.customFormat = true;
            }
            else {
              rgbStore.customFormat = false;
              rgbStore.colorFormat = JSON.parse(el.value);
            }
          }
        } values={[
          ...!rgbStore.customFormat && !colorFormats.find((format) => format.color == rgbStore.colorFormat.color) ? [{
            name: rgbStore.colorFormat.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${rgbStore.baseFormatting?.bold ? rgbStore.colorFormat.char + 'l' : ''}${rgbStore.baseFormatting?.italic ? rgbStore.colorFormat.char + 'o' : ''}${rgbStore.baseFormatting?.underline ? rgbStore.colorFormat.char + 'n' : ''}${rgbStore.baseFormatting?.strikethrough ? rgbStore.colorFormat.char + 'm' : ''}${rgbStore.baseFormatting?.obfuscate ? rgbStore.colorFormat.char + 'k' : ''}`)
              .replace('$c', ''),
            value: JSON.stringify(rgbStore.colorFormat),
          }] : [],
          ...colorFormats.map(format => ({
            name: format.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${rgbStore.baseFormatting?.bold ? rgbStore.colorFormat.char + 'l' : ''}${rgbStore.baseFormatting?.italic ? rgbStore.colorFormat.char + 'o' : ''}${rgbStore.baseFormatting?.underline ? rgbStore.colorFormat.char + 'n' : ''}${rgbStore.baseFormatting?.strikethrough ? rgbStore.colorFormat.char + 'm' : ''}${rgbStore.baseFormatting?.obfuscate ? rgbStore.colorFormat.char + 'k' : ''}`)
              .replace('$c', ''),
            value: JSON.stringify(format),
          })),
          {
            name: rgbStore.customFormat ? `${t('rgb.colors.customFormat@@Custom Format')}: ${rgbStore.colorFormat.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${rgbStore.baseFormatting?.bold ? rgbStore.colorFormat.char + 'l' : ''}${rgbStore.baseFormatting?.italic ? rgbStore.colorFormat.char + 'o' : ''}${rgbStore.baseFormatting?.underline ? rgbStore.colorFormat.char + 'n' : ''}${rgbStore.baseFormatting?.strikethrough ? rgbStore.colorFormat.char + 'm' : ''}${rgbStore.baseFormatting?.obfuscate ? rgbStore.colorFormat.char + 'k' : ''}`)
              .replace('$c', '')}`
              : t('rgb.colors.customFormat@@Custom Format'),
            value: 'custom',
          },
        ]}>
          {t('rgb.colors.format@@Color Format')}
        </SelectMenu>
        <SelectMenu
          id="gradientType"
          value={rgbStore.gradientType}
          class={{ 'w-full': true }}
          onChange$={(e, el) => {
            const value = el.value as GradientType;
            rgbStore.gradientType = value;
          }}
          values={GRADIENT_TYPES.map(type => ({
            name: type,
            value: type,
          }))}
        >
          {t('rgb.colors.gradientType@@Gradient Type')}
        </SelectMenu>
        <div class="flex flex-col gap-1">
          <label for="prefixsuffix">
            {t('rgb.prefixsuffix@@Prefix/Suffix')}
          </label>
          <input class="lum-input" id="prefixsuffix" value={rgbStore.prefixSuffix} placeholder={'/nick $t'} onInput$={(e, el) => { rgbStore.prefixSuffix = el.value; }} />
        </div>
        {
          rgbStore.customFormat && <>
            <div id="customformat" class={{
              'flex flex-col gap-2 col-span-2': true,
            }}>
              <label for="customformat">
                {t('rgb.colors.customFormat@@Custom Format')}
              </label>
              <input class="lum-input" id="customformat" value={rgbStore.colorFormat.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { rgbStore.colorFormat.color = el.value; }} />
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
          </>
        }
        <div class="flex flex-col gap-1">
          <Toggle id="disperse" checked={rgbStore.disperse}
            onChange$={(e, el) => { rgbStore.disperse = el.checked; }}>
            {t('rgb.colors.disperse.always.title@@Always Disperse Colors')}
          </Toggle>
          <p class="text-xs text-lum-text-secondary">
            {t('rgb.colors.disperse.always.description@@Turn this on if you want the gradient to always be equally spread out. This will disable the gradient map.')}
          </p>
        </div>
        {rgbStore.colorFormat.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="trimspaces" checked={rgbStore.trimSpaces}
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
            <Toggle id="lowercase" checked={rgbStore.lowercase}
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