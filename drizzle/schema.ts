import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  index,
} from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from '@auth/qwik/adapters';
import { sql } from 'drizzle-orm/sql/sql';
import { rgbPreset } from '../src/util/rgb/presets';
import { Settings } from '../src/routes/layout';
import type { PluginType } from '../src/util/plugins/ServerPlugin';
import type { PluginsStoreType } from '../src/util/plugins/types';
import type {
  ServerEdition,
  ServerTag,
} from '../src/util/serverlist/constants';

// -------------------- User --------------------
export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  privatePresets: text('privatePresets', { mode: 'json' }).$type<rgbPreset[]>(),
  settings: text('settings', { mode: 'json' }).$type<Settings>(),
  plugins: text('plugins', { mode: 'json' }).$type<PluginsStoreType>(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type User = typeof users.$inferSelect;

// -------------------- Account --------------------
export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// -------------------- Session --------------------
export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// -------------------- Presets --------------------
export const presets = sqliteTable('presets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  author: text('author').notNull(),
  userId: text('userId').references(() => users.id),
  description: text('description'),
  preset: text('preset', { mode: 'json' })
    .$type<rgbPreset>()
    .notNull()
    .unique(),
  colorVector: text('colorVector', { mode: 'json' }).$type<number[]>(),
  saves: integer('saves').default(0).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  pending: integer('pending', { mode: 'boolean' }).default(true).notNull(),
});

export type PublicPreset = typeof presets.$inferSelect;
export interface PublicPresetWithUser extends PublicPreset {
  user: User | null;
}
export interface PresetPartial extends Omit<
  PublicPresetWithUser,
  | 'id'
  | 'author'
  | 'user'
  | 'userId'
  | 'description'
  | 'createdAt'
  | 'pending'
  | 'saves'
  | 'colorVector'
> {
  id?: number;
  author?: string;
  user?: User | null;
  userId?: string | null;
  description?: string | null;
  createdAt?: Date;
  pending?: boolean;
  saves?: number;
  colorVector?: number[] | null;
}
export type PublicPresetInsert = typeof presets.$inferInsert;
export type PublicPresetSubmission = Omit<
  PublicPresetInsert,
  'userId' | 'author'
>;

// -------------------- Saved Presets (Join Table) --------------------
export const savedPresets = sqliteTable(
  'savedPresets',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    presetId: integer('presetId')
      .notNull()
      .references(() => presets.id, { onDelete: 'cascade' }),

    savedAt: integer('savedAt', { mode: 'timestamp_ms' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.presetId] })]
);

// -------------------- Server List --------------------
export const servers = sqliteTable(
  'servers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Owner who submitted the listing. Kept on delete so listings survive
    // account removal, just unowned (and therefore admin-only to manage).
    ownerId: text('ownerId').references(() => users.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    shortDescription: text('shortDescription'),
    edition: text('edition').$type<ServerEdition>().notNull().default('java'),
    minVersion: text('minVersion'),
    maxVersion: text('maxVersion'),
    rgbPreset: text('rgbPreset', { mode: 'json' }).$type<rgbPreset>(),
    // Connection details. Java/Bedrock hosts are independent so a "both"
    // listing can point each edition at a different address.
    javaHost: text('javaHost'),
    javaPort: integer('javaPort'),
    bedrockHost: text('bedrockHost'),
    bedrockPort: integer('bedrockPort'),
    website: text('website'),
    discord: text('discord'),
    bannerUrl: text('bannerUrl'),
    tags: text('tags', { mode: 'json' })
      .$type<ServerTag[]>()
      .notNull()
      .default(sql`'[]'`),
    // NuVotifier (Votifier v2) token-protocol delivery details.
    votifierHost: text('votifierHost'),
    votifierPort: integer('votifierPort'),
    votifierToken: text('votifierToken'),
    // Sponsored / featured placement (admin-granted in v1).
    featured: integer('featured', { mode: 'boolean' }).default(false).notNull(),
    featuredUntil: integer('featuredUntil', { mode: 'timestamp_ms' }),
    // Verified Birdflop host placement (admin-granted).
    verified: integer('verified', { mode: 'boolean' }).default(false).notNull(),
    plugins: text('plugins', { mode: 'json' }).$type<{
      [id: string]: PluginType;
    }>(),
    // Auto-detected "hosted on Birdflop" flag. Set server-side by resolving
    // the listing's address against panel node IPs (see
    // src/util/serverlist/birdflop.ts) — never user-editable. Surfaces the
    // same badge as the admin-granted `verified` flag.
    birdflopHosted: integer('birdflopHosted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    birdflopCheckedAt: integer('birdflopCheckedAt', { mode: 'timestamp_ms' }),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    index('servers_owner_idx').on(t.ownerId),
    index('servers_featured_idx').on(t.featured),
    index('servers_verified_idx').on(t.verified),
  ]
);

export type Server = typeof servers.$inferSelect;
export type ServerInsert = typeof servers.$inferInsert;
export interface ServerWithVotes extends Server {
  monthlyVotes: number;
  totalVotes: number;
  owner?: User | null;
}

// -------------------- Server Votes --------------------
export const serverVotes = sqliteTable(
  'serverVotes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    serverId: integer('serverId')
      .notNull()
      .references(() => servers.id, { onDelete: 'cascade' }),
    // Minecraft username supplied at vote time (voting requires no login).
    username: text('username').notNull(),
    ip: text('ip'),
    votifierDelivered: integer('votifierDelivered', { mode: 'boolean' })
      .default(false)
      .notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    index('serverVotes_server_created_idx').on(t.serverId, t.createdAt),
    index('serverVotes_username_idx').on(t.username),
  ]
);

export type ServerVote = typeof serverVotes.$inferSelect;

// -------------------- Server Reports --------------------
export const serverReports = sqliteTable(
  'serverReports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    serverId: integer('serverId')
      .notNull()
      .references(() => servers.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    details: text('details'),
    reporterId: text('reporterId').references(() => users.id, {
      onDelete: 'set null',
    }),
    ip: text('ip'),
    resolved: integer('resolved', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    index('serverReports_server_idx').on(t.serverId),
    index('serverReports_resolved_idx').on(t.resolved),
  ]
);

export type ServerReport = typeof serverReports.$inferSelect;

// -------------------- Birdflop node IP cache --------------------
// Single-row cache (id = 1) of the panel's public node/allocation IPs so
// Birdflop-hosted detection doesn't hit the panel API on every check.
// Server-side only; never returned by any loader or endpoint.
export const birdflopIpCache = sqliteTable('birdflopIpCache', {
  id: integer('id').primaryKey(),
  ips: text('ips', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  fetchedAt: integer('fetchedAt', { mode: 'timestamp_ms' }).notNull(),
});
