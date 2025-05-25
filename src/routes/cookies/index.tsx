import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = ({ json, cookie }) => {
  // get all cookies
  const cookies = cookie.getAll();
  console.debug('cookies', cookies);
  Object.keys(cookies).forEach((key) => {
    if (key.startsWith('authjs')) delete cookies[key];
  });
  throw json(200, cookies);
};