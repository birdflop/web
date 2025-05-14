export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function rgbToHex(RGBAcolor: number[]) {
  return hex(RGBAcolor[0]) + hex(RGBAcolor[1]) + hex(RGBAcolor[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

export function hexToRGB(hexcolor: string) {
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
