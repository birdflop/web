import { $, component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';

export default component$(({ hidden, value }: {
  hidden: boolean;
  value: string;
}) => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const notifications = useContext(NotificationContext);

  return (
    <div class={{
      'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
      'max-h-0 opacity-0 pointer-events-none': hidden,
      'max-h-62.5 opacity-100 pointer-events-auto': !hidden,
    }} id="outputcontainer">
      <label for="output" class="text-lum-text-secondary">
        {t('rgb.output.description@@Copy-paste this for RGB text!')}
      </label>
      <textarea id="output" readOnly
        class={{
          'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
        }}
        value={value}
        onClick$={async () => {
          const notification = new Notification()
            .setTitle(await t$('rgb.output.copied@@Copied to clipboard!'))
            .setDescription(await t$('rgb.output.copied.description@@The RGB text has been copied to your clipboard successfully.'))
            .setBgColor('lum-bg-green/50');
          navigator.clipboard.writeText(value).catch(async (err) => {
            notification.setTitle(await t$('rgb.copyFailed@@Failed to copy to clipboard!'))
              .setDescription(err)
              .setBgColor('lum-bg-red/50')
              .setPersist(true);
          });
          notifications.push(notification);
        }}
      />
    </div>
  );
});