import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Create a function to get Prisma with the right environment
export function getPrismaClient(env?: any) {
  const databaseUrl = env?.DATABASE_URL || process.env.DATABASE_URL;

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends(withAccelerate());
}

// Singleton instance for non-Worker environments
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
