import { generateOutput } from '~/components/util/RGBUtils';
import { createPreview } from '~/components/util/HexCanvas';
import { server$ } from '@builder.io/qwik-city';

const createPreviewonServer = server$(async (text, colors, prefix, bold, italic, underline, strikethrough) => await createPreview(text, colors?.split(','), prefix, bold, italic, underline, strikethrough));

export const onGet: any = async ({ json, query }: any) => {
  const { text, colors, format, formatchar, prefix = '', bold = false, italic = false, underline = false, strikethrough = false } = Object.fromEntries(query);

  const preview = await createPreviewonServer(text, colors, prefix, bold, italic, underline, strikethrough);
  throw json(200, {
    output: generateOutput(text, colors?.split(','), format, formatchar, prefix, bold, italic, underline, strikethrough),
    preview,
    notice: 'This API is unfinished.',
  });
};