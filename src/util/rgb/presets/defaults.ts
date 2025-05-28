import { format, publishedPreset } from '.';

export const defaultPresets = {
  savedPresets: [],
};

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
  format: {
    color: '&#$1$2$3$4$5$6$f$c',
    char: '&',
  } as format,
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

export const presets: publishedPreset[] = [
  {
    name: 'SimplyTerraria',
    author: 'FrankV22',
    preset: {
      version: 4,
      colors: [
        { hex: '#62B071', pos: 0 },
        { hex: '#CDA785', pos: 100 },
      ],
      format: {
        color: '[c/$1$2$3$4$5$6$f:$c]',
        char: '&',
        class: 'font-terraria',
      },
      customFormat: true,
    },
  },
  {
    name: 'Birdflop',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: combinedDefaults.colors,
      length: 1,
    },
  },
  {
    name: 'SimplyMC',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#00FFE0', pos: 0 },
        { hex: '#EB00FF', pos: 100 },
      ],
      length: 1,
    },
  },
  {
    name: 'Rainbow',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#FF7F00', pos: 16.66 },
        { hex: '#FFFF00', pos: 33.33 },
        { hex: '#00FF00', pos: 50 },
        { hex: '#0000FF', pos: 66.66 },
        { hex: '#4B0082', pos: 83.33 },
        { hex: '#9400D3', pos: 100 },
      ],
      length: 2,
    },
  },
  {
    name: 'Skyline',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#1488CC', pos: 0 },
        { hex: '#2B32B2', pos: 100 },
      ],
      length: 2,
    },
  },
  {
    name: 'Mango',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#FFE259', pos: 0 },
        { hex: '#FFA751', pos: 100 },
      ],
      length: 1,
      bold: true,
    },
  },
  {
    name: 'Vice City',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#3494E6', pos: 0 },
        { hex: '#EC6EAD', pos: 100 },
      ],
      length: 1,
    },
  },
  {
    name: 'Dawn',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#F3904F', pos: 0 },
        { hex: '#3B4371', pos: 100 },
      ],
      length: 1,
    },
  },
  {
    name: 'Rose',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#F4C4F3', pos: 0 },
        { hex: '#FC67FA', pos: 100 },
      ],
      length: 1,
    },
  },
  {
    name: 'Firewatch',
    author: 'RGBirdflop',
    preset: {
      version: 4,
      colors: [
        { hex: '#CB2D3E', pos: 0 },
        { hex: '#EF473A', pos: 100 },
      ],
      length: 1,
    },
  },
];

export const formats = [
  {
    color: 'MiniMessage',
    bold: '<b>$t</b>',
    italic: '<i>$t</i>',
    underline: '<u>$t</u>',
    strikethrough: '<st>$t</st>',
    obfuscate: '<obf>$t</obf>',
  },
  combinedDefaults.format,
  {
    color: '§x§$1§$2§$3§$4§$5§$6$f$c',
    char: '§',
  },
  {
    color: 'JSON',
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
    color: '<##$1$2$3$4$5$6>$f$c',
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

export const types = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];