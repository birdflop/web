import { server$, type Cookie } from '@builder.io/qwik-city';
import type { BirdflopSession } from '~/routes/plugin@auth';
import { rgbDefaults } from '~/routes/resources/rgb';
import { animTABDefaults } from '~/routes/resources/animtab';
import { loadPreset } from './rgb/presets';
import { getPrismaClient } from './prisma';
import { defaults } from './rgb/presets/defaults';

type names = 'rgb' | 'animtab' | 'parsed' | 'animpreview';

export function getCookies(cookie: Cookie, name: names, urlParams?: URLSearchParams) {
  let cookies: { [key: string]: any } = {};

  const cookieVal = cookie.get(name)?.value;
  // Decode the cookie value
  if (cookieVal) cookies = JSON.parse(decodeURIComponent(cookieVal));

  const errors: string[] = [];
  if (urlParams) {
    const params = Object.fromEntries([...urlParams.entries()]) as any;
    Object.keys(params).forEach(key => {
      try {
        if ((name == 'rgb' && !Object.keys(rgbDefaults).includes(key))
          || (name == 'animtab' && !Object.keys(animTABDefaults).includes(key))) {
          delete params[key];
        }
        if (key == 'format' || key == 'colors' || key == 'shadowcolors') {
          params[key] = JSON.parse(params[key]);
        }
        else if (params[key] === 'true' || params[key] === 'false') params[key] = params[key] === 'true';
        else if (!isNaN(Number(params[key]))) params[key] = Number(params[key]);
      }
      catch (e) {
        params[key] = undefined;
        errors.push(`Error parsing the ${key} value: ${e}`);
      }
    });
    cookies = { ...cookies, ...params };
  }

  try {
    // Migrate between versions
    if (cookies.version != defaults.version) {
      cookies = loadPreset(JSON.stringify(cookies));
      cookie.set(name, JSON.stringify(cookies), {
        path: '/',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }
  }
  catch (e) {
    errors.push(`Error loading preset: ${e}`);
  }

  return { cookies, errors };
}

export function setCookies(name: names, cookies: { [key: string]: any }) {
  console.debug('cookie', name, JSON.stringify(cookies));

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie.optout === 'true') return;

  const cookieValue = { ...cookies };
  if (cookieValue.syncshadow) delete cookieValue.shadowcolors;
  Object.keys(cookieValue).forEach(key => {
    if (key != 'version' && JSON.stringify(cookieValue[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete cookieValue[key];
  });

  const existingCookie = cookie[name];
  const encodedValue = encodeURIComponent(JSON.stringify(cookieValue));
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString()};`;
}

export const setUserData = server$(async function(data: {
  savedPresets?: Partial<typeof defaults>[];
}) {
  const session = this.sharedMap.get('session') as BirdflopSession | undefined;
  const prisma = getPrismaClient(this.env?.get('DATABASE_URL'));
  if (!session || !prisma) return console.log('No session or prisma client', session, prisma);
  const sessionData = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  console.log(sessionData);
  return sessionData;
});