import { component$, Slot, useContext } from '@builder.io/qwik';
import { Clipboard } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { Notification, NotificationContext } from '~/util/Notification';

export default component$<{ hidden?: boolean; value: string, class?: string }>(
  ({ hidden, value, class: className }) => {
    const t = inlineTranslate();
    const copiedTitle = t('nav.copied.title@@Copied to clipboard!');
    const copiedDescription = t(
      'nav.copied.description@@The text has been copied to your clipboard successfully.',
    );
    const copyFailedTitle = t('nav.copyFailed@@Failed to copy to clipboard!');

    const notifications = useContext(NotificationContext);

    return (
      <div
        class={{
          'flex flex-col gap-2 transition-all duration-200 sm:pointer-events-auto sm:max-h-full sm:opacity-100': true,
          ...(hidden === undefined) ? {} : {
            'pointer-events-none max-h-0 opacity-0': hidden,
            'pointer-events-auto max-h-62.5 opacity-100': !hidden,
          },
        }}
        id="outputcontainer"
      >
        <label for="output" class="flex items-center gap-2 p-2 font-semibold">
          <span class="flex items-center gap-2 flex-1">
            <Clipboard />
            {t('rgb.output.title@@Output')}
          </span>
          <Slot name="label" />
        </label>
        <textarea
          id="output"
          readOnly
          class={{
            'lum-input w-full whitespace-pre-wrap': true,
            [className ?? '']: className !== undefined,
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
