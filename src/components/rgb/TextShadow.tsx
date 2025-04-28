import { $, component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/routes/resources/rgb';
import { NotificationContext } from '~/routes/layout';
import ColorMap from './ColorMap';
import ColorList from './ColorList';

export default component$(({ hidden }: {
  hidden: boolean;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
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
      <div class="py-2 px-4">
        <ColorMap id="shadow"/>
      </div>
      <ColorList id="shadow"/>
    </div>
  );
});