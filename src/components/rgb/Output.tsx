import { component$ } from '@builder.io/qwik';
import { Dropdown } from '@luminescent/ui-qwik';
import { inlineTranslate, useSpeak } from 'qwik-speak';
import type { rgbDefaults } from '~/routes/resources/rgb';

export default component$(({ store, tmpstore, hidden, value }: {
  store: typeof rgbDefaults;
  tmpstore: {
    threshold: number,
    sectionsOpened: string[],
    alerts: {
      class: string,
      text: string,
    }[],
  };
  hidden: boolean;
  value: string;
}) => {
  useSpeak({ assets: ['color'] });
  const t = inlineTranslate();

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
        onClick$={() => {
          let alert = {
            class: 'text-green-500',
            text: 'color.copied@@Copied to clipboard!',
          };
          navigator.clipboard.writeText(value).catch(() => {
            alert = {
              class: 'text-red-500',
              text: 'color.copied@@Failed to copy to clipboard!',
            };
          });
          tmpstore.alerts.push(alert);
          setTimeout(() => {
            tmpstore.alerts.splice(tmpstore.alerts.indexOf(alert), 1);
          }, 2000);
        }}
      />
      {tmpstore.alerts.map((alert, i) => (
        <p key={`alert${i}`} class={alert.class} dangerouslySetInnerHTML={t(alert.text)} />
      ))}
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