import type { RequestHandler } from '@builder.io/qwik-city';
import { parseParams } from '~/util/dataUtils';
import { formats, rgbDefaults, generateOutput } from '@birdflop/rgbirdflop';

export const onGet: RequestHandler = ({ json, query }) => {
  let output;
  try {
    const { params } = parseParams(
      Object.fromEntries(query), 'rgb',
    );

    output = getOutput(params);
  }
  catch (e: any) {
    console.error(e);
    throw json(400, { error: e.message });
  }
  throw json(200, output);
};

export const onPost: RequestHandler = async ({ json, parseBody }) => {
  let output;
  try {
    const body = await parseBody();
    output = getOutput(body);
  }
  catch (e: any) {
    console.error(e);
    throw json(400, { error: e.message });
  }

  throw json(200, output);
};

const descriptions: {
  [key in keyof typeof rgbDefaults]?: string;
} = {
  text: 'The text to use for the gradient.',
  colors: 'The colors to use for the gradient. Must be in hex format.',
  shadowcolors: 'The colors to use for the text shadow gradient. Must be in hex format and requires color format set to JSON or MiniMessage',
  format: 'The format to use for the color and format codes. For MiniMessage or JSON, { color: "MiniMessage" } can be used.',
  prefixsuffix: 'The prefix or suffix to use for the text. Usually used for commands and stuff. $t will be replaced with the output text, if $t is not included, the output will not show.',
  trimspaces: 'Whether or not to trim color codes from spaces. Turn this off if you\'re using empty underlines or strikethroughs.',
  colorlength: 'The amount of characters for one color step.',
  bold: 'Whether or not to bold the text.',
  italic: 'Whether or not to italicize the text.',
  underline: 'Whether or nots to underline the text.',
  strikethrough: 'Whether or not to strikethrough the text.',
  obfuscate: 'Whether or not to obfuscate the text.',
};

const customTypes: {
  [key in keyof typeof rgbDefaults]?: string;
} = {
  colors: 'Color[] - see types in docs | string[]',
  shadowcolors: 'Color[] - see types in docs | string[]',
  format: 'RegularFormatting | MiniMessageFormatting | JSONFormatting - see types in docs',
};

export const rgbOptions = (Object.keys(rgbDefaults) as (keyof typeof rgbDefaults)[])
  .filter(key => !['version', 'disperse', 'customFormat'].includes(key))
  .reduce((acc: {
    [key in keyof typeof rgbDefaults]?: {
      type: string;
      description: string;
      default: any;
    };
  }, key) => {
    const description = descriptions[key];
    const customType = customTypes[key];
    acc[key] = {
      type: customType ?? typeof rgbDefaults[key],
      description: description ?? `${key} has not been documented yet.`,
      default: rgbDefaults[key],
    };
    return acc;
  }, {});

function getOutput(body: any) {
  const options = body?.silent ? {} : {
    input: {
      ...rgbDefaults,
      ...body,
    },
    options: {
      ...rgbOptions,
      silent: {
        type: 'boolean',
        description: 'Set this to true to hide the options and input.',
        default: false,
      },
    },
  };

  // make { color: "MiniMessage" } a valid format
  let format = body?.format;
  if (format && !format.char && (!format.bold || !format.italic || !format.underline || !format.strikethrough)) {
    format = formats.find(f => f.color == format.color) ?? { ...format, char: '&' };
  }

  // make string[] a valid color array
  let colors = body?.colors;
  if (colors && colors.length && typeof colors[0] == 'string') {
    if (typeof colors[0] == 'string') colors = colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (colors.length - 1)) * i }));
  }
  body.colors = colors;
  let shadowcolors = body?.shadowcolors;
  if (shadowcolors && shadowcolors.length && typeof shadowcolors[0] == 'string') {
    if (typeof shadowcolors[0] == 'string') shadowcolors = shadowcolors.map((color: string, i: number) => ({ hex: color, pos: (100 / (colors.length - 1)) * i }));
  }
  body.shadowcolors = shadowcolors;

  const output = generateOutput({
    ...rgbDefaults,
    ...body,
  });
  return {
    output,
    ...options,
  };
}