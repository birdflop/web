import type { User } from '@auth/qwik';
import { QwikAuth$ } from '@auth/qwik';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { getPrismaClient } from '~/util/prisma';
import Discord from '@auth/qwik/providers/discord';
import { publishedPreset, rgbPreset } from '~/util/rgb/presets';
import { Session } from '@prisma/client';

// This is a temporary secret, in case the env variable is not set
const tempsecret = Math.random().toString(36).slice(2);

export interface BirdflopSession {
  user: BirdflopUser;
  expires: Date & string;
}

export interface BirdflopUser extends User {
  privatePresets?: rgbPreset[];
  savedPresets?: publishedPreset[];
}

const cachedSessionAndUser: {
  [key: string]: {
    user: User;
    session: Session;
  }
} = {};

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (event) => {
    const databaseUrl = event?.platform?.env?.DATABASE_URL || process.env.DATABASE_URL;
    let secret = event?.platform?.env?.AUTH_SECRET || process.env.AUTH_SECRET;
    if (!secret) {
      console.error('AUTH_SECRET is not set, using a temporary secret');
      secret = tempsecret;
    }
    const prisma = getPrismaClient(databaseUrl);

    const customPrismaAdapter = prisma ? {
      ...PrismaAdapter(prisma),
      async getSessionAndUser(sessionToken: string) {
        if (cachedSessionAndUser[sessionToken]) return cachedSessionAndUser[sessionToken] as any;
        const userAndSession = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: {
            include: {
              savedPresets: true,
            },
          } },
        });
        if (!userAndSession) return null;
        const { user, ...session } = userAndSession;
        cachedSessionAndUser[sessionToken] = { user, session };
        return cachedSessionAndUser[sessionToken];
      },
    } : undefined;

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
      adapter: customPrismaAdapter,
      trustHost: true, // uncomment this if previewing on localhost
      secret,
      callbacks: {
        session({ session }) {
          const { id, name, email, image, privatePresets, savedPresets } = session.user as BirdflopUser;

          return {
            expires: session.expires,
            user: {
              id, name, email, image, privatePresets, savedPresets,
            },
          };
        },
      },
    };
  },
);