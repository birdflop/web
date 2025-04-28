import { AnimatedGradient, Gradient } from './HexUtils';
import { defaults } from './PresetUtils';
import { sortColors } from './SharedUtils';

export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 100, s: 100, l: 100 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

export function getSignificantPoints(gradient: string[], threshold: number) {
  // Convert all colors to HSL
  const hslColors = gradient.map(hexToHSL);

  // Calculate differences between consecutive colors
  const differences = [];
  for (let i = 1; i < hslColors.length; i++) {
    const hDiff = Math.abs(hslColors[i].h - hslColors[i - 1].h);
    const sDiff = Math.abs(hslColors[i].s - hslColors[i - 1].s);
    const lDiff = Math.abs(hslColors[i].l - hslColors[i - 1].l);

    // Weight hue, saturation, and lightness changes
    differences.push({
      index: i,
      change: hDiff * 2 + sDiff + lDiff, // Hue changes weighted more heavily
    });
  }

  // Identify significant points based on notable changes
  const significantPoints = [gradient[0]]; // Always include the first color

  // Iterate over differences to capture significant transitions
  for (let i = 1; i < differences.length; i++) {
    console.log(differences[i - 1].change);
    if (differences[i - 1].change > threshold) { // Dynamic threshold based on gradient characteristics
      significantPoints.push(gradient[differences[i - 1].index]);
    }
  }

  significantPoints.push(gradient[gradient.length - 1]); // Always include the last color

  return significantPoints;
}

export function convertToHex(RGBAcolor: number[]) {
  return hex(RGBAcolor[0]) + hex(RGBAcolor[1]) + hex(RGBAcolor[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

export function convertToRGB(hexcolor: string) {
  const color = [];
  color[0] = parseInt((trim(hexcolor)).substring(0, 2), 16);
  color[1] = parseInt((trim(hexcolor)).substring(2, 4), 16);
  color[2] = parseInt((trim(hexcolor)).substring(4, 6), 16);
  return color;
}

export function getBrightness(RGBAcolor: number[]) {
  return Math.sqrt(
    (RGBAcolor[0] * RGBAcolor[0] * 0.299) +
    (RGBAcolor[1] * RGBAcolor[1] * 0.587) +
    (RGBAcolor[2] * RGBAcolor[2] * 0.114),
  );
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function disperseColors(colors: typeof defaults.colors) {
  const newColors = colors.slice(0).map((color, i) => ({ hex: color.hex, pos: (100 / (colors.length - 1)) * i }));
  return newColors;
}

export function swapItems(array: any[], indexA: number, indexB: number) {
  // check if the index is out of bounds
  const arrLength = array.length;
  if (indexB < 0) indexB = arrLength - 1;
  else if (indexB >= arrLength) indexB = 0;

  // create a new array to avoid mutating the original
  const arr = [...array];

  // swap the positions if the item has a pos property
  if (arr[indexA].pos !== undefined && arr[indexB].pos !== undefined) {
    const currentPos = Number(`${arr[indexA].pos}`);
    arr[indexA].pos = arr[indexB].pos;
    arr[indexB].pos = currentPos;
  }
  console.log(arr[indexA], arr[indexB]);

  // swap the items in the array
  const temp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = temp;

  return arr;
}

export function getAnimFrames(store: typeof defaults) {
  if (store.colors.length < 2) return { OutputArray: [], frames: [] };

  const frames = generateAnimationFrames(store);

  const OutputArray = formatFrames(frames, store);

  return { OutputArray, frames: frames.colorFrames };
}

function generateAnimationFrames(store: typeof defaults) {
  const colors = store.colors.map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
  const text = store.text ?? 'Birdflop';

  let loopAmount;
  const length = text.length * store.length / store.colorlength;
  switch (Number(store.type)) {
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

    if (store.type === 4) {
      const hex = convertToHex(gradient.next());
      frameColors.push(hex);
      textFrames.push({ type: 'solid', text, colors: [hex] });
    } else {
      const textArray = Array.from(text);
      const segments = [];
      let index = 0;

      while (index < textArray.length) {
        segments.push(textArray.slice(index, index + store.colorlength).join(''));
        index += store.colorlength;
      }

      const segmentColors = [];

      for (const segment of segments) {
        if (store.trimspaces && segment.match(/^\s+$/)) {
          segmentColors.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        segmentColors.push(hex);
        frameColors.push(hex);
      }

      textFrames.push({ type: 'segments', segments, colors: segmentColors });
    }

    colorFrames.push(frameColors);
  }

  return { colorFrames, textFrames };
}

function formatFrames(frames: { colorFrames?: string[][]; textFrames: any; }, store: typeof defaults) {
  const { textFrames } = frames;
  const OutputArray = [];
  const text = store.text ?? 'Birdflop';

  for (let n = 0; n < textFrames.length; n++) {
    const frame = textFrames[n];
    let output = '';

    if (store.format.color === 'MiniMessage') {
      if (frame.type === 'solid') {

        const hex = frame.colors[0];
        output = `<color:#${hex}>${text}</color>`;
      } else if (frame.type === 'segments') {
        if (store.colors.find((color, i) => color.pos != (100 / (store.colors.length - 1)) * i)) {
          output = formatMiniMessageCustomPositions(store, n);
        } else {
          const animatedColors = [];

          for (let i = 0; i < store.colors.length; i++) {
            const colors = store.colors.map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
            const length = text.length * store.length / store.colorlength;

            const offset = (n + i * (length / store.colors.length)) % length;
            const shiftedGradient = new AnimatedGradient(colors, length, offset);
            const color = convertToHex(shiftedGradient.next());
            animatedColors.push('#' + color);
          }

          if (animatedColors.length < 2) {
            animatedColors.push('#' + animatedColors[0]);
          }

          output = `<gradient:${animatedColors.join(':')}>${text}</gradient>`;
        }
      }
    } else if (frame.type === 'solid') {
      let hexOutput = store.format.color;
      const hex = frame.colors[0];

      for (let i = 1; i <= 6; i++) {
        hexOutput = hexOutput.replace(`$${i}`, hex.charAt(i - 1));
      }

      let formatCodes = '';
      if (store.format.color.includes('$f')) {
        if (store.bold) formatCodes += store.format.char + 'l';
        if (store.italic) formatCodes += store.format.char + 'o';
        if (store.underline) formatCodes += store.format.char + 'n';
        if (store.strikethrough) formatCodes += store.format.char + 'm';
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);

      if (store.prefixsuffix) {
        hexOutput = store.prefixsuffix.replace(/\$t/g, hexOutput);
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

        let hexOutput = store.format.color;
        for (let j = 1; j <= 6; j++) {
          hexOutput = hexOutput.replace(`$${j}`, hex.charAt(j - 1));
        }

        let formatCodes = '';
        if (store.format.color.includes('$f')) {
          if (store.bold) formatCodes += store.format.char + 'l';
          if (store.italic) formatCodes += store.format.char + 'o';
          if (store.underline) formatCodes += store.format.char + 'n';
          if (store.strikethrough) formatCodes += store.format.char + 'm';
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', segment);
        output += hexOutput;
      }

      if (store.prefixsuffix) {
        output = store.prefixsuffix.replace(/\$t/g, output);
      }
    }

    OutputArray.push(output);
  }

  return OutputArray;
}

function formatMiniMessageCustomPositions(store: typeof defaults, frameIndex: number) {
  const text = store.text ?? 'Birdflop';
  const colors = sortColors(store.colors);
  let output = '';

  if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
  if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });

  const animatedColors = colors.map((color, i) => {
    const colorArray = store.colors.map(c => ({ rgb: convertToRGB(c.hex), pos: c.pos }));
    const length = text.length * store.length / store.colorlength;
    const offset = (frameIndex + i * (length / colors.length)) % length;
    const shiftedGradient = new AnimatedGradient(colorArray, length, offset);
    return {
      hex: convertToHex(shiftedGradient.next()),
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

export function AnimationOutput(store: typeof defaults) {
  let FinalOutput = '';

  const AnimFrames = getAnimFrames(store);
  let { OutputArray } = AnimFrames;

  const format = store.outputFormat;
  FinalOutput = format.replace('%name%', store.name);
  FinalOutput = FinalOutput.replace('%speed%', `${store.speed}`);
  if (store.type == 1) {
    OutputArray.reverse();
  }
  else if (store.type == 3) {
    const OutputArray2 = OutputArray.slice();
    OutputArray = OutputArray.reverse().concat(OutputArray2);
  }

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat) OutputArray = OutputArray.map(output => outputFormat[1].replace('$t', output));
  FinalOutput = FinalOutput.replace(/%output:{.*\$t.*}%/, OutputArray.join('\n'));
  return FinalOutput;
}

export function generateOutput(
  text = defaults.text,
  colors = defaults.colors,
  format = defaults.format,
  prefixsuffix?: string,
  trimspaces?: boolean,
  colorlength?: number,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strikethrough?: boolean,
) {
  let output = '';

  if (format.color == 'MiniMessage' && colors.find((color, i) => color.pos != (100 / (colors.length - 1)) * i)) {
    colors = sortColors(colors);
    if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
    if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });
    for (let i = 0; i < colors.length - 1; i++) {
      let currentColor = colors[i];
      let nextColor = colors[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const newColor = currentColor;
        currentColor = nextColor;
        nextColor = newColor;
      }

      const numSteps = text.length;
      const lowerRange = Math.round(colors[i].pos / 100 * numSteps);
      const upperRange = Math.round(colors[i + 1].pos / 100 * numSteps);
      if (lowerRange === upperRange) continue;
      output += `<gradient:${currentColor.hex}:${nextColor.hex}>${text.substring(lowerRange, upperRange)}</gradient>`;
    }
  }
  else if (format.color == 'MiniMessage') {
    colors = sortColors(colors);
    output = `<gradient:${colors.map(c => c.hex).join(':')}>${text}</gradient>`;
  }
  // Handle Minecraft Format JSON
  else if (format.color == 'JSON') {
    const newColors = sortColors(colors).map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
    if (newColors.length < 2) return 'Error: Not enough colors.';

    const gradient = new Gradient(newColors, text.length / (colorlength ?? 1));

    // Create the base JSON structure
    const jsonOutput: any = {
      text: '',
      extra: [],
    };

    // Process each character
    let index = 0;
    while (index < text.length) {
      // Handle multi-byte characters like emojis
      const segment = Array.from(text).slice(index, index + (colorlength ?? 1)).join('');

      // Skip formatting for pure space segments if trimspaces is true
      if (trimspaces && segment.trim() === '') {
        // Add a plain space to the output
        jsonOutput.extra.push({
          text: segment,
        });
        gradient.next();
      } else {
        // Get the next color in the gradient
        const rgb = gradient.next();
        const hex = convertToHex(rgb);

        // Add the character with its formatting
        const charFormatting: any = {
          text: segment,
          color: '#' + hex,
        };

        // Only include formatting properties if they're true
        if (bold) charFormatting.bold = true;
        if (italic) charFormatting.italic = true;
        if (underline) charFormatting.underlined = true;
        if (strikethrough) charFormatting.strikethrough = true;

        jsonOutput.extra.push(charFormatting);
      }

      index += colorlength || 1;
    }

    // Convert the JSON object to a string
    output = JSON.stringify(jsonOutput);
  }
  // Handle other formats
  else {
    const newColors = sortColors(colors).map(color => ({ rgb: convertToRGB(color.hex), pos: color.pos }));
    if (newColors.length < 2) return 'Error: Not enough colors.';

    const gradient = new Gradient(newColors, text.length / (colorlength ?? 1));

    const segments = [];
    let index = 0;

    // Break text into segments without splitting multi-byte characters like emojis
    while (index < text.length) {
      const segment = Array.from(text).slice(index, index + (colorlength ?? 1)).join('');
      segments.push([segment]);
      index += colorlength ?? 1;
    }

    for (const segment of segments) {
      // Skip formatting only pure space segments, but not segments with emojis or non-space characters
      if (trimspaces && segment[0].trim() === '') {
        output += segment[0];
        gradient.next();
        continue;
      }

      const hex = convertToHex(gradient.next());
      let hexOutput = format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));

      let formatCodes = '';
      if (format.color.includes('$f')) {
        if (format.char) {
          if (bold) formatCodes += format.char + 'l';
          if (italic) formatCodes += format.char + 'o';
          if (underline) formatCodes += format.char + 'n';
          if (strikethrough) formatCodes += format.char + 'm';
        }
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', segment[0]);
      output += hexOutput;
    }
  }

  // Apply formatting to the entire output string
  if (format.bold && bold) output = format.bold.replace('$t', output);
  if (format.italic && italic) output = format.italic.replace('$t', output);
  if (format.underline && underline) output = format.underline.replace('$t', output);
  if (format.strikethrough && strikethrough) output = format.strikethrough.replace('$t', output);
  if (prefixsuffix) output = prefixsuffix.replace(/\$t/g, output);

  return output;
}