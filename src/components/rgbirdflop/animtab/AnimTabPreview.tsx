import { component$, useContext } from '@qwik.dev/core';
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

interface AnimTABPreviewProps extends RgbPreviewProps {
  animtabStore?: typeof animTABDefaults;
  currentFrameIndex: number;
}

export default component$<AnimTABPreviewProps>(
  ({
    rgbStore: rgbStoreFromProp,
    shadowLength = 4,
    animtabStore: animtabStoreFromProp,
    currentFrameIndex,
  }) => {
    const rgbStore = useContext(
      rgbStoreContext,
      rgbStoreFromProp || rgbDefaults
    );
    const animtabStore = useContext(
      animtabStoreContext,
      animtabStoreFromProp || animTABDefaults
    );

    if (!rgbStore.text || rgbStore.text.trim() === '') return <EmptyPreview />;
    if (rgbStore.colors.length < 1) return rgbStore.text;

    // Generate frames for this specific gradient type
    const { frames: framesList } = generateAnimTABFrames(
      rgbStore,
      animtabStore
    );

    if (!framesList[0]) return <EmptyPreview />;
    const colors = framesList[currentFrameIndex % framesList.length];
    if (!colors) return <EmptyPreview />;

    const segments = [
      ...rgbStore.text.matchAll(
        new RegExp(`.{1,${rgbStore.colorLength}}`, 'g')
      ),
    ];
    let charIndex = 0;
    return segments.map((segment, segmentIndex) => {
      const segmentText = segment[0];
      const segmentStart = charIndex;
      charIndex += segmentText.length;
      const color = `#${colors[segmentIndex]}`;
      const rgbShadow = hexToRGB(color).map((c) => Math.round(c * 0.25));
      const rgbShadowCSS = toCSS(rgbShadow);
      const output = Array.from(segmentText).map((char, offset) => {
        const formatting = getEffectiveFormatting(
          rgbStore,
          segmentStart + offset
        );
        return (
          <span
            key={`char${segmentStart + offset}`}
            style={{
              color,
              textShadow: `${shadowLength}px ${shadowLength}px 0 ${rgbShadowCSS}`,
            }}
            class={getFormattingClasses(formatting)}
          >
            {char}
          </span>
        );
      });
      return (
        <span key={`segment-${segmentStart}`} q:slot="input">
          {output}
        </span>
      );
    });
  }
);
