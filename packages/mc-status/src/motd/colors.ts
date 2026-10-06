export interface MCColor {
  code: string;
  name: string;
  hex: string;
}

export const MC_COLORS: MCColor[] = [
  { code: '0', name: 'black', hex: '#000000' },
  { code: '1', name: 'dark_blue', hex: '#0000AA' },
  { code: '2', name: 'dark_green', hex: '#00AA00' },
  { code: '3', name: 'dark_aqua', hex: '#00AAAA' },
  { code: '4', name: 'dark_red', hex: '#AA0000' },
  { code: '5', name: 'dark_purple', hex: '#AA00AA' },
  { code: '6', name: 'gold', hex: '#FFAA00' },
  { code: '7', name: 'gray', hex: '#AAAAAA' },
  { code: '8', name: 'dark_gray', hex: '#555555' },
  { code: '9', name: 'blue', hex: '#5555FF' },
  { code: 'a', name: 'green', hex: '#55FF55' },
  { code: 'b', name: 'aqua', hex: '#55FFFF' },
  { code: 'c', name: 'red', hex: '#FF5555' },
  { code: 'd', name: 'light_purple', hex: '#FF55FF' },
  { code: 'e', name: 'yellow', hex: '#FFFF55' },
  { code: 'f', name: 'white', hex: '#FFFFFF' },
];

export const COLOR_BY_CODE: Record<string, string> = Object.fromEntries(
  MC_COLORS.map((c) => [c.code, c.hex])
);

export const NAMED_COLORS: Record<string, string> = Object.fromEntries([
  ...MC_COLORS.map((c) => [c.name, c.hex]),
  ...MC_COLORS.map((c) => [c.name.replace('_', ''), c.hex]),
  ['lightpurple', '#FF55FF'],
  ['darkblue', '#0000AA'],
  ['darkgreen', '#00AA00'],
  ['darkaqua', '#00AAAA'],
  ['darkred', '#AA0000'],
  ['darkpurple', '#AA00AA'],
  ['darkgray', '#555555'],
  ['reset', '#FFFFFF'],
]);

export function normalizeHexColor(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();

  if (trimmed in NAMED_COLORS) {
    return NAMED_COLORS[trimmed];
  }

  const cleanHex = trimmed.replace(/^#/, '');
  if (/^[0-9a-f]{6}$/.test(cleanHex)) {
    return `#${cleanHex.toUpperCase()}`;
  }
  if (/^[0-9a-f]{3}$/.test(cleanHex)) {
    const [r, g, b] = cleanHex.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

export function shadowColor(hex: string): string {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#3f3f3f';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#3f3f3f';

  const sr = Math.round(r * 0.25)
    .toString(16)
    .padStart(2, '0');
  const sg = Math.round(g * 0.25)
    .toString(16)
    .padStart(2, '0');
  const sb = Math.round(b * 0.25)
    .toString(16)
    .padStart(2, '0');

  return `#${sr}${sg}${sb}`.toUpperCase();
}
