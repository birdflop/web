import { ColorAnimatedGradient } from './ColorUtils';
import { rgbToHex } from './Colors';
import {
  applyMiniMessageFormatting,
  getFormattingAtOffset,
  getRGBColorStop,
  sortColors,
  applyFont,
  renderTemplateSegment,
  applyWrappers,
  segmentText,
  isFormattingEqual,
} from './RGBUtils';
import { animTABDefaults, rgbDefaults, Formatting } from './Defaults';

export function generateAnimTABFrames(
  rgbOptions: typeof rgbDefaults,
  animtabStore: typeof animTABDefaults,
) {
  if (rgbOptions.colors.length < 2) return { OutputArray: [], frames: [] };

  const colors = rgbOptions.colors.map(getRGBColorStop);
  const text = rgbOptions.text ?? 'Birdflop';

  let loopAmount;
  const length = (text.length * animtabStore.length) / rgbOptions.colorLength;
  switch (Number(animtabStore.type)) {
    case 3:
      loopAmount = length;
      break;
    default:
      loopAmount = length * 2 - 2;
      break;
  }

  const colorFrames = [];
  const textFrames = [];

  for (let n = 0; n < loopAmount; n++) {
    const frameColors = [];
    const gradient = new ColorAnimatedGradient(
      colors,
      length,
      n,
      rgbOptions.gradientType,
    );

    if (animtabStore.type === 4) {
      let hex = rgbToHex(gradient.next());
      if (rgbOptions.lowercase) hex = hex.toLowerCase();
      frameColors.push(hex);
      textFrames.push({ type: 'solid', text, colors: [hex] });
    } else {
      const segments = segmentText(text, rgbOptions.colorLength);

      const segmentColors = [];

      for (const segment of segments) {
        if (rgbOptions.trimSpaces && segment.match(/^\s+$/)) {
          segmentColors.push(null);
          continue;
        }

        let hex = rgbToHex(gradient.next());
        if (rgbOptions.lowercase) hex = hex.toLowerCase();
        segmentColors.push(hex);
        frameColors.push(hex);
      }

      textFrames.push({ type: 'segments', segments, colors: segmentColors });
    }

    colorFrames.push(frameColors);
  }

  const OutputArray = formatFrames(
    { colorFrames, textFrames },
    rgbOptions,
    animtabStore,
  );

  let processedOutputArray = OutputArray;
  let processedFrames = colorFrames;

  if (Number(animtabStore.type) === 1) {
    processedOutputArray = [...OutputArray].reverse();
    processedFrames = [...colorFrames].reverse();
  } else if (Number(animtabStore.type) === 3) {
    const OutputArray2 = OutputArray.slice();
    processedOutputArray = [...OutputArray].reverse().concat(OutputArray2);
    const colorFrames2 = colorFrames.slice();
    processedFrames = [...colorFrames].reverse().concat(colorFrames2);
  }

  return { OutputArray: processedOutputArray, frames: processedFrames };
}

function formatFrames(
  frames: { colorFrames?: string[][]; textFrames: any },
  rgbOptions: typeof rgbDefaults,
  animtabStore: typeof animTABDefaults,
) {
  const { textFrames } = frames;
  const OutputArray = [];
  const text = rgbOptions.text ?? 'Birdflop';

  for (let n = 0; n < textFrames.length; n++) {
    const frame = textFrames[n];
    let output = '';

    if (rgbOptions.colorFormat.color === 'MiniMessage') {
      if (frame.type === 'solid') {
        const hex = frame.colors[0];
        const formatting = getFormattingAtOffset(0, rgbOptions);
        output = `<color:#${hex}>${applyMiniMessageFormatting(text, formatting, rgbOptions)}</color>`;
      } else if (frame.type === 'segments') {
        if (
          rgbOptions.colors.find(
            (color, i) =>
              color.pos != (100 / (rgbOptions.colors.length - 1)) * i,
          )
        ) {
          output = formatMiniMessageCustomPositions(
            rgbOptions,
            animtabStore,
            n,
          );
        } else {
          const animatedColors = [];

          for (let i = 0; i < rgbOptions.colors.length; i++) {
            const colors = rgbOptions.colors.map(getRGBColorStop);
            const length =
              (text.length * animtabStore.length) / rgbOptions.colorLength;

            const offset =
              (n + i * (length / rgbOptions.colors.length)) % length;
            const shiftedGradient = new ColorAnimatedGradient(
              colors,
              length,
              offset,
              rgbOptions.gradientType,
            );
            const color = rgbToHex(shiftedGradient.next());
            animatedColors.push('#' + color);
          }

          if (animatedColors.length < 2) {
            animatedColors.push('#' + animatedColors[0]);
          }

          const formatting = getFormattingAtOffset(0, rgbOptions);
          output = `<gradient:${animatedColors.join(':')}>${applyMiniMessageFormatting(text, formatting, rgbOptions)}</gradient>`;
        }
      }
    } else if (frame.type === 'solid') {
      const hex = frame.colors[0];
      const formatting = getFormattingAtOffset(0, rgbOptions);
      output = renderTemplateSegment(hex, text, formatting, rgbOptions);
    } else if (frame.type === 'segments') {
      let charIndex = 0;
      let previousHex: string | null = null;
      let previousFormatting: Formatting | null = null;
      for (let i = 0; i < frame.segments.length; i++) {
        const segment = frame.segments[i];
        const hex = frame.colors[i];

        if (hex === null) {
          const formatting = getFormattingAtOffset(charIndex, rgbOptions);
          let segText = segment;
          if (formatting.font) {
            segText = applyFont(segText, formatting.font);
          }
          output += segText;
          charIndex += segment.length;
          previousHex = null;
          previousFormatting = null;
          continue;
        }

        const formatting = getFormattingAtOffset(charIndex, rgbOptions);
        const skipColor = previousHex !== null && hex === previousHex && isFormattingEqual(formatting, previousFormatting);
        output += renderTemplateSegment(hex, segment, formatting, rgbOptions, skipColor);
        previousHex = hex;
        previousFormatting = formatting;
        charIndex += segment.length;
      }
    }

    output = applyWrappers(output, rgbOptions);
    OutputArray.push(output);
  }

  return OutputArray;
}

function formatMiniMessageCustomPositions(
  rgbOptions: typeof rgbDefaults,
  animtabStore: typeof animTABDefaults,
  frameIndex: number,
) {
  const text = rgbOptions.text ?? 'Birdflop';
  const colors = sortColors(rgbOptions.colors);
  let output = '';

  if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
  if (colors[colors.length - 1].pos !== 100)
    colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });

  const animatedColors = colors.map((color, i) => {
    const colorArray = rgbOptions.colors.map(getRGBColorStop);
    const length = (text.length * animtabStore.length) / rgbOptions.colorLength;
    const offset = (frameIndex + i * (length / colors.length)) % length;
    const shiftedGradient = new ColorAnimatedGradient(
      colorArray,
      length,
      offset,
      rgbOptions.gradientType,
    );
    return {
      hex: rgbToHex(shiftedGradient.next()),
      pos: color.pos,
    };
  });

  for (let i = 0; i < animatedColors.length - 1; i++) {
    let currentColor = animatedColors[i];
    let nextColor = animatedColors[i + 1];

    if (currentColor.pos > nextColor.pos) {
      const newColor = currentColor;
      currentColor = nextColor;
      nextColor = newColor;
    }

    const numSteps = text.length;
    const lowerRange = Math.round((currentColor.pos / 100) * numSteps);
    const upperRange = Math.round((nextColor.pos / 100) * numSteps);

    if (lowerRange === upperRange) continue;

    const formatting = getFormattingAtOffset(lowerRange, rgbOptions);
    const innerText = applyMiniMessageFormatting(
      text.substring(lowerRange, upperRange),
      formatting,
      rgbOptions,
    );
    output += `<gradient:#${currentColor.hex}:#${nextColor.hex}>${innerText}</gradient>`;
  }

  return output;
}

export function AnimationOutput(
  rgbOptions: typeof rgbDefaults,
  animtabStore: typeof animTABDefaults,
) {
  let FinalOutput;

  const AnimFrames = generateAnimTABFrames(rgbOptions, animtabStore);
  let { OutputArray } = AnimFrames;

  const format = animtabStore.outputFormat;
  FinalOutput = format.replace('%name%', animtabStore.name);
  FinalOutput = FinalOutput.replace('%speed%', `${animtabStore.speed}`);

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat)
    OutputArray = OutputArray.map((output) =>
      outputFormat[1].replace('$t', output),
    );
  FinalOutput = FinalOutput.replace(
    /%output:{.*\$t.*}%/,
    OutputArray.join('\n'),
  );
  return FinalOutput;
}
