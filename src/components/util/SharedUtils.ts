import { $ } from '@builder.io/qwik';

export const getCookie = $(function (store: any) {
  const json = JSON.parse(store);
  delete json.alerts;
  delete json.frames;
  delete json.frame;
  const cookie: { [key: string]: string; } = {};
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  Object.keys(json).forEach(key => {
    if (!cookie[key]) return;
    let existingCookie: string | string[] = decodeURIComponent(cookie[key]);
    if (key == 'colors' && existingCookie) existingCookie = existingCookie.split(',');
    json[key] = existingCookie;
  });
  return JSON.stringify(json);
});