import { component$, isBrowser, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { defaultDescription, generateHead } from '~/root';
import RGBirdflop, { rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflop';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies, setCookies } from '~/util/dataUtils';
import { AnimationOutput, animationStyles, animTABDefaults, generateAnimTABFrames, GRADIENT_TYPES, hexToRGB, rgbDefaults } from '@birdflop/rgbirdflop';
import { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { Braces, Rainbow } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { openItemsContext } from '~/routes/layout';
import { NumberInput, SelectMenu } from '@luminescent/ui-qwik';
import Accordion from '~/components/Elements/Accordion';
import { deepTrack } from '~/util/misc';

export const useRGBCookies = routeLoader$(({ cookie, url }) => {
  const cookies: {
    cookies: Partial<typeof rgbDefaults>
    errors: string[]
  } = getCookies(cookie, 'rgb', url.searchParams);
  return cookies;
});

export const useAnimTABCookies = routeLoader$(({ cookie, url }) => {
  const cookies: {
    cookies: Partial<typeof animTABDefaults>
    errors: string[]
  } = getCookies(cookie, 'animtab', url.searchParams);
  return cookies;
});

export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const { cookies: animTABCookies, errors: animTABErrors } = useAnimTABCookies().value;

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const animtabStore = useStore({
    ...structuredClone(animTABDefaults),
    ...animTABCookies,
  }, { deep: true });

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  const openItemsStore = useContext(openItemsContext);

  const frames = useStore({
    list: [] as (string | null)[][],
    current: 0,
  }, { deep: true });

  useTask$(({ track }) => {
    if (isBrowser) setCookies('animtab', { version: rgbStore.version, ...animtabStore });
    deepTrack(track, animtabStore);
  });

  useTask$(({ track }) => {
    deepTrack(track, animtabStore);
    deepTrack(track, rgbStore);

    const { frames: newFrames } = generateAnimTABFrames({ ...rgbStore, text: rgbStore.text != '' ? rgbStore.text : 'Birdflop' }, animtabStore);

    switch (animtabStore.type) {
    case 1:
      // Reverse
      frames.list = newFrames.reverse();
      break;
    case 3: {
      // Ping Pong
      const frames2 = newFrames.slice();
      frames.list = newFrames.reverse().concat(frames2);
      break;
    }
    default:
      frames.list = newFrames;
    }
  });

  // Animtab frames updater
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (frames.list[0] && deltaTime > animtabStore.speed) {
        frames.current = frames.current + 1 >= frames.list.length ? 0 : frames.current + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  return (
    <RGBirdflop errors={[...rgbErrors, ...animTABErrors]} output={AnimationOutput(rgbStore, animtabStore)}>
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2" q:slot="header">
        <Rainbow size={32} />
        {t('nav.resources.animatedTAB.title@@Animated TAB')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4 text-lum-text-secondary" q:slot="header">
        {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
      </p>

      <button onClick$={() => {
        openItemsStore.items = openItemsStore.items.includes('outputformat')
          ? openItemsStore.items.filter(item => item !== 'outputformat')
          : ['outputformat'];
      }} class={{
        'lum-grad-bg-blue!': openItemsStore.items.includes('outputformat'),
      }} q:slot="mobile-navbar">
        <Braces />
        {t('animtab.outputFormat.title@@Output Format')}
      </button>

      {(() => {
        if (!rgbStore.text) return '\u00A0';

        const renderFrames = (store: typeof rgbDefaults) => {
          // Generate frames for this specific gradient type
          const { frames: framesList } = generateAnimTABFrames(
            { ...store, text: store.text || 'Birdflop' },
            animtabStore,
          );

          let processedFrames = framesList;
          if (animtabStore.type == 1) {
            processedFrames = [...framesList].reverse();
          } else if (animtabStore.type == 3) {
            const frames2 = framesList.slice();
            processedFrames = [...framesList].reverse().concat(frames2);
          }

          if (!processedFrames[0]) return '\u00A0';
          const colors = processedFrames[frames.current % processedFrames.length];
          if (!colors) return '\u00A0';

          const segments = [...store.text.matchAll(new RegExp(`.{1,${store.colorlength}}`, 'g'))];
          let i = 0;
          return segments.map((segment) => {
            const color = `#${colors[i]}`;
            const shadowLength = previewStyle.value == 'default' ? '4px 4px' : '2px 2px';
            const shadowRGB = hexToRGB(color).map(c => Math.round(c * 0.25));
            const shadowColor = `rgb(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]})`;
            i = store.trimspaces && segment[0] != ' ' && colors[i + 1] ? i + 1 : i;
            return <span key={`char${i}`} q:slot="input" style={{
              color,
              textShadow: `${shadowLength} 0 ${shadowColor};`,
            }} class={{
              'underline': store.underline,
              'strikethrough': store.strikethrough,
              'underline-strikethrough': store.underline && store.strikethrough,
              'obfuscate': store.obfuscate,
            }}>
              {segment[0]}
            </span>;
          });
        };

        if (showAllGradients.value && previewStyle.value != 'default') {
          return GRADIENT_TYPES.map((gradientType) => {
            const tempStore = {
              ...rgbStore,
              gradientType: gradientType,
            };
            const isActive = gradientType === rgbStore.gradientType;
            return (
              <span key={gradientType} q:slot="input" class="flex items-center gap-2">
                <span
                  class={{
                    'lum-grad-bg-lum-input-bg lum-btn-p-1 rounded-lum text-[10px] min-w-15 text-center': true,
                    'text-lum-text': isActive,
                    'text-gray-400': !isActive,
                  }}
                >
                  {gradientType}
                </span>
                <span class="flex-1">
                  {renderFrames(tempStore)}
                </span>
              </span>
            );
          });
        }

        return renderFrames(rgbStore);
      })()}

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
        onInput$={(event, el) => {
          animtabStore.speed = Number(el.value);
        }}
        onIncrement$={() => {
          animtabStore.speed = Number(animtabStore.speed) + 50;
        }}
        onDecrement$={() => {
          animtabStore.speed = Number(animtabStore.speed) - 50;
        }}>
        {t('animtab.animation.interval@@Animation Interval')} (ms)
      </NumberInput>
      <SelectMenu q:slot="options" id="type" class={{ 'w-full': true }} onChange$={(e, el) => { animtabStore.type = Number(el.value); }}
        values={animationStyles}
        value={animtabStore.type}>
        {t('animtab.animation.style@@Animation Style')}
      </SelectMenu>

      <Accordion q:slot="column3" sectionName="outputformat" pcOnly>
        <Braces />
        {t('animtab.outputFormat.title@@Output Format')}
      </Accordion>
      <div q:slot="column3" class={{
        'flex flex-col gap-2 transition-all duration-200': true,
        'max-h-0 opacity-0 pointer-events-none': !openItemsStore.items.includes('outputformat'),
        'max-h-125 opacity-100 pointer-events-auto': openItemsStore.items.includes('outputformat'),
      }}>
        <label for="outputformat" class="text-lum-text-secondary">
          {t('animtab.outputFormat.description@@Only use this if you\'re trying to use this tool for a different plugin or know what you\'re doing.')}
        </label>
        <textarea class="lum-input h-32 whitespace-pre" id="outputformat"
          value={animtabStore.outputFormat}
          placeholder={animTABDefaults.outputFormat}
          onInput$={(e, el) => { animtabStore.outputFormat = el.value; }}/>
      </div>

    </RGBirdflop>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop Animated TAB',
  description: 'TAB plugin gradient animation creator. ' + defaultDescription,
});
