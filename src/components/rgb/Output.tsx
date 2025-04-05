import { $, component$, useContext } from '@builder.io/qwik';
import { Dropdown } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import { NotificationContext } from '~/routes/layout';
import type { rgbDefaults } from '~/routes/resources/rgb';

export default component$(({ store, hidden, value }: {
  store: typeof rgbDefaults;
  hidden: boolean;
  value: string;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-[250px] opacity-100 pointer-events-auto': !hidden,
    }} id="output">
      <label for="output" class="text-gray-500">
        {t('color.outputSubtitle@@Copy-paste this for RGB text!')}
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
            title: await t$('color.copied@@Copied to clipboard!'),
            description: await t$('color.copiedDescription@@The RGB text has been copied to your clipboard successfully.'),
            bgColor: 'lum-bg-green-900/50',
          };
          navigator.clipboard.writeText(value).catch(async (err) => {
            notification.title = await t$('color.copyFailed@@Failed to copy to clipboard!');
            notification.description = err;
            notification.bgColor = 'lum-bg-red-900/50';
          });
          notifications.value = [...notifications.value, notification];
          setTimeout(() => {
            notifications.value = notifications.value.filter((n) => n?.id !== id);
          }, 2000);
        }}
      />
      <Dropdown id="previewstyle" value={store.previewStyle} class={{ 'w-full': true }} onChange$={
        (e, el) => {
          store.previewStyle = el.value;
        }
      } values={[
        {
          name: t('color.previewstyle.default@@Default'),
          value: 'default',
        },
        {
          name: t('color.previewstyle.chat@@Minecraft Chat'),
          value: 'chat',
        },
      ]}>
        {t('color.previewStyle@@Preview Style')}
      </Dropdown>
    </div>
  );
});