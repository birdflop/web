import { component$, JSXOutput, useContext } from '@qwik.dev/core';
import {
  animTABDefaults,
  generateAnimTABFrames,
  hexToRGB,
  rgbDefaults,
} from '@birdflop/rgbirdflop';
import {
  EmptyPreview,
  getEffectiveFormatting,
  getFormattingClasses,
  toCSS,
} from '../preview';
import { rgbStoreContext } from '../RGBirdflop';
import { animtabStoreContext } from '~/routes/resources/animtab';
import { RgbPreviewProps } from '../RgbPreview';
import { selectionContext } from '../Input';

interface AnimTABPreviewProps extends RgbPreviewProps {
  animtabStore?: typeof animTABDefaults;
  currentFrameIndex: number;
  showSelection?: boolean;
  framesList?: (string | null)[][];
}

export default component$<AnimTABPreviewProps>(
  ({
    rgbStore: rgbStoreFromProp,
    shadowLength = 4,
    animtabStore: animtabStoreFromProp,
    currentFrameIndex,
    showSelection,
    framesList: framesListProp,
  }) => {
    const rgbStoreFromContext = useContext(rgbStoreContext, rgbDefaults);
    const rgbStore = rgbStoreFromProp || rgbStoreFromContext;
    const animtabStoreFromContext = useContext(
      animtabStoreContext,
      animTABDefaults
    );
    const animtabStore = animtabStoreFromProp || animtabStoreFromContext;
    const selection = useContext(selectionContext, null);

    if (!rgbStore.text || rgbStore.text.trim() === '') return <EmptyPreview />;
    if (rgbStore.colors.length < 1) return rgbStore.text;

    // Use framesList prop if provided, otherwise generate them (fallback)
    const framesList =
      framesListProp ||
      generateAnimTABFrames(
        { ...rgbStore, text: rgbStore.text != '' ? rgbStore.text : 'Birdflop' },
        animtabStore
      ).frames;

    if (!framesList || !framesList[0]) return <EmptyPreview />;
    const colors = framesList[currentFrameIndex % framesList.length];
    if (!colors) return <EmptyPreview />;

    const segments = [
      ...rgbStore.text.matchAll(
        new RegExp(`.{1,${rgbStore.colorLength}}`, 'g')
      ),
    ];

    const cursorIndex =
      selection &&
      selection.value &&
      selection.value.start === selection.value.end
        ? selection.value.start
        : -1;

    const rendered: JSXOutput[] = [];
    const textLength = rgbStore.text.length;
    let charIndex = 0;

    segments.forEach((segment, segmentIndex) => {
      const segmentText = segment[0];
      const segmentStart = charIndex;
      charIndex += segmentText.length;
      const rawColor = colors[segmentIndex];
      const color = rawColor ? `#${rawColor}` : 'inherit';
      const rgbShadow = rawColor
        ? hexToRGB(rawColor).map((c) => Math.round(c * 0.25))
        : null;
      const rgbShadowCSS = rgbShadow ? toCSS(rgbShadow) : null;

      const segmentSpans: JSXOutput[] = [];

      Array.from(segmentText).forEach((char, offset) => {
        const globalIndex = segmentStart + offset;

        if (globalIndex === cursorIndex && showSelection) {
          segmentSpans.push(<span key="custom-cursor" class="custom-cursor" />);
        }

        const formatting = getEffectiveFormatting(rgbStore, globalIndex);
        const isSelected =
          selection &&
          selection.value &&
          selection.value.start !== selection.value.end &&
          globalIndex >= selection.value.start &&
          globalIndex < selection.value.end;

        segmentSpans.push(
          <span
            key={`char${globalIndex}`}
            style={{
              color,
              ...(rgbShadowCSS && {
                textShadow: `${shadowLength}px ${shadowLength}px 0 ${rgbShadowCSS}`,
              }),
            }}
            class={{
              'char-span': true,
              'bg-blue/40 text-white!': !!isSelected && showSelection,
              ...getFormattingClasses(formatting),
            }}
            data-index={globalIndex}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      });

      rendered.push(
        <span key={`segment-${segmentStart}`} q:slot="input">
          {segmentSpans}
        </span>
      );
    });

    if (cursorIndex === textLength && showSelection) {
      rendered.push(<span key="custom-cursor" class="custom-cursor" />);
    }

    return rendered;
  }
);
