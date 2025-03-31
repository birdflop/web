import { server$ } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma
  || await server$(function () {
    return new PrismaClient({
      datasources: {
        db: {
          url: this.env.get('DATABASE_URL'),
        },
      },
    }).$extends(withAccelerate());
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
