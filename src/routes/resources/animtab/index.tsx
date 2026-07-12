import {
  component$,
  createContextId,
  isBrowser,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import { defaultDescription, generateHead } from '~/root';
import { routeLoader$ } from '@qwik.dev/router';
import { getCookies, setCookies } from '~/util/dataUtils';
import {
  ANIMATION_STYLES,
  AnimationOutput,
  animTABDefaults,
  generateAnimTABFrames,
  rgbDefaults,
} from '@birdflop/rgbirdflop';
import {
  previewStyleContext,
  Selection,
  selectionContext,
} from '~/components/rgbirdflop/Input';
import Rainbow from 'lucide-icons-qwik/icons/Rainbow';
import Braces from 'lucide-icons-qwik/icons/Braces';
import { inlineTranslate } from 'qwik-speak';
import { deepTrack } from '~/util/track';
import RGBirdflop, {
  rgbStoreContext,
  showAllGradientsContext,
} from '~/components/rgbirdflop/RGBirdflop';
import { Label, NumberInput, SelectMenu } from '@luminescent/ui-qwik';
import Accordion from '~/components/Elements/Accordion';
import { openItemsContext } from '~/routes/layout-markdown';
import AnimTabPreview from '~/components/rgbirdflop/animtab/AnimTabPreview';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  const cookies = getCookies<Partial<typeof rgbDefaults>>(
    cookie,
    'rgb',
    url.searchParams
  );
  return cookies;
});

export const useAnimTABCookies = routeLoader$(({ cookie, url }) => {
  const cookies = getCookies<Partial<typeof animTABDefaults>>(
    cookie,
    'animtab',
    url.searchParams
  );
  return cookies;
});

export const animtabStoreContext =
  createContextId<typeof animTABDefaults>('animtab-store');
export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const { cookies: animTABCookies, errors: animTABErrors } =
    useAnimTABCookies().value;

  const rgbStore = useStore(
    {
      ...structuredClone(rgbDefaults),
      ...rgbCookies,
    },
    { deep: true }
  );
  useContextProvider(rgbStoreContext, rgbStore);

  const animtabStore = useStore<typeof animTABDefaults>(
    {
      ...structuredClone(animTABDefaults),
      ...animTABCookies,
    },
    { deep: true }
  );
  useContextProvider(animtabStoreContext, animtabStore);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);
  const openItems = useContext(openItemsContext);

  const framesStore = useStore(
    {
      list: [] as (string | null)[][],
      current: 0,
    },
    { deep: true }
  );

  useTask$(({ track }) => {
    if (isBrowser)
      setCookies('animtab', { version: rgbStore.version, ...animtabStore });
    deepTrack(track, animtabStore);
  });

  useTask$(({ track }) => {
    deepTrack(track, animtabStore);
    deepTrack(track, rgbStore);

    const { frames: newFrames } = generateAnimTABFrames(
      { ...rgbStore, text: rgbStore.text != '' ? rgbStore.text : 'Birdflop' },
      animtabStore
    );

    framesStore.list = newFrames;
  });

  // Animtab frames updater
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = currentTime - lastTime;
      if (framesStore.list[0] && deltaTime > animtabStore.speed) {
        framesStore.current =
          framesStore.current + 1 >= framesStore.list.length
            ? 0
            : framesStore.current + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  return (
    <RGBirdflop
      errors={[...rgbErrors, ...animTABErrors]}
      output={AnimationOutput(rgbStore, animtabStore)}
    >
      <h1
        class="my-2 flex items-center gap-3 text-2xl font-extrabold"
        q:slot="header"
      >
        <Rainbow size={32} />
        {t('nav.resources.animatedTAB.title@@Animated TAB')}
      </h1>
      <p
        class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4"
        q:slot="header"
      >
        {t(
          'nav.resources.animatedTAB.description@@TAB plugin gradient animation creator'
        )}
      </p>

      <AnimTabPreview
        currentFrameIndex={framesStore.current}
        shadowLength={previewStyle.value == 'default' ? 4 : 2}
      />

      <Label for="length" label={t('animtab.length@@Gradient Length')}>
        <NumberInput
          id="length"
          input
          disabled
          value={animtabStore.length}
          min={1}
          max={rgbStore.text.length}
          class={{ 'w-full opacity-100!': true }}
          onInput$={(event, el) => (animtabStore.length = Number(el.value))}
          q:slot="column1"
        />
      </Label>

      <div class="col-span-2 flex flex-col gap-1" q:slot="options">
        <label for="nameinput">
          {t('animtab.animation.name@@Animation Name')}
        </label>
        <input
          class="lum-input"
          id="nameinput"
          value={animtabStore.name}
          placeholder={'name'}
          onInput$={(e, el) => (animtabStore.name = el.value)}
        />
      </div>
      <Label
        for="speed"
        label={`${t('animtab.animation.interval@@Animation Interval')} (ms)`}
      >
        <NumberInput
          q:slot="options"
          id="speed"
          input
          value={animtabStore.speed}
          class={{ 'w-full': true }}
          step={50}
          min={50}
          onInput$={(event, el) => (animtabStore.speed = Number(el.value))}
        />
      </Label>
      <SelectMenu
        q:slot="options"
        id="type"
        class={{ 'w-full': true }}
        onChange$={(e, el) => (animtabStore.type = Number(el.value))}
        values={Object.entries(ANIMATION_STYLES).map(([key, value]) => ({
          name: t(`animtab.animation.style.${key}@@${key}`),
          value: String(value),
        }))}
        value={animtabStore.type}
      >
        {t('animtab.animation.style.title@@Animation Style')}
      </SelectMenu>

      <button
        onClick$={() => {
          openItems.value = openItems.value.includes('outputformat')
            ? openItems.value.filter((item) => item !== 'outputformat')
            : ['outputformat'];
        }}
        class={{
          'lum-grad-bg-blue!': openItems.value.includes('outputformat'),
        }}
        q:slot="mobile-navbar"
      >
        <Braces />
        {t('animtab.outputFormat.title@@Output Format')}
      </button>
      <Accordion q:slot="column3" sectionName="outputformat" pcOnly>
        <Braces />
        {t('animtab.outputFormat.title@@Output Format')}
      </Accordion>
      <div
        q:slot="column3"
        class={{
          'flex flex-col gap-2 transition-all duration-200': true,
          'pointer-events-none max-h-0 opacity-0':
            !openItems.value.includes('outputformat'),
          'pointer-events-auto max-h-125 opacity-100':
            openItems.value.includes('outputformat'),
        }}
      >
        <label for="outputformat" class="text-lum-text-secondary">
          {t(
            "animtab.outputFormat.description@@Only use this if you're trying to use this tool for a different plugin or know what you're doing."
          )}
        </label>
        <textarea
          class="lum-input h-32 whitespace-pre"
          id="outputformat"
          value={animtabStore.outputFormat}
          placeholder={animTABDefaults.outputFormat}
          onInput$={(e, el) => {
            animtabStore.outputFormat = el.value;
          }}
        />
      </div>
    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop Animated TAB',
  description: 'TAB plugin gradient animation creator. ' + defaultDescription,
});
