// Utilities for the MOTD Designer resource and MOTD rendering (MotdText).
// Parsing (legacy &/§ codes, hex, spread hex, the MiniMessage subset and our
// own HTML) lives in @birdflop/mc-status so the server-list status pipeline
// and the designer share one implementation; this module adds the designer's
// palette metadata and output encoders.

export {
  isCustomHexColor,
  normalizeMotdText,
  parseMotdLine,
  type MotdRun,
  type MotdStyle,
} from '@birdflop/mc-status/motd';

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

// Default MOTD text color (white) used until a color code is encountered.
export const DEFAULT_COLOR = '#FFFFFF';

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

// Convert a string using & codes to § (section sign) codes.
function ampToSection(text: string): string {
  return text
    .replace(
      /&#([0-9a-fA-F]{6})/g,
      (_, h: string) =>
        '§x' +
        h
          .split('')
          .map((d) => '§' + d)
          .join('')
    )
    .replace(/&([0-9a-fk-orxA-FK-ORX])/g, '§$1');
}

export type MotdFormat = 'properties' | 'section' | 'amp';

// Build the output string for the chosen target format.
export function generateMotdOutput(
  line1: string,
  line2: string,
  format: MotdFormat
): string {
  if (format === 'amp') {
    return line2 ? `${line1}\n${line2}` : line1;
  }

  const section = line2
    ? `${ampToSection(line1)}\n${ampToSection(line2)}`
    : ampToSection(line1);

  if (format === 'section') return section;

  // server.properties: escape the section sign and newline so the value is ASCII-safe.
  const escaped = section.replace(/§/g, '\\u00A7').replace(/\n/g, '\\n');
  return `motd=${escaped}`;
}
