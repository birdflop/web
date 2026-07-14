import { component$, Slot, useContext } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { Label, NumberInput, Toggle } from '@luminescent/ui-qwik';

export default component$<{ hidden?: boolean }>(({ hidden = false }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div
      class={{
        'flex flex-col gap-2 transition-all duration-300': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-100 opacity-100': !hidden,
      }}
      id="options"
    >
      <Slot />
      <Label for="prefixsuffix" label={t('rgb.prefixsuffix@@Prefix/Suffix')}>
        <input
          class="lum-input w-full"
          id="prefixsuffix"
          value={rgbStore.prefixSuffix}
          placeholder={'/nick $t'}
          onInput$={(e, el) => {
            rgbStore.prefixSuffix = el.value;
          }}
        />
      </Label>
      {rgbStore.colorFormat.color != 'MiniMessage' && (
        <Label
          for="colorLength"
          label={t('rgb.colors.charsPer@@Characters per color')}
        >
          <NumberInput
            input
            disabled
            id="colorLength"
            min={1}
            max={rgbStore.text.length / rgbStore.colors.length}
            value={rgbStore.colorLength}
            class="w-full opacity-100!"
            onInput$={(e, el) => (rgbStore.colorLength = Number(el.value))}
          />
        </Label>
      )}
      {rgbStore.colorFormat.color != 'MiniMessage' && (
        <>
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
                "rgb.colors.trimSpaces.description@@Turn this off if you're using empty underlines / strikethroughs"
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
});
