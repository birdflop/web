import type { Cookie } from '@builder.io/qwik-city';
import { defaults } from './PresetUtils';

export const getCookies = (cookie: Cookie, names: string[], urlParams: URLSearchParams) => {
  const cookiesObj: { [key: string]: string; } = {};
  names.forEach(name => {
    const cookieValue = cookie.get(name)?.value;
    if (cookieValue) cookiesObj[name] = cookieValue;
  });

  if (!cookiesObj.version) {
    delete cookiesObj.format;
    delete cookiesObj.outputFormat;
  }

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
            : (value.startsWith('{') && (key == 'parsed' || key == 'format')) ? JSON.parse(value)
              : value;
  }
  return parsedCookiesAndParams;
};

export const setCookies = function (json: { [key: string]: any; }) {
  const excludedKeys = ['alerts', 'frames', 'frame'];
  console.debug('setCookies', json);

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie.optout === 'true') return;
  Object.keys(json).forEach(key => {
    let value = json[key];
    if (key == 'format') {
      value = JSON.stringify(value);
      if (value === JSON.stringify(defaults[key])) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        return;
      }
    }
    else if (key != 'version') {
      if (value === defaults[key as keyof typeof defaults]) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        return;
      }
    }
    const existingCookie = cookie[key];
    if (excludedKeys.includes(key)) return;
    const encodedValue = encodeURIComponent(value);
    if (existingCookie === encodedValue) return;
    console.debug('cookie', key, encodedValue);
    document.cookie = `${key}=${encodedValue}; path=/`;
  });
};