import type { RequestHandler } from '@builder.io/qwik-city';

export const apiEndpoints = {
  endpoints: {
    '/api/v2/rgb': {
      methods: {
        POST: 'Generate a gradient.',
        GET: 'Equivalent to POST, but with query parameters.',
      },
      html: undefined as string[] | undefined,
    },
  },
};

export const onGet: RequestHandler = ({ json }) => {
  throw json(200, apiEndpoints);
};