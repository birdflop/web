import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "@auth/qwik/adapters"
import { sql } from "drizzle-orm/sql/sql";
import { rgbPreset } from "~/util/rgb/presets";

// -------------------- User --------------------
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  privatePresets: text("privatePresets", { mode: 'json' }).$type<rgbPreset[]>(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type User = typeof users.$inferSelect;

// -------------------- Account --------------------
export const accounts = sqliteTable("account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

// -------------------- Session --------------------
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
},
(verificationToken) => ({
  compositePk: primaryKey({
    columns: [verificationToken.identifier, verificationToken.token],
  }),
}));




// -------------------- Presets --------------------
export const presets = sqliteTable("presets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  author: text("author").notNull(),
  userId: text("userId")
    .references(() => users.id),
  description: text("description"),
  preset: text("preset", { mode: 'json' }).$type<rgbPreset>().notNull().unique(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  pending: integer("pending", { mode: "boolean" }).default(true).notNull(),
});

export type PublicPreset = typeof presets.$inferSelect;
export interface PublicPresetWithUser extends PublicPreset {
  user: User;
  saveCount: number;
}
export interface PresetPartial extends Omit<PublicPresetWithUser,
  'id' | 'author' | 'user' | 'userId' | 'description' | 'createdAt' | 'pending' | 'saveCount'> {
  id?: number;
  author?: string;
  user?: User | null;
  userId?: string | null;
  description?: string | null;
  createdAt?: Date;
  pending?: boolean;
  saveCount?: number;
}
export type PublicPresetInsert = typeof presets.$inferInsert;
export type PublicPresetSubmission = Omit<PublicPresetInsert, 'userId' | 'author'>;

// -------------------- Saved Presets (Join Table) --------------------
export const savedPresets = sqliteTable("savedPresets", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  presetId: integer("presetId")
    .notNull()
    .references(() => presets.id, { onDelete: "cascade" }),
  savedAt: integer("savedAt", { mode: "timestamp_ms" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.presetId] }),
}));
