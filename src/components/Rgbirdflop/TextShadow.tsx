import { component$, useContext, useSignal } from '@builder.io/qwik';
import { rgbStoreContext } from '~/routes/resources/rgb';
import ColorMap from './ColorMap';
import ColorList from './ColorList';
import { inlineTranslate } from 'qwik-speak';
import { Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const enabled = useSignal(!!rgbStore.shadowcolors);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-300': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="decode">
      {rgbStore.format.color != 'JSON' && rgbStore.format.color != 'MiniMessage' &&
        <p class="text-red-500!">
          {t('rgb.colors.shadow.warning@@Warning: Text shadow only works with JSON or MiniMessage formatting!')}
        </p>
      }
      <Toggle id="textshadowtoggle"
        checked={!!rgbStore.shadowcolors}
        onChange$={(e, el) => {
          if (!el.checked) {
            rgbStore.shadowcolors = null;
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
        'opacity-50': !rgbStore.shadowcolors && !enabled.value,
      }}>
        <div class="py-2 px-4">
          <ColorMap id="shadow"/>
        </div>
        <ColorList id="shadow" hidden={hidden}/>
      </div>
    </div>
  );
});