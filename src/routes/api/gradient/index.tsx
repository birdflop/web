import { generateOutput } from '~/components/util/RGBUtils';
import { createPreview } from '~/components/util/HexCanvas';

export const onGet: any = async ({ json, query }: any) => {
  const { text, colors, format, formatchar, prefix = '', bold = false, italic = false, underline = false, strikethrough = false } = Object.fromEntries(query);

  throw json(200, {
    output: generateOutput(text, colors?.split(','), format, formatchar, prefix, bold, italic, underline, strikethrough),
    preview: await createPreview(text, colors?.split(','), prefix, bold, italic, underline, strikethrough),
    notice: 'This API is unfinished.',
  });
};