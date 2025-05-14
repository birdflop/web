import { $, component$, useContext } from '@builder.io/qwik';
import { Dropdown } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';
import { NotificationContext } from '~/routes/layout';
import { rgbStoreContext } from '~/routes/resources/rgb';

export default component$(({ hidden, value }: {
  hidden: boolean;
  value: string;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="output">
      <label for="output" class="text-gray-500">
        {t('rgb.output.description@@Copy-paste this for RGB text!')}
      </label>
      <textarea id="output" readOnly
        class={{
          'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
        }}
        value={value}
        onClick$={async () => {
          const id = Math.random().toString(36).substring(2, 15);
          const notification = {
            id,
            title: await t$('rgb.copied@@Copied to clipboard!'),
            description: await t$('rgb.output.copied@@The RGB text has been copied to your clipboard successfully.'),
            bgColor: 'lum-bg-green-900/50',
          };
          navigator.clipboard.writeText(value).catch(async (err) => {
            notification.title = await t$('rgb.copyFailed@@Failed to copy to clipboard!');
            notification.description = err;
            notification.bgColor = 'lum-bg-red-900/50';
          });
          notifications.push(notification);
          setTimeout(() => {
            notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
          }, 2000);
        }}
      />
      <Dropdown id="previewstyle" value={rgbStore.previewStyle} class={{ 'w-full': true }} onChange$={
        (e, el) => {
          rgbStore.previewStyle = el.value;
        }
      } values={[
        {
          name: t('rgb.inputText.preview.default@@Default'),
          value: 'default',
        },
        {
          name: t('rgb.inputText.preview.chat@@Minecraft Chat'),
          value: 'chat',
        },
      ]}>
        {t('rgb.inputText.preview.title@@Preview Style')}
      </Dropdown>
    </div>
  );
});