import type { RequestHandler } from '@qwik.dev/router';

export const onGet: RequestHandler = ({ text, json, cookie, query }) => {
  // get all cookies
  const cookies = cookie.getAll();
  Object.keys(cookies).forEach((key) => {
    if (key.includes('authjs') || key.includes('FCNEC')) delete cookies[key];
  });
  const cookiesObject = Object.fromEntries(
    Object.entries(cookies).map(([key, value]) => {
      let parsedVal: unknown = value.value;
      if (value.value.startsWith('{"')) {
        try {
          parsedVal = JSON.parse(value.value);
        } catch (e) {
          console.error(`Failed to parse cookie ${key}:`, e);
        }
      }
      return [key, parsedVal];
    })
  );

  if (query.get('text') !== null) {
    throw text(200, JSON.stringify(cookiesObject, null, 2));
  }
  throw json(200, cookiesObject);
};
