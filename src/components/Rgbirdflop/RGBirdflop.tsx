import {
  component$,
  createContextId,
  Signal,
  Slot,
  useContext,
} from '@builder.io/qwik';

import {
  rgbDefaults,
} from '@birdflop/rgbirdflop';

import RGBirdflopBase from './RGBirdflopBase';
import { Blend, Palette, Save } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';
import ColorList from './ColorList';
import Accordion from '../Elements/Accordion';
import TextShadow from './TextShadow';
import Options from './Options';
import Settings from '~/routes/settings';
import FormatOptions from './FormatOptions';
import Presets from './Presets';

export const rgbStoreContext = createContextId<typeof rgbDefaults>('rgbstore-context');
export const showAllGradientsContext = createContextId<Signal<boolean>>('showallgradients-context');

export const AD_VARIANTS = {
  'ai-generated': {
    image: '/ad-ai.png',
    label: 'AI Generated',
  },
  'pemi-handmade': {
    image: '/ad-pemi.png',
    label: 'Handmade by Pemi',
  },
} as const;
export type AdVariantKey = keyof typeof AD_VARIANTS;
export const AD_VARIANT_STORAGE_KEY = 'rgb-ad-variant';

export default component$(({ errors, output }: {
  errors: string[];
  output: string;
}) => {
  const t = inlineTranslate();
  const openItems = useContext(openItemsContext);
  const rgbStore = useContext(rgbStoreContext);

  return <RGBirdflopBase errors={errors} output={output}>
    <Slot q:slot="header" name="header" />

    <div q:slot="column1" class="hidden sm:flex items-center p-2 gap-2 font-semibold">
      <Palette />
      {t('rgb.colors.title@@Colors')}
    </div>
    <ColorList q:slot="column1" hidden={!openItems.value.includes('colors')}>
      <Slot name="color-list" />
    </ColorList>
    <Accordion q:slot="column1" sectionName="textshadow" pcOnly>
      <Blend />
      {t('rgb.colors.shadow.title@@Text Shadow')}
    </Accordion>
    <TextShadow q:slot="column1" hidden={!openItems.value.includes('textshadow')} />

    <Options q:slot="options" hidden={!openItems.value.includes('options')} />
    <Slot q:slot="options" name="options" />

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

  </RGBirdflopBase>;
});