import { AnimatedGradient } from './HexUtils';

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

export function AnimationOutput(store: any, colors: number[][], loopAmount: number) {

  let OutPutArray = [];
  const text = store.text ? store.text : 'SimplyMC';
  let FinalOutput = '';
  const frames = [];
  for (let n = 0; n < loopAmount; n++) {
    const clrs = [];
    const gradient = new AnimatedGradient(colors, text.replace(/ /g, '').length, n);
    let output = '';
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
    }else{
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

  const format = store.outputFormat;
  FinalOutput = format.replace('%name%', store.name);
  FinalOutput = FinalOutput.replace('%speed%', store.speed);
  if (store.type == 1) {
    OutPutArray.reverse();
    store.frames = frames.reverse();
  }
  else if (store.type == 3) {
    const OutPutArray2 = OutPutArray.slice();
    OutPutArray = OutPutArray.reverse().concat(OutPutArray2);
    const frames2 = frames.slice();
    store.frames = frames.reverse().concat(frames2);
  }
  else {
    store.frames = frames;
  }
  FinalOutput = FinalOutput.replace('%output%', OutPutArray.join('\n'));
  return FinalOutput;
}