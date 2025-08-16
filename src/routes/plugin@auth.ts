import type { User } from '@auth/qwik';
import { QwikAuth$ } from '@auth/qwik';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Discord from '@auth/qwik/providers/discord';
import { publishedPreset, rgbPreset } from '~/util/rgb/presets';
import { getDB } from '~/util/db';

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

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (event) => {
    let secret = event?.platform?.env?.AUTH_SECRET || process.env.AUTH_SECRET;
    if (!secret) {
      console.error('AUTH_SECRET is not set, using a temporary secret');
      secret = tempsecret;
    }
    const db = getDB();

    const customPrismaAdapter = db ? {
      ...DrizzleAdapter(db),
      /*
      async getSessionAndUser(sessionToken: string) {
        const userAndSession = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: {
            include: { savedPresets: true },
          } },
        });
        if (!userAndSession) return null;
        const { user, ...session } = userAndSession;
        return { user, session } as any;
      },
      */
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
        signIn({ account, profile }) {
          if (account?.provider === 'discord' && profile) {
            try {
              /*
              if (profile.avatar) {
                const avatarHash = (profile as any).avatar;
                const format = avatarHash?.startsWith('a_') ? 'gif' : 'png';
                const newImageUrl = `https://cdn.discordapp.com/avatars/${(profile as any).id}/${avatarHash}.${format}`;
                user.image = newImageUrl;

                if (prisma) {
                  await prisma.user.update({
                    where: { id: user.id },
                    data: {
                      image: newImageUrl,
                      updatedAt: new Date(),
                    },
                  });
                }
              }
              */
            } catch (error) {
              console.error('Failed to refresh Discord profile picture on sign in:', error);
            }
          }
          return true;
        },
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