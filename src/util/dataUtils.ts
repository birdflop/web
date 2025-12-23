import { server$, type Cookie } from '@builder.io/qwik-city';
import { loadPreset, rgbPreset } from './rgb/presets';
import { animTABDefaults, rgbDefaults } from './rgb/presets/defaults';
import { getDB, presets, PublicPresetSubmission, savedPresets, users } from './db';
import { and, eq } from 'drizzle-orm';

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
}) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return console.warn('No session or database client');

  const userData = await db.update(users)
    .set({
      privatePresets: data.privatePresets,
    })
    .where(eq(users.id, session.user.id))
    .returning().get();

  return userData;
});

export const savePreset = server$(async function(presetId: number) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return console.warn('No session or database client');

  try {
    const userData = await db.insert(savedPresets)
      .values({
        userId: session.user.id,
        presetId,
      });
    return userData;
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
});

export const unsavePreset = server$(async function(presetId: number) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return console.warn('No session or database client');

  try {
    const userData = await db.delete(savedPresets)
      .where(and(
        eq(savedPresets.userId, session.user.id),
        eq(savedPresets.presetId, presetId),
      ));
    return userData;
  } catch (error) {
    console.error('Error unsaving preset:', error);
    throw error;
  }
});

export const publishPreset = server$(async function(submission: PublicPresetSubmission) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return { success: false, error: 'No session or database client' };

  try {
    const result = await db.insert(presets)
      .values({
        name: submission.name,
        userId: session.user.id,
        author: session.user.name,
        description: submission.description,
        preset: submission.preset,
      }).onConflictDoNothing().returning();
    return { success: true, result };
  } catch (error) {
    console.error('Error publishing preset:', error);
    return { success: false, error };
  }
});

export const updatePreset = server$(async function(presetId: number, presetData: Partial<rgbPreset>) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return console.warn('No session or database client');

  try {
    const updatedPreset = await db.update(presets)
      .set(presetData)
      .where(and(
        eq(presets.id, presetId),
        eq(presets.userId, session.user.id),
      ))
      .returning().get();
    return updatedPreset;
  } catch (error) {
    console.error('Error updating preset:', error);
    throw error;
  }
});

export const deletePreset = server$(async function(presetId: number) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id) return console.warn('No session or database client');

  try {
    await db.delete(presets)
      .where(and(
        eq(presets.id, presetId),
        eq(presets.userId, session.user.id),
      ));
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
});