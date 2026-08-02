// Shared constants for the server list / voting feature.
// Kept dependency-free so it can be imported from both the Drizzle schema
// (drizzle/schema.ts) and from route/component code.

// Curated gamemode tags. Admins can extend this list over time.
// Order here is the order shown in filter/select UIs.
export const SERVER_TAGS = [
  'Survival',
  'Skyblock',
  'Creative',
  'PvP',
  'PvE',
  'Factions',
  'Prison',
  'Minigames',
  'Bedwars',
  'Skywars',
  'Anarchy',
  'Towny',
  'Economy',
  'Roleplay',
  'Hardcore',
  'Vanilla',
  'Modded',
  'Adventure',
  'Parkour',
  'Earth',
  'KitPvP',
  'Lifesteal',
] as const;

export type ServerTag = (typeof SERVER_TAGS)[number];

export function isServerTag(value: unknown): value is ServerTag {
  return (
    typeof value === 'string' &&
    (SERVER_TAGS as readonly string[]).includes(value)
  );
}

// Server editions.
export const SERVER_EDITIONS = ['java', 'bedrock', 'both'] as const;
export type ServerEdition = (typeof SERVER_EDITIONS)[number];

export function isServerEdition(value: unknown): value is ServerEdition {
  return (
    typeof value === 'string' &&
    (SERVER_EDITIONS as readonly string[]).includes(value)
  );
}

// Sort options for the public listing.
// "votes" = current-month votes (the default ranking).
export const SERVER_SORTS = [
  'votes',
  'players',
  'newest',
  'allTimeVotes',
] as const;
export type ServerSort = (typeof SERVER_SORTS)[number];

export function isServerSort(value: unknown): value is ServerSort {
  return (
    typeof value === 'string' &&
    (SERVER_SORTS as readonly string[]).includes(value)
  );
}

// Default port numbers used when an owner omits a port.
export const DEFAULT_JAVA_PORT = 25565;
export const DEFAULT_BEDROCK_PORT = 19132;
export const DEFAULT_VOTIFIER_PORT = 8192;

// How long (ms) a username+server (and ip+server) vote stays on cooldown.
export const VOTE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// How long (ms) before the same user/IP can report the same server again.
export const REPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Minimum gap (ms) between owner-initiated Votifier test votes.
export const TEST_VOTE_COOLDOWN_MS = 10 * 1000;

// Field length limits, enforced on submit/edit.
export const LIMITS = {
  name: 50,
  description: 2000,
  shortDescription: 150,
  maxTags: 5,
  url: 300,
  version: 8,
  // Listings per account, to bound spam from a single login.
  maxServersPerOwner: 10,
} as const;
