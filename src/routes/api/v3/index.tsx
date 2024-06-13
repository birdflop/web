import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  throw json(200, {
    endpoints: {
      '/api/v3/rgb': {
        POST: 'Generate a gradient.',
        GET: 'Equivalent to POST, but with query parameters.',
      },
    },
  });
};