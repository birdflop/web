import type { RequestHandler } from '@qwik.dev/router';
import { parseParams } from '~/util/dataUtils';
import {
  colorFormats,
  rgbDefaults,
  generateOutput,
} from '@birdflop/rgbirdflop';

export const onGet: RequestHandler = ({ json, query }) => {
  let output;
  try {
    const { params } = parseParams(Object.fromEntries(query), 'rgb');

    output = getOutput(params);
  } catch (e: any) {
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
  } catch (e: any) {
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
  shadowColors:
    'The colors to use for the text shadow gradient. Must be in hex format and requires color format set to JSON or MiniMessage',
  colorFormat:
    'The format to use for the color and format codes. For MiniMessage or JSON, { color: "MiniMessage" } can be used.',
  prefixSuffix:
    'The prefix or suffix to use for the text. Usually used for commands and stuff. $t will be replaced with the output text, if $t is not included, the output will not show.',
  trimSpaces:
    'Whether or not to trim color codes from spaces. Turn this off if you\'re using empty underlines or strikethroughs.',
  colorLength: 'The amount of characters for one color step.',
  baseFormatting: 'The base formatting options to apply (bold, italic, etc.).',
};

const customTypes: {
  [key in keyof typeof rgbDefaults]?: string;
} = {
  colors: 'Color[] - see types in docs | string[]',
  shadowColors: 'Color[] - see types in docs | string[]',
  colorFormat:
    'RegularFormatting | MiniMessageFormatting | JSONFormatting - see types in docs',
  baseFormatting: 'Formatting - see types in docs',
};

export const rgbOptions = (
  Object.keys(rgbDefaults) as (keyof typeof rgbDefaults)[]
)
  .filter((key) => !['version', 'disperse', 'customFormat'].includes(key))
  .reduce(
    (
      acc: {
        [key in keyof typeof rgbDefaults]?: {
          type: string;
          description: string;
          default: any;
        };
      },
      key,
    ) => {
      const description = descriptions[key];
      const customType = customTypes[key];
      acc[key] = {
        type: customType ?? typeof rgbDefaults[key],
        description: description ?? `${key} has not been documented yet.`,
        default: rgbDefaults[key],
      };
      return acc;
    },
    {},
  );

function getOutput(body: any) {
  // Map flat formatting flags to baseFormatting object
  const baseFormatting = {
    bold: body?.bold,
    italic: body?.italic,
    underline: body?.underline,
    strikethrough: body?.strikethrough,
    obfuscate: body?.obfuscate,
  };
  Object.keys(baseFormatting).forEach((key) => {
    if (baseFormatting[key as keyof typeof baseFormatting] === undefined) {
      delete baseFormatting[key as keyof typeof baseFormatting];
    }
  });
  if (Object.keys(baseFormatting).length > 0) {
    body.baseFormatting = {
      ...rgbDefaults.baseFormatting,
      ...body.baseFormatting,
      ...baseFormatting,
    };
  }

  const options = body?.silent
    ? {}
    : {
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
  let format = body?.colorFormat ?? body?.colorformat ?? body?.format;
  if (
    format &&
    !format.char &&
    (!format.bold ||
      !format.italic ||
      !format.underline ||
      !format.strikethrough)
  ) {
    format = colorFormats.find((f: any) => f.color == format.color) ?? {
      ...format,
      char: '&',
    };
  }
  if (format) body.colorFormat = format;

  // make string[] a valid color array
  let colors = body?.colors;
  if (colors && colors.length && typeof colors[0] == 'string') {
    if (typeof colors[0] == 'string')
      colors = colors.map((color: string, i: number) => ({
        hex: color,
        pos: Math.round((100 / (colors.length - 1)) * i * 1000) / 1000,
      }));
  }
  body.colors = colors;

  let shadowColors = body?.shadowColors ?? body?.shadowcolors;
  if (
    shadowColors &&
    shadowColors.length &&
    typeof shadowColors[0] == 'string'
  ) {
    if (typeof shadowColors[0] == 'string')
      shadowColors = shadowColors.map((color: string, i: number) => ({
        hex: color,
        pos: Math.round((100 / (colors.length - 1)) * i * 1000) / 1000,
      }));
  }
  body.shadowColors = shadowColors;

  const output = generateOutput({
    ...rgbDefaults,
    ...body,
  });
  return {
    output,
    ...options,
  };
}
