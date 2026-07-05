import {
  component$,
  Slot,
  useContext,
} from '@builder.io/qwik';

import { Blend, Palette, Save } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';

import ColorList from '~/components/Rgbirdflop/ColorList';
import TextShadow from '~/components/Rgbirdflop/TextShadow';
import Options from '~/components/Rgbirdflop/Options';
import FormatOptions from '~/components/Rgbirdflop/FormatOptions';
import Presets from '~/components/Rgbirdflop/Presets';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflopBase';

import Accordion from '~/components/Elements/Accordion';
import Settings from '~/routes/settings';

export default component$(() => {
  const t = inlineTranslate();
  const openItems = useContext(openItemsContext);
  const rgbStore = useContext(rgbStoreContext);

  return <>
    <div q:slot="column1" class="hidden sm:flex items-center p-2 gap-2 font-semibold">
      <Palette />
      {t('rgb.colors.title@@Colors')}
    </div>
    <ColorList q:slot="column1" hidden={!openItems.value.includes('colors')}>
      <Slot name="color-list" />
    </ColorList>

    <button onClick$={() => {
      openItems.value = openItems.value.includes('textshadow')
        ? openItems.value.filter(item => item !== 'textshadow')
        : ['textshadow'];
    }} class={{
      'lum-grad-bg-blue!': openItems.value.includes('textshadow'),
    }} q:slot="mobile-navbar">
      <Blend />
      {t('rgb.colors.shadow.title@@Text Shadow')}
    </button>
    <Accordion q:slot="column1" sectionName="textshadow" pcOnly>
      <Blend />
      {t('rgb.colors.shadow.title@@Text Shadow')}
    </Accordion>
    <TextShadow q:slot="column1" hidden={!openItems.value.includes('textshadow')} />

    <Options q:slot="options" hidden={!openItems.value.includes('options')} />

    <div q:slot="column3" class="hidden sm:flex items-center p-2 gap-2 font-semibold">
      <Save />
      {t('rgb.presets.title@@Presets')}
    </div>
    <Presets q:slot="column3" hidden={!openItems.value.includes('presets')} />

    {rgbStore.customFormat && <>
      <Accordion q:slot="column3" sectionName="formatoptions" pcOnly>
        <Settings />
        {t('rgb.formatting.options@@Format Options')}
      </Accordion>
      <FormatOptions q:slot="column3"
        hidden={!openItems.value.includes('formatoptions')}
      />
    </>}
  </>;
});