import type { GradientType } from './ColorUtils';

export type ColorMode = 'gradient' | 'solid' | 'none';
export type ColorStop = {
  hex: string;
  pos: number;
  opacity?: number;
};

export interface Formatting {
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strikethrough?: boolean,
  obfuscate?: boolean,
  smalltext?: boolean,
}

export interface FormatSegment extends Formatting {
  start: number;
  end: number;
};

export interface ColorFormat {
  color: string;
  char?: string;
  class?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
  obfuscate?: string;
}

export const colorFormats: ColorFormat[] = [
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

export const version = 5;
export const rgbColorDefaults = {
  version,
  text: 'Birdflop',
  colors: [
    { hex: '#54daf4', pos: 0 },
    { hex: '#545eb6', pos: 100 },
  ] as ColorStop[],
  shadowColors: null as null | ColorStop[],
  colorLength: 1,
  gradientType: 'rgb' as GradientType,
};
export const rgbColorDefaultsWithColorMode = {
  ...rgbColorDefaults,
  colorMode: 'gradient' as ColorMode,
};
export const rgbOptionDefaults = {
  version,
  colorFormat: colorFormats[1],
  formatting: [] as FormatSegment[],
  baseFormatting: {} as Formatting,
  prefixSuffix: '',
  customFormat: false,
  trimSpaces: true,
  disperse: false,
  lowercase: false,
};

export const rgbDefaults = {
  ...rgbColorDefaults,
  ...rgbOptionDefaults,
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
