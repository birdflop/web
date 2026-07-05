import { component$, isBrowser, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { defaultDescription, generateHead } from '~/root';
import RGBirdflop from '~/components/Rgbirdflop/RGBirdflop';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies, setCookies } from '~/util/dataUtils';
import { AnimationOutput, animTABDefaults, generateAnimTABFrames, GRADIENT_TYPES, hexToRGB, rgbDefaults } from '@birdflop/rgbirdflop';
import { previewStyleContext, Selection, selectionContext } from '~/components/Rgbirdflop/Input';
import { Rainbow } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { deepTrack } from '~/util/misc';
import { getEffectiveFormatting, getFormattingClasses } from '~/components/Rgbirdflop/preview';
import RGBirdflopBase, { rgbStoreContext, showAllGradientsContext } from '~/components/Rgbirdflop/RGBirdflopBase';
import AnimTab, { animtabStoreContext } from '~/components/Rgbirdflop/AnimTab';

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

function renderFrames(
  rgbStore: typeof rgbDefaults,
  animtabStore: typeof animTABDefaults,
  currentFrameIndex: number,
  shadowLength: string = '4px 4px',
) {
  // Generate frames for this specific gradient type
  const { frames: framesList } = generateAnimTABFrames(rgbStore, animtabStore);

  let processedFrames = framesList;
  if (animtabStore.type == 1) {
    processedFrames = [...framesList].reverse();
  } else if (animtabStore.type == 3) {
    const frames2 = framesList.slice();
    processedFrames = [...framesList].reverse().concat(frames2);
  }

  if (!processedFrames[0]) return '\u00A0';
  const colors = processedFrames[currentFrameIndex % processedFrames.length];
  if (!colors) return '\u00A0';

  const segments = [...rgbStore.text.matchAll(new RegExp(`.{1,${rgbStore.colorLength}}`, 'g'))];
  let charIndex = 0;
  return segments.map((segment, segmentIndex) => {
    const segmentText = segment[0];
    const segmentStart = charIndex;
    charIndex += segmentText.length;
    const color = `#${colors[segmentIndex]}`;
    const shadowRGB = hexToRGB(color).map(c => Math.round(c * 0.25));
    const shadowColor = `rgb(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]})`;
    const output = Array.from(segmentText).map((char, offset) => {
      const formatting = getEffectiveFormatting(rgbStore, segmentStart + offset);
      return (
        <span
          key={`char${segmentStart + offset}`}
          style={{
            color,
            textShadow: `${shadowLength} 0 ${shadowColor};`,
          }}
          class={getFormattingClasses(formatting)}
        >
          {char}
        </span>
      );
    });
    return <span key={`segment-${segmentStart}`} q:slot="input">{output}</span>;
  });
};

export default component$(() => {
  const t = inlineTranslate();
  const { cookies: rgbCookies, errors: rgbErrors } = useRGBCookies().value;
  const { cookies: animTABCookies, errors: animTABErrors } = useAnimTABCookies().value;

  const rgbStore = useStore({
    ...structuredClone(rgbDefaults),
    ...rgbCookies,
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  const animtabStore = useStore<typeof animTABDefaults>({
    ...structuredClone(animTABDefaults),
    ...animTABCookies,
  }, { deep: true });
  useContextProvider(animtabStoreContext, animtabStore);

  const selection = useSignal<Selection>();
  useContextProvider(selectionContext, selection);
  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);
  const showAllGradients = useSignal(false);
  useContextProvider(showAllGradientsContext, showAllGradients);

  const framesStore = useStore({
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
      framesStore.list = newFrames.reverse();
      break;
    case 3: {
      // Ping Pong
      const frames2 = newFrames.slice();
      framesStore.list = newFrames.reverse().concat(frames2);
      break;
    }
    default:
      framesStore.list = newFrames;
    }
  });

  // Animtab frames updater
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (framesStore.list[0] && deltaTime > animtabStore.speed) {
        framesStore.current = framesStore.current + 1 >= framesStore.list.length ? 0 : framesStore.current + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  return (
    <RGBirdflopBase errors={[...rgbErrors, ...animTABErrors]} output={AnimationOutput(rgbStore, animtabStore)}>
      <RGBirdflop />
      <AnimTab />

      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2" q:slot="header">
        <Rainbow size={32} />
        {t('nav.resources.animatedTAB.title@@Animated TAB')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4 text-lum-text-secondary" q:slot="header">
        {t('nav.resources.animatedTAB.description@@TAB plugin gradient animation creator')}
      </p>

      {(() => {
        if (!rgbStore.text) return '\u00A0';

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
                  {renderFrames(tempStore, animtabStore, framesStore.current, previewStyle.value == 'default' ? '4px 4px' : '2px 2px')}
                </span>
              </span>
            );
          });
        }

        return renderFrames(rgbStore, animtabStore, framesStore.current, previewStyle.value == 'default' ? '4px 4px' : '2px 2px');
      })()}

    </RGBirdflopBase>
  );
});

export const head = generateHead({
  title: 'RGB Birdflop Animated TAB',
  description: 'TAB plugin gradient animation creator. ' + defaultDescription,
});
