import { component$ } from '@builder.io/qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';
import { v3formats } from '../util/PresetUtils';
import { Dropdown, Toggle } from '@luminescent/ui-qwik';

export default component$(({ store, hidden }: {
  store: typeof rgbDefaults;
  hidden: boolean;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[500px] opacity-100 pointer-events-auto': !hidden,
    }}>
      <div class="flex flex-col md:grid grid-cols-2 gap-2">
        <Dropdown id="format" value={store.customFormat ? 'custom' : JSON.stringify(store.format)} class={{ 'w-full': true }} onChange$={
          (e, el) => {
            if (el.value == 'custom') {
              store.customFormat = true;
            }
            else {
              store.customFormat = false;
              store.format = JSON.parse(el.value);
            }
          }
        } values={[
          ...v3formats.map(format => ({
            name: format.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
              .replace('$c', ''),
            value: JSON.stringify(format),
          })),
          {
            name: store.customFormat ? `Custom: ${store.format.color
              .replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b')
              .replace('$f', `${store.bold ? store.format.char + 'l' : ''}${store.italic ? store.format.char + 'o' : ''}${store.underline ? store.format.char + 'n' : ''}${store.strikethrough ? store.format.char + 'm' : ''}`)
              .replace('$c', '')}`
              : t('color.custom@@Custom'),
            value: 'custom',
          },
        ]}>
          {t('color.colorFormat@@Color Format')}
        </Dropdown>
        <div class="flex flex-col gap-1">
          <label for="prefixsuffix">
            {t('color.prefixsuffix@@Prefix/Suffix')}
          </label>
          <input class="lum-input" id="prefixsuffix" value={store.prefixsuffix} placeholder={'/nick $t'} onInput$={(e, el) => { store.prefixsuffix = el.value; }}/>
        </div>
        <div class="flex flex-col gap-1">
          <Toggle id="disperse" checked={store.disperse}
            onChange$={(e, el) => { store.disperse = el.checked; }}
            label={<p class="flex flex-col"><span>Always disperse colors</span></p>} />
          <p class="text-xs text-gray-400">Turn this on if you want the gradient to always be equally spread out. This will disable the gradient map.</p>
        </div>
        {store.format.color != 'MiniMessage' &&
          <div class="flex flex-col gap-1">
            <Toggle id="trimspaces" checked={store.trimspaces}
              onChange$={(e, el) => { store.trimspaces = el.checked; }}
              label={'Trim colors from spaces'} />
            <p class="text-xs text-gray-400">Turn this off if you're using empty underlines / strikethroughs</p>
          </div>
        }
      </div>

      {
        store.customFormat && <>
          <div id="customformat" class={{
            'flex flex-col gap-2': true,
          }}>
            <label for="customformat">
              {t('color.customFormat@@Custom Format')}
            </label>
            <input class="lum-input" id="customformat" value={store.format.color} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(e, el) => { store.format.color = el.value; }}/>
            <div class="py-3 font-mono">
              <p>{t('color.placeholders@@Placeholders:')}</p>
              <p>$1 = <strong class="text-red-400">R</strong>RGGBB</p>
              <p>$2 = R<strong class="text-red-400">R</strong>GGBB</p>
              <p>$3 = RR<strong class="text-green-400">G</strong>GBB</p>
              <p>$4 = RRG<strong class="text-green-400">G</strong>BB</p>
              <p>$5 = RRGG<strong class="text-blue-400">B</strong>B</p>
              <p>$6 = RRGGB<strong class="text-blue-400">B</strong></p>
              {store.format.char && <p>$f = {t('color.formatting@@Formatting')}</p>}
              <p>$c = {t('color.character@@Character')}</p>
            </div>
          </div>
        </>
      }
    </div>
  );
});