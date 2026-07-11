import { server$, type Cookie } from '@qwik.dev/router';
import { loadPreset, rgbPreset } from './rgb/presets';
import {
  animTABDefaults,
  rgbColorDefaultsWithColorMode,
  rgbDefaults,
} from '@birdflop/rgbirdflop';
import {
  getDB,
  PresetPartial,
  presets,
  PublicPresetSubmission,
  savedPresets,
  users,
} from './db';
import { and, eq, sql } from 'drizzle-orm';
import { presetToVector } from './rgb/presets/vectorize';
import { validatePresetSubmission } from './rgb/presets/presetValidation';
import { isAdmin, Settings } from '~/routes/layout';

type names =
  'rgb' | 'rgbsegments' | 'animtab' | 'parsed' | 'animpreview' | 'settings';

const getDefaults = (name: names) => {
  switch (name) {
  case 'rgb':
    return rgbDefaults;
  case 'rgbsegments':
    return [rgbColorDefaultsWithColorMode];
  case 'animtab':
    return animTABDefaults;
  }
  return {};
};

export function parseParams(params: { [key: string]: any }, name: names) {
  const errors: string[] = [];
  const defaults = getDefaults(name);
  for (const key in params) {
    try {
      const isSegmentsKey = name === 'rgbsegments' && key === 'segments';
      if (!isSegmentsKey && !Object.keys(defaults).includes(key)) {
        delete params[key];
        continue;
      }
      const defaultValue = defaults[key as keyof typeof defaults];
      const isJsonObject =
        isSegmentsKey ||
        (defaultValue !== undefined && typeof defaultValue === 'object');
      if (isJsonObject && params[key]) {
        params[key] = JSON.parse(params[key]);
      } else if (params[key] === 'true' || params[key] === 'false')
        params[key] = params[key] === 'true';
      else if (!isNaN(Number(params[key]))) params[key] = Number(params[key]);
    } catch (e) {
      params[key] = undefined;
      errors.push(`Error parsing the ${key} value: ${e}`);
    }
  }
  return {
    params,
    errors,
  };
}

export function getCookies(
  cookie: Cookie,
  name: names,
  urlParams?: URLSearchParams,
) {
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
    // Migrate between versions (only the classic 'rgb' store uses preset migration)
    if (name === 'rgb' && cookies.version != rgbDefaults.version) {
      cookies = loadPreset(JSON.stringify(cookies));
      cookie.set(name, JSON.stringify(cookies), {
        path: '/',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }
  } catch (e) {
    errors.push(`Error loading preset: ${e}`);
  }

  // Check for any numbers lower than 1 in the cookies
  Object.keys(cookies).forEach((key) => {
    if (typeof cookies[key] === 'number' && cookies[key] < 1) {
      errors.push(`Invalid value found in ${key}: ${cookies[key]}`);
      cookies[key] = 1; // Reset values lower than 1 to 1
    }
  });

  // log any errors encountered
  if (errors.length > 0) {
    console.error(
      `Errors encountered while processing cookies for ${name}:`,
      errors,
    );
  }

  return { cookies, errors };
}

export function getClientCookies(): { [key: string]: string } {
  const cookie: { [key: string]: string } = {};
  if (typeof document === 'undefined') return cookie;
  document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    const pairsplit = pair.split(/\s*=\s*/);
    cookie[pairsplit[0]] = pairsplit.splice(1).join('=');
  });
  return cookie;
}

export function setCookies(name: names, cookies: { [key: string]: any }) {
  console.debug('cookie', name, JSON.stringify(cookies));

  const cookie = getClientCookies();

  // Settings cookie may not exist yet (e.g. a fresh browser); default to allowing cookies.
  let settings: { cookies?: boolean } = {};
  if (cookie.settings) {
    try {
      settings = JSON.parse(decodeURIComponent(cookie.settings));
    } catch {
      settings = {};
    }
  }
  // don't set cookies if user has opted out unless this is the settings cookie itself
  if (settings.cookies === false && name !== 'settings') return;

  const cookieValue = { ...cookies };

  const defaults = getDefaults(name);
  Object.keys(cookieValue).forEach((key) => {
    if (
      key != 'version' &&
      JSON.stringify(cookieValue[key]) ===
        JSON.stringify(defaults[key as keyof typeof defaults])
    ) {
      delete cookieValue[key];
    }
  });

  const existingCookie = cookie[name];
  const encodedValue = encodeURIComponent(JSON.stringify(cookieValue));
  if (existingCookie === encodedValue) return;
  console.debug('cookie processed', name, encodedValue);
  document.cookie = `${name}=${encodedValue}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString()};`;
}

export const setUserData = server$(async function (data: {
  privatePresets?: rgbPreset[];
  settings?: Settings;
}) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id)
    return console.warn('No session or database client');

  const userData = await db
    .update(users)
    .set({
      privatePresets: data.privatePresets,
      settings: data.settings,
    })
    .where(eq(users.id, session.user.id))
    .returning()
    .get();

  return userData;
});

export const savePreset = server$(async function (presetId: number) {
  const session = this.sharedMap.get('session');
  const db = getDB();

  if (!session?.user?.id || !db)
    return {
      success: false,
      error: 'No session or database client',
    };

  const insert = await db
    .insert(savedPresets)
    .values({
      userId: session.user.id,
      presetId,
    })
    .run();

  // Only increment if this user actually saved it
  if (insert.success) {
    await db
      .update(presets)
      .set({ saves: sql`${presets.saves} + 1` })
      .where(eq(presets.id, presetId))
      .run();
  }

  return insert;
});

export const unsavePreset = server$(async function (presetId: number) {
  const session = this.sharedMap.get('session');
  const db = getDB();

  if (!session?.user?.id || !db)
    return {
      success: false,
      error: 'No session or database client',
    };

  const unsave = await db
    .delete(savedPresets)
    .where(
      and(
        eq(savedPresets.userId, session.user.id),
        eq(savedPresets.presetId, presetId),
      ),
    )
    .run();

  // Only decrement if this user actually unsaved it
  if (unsave.success) {
    await db
      .update(presets)
      .set({ saves: sql`${presets.saves} - 1` })
      .where(eq(presets.id, presetId))
      .run();
  }

  return unsave;
});

export const publishPreset = server$(async function (
  submission: PublicPresetSubmission,
) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id)
    return { success: false, error: 'No session or database client' };

  try {
    // Validate submission
    const validation = await validatePresetSubmission(submission, true);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.map((e) => e.message).join('; '),
        validationErrors: validation.errors,
        similarPresets: validation.similarPresets,
      };
    }

    // Generate color vector for the preset
    const colorVector = presetToVector(submission.preset);

    const result = await db
      .insert(presets)
      .values({
        name: submission.name,
        userId: session.user.id,
        author: session.user.name,
        description: submission.description,
        preset: submission.preset,
        colorVector: colorVector,
      })
      .onConflictDoNothing()
      .returning();
    return {
      success: true,
      result,
      warnings: validation.warnings,
    };
  } catch (error) {
    console.error('Error publishing preset:', error);
    return { success: false, error };
  }
});

export const updatePreset = server$(async function (
  presetId: number,
  presetData: Partial<PresetPartial>,
) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id)
    return console.warn('No session or database client');
  const admin = await isAdmin();

  try {
    // If the preset data is being updated, regenerate the colorVector
    if (presetData.preset) {
      presetData.colorVector = presetToVector(presetData.preset);
    }

    const updatedPreset = await db
      .update(presets)
      .set(presetData)
      .where(
        and(
          eq(presets.id, presetId),
          admin ? undefined : eq(presets.userId, session.user.id),
        ),
      )
      .returning()
      .get();
    return updatedPreset;
  } catch (error) {
    console.error('Error updating preset:', error);
    throw error;
  }
});

export const deletePreset = server$(async function (presetId: number) {
  const session = this.sharedMap.get('session');

  const db = getDB();
  if (!session || !db || !session.user.id)
    return console.warn('No session or database client');
  const admin = await isAdmin();

  try {
    await db
      .delete(presets)
      .where(
        and(
          eq(presets.id, presetId),
          admin ? undefined : eq(presets.userId, session.user.id),
        ),
      );
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
});
