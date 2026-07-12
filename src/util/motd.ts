// Utilities for the MOTD Designer resource.
// Parses Minecraft legacy color/format codes (and hex codes) and converts
// between the various encodings used in server.properties and plugin configs.

export interface MCColor {
  code: string;
  name: string;
  hex: string;
}

// The 16 standard Minecraft legacy colors, in code order.
export const MC_COLORS: MCColor[] = [
  { code: '0', name: 'Black', hex: '#000000' },
  { code: '1', name: 'Dark Blue', hex: '#0000AA' },
  { code: '2', name: 'Dark Green', hex: '#00AA00' },
  { code: '3', name: 'Dark Aqua', hex: '#00AAAA' },
  { code: '4', name: 'Dark Red', hex: '#AA0000' },
  { code: '5', name: 'Dark Purple', hex: '#AA00AA' },
  { code: '6', name: 'Gold', hex: '#FFAA00' },
  { code: '7', name: 'Gray', hex: '#AAAAAA' },
  { code: '8', name: 'Dark Gray', hex: '#555555' },
  { code: '9', name: 'Blue', hex: '#5555FF' },
  { code: 'a', name: 'Green', hex: '#55FF55' },
  { code: 'b', name: 'Aqua', hex: '#55FFFF' },
  { code: 'c', name: 'Red', hex: '#FF5555' },
  { code: 'd', name: 'Light Purple', hex: '#FF55FF' },
  { code: 'e', name: 'Yellow', hex: '#FFFF55' },
  { code: 'f', name: 'White', hex: '#FFFFFF' },
];

export const MC_FORMATS = [
  { code: 'l', name: 'Bold' },
  { code: 'o', name: 'Italic' },
  { code: 'n', name: 'Underline' },
  { code: 'm', name: 'Strikethrough' },
  { code: 'k', name: 'Obfuscated' },
  { code: 'r', name: 'Reset' },
] as const;

const COLOR_BY_CODE: Record<string, string> = Object.fromEntries(
  MC_COLORS.map((c) => [c.code, c.hex]),
);

// Default MOTD text color (white) used until a color code is encountered.
export const DEFAULT_COLOR = '#FFFFFF';

export interface MotdStyle {
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
}

export interface MotdRun {
  text: string;
  style: MotdStyle;
}

const baseStyle = (): MotdStyle => ({
  color: DEFAULT_COLOR,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  obfuscated: false,
});

// Minecraft renders text shadows at 25% brightness of the foreground color.
export function shadowColor(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return '#000000';
  const n = parseInt(m[1], 16);
  const r = Math.floor(((n >> 16) & 0xff) / 4);
  const g = Math.floor(((n >> 8) & 0xff) / 4);
  const b = Math.floor((n & 0xff) / 4);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Parse a single MOTD line (using & or § codes) into styled runs.
// Supports legacy codes (&a), hex (&#RRGGBB) and the spread hex form (&x&R&R&G&G&B&B).
export function parseMotdLine(line: string): MotdRun[] {
  const runs: MotdRun[] = [];
  let style = baseStyle();
  let buffer = '';

  const flush = () => {
    if (buffer) {
      runs.push({ text: buffer, style: { ...style } });
      buffer = '';
    }
  };

  const chars = Array.from(line);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const isCodeChar = c === '&' || c === '§';
    if (!isCodeChar || i + 1 >= chars.length) {
      buffer += c;
      continue;
    }

    const next = chars[i + 1];

    // Hex: &#RRGGBB
    if (next === '#' && /^[0-9a-fA-F]{6}$/.test(chars.slice(i + 2, i + 8).join(''))) {
      flush();
      style = { ...baseStyle(), color: '#' + chars.slice(i + 2, i + 8).join('').toUpperCase() };
      i += 7;
      continue;
    }

    // Spread hex: &x&R&R&G&G&B&B
    if ((next === 'x' || next === 'X')) {
      const hexDigits: string[] = [];
      let j = i + 2;
      while (hexDigits.length < 6 && j + 1 < chars.length && (chars[j] === '&' || chars[j] === '§') && /[0-9a-fA-F]/.test(chars[j + 1])) {
        hexDigits.push(chars[j + 1]);
        j += 2;
      }
      if (hexDigits.length === 6) {
        flush();
        style = { ...baseStyle(), color: '#' + hexDigits.join('').toUpperCase() };
        i = j - 1;
        continue;
      }
    }

    const lower = next.toLowerCase();
    if (lower in COLOR_BY_CODE) {
      // A color code resets all formatting.
      flush();
      style = { ...baseStyle(), color: COLOR_BY_CODE[lower] };
      i++;
      continue;
    }

    switch (lower) {
    case 'l': flush(); style.bold = true; i++; continue;
    case 'o': flush(); style.italic = true; i++; continue;
    case 'n': flush(); style.underline = true; i++; continue;
    case 'm': flush(); style.strikethrough = true; i++; continue;
    case 'k': flush(); style.obfuscated = true; i++; continue;
    case 'r': flush(); style = baseStyle(); i++; continue;
    default:
      buffer += c;
    }
  }
  flush();
  return runs;
}

// Convert a string using & codes to § (section sign) codes.
function ampToSection(text: string): string {
  return text
    .replace(/&#([0-9a-fA-F]{6})/g, (_, h: string) =>
      '§x' + h.split('').map((d) => '§' + d).join(''),
    )
    .replace(/&([0-9a-fk-orxA-FK-ORX])/g, '§$1');
}

export type MotdFormat = 'properties' | 'section' | 'amp';

// Build the output string for the chosen target format.
export function generateMotdOutput(line1: string, line2: string, format: MotdFormat): string {
  if (format === 'amp') {
    return line2 ? `${line1}\n${line2}` : line1;
  }

  const section = line2 ? `${ampToSection(line1)}\n${ampToSection(line2)}` : ampToSection(line1);

  if (format === 'section') return section;

  // server.properties: escape the section sign and newline so the value is ASCII-safe.
  const escaped = section.replace(/§/g, '\\u00A7').replace(/\n/g, '\\n');
  return `motd=${escaped}`;
}
