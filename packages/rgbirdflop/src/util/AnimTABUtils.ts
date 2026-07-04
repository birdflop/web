import { ColorAnimatedGradient } from './ColorUtils';
import { rgbToHex } from './Colors';
import { applyMiniMessageFormatting, buildFormatCodes, getFormattingAtOffset, getRGBColorStop, sortColors, applyFont } from './RGBUtils';
import { animTABDefaults, rgbDefaults } from './Defaults';

export function generateAnimTABFrames(rgbOptions: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
  if (rgbOptions.colors.length < 2) return { OutputArray: [], frames: [] };

  const colors = rgbOptions.colors.map(getRGBColorStop);
  const text = rgbOptions.text ?? 'Birdflop';

  let loopAmount;
  const length = text.length * animtabStore.length / rgbOptions.colorLength;
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
    const gradient = new ColorAnimatedGradient(colors, length, n, rgbOptions.gradientType);

    if (animtabStore.type === 4) {
      let hex = rgbToHex(gradient.next());
      if (rgbOptions.lowercase) hex = hex.toLowerCase();
      frameColors.push(hex);
      textFrames.push({ type: 'solid', text, colors: [hex] });
    } else {
      const textArray = Array.from(text);
      const segments = [];
      let index = 0;

      while (index < textArray.length) {
        // check if colorLength is set and valid
        if (!rgbOptions.colorLength || rgbOptions.colorLength < 1) rgbOptions.colorLength = 1;
        segments.push(textArray.slice(index, index + rgbOptions.colorLength).join(''));
        index += rgbOptions.colorLength;
      }

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

  const OutputArray = formatFrames({ colorFrames, textFrames }, rgbOptions, animtabStore);

  return { OutputArray, frames: colorFrames };
}

function formatFrames(frames: { colorFrames?: string[][]; textFrames: any; }, rgbOptions: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
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
        if (rgbOptions.colors.find((color, i) => color.pos != (100 / (rgbOptions.colors.length - 1)) * i)) {
          output = formatMiniMessageCustomPositions(rgbOptions, animtabStore, n);
        } else {
          const animatedColors = [];

          for (let i = 0; i < rgbOptions.colors.length; i++) {
            const colors = rgbOptions.colors.map(getRGBColorStop);
            const length = text.length * animtabStore.length / rgbOptions.colorLength;

            const offset = (n + i * (length / rgbOptions.colors.length)) % length;
            const shiftedGradient = new ColorAnimatedGradient(colors, length, offset, rgbOptions.gradientType);
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
      let hexOutput = rgbOptions.colorFormat.color;
      const hex = frame.colors[0];

      for (let i = 1; i <= 6; i++) {
        hexOutput = hexOutput.replace(`$${i}`, hex.charAt(i - 1));
      }

      let segText = text;
      if (rgbOptions.baseFormatting.font) {
        segText = applyFont(segText, rgbOptions.baseFormatting.font);
      }
      hexOutput = hexOutput.replace('$c', segText);

      if (rgbOptions.prefixSuffix) {
        hexOutput = rgbOptions.prefixSuffix.replace(/\$t/g, hexOutput);
      }

      output = hexOutput;
    } else if (frame.type === 'segments') {
      let charIndex = 0;
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
          continue;
        }

        let hexOutput = rgbOptions.colorFormat.color;
        for (let j = 1; j <= 6; j++) {
          hexOutput = hexOutput.replace(`$${j}`, hex.charAt(j - 1));
        }

        let formatCodes = '';
        const formatting = getFormattingAtOffset(charIndex, rgbOptions);
        if (rgbOptions.colorFormat.color.includes('$f')) {
          formatCodes = buildFormatCodes(formatting, rgbOptions);
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        let segText = segment;
        if (formatting.font) {
          segText = applyFont(segText, formatting.font);
        }
        hexOutput = hexOutput.replace('$c', segText);
        output += hexOutput;
        charIndex += segment.length;
      }

      if (rgbOptions.prefixSuffix) {
        output = rgbOptions.prefixSuffix.replace(/\$t/g, output);
      }
    }

    OutputArray.push(output);
  }

  return OutputArray;
}

function formatMiniMessageCustomPositions(rgbOptions: typeof rgbDefaults, animtabStore: typeof animTABDefaults, frameIndex: number) {
  const text = rgbOptions.text ?? 'Birdflop';
  const colors = sortColors(rgbOptions.colors);
  let output = '';

  if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
  if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });

  const animatedColors = colors.map((color, i) => {
    const colorArray = rgbOptions.colors.map(getRGBColorStop);
    const length = text.length * animtabStore.length / rgbOptions.colorLength;
    const offset = (frameIndex + i * (length / colors.length)) % length;
    const shiftedGradient = new ColorAnimatedGradient(colorArray, length, offset, rgbOptions.gradientType);
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
    const lowerRange = Math.round(currentColor.pos / 100 * numSteps);
    const upperRange = Math.round(nextColor.pos / 100 * numSteps);

    if (lowerRange === upperRange) continue;

    const formatting = getFormattingAtOffset(lowerRange, rgbOptions);
    const innerText = applyMiniMessageFormatting(text.substring(lowerRange, upperRange), formatting, rgbOptions);
    output += `<gradient:#${currentColor.hex}:#${nextColor.hex}>${innerText}</gradient>`;
  }

  return output;
}

export function AnimationOutput(rgbOptions: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
  let FinalOutput;

  const AnimFrames = generateAnimTABFrames(rgbOptions, animtabStore);
  let { OutputArray } = AnimFrames;

  const format = animtabStore.outputFormat;
  FinalOutput = format.replace('%name%', animtabStore.name);
  FinalOutput = FinalOutput.replace('%speed%', `${animtabStore.speed}`);
  if (animtabStore.type == 1) {
    OutputArray.reverse();
  }
  else if (animtabStore.type == 3) {
    const OutputArray2 = OutputArray.slice();
    OutputArray = OutputArray.reverse().concat(OutputArray2);
  }

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat) OutputArray = OutputArray.map(output => outputFormat[1].replace('$t', output));
  FinalOutput = FinalOutput.replace(/%output:{.*\$t.*}%/, OutputArray.join('\n'));
  return FinalOutput;
}