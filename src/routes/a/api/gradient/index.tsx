import type { RequestHandler } from '@builder.io/qwik-city';
import { generateOutput } from '~/components/util/RGBUtils';

export const onGet: RequestHandler = async ({ json, query }) => {
  const { text, colors, format, formatchar, prefix = '', bold = 'false', italic = 'false', underline = 'false', strikethrough = 'false', silent = 'false' } = Object.fromEntries(query);

  const options = silent ? {} : {
    options: {
      text: {
        url: 'text=exampleText',
        description: 'The text to use for the gradient.',
      },
      colors: {
        url: 'colors=#rrggbb,#rrggbb,#rrggbb...',
        description: 'The colors to use for the gradient. Must be in hex format.',
      },
      format: {
        url: 'format=&#$1$2$3$4$5$6$f$c',
        description: 'The format to use for the color codes. $1 = #(r)rggbb, $2 = #r(r)ggbb, $3 = #rr(g)gbb, $4 = #rrg(g)bb, $5 = #rrgg(b)b, $6 = #rrggb(b), $f = format tags, $c = the character',
      },
      formatchar: {
        url: 'formatchar=&',
        description: 'The character to use for the format tags. (such as &l, &o, &n, &m)',
      },
      prefix: {
        url: 'prefix=/nick',
        description: 'The prefix to use for the text. Usually used for commands and stuff.',
      },
      bold: {
        url: 'bold=true',
        description: 'Whether or not to bold the text.',
      },
      italic: {
        url: 'italic=true',
        description: 'Whether or not to italicize the text.',
      },
      underline: {
        url: 'underline=true',
        description: 'Whether or not to underline the text.',
      },
      strikethrough: {
        url: 'strikethrough=true',
        description: 'Whether or not to strikethrough the text.',
      },
      silent: {
        url: 'silent=true',
        description: 'Set this to true to hide these options.',
      },
    },
  };

  throw json(200, {
    output: generateOutput(text, colors?.split(','), format, formatchar, prefix, bold == 'true', italic == 'true', underline == 'true', strikethrough == 'true'),
    ...options,
  });
};