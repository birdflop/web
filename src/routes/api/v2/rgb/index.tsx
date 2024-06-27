import type { RequestHandler } from '@builder.io/qwik-city';
import { v3formats } from '~/components/util/PresetUtils';
import { generateOutput } from '~/components/util/RGBUtils';
import { rgbDefaults } from '~/routes/resources/rgb';

export const onGet: RequestHandler = async ({ json, query }) => {
  let output = {};
  try {
    const queryjson: any = Object.fromEntries(query);

    const keys = Object.keys(queryjson);
    for (const key of keys) {
      if (key == 'colors') queryjson.colors = queryjson.colors.split(',');
      else if (queryjson[key] == 'true') queryjson[key] = true;
      else if (queryjson[key] == 'false') queryjson[key] = false;
      else if (queryjson[key].startsWith('{') && queryjson[key].endsWith('}')) queryjson[key] = JSON.parse(queryjson[key]);
    }
    output = await getOutput(queryjson);
  }
  catch (e: any) {
    console.error(e);
    throw json(400, { error: e.message });
  }
  throw json(200, output);
};

export const onPost: RequestHandler = async ({ json, parseBody }) => {
  let output = {};
  try {
    const body = await parseBody();
    output = await getOutput(body);
  }
  catch (e: any) {
    console.error(e);
    throw json(400, { error: e.message });
  }

  throw json(200, output);
};

async function getOutput(body: any) {
  const options = body?.silent ? {} : {
    input: {
      ...rgbDefaults,
      ...body,
    },
    options: {
      text: {
        type: 'string',
        description: 'The text to use for the gradient.',
        default: rgbDefaults.text,
      },
      colors: {
        type: 'array of (Color object - see data models in docs) or array of (string)',
        description: 'The colors to use for the gradient. Must be in hex format.',
        default: rgbDefaults.colors,
      },
      format: {
        type: 'Format object - see data models in docs',
        description: 'The format to use for the color and format codes. For MiniMessage, { color: "MiniMessage" } can be used.',
        default: rgbDefaults.format,
      },
      prefixsuffix: {
        type: 'string',
        description: 'The prefix or suffix to use for the text. Usually used for commands and stuff. $t will be replaced with the output text, if $t is not included, the output will not show.',
        default: rgbDefaults.prefixsuffix,
      },
      trimspaces: {
        type: 'boolean',
        description: 'Whether or not to trim color codes from spaces. Turn this off if you\'re using empty underlines or strikethroughs.',
        default: rgbDefaults.trimspaces,
      },
      colorlength: {
        type: 'number',
        description: 'The amount of characters for one color step.',
        default: rgbDefaults.colorlength,
      },
      bold: {
        type: 'boolean',
        description: 'Whether or not to bold the text.',
        default: rgbDefaults.bold,
      },
      italic: {
        type: 'boolean',
        description: 'Whether or not to italicize the text.',
        default: rgbDefaults.italic,
      },
      underline: {
        type: 'boolean',
        description: 'Whether or not to underline the text.',
        default: rgbDefaults.underline,
      },
      strikethrough: {
        type: 'boolean',
        description: 'Whether or not to strikethrough the text.',
        default: rgbDefaults.strikethrough,
      },
      silent: {
        type: 'boolean',
        description: 'Set this to true to hide the options and input.',
        default: false,
      },
    },
  };

  /* in case stupid */

  // make { color: "MiniMessage" } a valid format
  let format = body?.format;
  if (format && !format.char && (!format.bold || !format.italic || !format.underline || !format.strikethrough)) {
    format = v3formats.find(f => f.color == format.color) ?? { ...format, char: '&' };
  }

  // make string[] a valid color array
  let colors = body?.colors;
  if (colors && colors.length && typeof colors[0] == 'string') {
    if (typeof colors[0] == 'string') colors = colors.map((color: string, i: number) => ({ hex: color, pos: (100 / (colors.length - 1)) * i }));
  }

  const { text, prefixsuffix, trimspaces, colorlength, bold, italic, underline, strikethrough } = body ?? {};
  const output = generateOutput(text, colors, format, prefixsuffix, trimspaces, colorlength, bold, italic, underline, strikethrough);
  return {
    output,
    ...options,
  };
}