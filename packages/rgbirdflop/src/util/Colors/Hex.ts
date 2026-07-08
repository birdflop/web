export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) {
    return '00';
  }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
}

export function rgbToHex(RGBAcolor: number[]) {
  return hex(RGBAcolor[0]) + hex(RGBAcolor[1]) + hex(RGBAcolor[2]);
}

export function trim(s: string) {
  return s.charAt(0) == '#' ? s.substring(1, 7) : s;
}

/**
 * Converts a hex color string to RGB(A) values
 * @param hex - Hex color string (e.g., '#FF00AA', '#FF00AA80', 'FFF', 'FFFF')
 * @returns Tuple of [R, G, B] or [R, G, B, A] values (0-255)
 */
export function hexToRGB(
  hex: string,
): [number, number, number] | [number, number, number, number] {
  // Remove '#' if present
  const cleanHex = hex.replace('#', '');

  // Expand shorthand (3 or 4 chars) to full 6 or 8 chars
  const fullHex =
    cleanHex.length === 3 || cleanHex.length === 4
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // If alpha is present, parse it
  if (fullHex.length === 8) {
    const a = parseInt(fullHex.substring(6, 8), 16);
    return [r, g, b, a];
  }

  return [r, g, b];
}

export function getBrightness(RGBAcolor: number[]) {
  return Math.sqrt(
    RGBAcolor[0] * RGBAcolor[0] * 0.299 +
      RGBAcolor[1] * RGBAcolor[1] * 0.587 +
      RGBAcolor[2] * RGBAcolor[2] * 0.114,
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

export function invertRgbColor(RGBAcolor: number[]) {
  const invertedR = 255 - RGBAcolor[0];
  const invertedG = 255 - RGBAcolor[1];
  const invertedB = 255 - RGBAcolor[2];

  return [invertedR, invertedG, invertedB];
}
