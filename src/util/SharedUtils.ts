import { server$, type Cookie } from '@builder.io/qwik-city';
import type { BirdflopSession } from '~/routes/plugin@auth';
import { rgbDefaults } from '~/routes/resources/rgb';
import { animTABDefaults } from '~/routes/resources/animtab';
import { loadPreset } from './rgb/presets';
import { getPrismaClient } from './prisma';
import { defaults } from './rgb/presets/defaults';

type names = 'rgb' | 'animtab' | 'parsed' | 'animpreview';

export function getCookies(cookie: Cookie, preset: names, urlParams?: URLSearchParams) {
  let json: { [key: string]: any } = {};
  try {
    const cookieVal = cookie.get(preset)?.value;
    // Decode the cookie value
    if (cookieVal) json = JSON.parse(decodeURIComponent(cookieVal));
  } catch (e) {
    console.error(e);
  }

  if (urlParams) {
    const params = Object.fromEntries([...urlParams.entries()]) as any;
    Object.keys(params).forEach(key => {
      try {
        if ((preset == 'rgb' && !Object.keys(rgbDefaults).includes(key))
        || (preset == 'animtab' && !Object.keys(animTABDefaults).includes(key))) {
          delete params[key];
        }
        if (key == 'format' || key == 'colors') params[key] = JSON.parse(params[key]);
        else if (params[key] === 'true' || params[key] === 'false') params[key] = params[key] === 'true';
        else if (!isNaN(Number(params[key]))) params[key] = Number(params[key]);
      } catch (e) {
        console.error(e);
      }
    });
    json = { ...json, ...params };
  }

  // migrate
  let migrated = false;
  if (preset == 'rgb' || preset == 'animtab') {
    const names = preset == 'rgb' ? Object.keys(rgbDefaults) : Object.keys(animTABDefaults);
    if (preset == 'animtab') names.push('version');
    names.forEach(name => {
      const cookieValue = cookie.get(name)?.value;
      if (!cookieValue) return;
      console.log('Migrating', name);
      try {
        if (name == 'colors') json[name] = cookieValue.split(',');
        else if (name == 'format') json[name] = JSON.parse(cookieValue);
        else if (cookieValue === 'true' || cookieValue === 'false') json[name] = cookieValue === 'true';
        else if (!isNaN(Number(cookieValue))) json[name] = Number(cookieValue);
        else json[name] = cookieValue;
      }
      catch (e) {
        console.error(e);
      }
      console.log('Deleting', name);
      cookie.delete(name, { path: '/' });
      migrated = true;
    });
    json = loadPreset(JSON.stringify(json));
  }
  if (migrated) cookie.set(preset, JSON.stringify(json), { path: '/' });

  return json;
}

export function setCookies(name: names, json: { [key: string]: any }) {
  console.debug('cookie', name, JSON.stringify(json));

  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  if (cookie.optout === 'true') return;

  const cookieValue = { ...json };
  Object.keys(cookieValue).forEach(key => {
    if (key != 'version' && JSON.stringify(cookieValue[key]) === JSON.stringify(defaults[key as keyof typeof defaults])) delete cookieValue[key];
  });
  if (cookieValue.syncshadow) delete cookieValue.shadowcolors;

  const existingCookie = cookie[name];
  const encodedValue = encodeURIComponent(JSON.stringify(cookieValue));
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/`;
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