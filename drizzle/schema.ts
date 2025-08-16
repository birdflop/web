import { sqliteTable, integer, text, primaryKey, index } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/qwik/adapters"

// -------------------- User --------------------
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique(),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  privatePresets: text("privatePresets"), // store JSON as string
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// -------------------- Presets --------------------
export const presets = sqliteTable("presets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  author: text("author").notNull(),
  userId: text("userId"), // FK to User.id
  description: text("description"),
  preset: text("preset").notNull(), // JSON as string
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  pending: integer("pending", { mode: "boolean" }).default(sql`1`).notNull(),
});

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
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (account) => ([
  primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
]));

// -------------------- Session --------------------
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("session_userId_idx").on(table.userId),
]);

// -------------------- VerificationToken --------------------
export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ([
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ])
);

// -------------------- SavedPresets Join Table --------------------
export const savedPresetsJoin = sqliteTable("saved-presets", {
  userId: text("userId").notNull(),
  presetId: integer("presetId").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.presetId] }),
]);

// ---------- User Relations ----------
export const usersRelations = relations(users, ({ many }) => ({
  publishedPresets: many(presets),
  savedPresets: many(savedPresetsJoin),
}));

// ---------- Presets Relations ----------
export const presetsRelations = relations(presets, ({ one, many }) => ({
  user: one(users, {
    fields: [presets.userId],
    references: [users.id],
  }),
  savedBy: many(savedPresetsJoin),
}));

// ---------- SavedPresets Join Table Relations ----------
export const savedPresetsRelations = relations(savedPresetsJoin, ({ one }) => ({
  user: one(users, {
    fields: [savedPresetsJoin.userId],
    references: [users.id],
  }),
  preset: one(presets, {
    fields: [savedPresetsJoin.presetId],
    references: [presets.id],
  }),
}));