import { $ } from '@builder.io/qwik';
import type { Cookie } from '@builder.io/qwik-city';

export const getCookies = $(function (cookie: Cookie, names: string[], urlParams: URLSearchParams) {
  const cookiesObj: { [key: string]: string; } = {};
  names.forEach(name => {
    const cookieValue = cookie.get(name)?.value;
    if (cookieValue) cookiesObj[name] = cookieValue;
  });

  names.forEach(name => {
    const paramValue = urlParams.get(name);
    if (paramValue) cookiesObj[name] = paramValue;
  });

  const parsedCookiesAndParams: any = {};
  for (const key of Object.keys(cookiesObj)) {
    const value = cookiesObj[key];
    parsedCookiesAndParams[key] = value === 'true' ? true
      : value === 'false' ? false
        : key == 'colors' ? value.split(',')
          : !isNaN(Number(value)) ? Number(value)
            : value.startsWith('{') ? JSON.parse(value)
              : value;
  }
  return parsedCookiesAndParams;
});