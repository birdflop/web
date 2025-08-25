import { QwikAuth$ } from '@auth/qwik';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Discord from '@auth/qwik/providers/discord';
import { getDB } from '~/util/db';

import {
  users,
  accounts,
  sessions,
  verificationTokens,
  savedPresets,
  presets,
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// This is a temporary secret, in case the env variable is not set
const tempsecret = Math.random().toString(36).slice(2);

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (event) => {
    let secret = event?.platform?.env?.AUTH_SECRET || process.env.AUTH_SECRET;
    if (!secret) {
      console.error('AUTH_SECRET is not set, using a temporary secret');
      secret = tempsecret;
    }
    const db = getDB();

    return {
      providers: [
        Discord({
          profile(profile) {
            if (profile.avatar === null) {
              const defaultAvatarNumber =
                profile.discriminator === '0'
                  ? Number(BigInt(profile.id) >> BigInt(22)) % 6
                  : parseInt(profile.discriminator) % 5;
              profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
            } else {
              const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
              profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
            }
            return {
              id: profile.id,
              name: profile.global_name ?? profile.username,
              username: profile.username,
              email: profile.email,
              image: profile.image_url,
            };
          },
        }),
      ],
      adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
        authenticatorsTable: undefined,
      }),
      trustHost: process.env.NODE_ENV === 'development',
      secret,
      callbacks: {
        async signIn({ user, account, profile }) {
          if (account?.provider === 'discord' && profile) {
            try {
              if (profile.avatar && user.id) {
                const avatarHash = (profile as any).avatar;
                const format = avatarHash?.startsWith('a_') ? 'gif' : 'png';
                const newImageUrl = `https://cdn.discordapp.com/avatars/${(profile as any).id}/${avatarHash}.${format}`;
                user.image = newImageUrl;

                await db.update(users)
                  .set({ image: newImageUrl })
                  .where(eq(users.id, user.id));
              }
            } catch (error) {
              console.error('Failed to refresh Discord profile picture on sign in:', error);
            }
          }
          return true;
        },
        async session({ session }) {
          const { id, name, email, image, privatePresets } = session.user;

          // fetch saved presets for this user
          const savedFromDB = await db.select({
            preset: presets,
          })
            .from(savedPresets)
            .where(eq(savedPresets.userId, session.user.id))
            .innerJoin(presets, eq(presets.id, savedPresets.presetId))
            .all();
          const saved = savedFromDB.map(({ preset }) => preset);

          return {
            expires: session.expires,
            user: {
              id, name, email, image, privatePresets, savedPresets: saved,
            },
          };
        },
      },
    };
  },
);