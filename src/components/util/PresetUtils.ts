export const presetVersion = 2;

declare interface preset {
  version: number;
  colors: string[];
  name: string;
  text: string;
  type: number;
  speed: number;
  format: string;
  formatchar: string;
  customFormat: boolean;
  prefix: string;
  outputFormat: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

function decompress(input: number, expectedValues: number) {
  const values = [];
  for (let i = 0; i < expectedValues; i++) {
    const value = !!((input >> i) & 1);
    values.push(value);
  }
  return values;
}

export const presets = {
  'birdflop': ['#084CFB', '#ADF3FD'],
  'SimplyMC': ['#00FFE0', '#EB00FF'],
  'Rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  'Skyline': ['#1488CC', '#2B32B2'],
  'Mango': ['#FFE259', '#FFA751'],
  'Vice City': ['#3494E6', '#EC6EAD'],
  'Dawn': ['#F3904F', '#3B4371'],
  'Rose': ['#F4C4F3', '#FC67FA'],
  'Firewatch': ['#CB2D3E', '#EF473A'],
};

const formats = {
  0: {
    outputPrefix: '',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  1: {
    outputPrefix: '',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  2: {
    outputPrefix: '',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  3: {
    outputPrefix: '/nick ',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  4: {
    outputPrefix: '/nick ',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  5: {
    outputPrefix: '/nick ',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  6: {
    outputPrefix: '',
    template: '§x§$1§$2§$3§$4§$5§$6$f$c',
    formatChar: '§',
  },
  7: {
    outputPrefix: '',
    template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    formatChar: '',
  },
  8: {
    outputPrefix: '',
    template: '',
    custom: true,
    formatChar: '',
  },
};

export function fromBinary(encoded: string): string {
  let binary: string;
  try {
    binary = atob(encoded);
  } catch (error) {
    return '';
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

export function loadPreset(p: string) {
  let version: number;
  let preset: any;
  const newPreset: preset = {
    version: 2,
    colors: [],
    name: 'logo',
    text: 'birdflop',
    type: 1,
    speed: 50,
    format: '&#$1$2$3$4$5$6$f$c',
    formatchar: '&',
    prefix: '',
    customFormat: false,
    outputFormat: '%name%:\n  change-interval: %speed%\n  texts:\n%output%',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  };
  if (fromBinary(p) !== '') {
    preset = JSON.parse(fromBinary(p));
    version = preset.version;
  } else {
    try {
      preset = JSON.parse(p);
      version = preset.version;
    } catch (error) {
      return 'Invalid Preset';
    }
  }
  if (version === presetVersion) {
    return preset;
  }
  if (version === 1) {
    newPreset.version = presetVersion;
    newPreset.colors = preset.colors;
    newPreset.name = preset.name;
    newPreset.text = preset.text;
    newPreset.speed = preset.speed;
    newPreset.type = Number(preset.type) + 1;
    newPreset.format = formats[preset['output-format'] as keyof typeof formats].template;
    newPreset.formatchar = formats[preset['output-format'] as keyof typeof formats].formatChar;
    newPreset.customFormat = preset['custom-format'] !== '';
    newPreset.prefix = formats[preset['output-format'] as keyof typeof formats].outputPrefix;
    const formatting = decompress(preset.formats, 4);
    newPreset.bold = formatting[0];
    newPreset.italic = formatting[1];
    newPreset.underline = formatting[2];
    newPreset.strikethrough = formatting[3];
    return newPreset;
  }
}