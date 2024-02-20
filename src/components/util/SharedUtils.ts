import { $ } from '@builder.io/qwik';
import type { Cookie } from '@builder.io/qwik-city';

export const getCookies = $(function (cookie: Cookie, names: string[]) {
  const cookiesObj: { [key: string]: string; } = {};
  names.forEach(name => {
    const cookieValue = cookie.get(name)?.value;
    if (cookieValue) cookiesObj[name] = cookieValue;
  });
  const parsedCookies: any = {};
  for (const key of Object.keys(cookiesObj)) {
    const value = cookiesObj[key];
    parsedCookies[key] = value === 'true' ? true
      : value === 'false' ? false
        : key == 'colors' ? value.split(',')
          : !isNaN(Number(value)) ? Number(value)
            : value;
  }
  return parsedCookies;
});