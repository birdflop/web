import { convertToRGB, convertToHex } from '~/components/util/RGBUtils';
import { Gradient } from '~/components/util/HexUtils';

import { createCanvas, registerFont, Canvas } from 'canvas';
if (registerFont) {
  registerFont('~/../public/fonts/MinecraftBold.otf', { family: 'MinecraftBold' });
  registerFont('~/../public/fonts/MinecraftItalic.otf', { family: 'MinecraftItalic' });
  registerFont('~/../public/fonts/MinecraftRegular.otf', { family: 'MinecraftRegular' });
  registerFont('~/../public/fonts/MinecraftBoldItalic.otf', { family: 'MinecraftBoldItalic' });
}

export function createPreview(text: string = 'SimplyMC', colors: string[] = ['#00FFE0', '#EB00FF'], prefix?: string, bold?: boolean, italic?: boolean, underline?: boolean, strikethrough?: boolean) {
  return new Promise<string>((resolve) => {
    const canvas = createCanvas(500, 100);
    const ctx = canvas.getContext('2d');
    ctx.font = applyText(canvas, text, bold, italic, underline, strikethrough);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    texter(canvas, text, colors, 0, 50, bold, italic, underline, strikethrough);
    const buffer = canvas.toDataURL();
    resolve(buffer);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function applyText(canvas: Canvas, text: string, bold?: boolean, italic?: boolean, underline?: boolean, strikethrough?: boolean) {
  const context = canvas.getContext('2d');
  let fontSize = 70;
  let font = 'MinecraftRegular';

  if (bold && italic) {
    font = 'MinecraftBoldItalic';
  } else if (bold) {
    font = 'MinecraftBold';
  } else if (italic) {
    font = 'MinecraftItalic';
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const fontString = `${fontSize -= 1}px ${font}`;
    context.font = fontString;

    if (context.measureText(text).width <= canvas.width - 50) {
      return fontString;
    }
  }
}

export function texter(canvas: Canvas, str: string, colors: string[], x: number, y: number, bold?: boolean, italic?: boolean, underline?: boolean, strikethrough?: boolean): void {
  const ctx = canvas.getContext('2d');
  const gradient = new Gradient(colors.map((color: string) => convertToRGB(color)), str.replace(/ /g, '').length);
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char == ' ') {
      x += ctx.measureText(char).width;
      continue;
    }
    const hex = convertToHex(gradient.next());
    const format = `§x§${hex.charAt(0)}§${hex.charAt(1)}§${hex.charAt(2)}§${hex.charAt(3)}§${hex.charAt(4)}§${hex.charAt(5)}`;
    let formatCodes = '';
    if (format.includes('$f')) {
      if (bold) formatCodes += '§l';
      if (italic) formatCodes += '§o';
      if (underline) formatCodes += '§n';
      if (strikethrough) formatCodes += '§m';
    }
    const hexOutput = format.replace('$f', formatCodes).replace('$c', char);
    ctx.font = applyText(canvas, hexOutput, bold, italic, underline, strikethrough);
    ctx.fillText(hexOutput, x, y);
    x += ctx.measureText(hexOutput).width;
  }
}