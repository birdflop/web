// Input validation + normalization for server listings.

import { loadPreset, type rgbPreset } from '../rgb/presets';
import type { PluginSource, PluginType } from '../plugins/ServerPlugin';
import type { PluginsType, ServerType } from '../plugins/types';
import {
  LIMITS,
  isServerEdition,
  isServerTag,
  type ServerEdition,
  type ServerTag,
} from './constants';

export interface ServerFormInput {
  name?: string;
  description?: string;
  shortDescription?: string;
  edition?: string;
  minVersion?: string;
  maxVersion?: string;
  rgbPreset?: string | rgbPreset;
  javaHost?: string;
  javaPort?: string | number;
  bedrockHost?: string;
  bedrockPort?: string | number;
  website?: string;
  discord?: string;
  bannerUrl?: string;
  tags?: string[];
  votifierHost?: string;
  votifierPort?: string | number;
  votifierToken?: string;
  pluginsPublic?: boolean;
  hiddenPlugins?: string[];
}

export interface NormalizedServer {
  name: string;
  description: string;
  shortDescription: string | null;
  edition: ServerEdition;
  minVersion: string | null;
  maxVersion: string | null;
  rgbPreset: rgbPreset | null;
  javaHost: string | null;
  javaPort: number | null;
  bedrockHost: string | null;
  bedrockPort: number | null;
  website: string | null;
  discord: string | null;
  bannerUrl: string | null;
  tags: ServerTag[];
  votifierHost: string | null;
  votifierPort: number | null;
  votifierToken: string | null;
  pluginsPublic: boolean;
  hiddenPlugins: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: NormalizedServer;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function trimOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parsePort(
  value: string | number | null | undefined
): number | null | undefined {
  if (value === undefined || value === '' || value === null) return null;
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  if (!Number.isInteger(n)) return undefined; // signal "invalid"
  if (n < 1 || n > 65535) return undefined;
  return n;
}

function isValidUrl(value: string): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Hostnames: allow domain names and IPv4 (no scheme, no path).
const HOST_RE = /^[a-zA-Z0-9.-]+$/;

export function isValidHost(host: string): boolean {
  return host.length <= 253 && HOST_RE.test(host);
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function isColorStops(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 20 &&
    value.every(
      (stop) =>
        isPlainObject(stop) &&
        typeof stop.hex === 'string' &&
        HEX_RE.test(stop.hex) &&
        typeof stop.pos === 'number' &&
        stop.pos >= 0 &&
        stop.pos <= 100 &&
        (stop.opacity === undefined || typeof stop.opacity === 'number')
    )
  );
}

/**
 * Shape-check an RGBirdflop preset before it's stored or rendered. Only the
 * fields the title preview reads are checked in depth; the whole thing is
 * size-capped since it's stored and shipped to every visitor. Returns null
 * for anything malformed.
 */
export function sanitizeRgbPreset(value: unknown): rgbPreset | null {
  let preset: unknown = value;
  if (typeof preset === 'string') {
    try {
      preset = loadPreset(preset);
    } catch {
      return null;
    }
  }
  if (!isPlainObject(preset)) return null;
  try {
    if (JSON.stringify(preset).length > LIMITS.rgbPresetBytes) return null;
  } catch {
    return null;
  }
  if (!isColorStops(preset.colors)) return null;
  if (preset.shadowColors != null && !isColorStops(preset.shadowColors))
    return null;
  if (
    preset.baseFormatting !== undefined &&
    !isPlainObject(preset.baseFormatting)
  )
    return null;
  if (
    preset.colorFormat !== undefined &&
    !(
      isPlainObject(preset.colorFormat) &&
      typeof preset.colorFormat.color === 'string' &&
      (preset.colorFormat.class === undefined ||
        typeof preset.colorFormat.class === 'string')
    )
  )
    return null;
  if (preset.formatting !== undefined && !Array.isArray(preset.formatting))
    return null;
  return preset;
}

const PLUGIN_SOURCES: readonly PluginSource[] = ['spigot', 'modrinth', 'misc'];

// Optional http(s) URL field; anything else is dropped.
function httpUrlOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' &&
    value.length <= LIMITS.url &&
    isValidUrl(value)
    ? value
    : undefined;
}

function sanitizePluginId(
  type: PluginSource,
  id: unknown
): string | number | null {
  // Spigot resources are numeric; Modrinth ids/slugs are short [\w.-]
  // tokens. Anything else would only feed bogus lookups to Spiget/Modrinth.
  if (type === 'spigot') {
    const n = typeof id === 'string' && /^\d{1,10}$/.test(id) ? Number(id) : id;
    return typeof n === 'number' && Number.isSafeInteger(n) && n > 0
      ? (id as string | number)
      : null;
  }
  if (typeof id !== 'string' || id.length === 0 || id.length > LIMITS.pluginId)
    return null;
  if (type === 'modrinth' && !/^[A-Za-z0-9_.-]+$/.test(id)) return null;
  return id;
}

// A Record keyed by the software union, so adding an option to
// softwareOptions (src/util/flags) fails type-checking until it's listed here.
// Kept apart from softwareOptions so this module doesn't pull in icon components.
const SERVER_SOFTWARE: Record<ServerType['software'], true> = {
  paper: true,
  purpur: true,
  velocity: true,
  waterfall: true,
  spigot: true,
  forge: true,
  fabric: true,
};

export function isServerSoftware(
  value: unknown
): value is ServerType['software'] {
  return typeof value === 'string' && Object.hasOwn(SERVER_SOFTWARE, value);
}

/**
 * Validate a client-sent plugin map (plugins page -> listing row). Malformed
 * entries are dropped, since they can only come from a tampered request;
 * only too many plugins is an error. Only the fields the plugins page
 * persists are kept, and URLs must be http(s) since they end up as hrefs on
 * the public listing page.
 */
export function sanitizeServerPlugins(
  value: unknown
): { plugins: PluginsType } | { error: string } {
  if (!isPlainObject(value)) return { error: 'Invalid plugin list.' };
  const entries = Object.entries(value);
  if (entries.length > LIMITS.maxPlugins)
    return { error: `You can list at most ${LIMITS.maxPlugins} plugins.` };

  const plugins: PluginsType = {};
  for (const [key, raw] of entries) {
    if (key.length > LIMITS.pluginId || !isPlainObject(raw)) continue;
    const type = raw.type as PluginSource;
    if (!PLUGIN_SOURCES.includes(type)) continue;
    const id = sanitizePluginId(type, raw.id);
    if (id === null) continue;

    const plugin: PluginType = { id, type };
    if (typeof raw.name === 'string' && raw.name.trim())
      plugin.name = raw.name.trim().slice(0, LIMITS.pluginName);
    const url = httpUrlOrUndefined(raw.url);
    if (url) plugin.url = url;
    const iconUrl = httpUrlOrUndefined(raw.iconUrl);
    if (iconUrl) plugin.iconUrl = iconUrl;

    const version = raw.currentVersion;
    if (
      isPlainObject(version) &&
      (typeof version.id === 'string' || typeof version.id === 'number') &&
      String(version.id).length <= LIMITS.pluginId &&
      typeof version.name === 'string'
    ) {
      const releaseDate = new Date(version.releaseDate as Date);
      plugin.currentVersion = {
        id: version.id,
        name: version.name.slice(0, LIMITS.pluginName),
        releaseDate: Number.isNaN(releaseDate.getTime())
          ? new Date(0)
          : releaseDate,
      };
    }
    plugins[key] = plugin;
  }
  return { plugins };
}

export function validateServerInput(input: ServerFormInput): ValidationResult {
  const errors: string[] = [];

  const name = input.name?.trim() ?? '';
  if (!name) errors.push('Server name is required.');
  else if (name.length > LIMITS.name)
    errors.push(`Server name must be ${LIMITS.name} characters or fewer.`);

  const description = input.description?.trim() ?? '';
  if (!description) errors.push('Description is required.');
  else if (description.length > LIMITS.description)
    errors.push(
      `Description must be ${LIMITS.description} characters or fewer.`
    );

  const shortDescription = trimOrNull(input.shortDescription);
  if (shortDescription && shortDescription.length > LIMITS.shortDescription)
    errors.push(
      `Short description must be ${LIMITS.shortDescription} characters or fewer.`
    );

  const minVersion = trimOrNull(input.minVersion);
  if (minVersion && minVersion.length > LIMITS.version)
    errors.push(
      `Minimum version must be ${LIMITS.version} characters or fewer.`
    );

  const maxVersion = trimOrNull(input.maxVersion);
  if (maxVersion && maxVersion.length > LIMITS.version)
    errors.push(
      `Maximum version must be ${LIMITS.version} characters or fewer.`
    );

  const edition = input.edition ?? 'java';
  if (!isServerEdition(edition)) errors.push('Invalid edition.');

  const javaHost = trimOrNull(input.javaHost);
  const bedrockHost = trimOrNull(input.bedrockHost);

  if (javaHost && !isValidHost(javaHost))
    errors.push('Java host is not a valid hostname or IP.');
  if (bedrockHost && !isValidHost(bedrockHost))
    errors.push('Bedrock host is not a valid hostname or IP.');

  const needsJava = edition === 'java' || edition === 'both';
  const needsBedrock = edition === 'bedrock' || edition === 'both';
  if (needsJava && !javaHost)
    errors.push('A Java server address is required for Java/both listings.');
  if (needsBedrock && !bedrockHost)
    errors.push(
      'A Bedrock server address is required for Bedrock/both listings.'
    );

  const javaPort = parsePort(input.javaPort);
  if (javaPort === undefined)
    errors.push('Java port must be a number between 1 and 65535.');
  const bedrockPort = parsePort(input.bedrockPort);
  if (bedrockPort === undefined)
    errors.push('Bedrock port must be a number between 1 and 65535.');

  const website = trimOrNull(input.website);
  if (website && (!isValidUrl(website) || website.length > LIMITS.url))
    errors.push('Website must be a valid http(s) URL.');

  // Rendered as a raw href, so it must be a real http(s) URL — anything else
  // (e.g. a javascript: URI) would be an XSS vector on the listing page.
  const discord = trimOrNull(input.discord);
  if (discord && (!isValidUrl(discord) || discord.length > LIMITS.url))
    errors.push('Discord link must be a valid http(s) URL.');

  const bannerUrl = trimOrNull(input.bannerUrl);
  if (bannerUrl && (!isValidUrl(bannerUrl) || bannerUrl.length > LIMITS.url))
    errors.push('Banner must be a valid http(s) image URL.');

  const rawTags = Array.isArray(input.tags) ? input.tags : [];
  const tags = rawTags.filter(isServerTag);
  if (tags.length > LIMITS.maxTags)
    errors.push(`You can select at most ${LIMITS.maxTags} tags.`);
  if (rawTags.some((t) => !isServerTag(t)))
    errors.push('One or more selected tags are invalid.');

  const votifierHost = trimOrNull(input.votifierHost);
  if (votifierHost && !isValidHost(votifierHost))
    errors.push('Votifier host is not a valid hostname or IP.');
  const votifierPort = parsePort(input.votifierPort);
  if (votifierPort === undefined)
    errors.push('Votifier port must be a number between 1 and 65535.');
  const votifierToken = trimOrNull(input.votifierToken);

  // Stored and rendered for every visitor, so shape/size-check it rather
  // than trusting whatever object the client sent.
  let rgbPresetData: rgbPreset | null = null;
  if (
    input.rgbPreset &&
    (typeof input.rgbPreset !== 'string' || input.rgbPreset.trim())
  ) {
    rgbPresetData = sanitizeRgbPreset(input.rgbPreset);
    if (!rgbPresetData) errors.push('Invalid RGBirdflop preset JSON.');
  }

  // Types don't survive the server$ boundary, so re-check at runtime. Ids
  // that aren't plain short strings are dropped rather than rejected, since
  // they can only come from a tampered request.
  const pluginsPublic = input.pluginsPublic !== false;
  const hiddenPlugins = [
    ...new Set(
      (Array.isArray(input.hiddenPlugins) ? input.hiddenPlugins : []).filter(
        (id): id is string =>
          typeof id === 'string' &&
          id.length > 0 &&
          id.length <= LIMITS.pluginId
      )
    ),
  ];
  if (hiddenPlugins.length > LIMITS.maxHiddenPlugins)
    errors.push(`You can hide at most ${LIMITS.maxHiddenPlugins} plugins.`);

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    data: {
      name,
      description,
      shortDescription,
      edition: edition as ServerEdition,
      minVersion,
      maxVersion,
      rgbPreset: rgbPresetData,
      javaHost: needsJava ? javaHost : null,
      javaPort: needsJava ? (javaPort ?? null) : null,
      bedrockHost: needsBedrock ? bedrockHost : null,
      bedrockPort: needsBedrock ? (bedrockPort ?? null) : null,
      website,
      discord,
      bannerUrl,
      tags: tags.slice(0, LIMITS.maxTags),
      votifierHost,
      votifierPort: votifierPort ?? null,
      votifierToken,
      pluginsPublic,
      hiddenPlugins,
    },
  };
}

// Minecraft username check: Java names are 3-16 [A-Za-z0-9_]. Listings can
// be Bedrock-only, so a single leading Floodgate/Geyser prefix ('.' by
// default, '*' on some setups) is allowed for Bedrock players voting through
// a Java proxy.
export function isValidMcUsername(username: string): boolean {
  return /^[.*]?[A-Za-z0-9_]{3,16}$/.test(username.trim());
}

export function formatVersionRange(
  minVersion?: string | null,
  maxVersion?: string | null,
  fallbackStatusVersion?: string | null
): string | null {
  const min = minVersion?.trim() || null;
  const max = maxVersion?.trim() || null;
  if (min && max) {
    return min === max ? min : `${min} - ${max}`;
  }
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return fallbackStatusVersion?.trim() || null;
}
