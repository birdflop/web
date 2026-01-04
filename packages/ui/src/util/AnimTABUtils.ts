import { AnimatedGradient } from './HexUtils';
import { hexToRGB, rgbToHex } from './Colors';
import { sortColors } from './RGBUtils';
import { animTABDefaults, rgbDefaults } from './Defaults';

export function generateAnimTABFrames(rgbStore: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
  if (rgbStore.colors.length < 2) return { OutputArray: [], frames: [] };

  const colors = rgbStore.colors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
  const text = rgbStore.text ?? 'Birdflop';

  let loopAmount;
  const length = text.length * animtabStore.length / rgbStore.colorlength;
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
    const gradient = new AnimatedGradient(colors, length, n);

    if (animtabStore.type === 4) {
      let hex = rgbToHex(gradient.next());
      if (rgbStore.lowercase) hex = hex.toLowerCase();
      frameColors.push(hex);
      textFrames.push({ type: 'solid', text, colors: [hex] });
    } else {
      const textArray = Array.from(text);
      const segments = [];
      let index = 0;

      while (index < textArray.length) {
        // check if colorlength is set and valid
        if (!rgbStore.colorlength || rgbStore.colorlength < 1) rgbStore.colorlength = 1;
        segments.push(textArray.slice(index, index + rgbStore.colorlength).join(''));
        index += rgbStore.colorlength;
      }

      const segmentColors = [];

      for (const segment of segments) {
        if (rgbStore.trimspaces && segment.match(/^\s+$/)) {
          segmentColors.push(null);
          continue;
        }

        let hex = rgbToHex(gradient.next());
        if (rgbStore.lowercase) hex = hex.toLowerCase();
        segmentColors.push(hex);
        frameColors.push(hex);
      }

      textFrames.push({ type: 'segments', segments, colors: segmentColors });
    }

    colorFrames.push(frameColors);
  }

  const OutputArray = formatFrames({ colorFrames, textFrames }, rgbStore, animtabStore);

  return { OutputArray, frames: colorFrames };
}

function formatFrames(frames: { colorFrames?: string[][]; textFrames: any; }, rgbStore: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
  const { textFrames } = frames;
  const OutputArray = [];
  const text = rgbStore.text ?? 'Birdflop';

  for (let n = 0; n < textFrames.length; n++) {
    const frame = textFrames[n];
    let output = '';

    if (rgbStore.format.color === 'MiniMessage') {
      if (frame.type === 'solid') {

        const hex = frame.colors[0];
        output = `<color:#${hex}>${text}</color>`;
      } else if (frame.type === 'segments') {
        if (rgbStore.colors.find((color, i) => color.pos != (100 / (rgbStore.colors.length - 1)) * i)) {
          output = formatMiniMessageCustomPositions(rgbStore, animtabStore, n);
        } else {
          const animatedColors = [];

          for (let i = 0; i < rgbStore.colors.length; i++) {
            const colors = rgbStore.colors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
            const length = text.length * animtabStore.length / rgbStore.colorlength;

            const offset = (n + i * (length / rgbStore.colors.length)) % length;
            const shiftedGradient = new AnimatedGradient(colors, length, offset);
            const color = rgbToHex(shiftedGradient.next());
            animatedColors.push('#' + color);
          }

          if (animatedColors.length < 2) {
            animatedColors.push('#' + animatedColors[0]);
          }

          output = `<gradient:${animatedColors.join(':')}>${text}</gradient>`;
        }
      }
    } else if (frame.type === 'solid') {
      let hexOutput = rgbStore.format.color;
      const hex = frame.colors[0];

      for (let i = 1; i <= 6; i++) {
        hexOutput = hexOutput.replace(`$${i}`, hex.charAt(i - 1));
      }

      let formatCodes = '';
      if (rgbStore.format.color.includes('$f')) {
        if (rgbStore.bold) formatCodes += rgbStore.format.char + 'l';
        if (rgbStore.italic) formatCodes += rgbStore.format.char + 'o';
        if (rgbStore.underline) formatCodes += rgbStore.format.char + 'n';
        if (rgbStore.strikethrough) formatCodes += rgbStore.format.char + 'm';
        if (rgbStore.obfuscate) formatCodes += rgbStore.format.char + 'k';
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);

      if (rgbStore.prefixsuffix) {
        hexOutput = rgbStore.prefixsuffix.replace(/\$t/g, hexOutput);
      }

      output = hexOutput;
    } else if (frame.type === 'segments') {
      for (let i = 0; i < frame.segments.length; i++) {
        const segment = frame.segments[i];
        const hex = frame.colors[i];

        if (hex === null) {
          output += segment;
          continue;
        }

        let hexOutput = rgbStore.format.color;
        for (let j = 1; j <= 6; j++) {
          hexOutput = hexOutput.replace(`$${j}`, hex.charAt(j - 1));
        }

        let formatCodes = '';
        if (rgbStore.format.color.includes('$f')) {
          if (rgbStore.bold) formatCodes += rgbStore.format.char + 'l';
          if (rgbStore.italic) formatCodes += rgbStore.format.char + 'o';
          if (rgbStore.underline) formatCodes += rgbStore.format.char + 'n';
          if (rgbStore.strikethrough) formatCodes += rgbStore.format.char + 'm';
          if (rgbStore.obfuscate) formatCodes += rgbStore.format.char + 'k';
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', segment);
        output += hexOutput;
      }

      if (rgbStore.prefixsuffix) {
        output = rgbStore.prefixsuffix.replace(/\$t/g, output);
      }
    }

    OutputArray.push(output);
  }

  return OutputArray;
}

function formatMiniMessageCustomPositions(rgbStore: typeof rgbDefaults, animtabStore: typeof animTABDefaults, frameIndex: number) {
  const text = rgbStore.text ?? 'Birdflop';
  const colors = sortColors(rgbStore.colors);
  let output = '';

  if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
  if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });

  const animatedColors = colors.map((color, i) => {
    const colorArray = rgbStore.colors.map(c => ({ rgb: hexToRGB(c.hex), pos: c.pos }));
    const length = text.length * animtabStore.length / rgbStore.colorlength;
    const offset = (frameIndex + i * (length / colors.length)) % length;
    const shiftedGradient = new AnimatedGradient(colorArray, length, offset);
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

    output += `<gradient:#${currentColor.hex}:#${nextColor.hex}>${text.substring(lowerRange, upperRange)}</gradient>`;
  }

  return output;
}

export function AnimationOutput(rgbStore: typeof rgbDefaults, animtabStore: typeof animTABDefaults) {
  let FinalOutput = '';

  const AnimFrames = generateAnimTABFrames(rgbStore, animtabStore);
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