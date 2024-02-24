import { AnimatedGradient, Gradient } from './HexUtils';

export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function convertToHex(rgb: number[]) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

export function convertToRGB(hex: string) {
  const color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getAnimFrames(store: any) {
  let colors = store.colors.map((color: string) => convertToRGB(color));
  if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

  const text = store.text ?? 'birdflop';
  let loopAmount;
  switch (Number(store.type)) {
  default:
    loopAmount = text.length * store.length * 2 - 2;
    break;
  case 3:
    loopAmount = text.length * store.length;
    break;
  }

  const OutPutArray = [];
  const frames = [];
  for (let n = 0; n < loopAmount; n++) {
    const clrs = [];
    const gradient = new AnimatedGradient(colors, text.length * store.length, n);
    let output = '';
    gradient.next();
    if (store.type == 4) {
      const hex = convertToHex(gradient.next());
      clrs.push(hex);
      let hexOutput = store.format;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (store.format.includes('$f')) {
        if (store.bold) formatCodes += store.formatchar + 'l';
        if (store.italic) formatCodes += store.formatchar + 'o';
        if (store.underline) formatCodes += store.formatchar + 'n';
        if (store.strikethrough) formatCodes += store.formatchar + 'm';
      }
      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);
      OutPutArray.push(`  - "${hexOutput}"`);
    } else {
      for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char == ' ') {
          output += char;
          clrs.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        clrs.push(hex);
        let hexOutput = store.format;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (store.format.includes('$f')) {
          if (store.bold) formatCodes += store.formatchar + 'l';
          if (store.italic) formatCodes += store.formatchar + 'o';
          if (store.underline) formatCodes += store.formatchar + 'n';
          if (store.strikethrough) formatCodes += store.formatchar + 'm';
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
      }
      OutPutArray.push(`  - "${output}"`);
    }
    frames.push(clrs);
  }

  return { OutPutArray, frames };
}

export function AnimationOutput(store: any) {
  let FinalOutput = '';

  const AnimFrames = getAnimFrames(store);
  let { OutPutArray } = AnimFrames;

  const format = store.outputFormat;
  FinalOutput = format.replace('%name%', store.name);
  FinalOutput = FinalOutput.replace('%speed%', store.speed);
  if (store.type == 1) {
    OutPutArray.reverse();
  }
  else if (store.type == 3) {
    const OutPutArray2 = OutPutArray.slice();
    OutPutArray = OutPutArray.reverse().concat(OutPutArray2);
  }

  FinalOutput = FinalOutput.replace('%output%', OutPutArray.join('\n'));
  return FinalOutput;
}

export function generateOutput(text: string = 'birdflop', colors: string[] = ['#00FFE0', '#EB00FF'], format: string = '&#$1$2$3$4$5$6$f$c', formatchar: string = '&', prefix?: string, bold?: boolean, italic?: boolean, underline?: boolean, strikethrough?: boolean) {
  if (format != 'MiniMessage') {
    let newColors = colors?.map((color: string) => convertToRGB(color));
    if (colors.length < 2) newColors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

    let output = prefix;

    const gradient = new Gradient(newColors!, text.replace(/ /g, '').length);

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      if (char == ' ') {
        output += char;
        continue;
      }

      const hex = convertToHex(gradient.next());
      let hexOutput = format;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (format.includes('$f')) {
        if (bold) formatCodes += formatchar + 'l';
        if (italic) formatCodes += formatchar + 'o';
        if (underline) formatCodes += formatchar + 'n';
        if (strikethrough) formatCodes += formatchar + 'm';
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', char);
      output += hexOutput;
    }

    return output;
  } else {
    let formats = '';
    if (bold) formats += '<bold>';
    if (italic) formats += '<italic>';
    if (underline) formats += '<underlined>';
    if (strikethrough) formats += '<strikethrough>';
    return `${formats}<gradient:${colors.join(':')}>${text}`;
  }
}