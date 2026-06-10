import { component$, useContext, useSignal } from '@builder.io/qwik';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import ColorMap from './ColorMap';
import ColorList from './ColorList';
import { inlineTranslate } from 'qwik-speak';
import { Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const enabled = useSignal(!!rgbStore.shadowColors);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-300': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="decode">
      {rgbStore.colorFormat.color != 'JSON' && rgbStore.colorFormat.color != 'MiniMessage' &&
        <p class="text-red-500!">
          {t('rgb.colors.shadow.warning@@Warning: Text shadow only works with JSON or MiniMessage formatting!')}
        </p>
      }
      <Toggle id="textshadowtoggle"
        checked={!!rgbStore.shadowColors}
        onChange$={(e, el) => {
          if (!el.checked) {
            rgbStore.shadowColors = null;
            enabled.value = false;
          } else {
            enabled.value = true;
          }
        }}
      >
        {t('rgb.colors.shadow.enable@@Custom Text Shadow')}
      </Toggle>
      <div class={{
        'transition-all duration-300': true,
        'opacity-50': !rgbStore.shadowColors && !enabled.value,
      }}>
        <div class="py-2 px-4">
          <ColorMap id="shadow"/>
        </div>
        <ColorList id="shadow"/>
      </div>
    </div>
  );
});