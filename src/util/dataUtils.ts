import { server$, type Cookie } from '@builder.io/qwik-city';
import type { BirdflopSession } from '~/routes/plugin@auth';
import { loadPreset, rgbPreset } from './rgb/presets';
import { getPrismaClient } from './prisma';
import { animTABDefaults, rgbDefaults } from './rgb/presets/defaults';

type names = 'rgb' | 'animtab' | 'parsed' | 'animpreview';

const getDefaults = (name: names) => {
  switch (name) {
  case 'rgb':
    return rgbDefaults;
  case 'animtab':
    return animTABDefaults;
  }
  return {};
};

export function parseParams(params: { [key: string]: any }, name: names) {
  const errors: string[] = [];
  for (const key in params) {
    try {
      if (!Object.keys(getDefaults(name)).includes(key)) {
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
  }
  return {
    params,
    errors,
  };
}

export function getCookies(cookie: Cookie, name: names, urlParams?: URLSearchParams) {
  let cookies: { [key: string]: any } = {};
  const errors: string[] = [];

  const cookieVal = cookie.get(name)?.value;

  // parse the cookie value if it exists
  if (cookieVal) {
    try {
      cookies = JSON.parse(cookieVal);
    } catch (e) {
      errors.push(`Failed to parse cookie ${name}: ${e}`);
    }
  }

  if (urlParams) {
    const { params, errors: parseErrors } = parseParams(
      Object.fromEntries(urlParams.entries()),
      name,
    );
    if (parseErrors.length > 0) errors.push(...parseErrors);
    cookies = { ...cookies, ...params };
  }

  try {
    // Migrate between versions
    if (cookies.version != rgbDefaults.version) {
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

  // Check for any numbers lower than 1 in the cookies
  Object.keys(cookies).forEach(key => {
    if (typeof cookies[key] === 'number' && cookies[key] < 1) {
      errors.push(`Invalid value found in ${key}: ${cookies[key]}`);
      cookies[key] = 1; // Reset values lower than 1 to 1
    }
  });

  // log any errors encountered
  if (errors.length > 0) {
    console.error(`Errors encountered while processing cookies for ${name}:`, errors);
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

  if (cookieValue.syncshadow && name == 'rgb') delete cookieValue.shadowcolors;
  const defaults = getDefaults(name);
  Object.keys(cookieValue).forEach(key => {
    if (key != 'version'
      && JSON.stringify(cookieValue[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) {
      delete cookieValue[key];
    }
  });

  const existingCookie = cookie[name];
  const encodedValue = encodeURIComponent(JSON.stringify(cookieValue));
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString()};`;
}

export const setUserData = server$(async function(data: {
  privatePresets?: rgbPreset[];
  savedPresets?: {
    disconnect?: { id: number };
    connect?: { id: number };
  }
}) {
  const session = this.sharedMap.get('session') as BirdflopSession | undefined;
  const prisma = getPrismaClient(this.env?.get('DATABASE_URL'));
  if (!session || !prisma) return console.warn('No session or prisma client');

  const userData = await prisma.user.update({
    where: { id: session.user.id },
    data,
    include: {
      savedPresets: true,
    },
  });

  return userData;
});