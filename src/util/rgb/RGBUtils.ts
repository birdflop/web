import { rgbDefaults } from '~/routes/resources/rgb';
import { defaults } from './presets/defaults';
import { hexToRGB, rgbToHex } from './Colors';
import { Gradient } from './HexUtils';

export function disperseColors(colors: typeof defaults.colors) {
  const newColors = colors.slice(0).map((color, i) => ({ hex: color.hex, pos: (100 / (colors.length - 1)) * i }));
  return newColors;
}

export function sortColors(colors: { hex: string, pos: number }[]) {
  return [...colors].sort((a, b) => a.pos - b.pos);
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

  // swap the items in the array
  const temp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = temp;

  return arr;
}

export function generateOutput(rgbStore: typeof rgbDefaults) {
  let output = '';
  const colors = sortColors(rgbStore.colors);

  if (rgbStore.format.color == 'MiniMessage' && colors.find((color, i) => color.pos != (100 / (colors.length - 1)) * i)) {
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

      const numSteps = rgbStore.text.length;
      const lowerRange = Math.round(colors[i].pos / 100 * numSteps);
      const upperRange = Math.round(colors[i + 1].pos / 100 * numSteps);
      if (lowerRange === upperRange) continue;
      output += `<gradient:${currentColor.hex}:${nextColor.hex}>${rgbStore.text.substring(lowerRange, upperRange)}</gradient>`;
    }
  }
  else if (rgbStore.format.color == 'MiniMessage') {
    output = `<gradient:${colors.map(c => c.hex).join(':')}>${rgbStore.text}</gradient>`;
  }
  // Handle Minecraft Format JSON
  else if (rgbStore.format.color == 'JSON') {
    const newColors = colors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
    if (newColors.length < 2) return 'Error: Not enough colors.';

    const gradient = new Gradient(newColors, rgbStore.text.length / (rgbStore.colorlength ?? 1));
    let shadowGradient: Gradient | undefined;

    if (!rgbStore.syncshadow) {
      const shadowColors = rgbStore.shadowcolors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
      shadowGradient = new Gradient(shadowColors, rgbStore.text.length / (rgbStore.colorlength ?? 1));
    }

    // Create the base JSON structure
    const jsonOutput: {
      text: string;
      extra: {
        text: string;
        color?: string;
        shadow_color?: number[];
        bold?: boolean;
        italic?: boolean;
        underlined?: boolean;
        strikethrough?: boolean;
      }[];
    } = {
      text: '',
      extra: [],
    };

    // Process each character
    let index = 0;
    while (index < rgbStore.text.length) {
      // Handle multi-byte characters like emojis
      const segment = Array.from(rgbStore.text).slice(index, index + (rgbStore.colorlength ?? 1)).join('');

      const rgb = gradient.next();
      const rgbShadow = shadowGradient ? shadowGradient.next() : undefined;

      // Skip formatting for pure space segments if trimspaces is true
      if (rgbStore.trimspaces && segment.trim() === '') {
        // Add a plain space to the output
        jsonOutput.extra.push({
          text: segment,
        });
      } else {
        // Get the next color in the gradient
        const hex = rgbToHex(rgb);

        // Add the character with its formatting
        const charFormatting: {
          text: string;
          color?: string;
          shadow_color?: number[];
          bold?: boolean;
          italic?: boolean;
          underlined?: boolean;
          strikethrough?: boolean;
          obfuscated?: boolean;
        } = {
          text: segment,
          color: '#' + hex,
        };

        // Only include formatting properties if they're true
        if (rgbStore.bold) charFormatting.bold = true;
        if (rgbStore.italic) charFormatting.italic = true;
        if (rgbStore.underline) charFormatting.underlined = true;
        if (rgbStore.strikethrough) charFormatting.strikethrough = true;
        if (rgbStore.obfuscate) charFormatting.obfuscated = true;
        if (rgbShadow) {
          const rgbShadowMinecraft = rgbShadow.map(c => Math.round(c / 255 * 100) / 100);
          rgbShadowMinecraft.push(1);
          charFormatting.shadow_color = rgbShadowMinecraft;
        }

        jsonOutput.extra.push(charFormatting);
      }

      index += rgbStore.colorlength || 1;
    }

    // Convert the JSON object to a string
    output = JSON.stringify(jsonOutput);
  }
  // Handle other formats
  else {
    const newColors = colors.map(color => ({ rgb: hexToRGB(color.hex), pos: color.pos }));
    if (newColors.length < 2) return 'Error: Not enough colors.';

    const gradient = new Gradient(newColors, rgbStore.text.length / (rgbStore.colorlength ?? 1));

    const segments = [];
    let index = 0;

    // Break text into segments without splitting multi-byte characters like emojis
    while (index < rgbStore.text.length) {
      const segment = Array.from(rgbStore.text).slice(index, index + (rgbStore.colorlength ?? 1)).join('');
      segments.push([segment]);
      index += rgbStore.colorlength ?? 1;
    }

    for (const segment of segments) {
      // Skip formatting only pure space segments, but not segments with emojis or non-space characters
      if (rgbStore.trimspaces && segment[0].trim() === '') {
        output += segment[0];
        gradient.next();
        continue;
      }

      const hex = rgbToHex(gradient.next());
      let hexOutput = rgbStore.format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      if (rgbStore.lowercase) hexOutput = hexOutput.toLowerCase();
      let formatCodes = '';
      if (rgbStore.format.color.includes('$f') && rgbStore.format.char) {
        if (rgbStore.bold) formatCodes += rgbStore.format.char + 'l';
        if (rgbStore.italic) formatCodes += rgbStore.format.char + 'o';
        if (rgbStore.underline) formatCodes += rgbStore.format.char + 'n';
        if (rgbStore.strikethrough) formatCodes += rgbStore.format.char + 'm';
        if (rgbStore.obfuscate) formatCodes += rgbStore.format.char + 'k';
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', segment[0]);
      output += hexOutput;
    }
  }

  // Apply formatting to the entire output string
  if (rgbStore.format.bold && rgbStore.bold) output = rgbStore.format.bold.replace('$t', output);
  if (rgbStore.format.italic && rgbStore.italic) output = rgbStore.format.italic.replace('$t', output);
  if (rgbStore.format.underline && rgbStore.underline) output = rgbStore.format.underline.replace('$t', output);
  if (rgbStore.format.strikethrough && rgbStore.strikethrough) output = rgbStore.format.strikethrough.replace('$t', output);
  if (rgbStore.format.obfuscate && rgbStore.obfuscate) output = rgbStore.format.obfuscate.replace('$t', output);
  if (rgbStore.prefixsuffix) output = rgbStore.prefixsuffix.replace(/\$t/g, output);

  return output;
}