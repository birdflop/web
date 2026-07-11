import type { RequestHandler } from "@qwik.dev/router";

export const onGet: RequestHandler = ({ json }) => {
  throw json(200, {
    endpoints: {
      "/api/v2": {
        GET: "View the v2 API endpoints.",
      },
    },
  });
};
