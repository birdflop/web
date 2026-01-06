import type { GradientType } from './ColorUtils';

export interface format {
  color: string;
  char?: string;
  class?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
  obfuscate?: string;
}

export const formats: format[] = [
  {
    color: 'MiniMessage',
    bold: '<b>$t</b>',
    italic: '<i>$t</i>',
    underline: '<u>$t</u>',
    strikethrough: '<st>$t</st>',
    obfuscate: '<obf>$t</obf>',
  },
  {
    color: '&#$1$2$3$4$5$6$f$c',
    char: '&',
  },
  {
    color: 'JSON',
  },
  {
    color: '§x§$1§$2§$3§$4§$5§$6$f$c',
    char: '§',
  },
  {
    color: '&x&$1&$2&$3&$4&$5&$6$f$c',
    char: '&',
  },
  {
    color: '<#$1$2$3$4$5$6>$f$c',
    char: '&',
  },
  {
    color: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    bold: '[BOLD]$t[/BOLD]',
    italic: '[ITALIC]$t[/ITALIC]',
    underline: '[UNDERLINE]$t[/UNDERLINE]',
    strikethrough: '[STRIKETHROUGH]$t[/STRIKETHROUGH]',
  },
];

export const animationStyles = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];

export const rgbDefaults = {
  version: 4,
  colors: [
    { hex: '#54daf4', pos: 0 },
    { hex: '#545eb6', pos: 100 },
  ],
  shadowcolors: [
    { hex: '#15373D', pos: 0 },
    { hex: '#15182E', pos: 100 },
  ],
  colorlength: 1,
  text: 'Birdflop',
  format: formats[1],
  prefixsuffix: '',
  customFormat: false,
  trimspaces: true,
  disperse: false,
  lowercase: false,
  syncshadow: true,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  obfuscate: false,
  gradientType: 'rgb' satisfies GradientType,
};

export const animTABDefaults = {
  name: 'logo',
  type: 1,
  speed: 50,
  length: 1,
  outputFormat: '%name%:\n  change-interval: %speed%\n  texts:\n%output:{  - "$t"}%',
};

export const combinedDefaults = {
  ...rgbDefaults, ...animTABDefaults,
};
