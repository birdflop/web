import type { RequestHandler } from "@qwik.dev/router";

import { rgbOptions } from "./rgb";

export const apiEndpoints = {
  endpoints: {
    "/api/v2/rgb": {
      methods: {
        POST: "Generate a gradient.",
        GET: "Equivalent to POST, but with query parameters.",
      },
      options: rgbOptions,
      html: undefined as string[] | undefined,
    },
  },
};

export const onGet: RequestHandler = ({ json }) => {
  throw json(200, apiEndpoints);
};
