import { component$, Slot, useContext } from '@builder.io/qwik';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { NumberInput, Toggle } from '@luminescent/ui-qwik';
import { Settings } from 'lucide-icons-qwik';

export default component$<{ hidden?: boolean }>(({ hidden = false }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-200 sm:pointer-events-auto sm:max-h-full sm:opacity-100': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-120 opacity-100': !hidden,
      }}
    >
      <div class="flex items-center gap-1 py-2 font-semibold">
        <span class="flex flex-1 items-center gap-2">
          <Settings />
          {t('rgb.options@@Options')}
        </span>
      </div>
      <div class="flex grid-cols-2 flex-col gap-2 md:grid">
        <Slot />
        <div class="flex flex-col gap-1">
          <label for="prefixsuffix">
            {t('rgb.prefixsuffix@@Prefix/Suffix')}
          </label>
          <input
            class="lum-input"
            id="prefixsuffix"
            value={rgbStore.prefixSuffix}
            placeholder={'/nick $t'}
            onInput$={(e, el) => {
              rgbStore.prefixSuffix = el.value;
            }}
          />
        </div>
        {rgbStore.colorFormat.color != 'MiniMessage' &&
          <NumberInput
            input
            disabled
            id="colorLength"
            min={1}
            max={rgbStore.text.length / rgbStore.colors.length}
            value={rgbStore.colorLength}
            class={{ 'w-full opacity-100!': true }}
            onIncrement$={() => rgbStore.colorLength++}
            onDecrement$={() => rgbStore.colorLength--}
          >
            {t('rgb.colors.charsPer@@Characters per color')}
          </NumberInput>
        }
        <div class="flex flex-col gap-1">
          <Toggle
            id="disperse"
            checked={rgbStore.disperse}
            onChange$={(e, el) => {
              rgbStore.disperse = el.checked;
            }}
          >
            {t('rgb.colors.disperse.always.title@@Always Disperse Colors')}
          </Toggle>
          <p class="text-lum-text-secondary text-xs">
            {t(
              'rgb.colors.disperse.always.description@@Turn this on if you want the gradient to always be equally spread out. This will disable the gradient map.',
            )}
          </p>
        </div>
        {rgbStore.colorFormat.color != 'MiniMessage' && <>
          <div class="flex flex-col gap-1">
            <Toggle
              id="trimspaces"
              checked={rgbStore.trimSpaces}
              onChange$={(e, el) => {
                rgbStore.trimSpaces = el.checked;
              }}
            >
              {t('rgb.colors.trimSpaces.title@@Trim colors from spaces')}
            </Toggle>
            <p class="text-lum-text-secondary text-xs">
              {t(
                'rgb.colors.trimSpaces.description@@Turn this off if you\'re using empty underlines / strikethroughs',
              )}
            </p>
          </div>
          <div class="flex flex-col gap-1">
            <Toggle
              id="lowercase"
              checked={rgbStore.lowercase}
              onChange$={(e, el) => {
                rgbStore.lowercase = el.checked;
              }}
            >
              {t('rgb.colors.lowercase.title@@Lowercase Hex Codes')}
            </Toggle>
            <p class="text-lum-text-secondary text-xs">
              {t(
                'rgb.colors.lowercase.description@@Turn this on if you want to use lowercase hex codes.',
              )}
            </p>
          </div>
        </>}
      </div>
    </div>
  );
});
