import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  throw json(200, {
    endpoints: {
      '/api/v2/rgb': {
        type: 'POST',
        description: 'Generate a gradient.',
      },
    },
  });
};