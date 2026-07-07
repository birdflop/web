import { component$, useContext, useSignal } from '@builder.io/qwik';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import ColorMap from '~/components/rgbirdflop/ColorMap';
import ColorList from '~/components/rgbirdflop/ColorList';
import { inlineTranslate } from 'qwik-speak';
import { Toggle } from '@luminescent/ui-qwik';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);
  const enabled = useSignal(!!rgbStore.shadowColors);

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-300': true,
        'pointer-events-none h-0 opacity-0': hidden,
        'pointer-events-auto opacity-100': !hidden,
      }}
      id="decode"
    >
      {rgbStore.colorFormat.color != 'JSON' &&
        rgbStore.colorFormat.color != 'MiniMessage' && (
        <p class="text-red-500!">
          {t(
            'rgb.colors.shadow.warning@@Warning: Text shadow only works with JSON or MiniMessage formatting!',
          )}
        </p>
      )}
      <Toggle
        id="textshadowtoggle"
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
      <div
        class={{
          'transition-all duration-300': true,
          'opacity-50': !rgbStore.shadowColors && !enabled.value,
        }}
      >
        <div class="px-4 py-2">
          <ColorMap id="shadow" />
        </div>
        <ColorList id="shadow" />
      </div>
    </div>
  );
});
