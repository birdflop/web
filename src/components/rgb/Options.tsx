import { component$, Slot, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { formats } from '~/util/rgb/presets/defaults';
import { Dropdown, Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[1000px] opacity-100 pointer-events-auto': !hidden,
    }}>
      <div class="flex flex-col md:grid grid-cols-2 gap-2">
        <Slot />
        <Dropdown id="format" value={rgbStore.customFormat ? 'custom' : JSON.stringify(rgbStore.format)} class={{ 'w-full': true }} onChange$={
          (e, el) => {
            if (el.value == 'custom') {
              rgbStore.customFormat = true;
            }
            else {
              rgbStore.customFormat = false;
              rgbStore.format = JSON.parse(el.value);
            }
          }
        } values={[
          ...formats.map(format => ({
            name: format.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${rgbStore.bold ? rgbStore.format.char + 'l' : ''}${rgbStore.italic ? rgbStore.format.char + 'o' : ''}${rgbStore.underline ? rgbStore.format.char + 'n' : ''}${rgbStore.strikethrough ? rgbStore.format.char + 'm' : ''}${rgbStore.obfuscate ? rgbStore.format.char + 'k' : ''}`)
              .replace('$c', ''),
            value: JSON.stringify(format),
          })),
          {
            name: rgbStore.customFormat ? `${t('rgb.colors.customFormat@@Custom Format')}: ${rgbStore.format.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${rgbStore.bold ? rgbStore.format.char + 'l' : ''}${rgbStore.italic ? rgbStore.format.char + 'o' : ''}${rgbStore.underline ? rgbStore.format.char + 'n' : ''}${rgbStore.strikethrough ? rgbStore.format.char + 'm' : ''}${rgbStore.obfuscate ? rgbStore.format.char + 'k' : ''}`)
              .replace('$c', '')}`
              : t('rgb.colors.customFormat@@Custom Format'),
            value: 'custom',
          },
        ]}>
          {t('rgb.colors.format@@Color Format')}
        </Dropdown>
        <div class="flex flex-col gap-1">
          <label for="prefixsuffix">
            {t('rgb.prefixsuffix@@Prefix/Suffix')}
          </label>
          <input class="lum-input" id="prefixsuffix" value={rgbStore.prefixsuffix} placeholder={'/nick $t'} onInput$={(e, el) => { rgbStore.prefixsuffix = el.value; }} />
        </div>
        {
          rgbStore.customFormat && <>
            <div id="customformat" class={{
              'flex flex-col gap-2 col-span-2': true,
            }}>
              <label for="customformat">
                {t('rgb.colors.customFormat@@Custom Format')}
              </label>
              <input class="lum-input" id="customformat" value={rgbStore.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { rgbStore.format.color = el.value; }} />
              <div class="font-mono text-sm">
                <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
                <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
                <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
                <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
                <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
                <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
                <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
                {rgbStore.format.char && <p>$f = {t('rgb.formatting.title@@Formatting')}</p>}
                <p>$c = {t('rgb.colors.character@@Character')}</p>
              </div>
            </div>
          </>
        }
        <div class="flex flex-col gap-1">
          <Toggle id="disperse" checked={rgbStore.disperse}
            onChange$={(e, el) => { rgbStore.disperse = el.checked; }}
            label={<p class="flex flex-col"><span>Always disperse colors</span></p>} />
          <p class="text-xs text-gray-400">Turn this on if you want the gradient to always be equally spread out. This will disable the gradient map.</p>
        </div>
        {rgbStore.format.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="trimspaces" checked={rgbStore.trimspaces}
              onChange$={(e, el) => { rgbStore.trimspaces = el.checked; }}
              label={'Trim colors from spaces'} />
            <p class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</p>
          </div>
        }
        {rgbStore.format.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="lowercase" checked={rgbStore.lowercase}
              onChange$={(e, el) => { rgbStore.lowercase = el.checked; }}
              label={'Make hex code lowercase'} />
            <p class="text-xs text-gray-400">Turn this on if for some reason your format needs all lowercase hex codes</p>
          </div>
        }
      </div>
    </div>
  );
});