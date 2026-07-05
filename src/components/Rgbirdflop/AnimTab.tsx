import {
  component$,
  createContextId,
  useContext,
} from '@builder.io/qwik';

import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';
import { rgbStoreContext } from './RGBirdflopBase';
import { NumberInput, SelectMenu } from '@luminescent/ui-qwik';
import Accordion from '../Elements/Accordion';
import { Braces } from 'lucide-icons-qwik';
import { ANIMATION_STYLES, animTABDefaults } from '@birdflop/rgbirdflop';

export const animtabStoreContext = createContextId<typeof animTABDefaults>('animtab-store');
export default component$(() => {
  const t = inlineTranslate();
  const openItems = useContext(openItemsContext);
  const rgbStore = useContext(rgbStoreContext);
  const animtabStore = useContext(animtabStoreContext);

  return <>
    <NumberInput id="length" input disabled value={animtabStore.length * rgbStore.text.length} min={rgbStore.text.length} class={{ 'w-full opacity-100!': true }}
      onIncrement$={() => animtabStore.length++}
      onDecrement$={() => animtabStore.length--}
      q:slot="color-list"
    >
      {t('animtab.length@@Gradient Length')}
    </NumberInput>

    <div class="flex flex-col gap-1 col-span-2" q:slot="options">
      <label for="nameinput">
        {t('animtab.animation.name@@Animation Name')}
      </label>
      <input class="lum-input" id="nameinput" value={animtabStore.name} placeholder={'name'} onInput$={(e, el) => { animtabStore.name = el.value; }}/>
    </div>
    <NumberInput q:slot="options" id="speed" input value={animtabStore.speed} class={{ 'w-full': true }} step={50} min={50}
      onInput$={(event, el) => animtabStore.speed = Number(el.value)}
      onIncrement$={() => animtabStore.speed = Number(animtabStore.speed) + 50}
      onDecrement$={() => animtabStore.speed = Number(animtabStore.speed) - 50}>
      {t('animtab.animation.interval@@Animation Interval')} (ms)
    </NumberInput>
    <SelectMenu q:slot="options" id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabStore.type = Number(el.value); }}
      values={Object.entries(ANIMATION_STYLES).map(([key, value]) => ({
        name: t(`animtab.animation.style.${key}`),
        value: String(value),
      }))}
      value={animtabStore.type}>
      {t('animtab.animation.style.title@@Animation Style')}
    </SelectMenu>

    <button onClick$={() => {
      openItems.value = openItems.value.includes('outputformat')
        ? openItems.value.filter(item => item !== 'outputformat')
        : ['outputformat'];
    }} class={{
      'lum-grad-bg-blue!': openItems.value.includes('outputformat'),
    }} q:slot="mobile-navbar">
      <Braces />
      {t('animtab.outputFormat.title@@Output Format')}
    </button>
    <Accordion q:slot="column3" sectionName="outputformat" pcOnly>
      <Braces />
      {t('animtab.outputFormat.title@@Output Format')}
    </Accordion>
    <div q:slot="column3" class={{
      'flex flex-col gap-2 transition-all duration-200': true,
      'max-h-0 opacity-0 pointer-events-none': !openItems.value.includes('outputformat'),
      'max-h-125 opacity-100 pointer-events-auto': openItems.value.includes('outputformat'),
    }}>
      <label for="outputformat" class="text-lum-text-secondary">
        {t('animtab.outputFormat.description@@Only use this if you\'re trying to use this tool for a different plugin or know what you\'re doing.')}
      </label>
      <textarea class="lum-input h-32 whitespace-pre" id="outputformat"
        value={animtabStore.outputFormat}
        placeholder={animTABDefaults.outputFormat}
        onInput$={(e, el) => { animtabStore.outputFormat = el.value; }}/>
    </div>
  </>;
});