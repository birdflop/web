import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export function createPrismaClient(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to connect to the database');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends(withAccelerate());
}

let prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!prismaGlobal) {
    prismaGlobal = createPrismaClient(process.env.DATABASE_URL!);
  }
}

export const prisma = prismaGlobal;