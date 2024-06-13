import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  throw json(200, {
    endpoints: {
      '/api/v2/rgb': {
        POST: 'Generate a gradient.',
        GET: 'Equivalent to POST, but with query parameters.',
        WARNING: '/api/v2/rgb is deprecated. Please use /api/v3/rgb instead.',
      },
    },
    WARNING: '/api/v2 is deprecated. Please use /api/v3 instead.',
  });
};