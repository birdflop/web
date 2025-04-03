import { QwikAuth$ } from '@auth/qwik';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { getPrismaClient } from '~/components/util/prisma';
import Discord from '@auth/qwik/providers/discord';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (event) => {
    const databaseUrl = event?.platform?.env?.DATABASE_URL;
    const secret = event?.platform?.env?.AUTH_SECRET;
    const prisma = getPrismaClient(databaseUrl);

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
      adapter: prisma ? PrismaAdapter(prisma) : undefined,
      // trustHost: true, // uncomment this if previewing on localhost
      secret: secret ?? Math.random().toString(36).slice(2),
    };
  },
);