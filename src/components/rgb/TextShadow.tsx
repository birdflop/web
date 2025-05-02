import { component$, useContext } from '@builder.io/qwik';
import { rgbStoreContext } from '~/routes/resources/rgb';
import ColorMap from './ColorMap';
import ColorList from './ColorList';
import { Toggle } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-300': true,
      'h-0 opacity-0 pointer-events-none': hidden,
      'opacity-100 pointer-events-auto': !hidden,
    }} id="decode">
      {rgbStore.format.color != 'JSON' &&
        <p class="text-red-500">
          This feature only works with the vanilla JSON-based Minecraft formatting.
        </p>
      }
      <Toggle id="syncshadow" checked={rgbStore.syncshadow}
        label={`${t('rgb.shadow.sync@@Sync with text colors')}`}
        onChange$={(e, el) => {
          rgbStore.syncshadow = el.checked;
        }}
      />
      <div class={{
        'transition-all duration-300': true,
        'opacity-50': rgbStore.syncshadow,
      }}>
        <div class="py-2 px-4">
          <ColorMap id="shadow"/>
        </div>
        <ColorList id="shadow"/>
      </div>
    </div>
  );
});