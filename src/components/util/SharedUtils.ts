import type { Cookie } from '@builder.io/qwik-city';
import { defaults } from './PresetUtils';

export function getCookies(cookie: Cookie, names: string[], urlParams: URLSearchParams) {
  const cookiesObj: { [key: string]: string; } = {};
  names.forEach(name => {
    const cookieValue = cookie.get(name)?.value;
    if (cookieValue) cookiesObj[name] = cookieValue;
  });

  if (!cookiesObj.version) {
    delete cookiesObj.format;
    delete cookiesObj.outputFormat;
  }
  if (cookiesObj.version == '3') {
    delete cookiesObj.colors;
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
        : !isNaN(Number(value)) ? Number(value)
          : (value.startsWith('{') && (key == 'parsed' || key == 'format')) ? JSON.parse(value)
            : (key == 'colors') ? JSON.parse(value)
              : value;
  }

  return parsedCookiesAndParams;
}

export function setCookies(json: { [key: string]: any; }) {
  console.debug('setCookies', json);

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie.optout === 'true') return;
  Object.keys(json).forEach(key => {
    let value = json[key];
    if (key == 'format' || key == 'parsed' || key == 'colors') {
      value = JSON.stringify(value);
      if (key != 'parsed' && value === JSON.stringify(defaults[key])) {
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
    const encodedValue = encodeURIComponent(value);
    if (existingCookie === encodedValue) return;
    console.debug('cookie', key, encodedValue);
    document.cookie = `${key}=${encodedValue}; path=/`;
  });
}

export function sortColors(colors: { hex: string, pos: number }[]) {
  return [...colors].sort((a, b) => a.pos - b.pos);
}