import type { Cookie } from '@builder.io/qwik-city';
import { rgbDefaults } from '~/routes/resources/rgb';
import { animTABDefaults } from '~/routes/resources/animtab';
import { defaults, loadPreset } from './PresetUtils';

type names = 'rgb' | 'animtab' | 'parsed' | 'animpreview';

export function getCookies(cookie: Cookie, preset: names, urlParams: URLSearchParams) {
  let json = JSON.parse(cookie.get(preset)?.value || '{}');

  // migrate
  let migrated = false;
  if (preset == 'rgb' || preset == 'animtab') {
    const names = preset == 'rgb' ? Object.keys(rgbDefaults) : Object.keys(animTABDefaults);
    if (preset == 'animtab') names.push('version');
    names.forEach(name => {
      let cookieValue = cookie.get(name)?.value;
      const paramValue = urlParams.get(name);
      if (paramValue) cookieValue = paramValue;
      if (!cookieValue) return;
      console.log('Migrating', name);
      try {
        if (name == 'colors') json[name] = cookieValue.split(',');
        else if (name == 'format' ) json[name] = JSON.parse(cookieValue);
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

export function setCookies(name: names, json: { [key: string]: any; }) {
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

  const existingCookie = cookie[name];
  const encodedValue = JSON.stringify(cookieValue);
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/`;
}

export function sortColors(colors: { hex: string, pos: number }[]) {
  return [...colors].sort((a, b) => a.pos - b.pos);
}