import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  throw json(200, {
    endpoints: {
      '/api/v2': {
        GET: 'View the v2 API endpoints.',
      },
      '/api/gradient': {
        GET: 'Generate a gradient.',
        WARNING: '/api/gradient is deprecated. Please use /api/v2/rgb instead.',
      },
    },
  });
};