import { component$, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';

export default component$(
  ({ hidden, value }: { hidden: boolean; value: string }) => {
    const t = inlineTranslate();
    const copiedTitle = t('rgb.output.copied.title@@Copied to clipboard!');
    const copiedDescription = t(
      'rgb.output.copied.description@@The RGB text has been copied to your clipboard successfully.',
    );
    const copyFailedTitle = t('rgb.copyFailed@@Failed to copy to clipboard!');

    const notifications = useContext(NotificationContext);

    return (
      <div
        class={{
          'flex flex-col gap-2 transition-all duration-200 sm:pointer-events-auto sm:max-h-full sm:opacity-100': true,
          'pointer-events-none max-h-0 opacity-0': hidden,
          'pointer-events-auto max-h-62.5 opacity-100': !hidden,
        }}
        id="outputcontainer"
      >
        <label for="output" class="text-lum-text-secondary">
          {t('rgb.output.description@@Copy-paste this for RGB text!')}
        </label>
        <textarea
          id="output"
          readOnly
          class={{
            'lum-input font-mc h-32 w-full whitespace-pre-wrap': true,
          }}
          value={value}
          onClick$={() => {
            const notification = new Notification()
              .setTitle(copiedTitle)
              .setDescription(copiedDescription)
              .setBgColor('lum-grad-bg-green/50');
            navigator.clipboard.writeText(value).catch((err) => {
              notification
                .setTitle(copyFailedTitle)
                .setDescription(err)
                .setBgColor('lum-grad-bg-red/50')
                .setPersist(true);
            });
            notifications.push(notification);
          }}
        />
      </div>
    );
  },
);
