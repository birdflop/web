import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  throw json(200, {
    endpoints: {
      '/api/gradient': {
        GET: 'Generate a gradient.',
        WARNING: '/api/gradient is deprecated. Please use /api/v2/rgb instead.',
      },
      '/api/v2': {
        GET: 'View the v2 API endpoints.',
        WARNING: '/api/v2 is deprecated. Please use /api/v3 instead.',
      },
      '/api/v3': {
        GET: 'View the v3 API endpoints.',
      },
    },
  });
};