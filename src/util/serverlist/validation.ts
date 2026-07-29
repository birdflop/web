// Input validation + normalization for server listings.

import { loadPreset, type rgbPreset } from '../rgb/presets';
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

function parsePort(
  value: string | number | undefined
): number | null | undefined {
  if (value === undefined || value === '' || value === null) return null;
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  if (!Number.isInteger(n)) return undefined; // signal "invalid"
  if (n < 1 || n > 65535) return undefined;
  return n;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Hostnames: allow domain names and IPv4 (no scheme, no path).
const HOST_RE = /^[a-zA-Z0-9.-]+$/;

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

  if (javaHost && !HOST_RE.test(javaHost))
    errors.push('Java host is not a valid hostname or IP.');
  if (bedrockHost && !HOST_RE.test(bedrockHost))
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

  const discord = trimOrNull(input.discord);
  if (discord && discord.length > LIMITS.url)
    errors.push('Discord link is too long.');

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
  if (votifierHost && !HOST_RE.test(votifierHost))
    errors.push('Votifier host is not a valid hostname or IP.');
  const votifierPort = parsePort(input.votifierPort);
  if (votifierPort === undefined)
    errors.push('Votifier port must be a number between 1 and 65535.');
  const votifierToken = trimOrNull(input.votifierToken);

  let rgbPresetData: rgbPreset | null = null;
  if (input.rgbPreset) {
    if (typeof input.rgbPreset === 'object') {
      rgbPresetData = input.rgbPreset;
    } else if (typeof input.rgbPreset === 'string' && input.rgbPreset.trim()) {
      try {
        rgbPresetData = loadPreset(input.rgbPreset);
      } catch {
        errors.push('Invalid RGBirdflop preset JSON.');
      }
    }
  }

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
    },
  };
}

// Basic Minecraft username sanity check (Java: 3-16 [A-Za-z0-9_];
// Bedrock gamertags can contain spaces, so we're lenient but bounded).
export function isValidMcUsername(username: string): boolean {
  const trimmed = username.trim();
  return trimmed.length >= 1 && trimmed.length <= 32;
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
