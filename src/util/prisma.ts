import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

function createPrismaClient(url: string) {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : ['error'],
  }).$extends(withAccelerate());
}

let prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
export function getPrismaClient(databaseUrl?: string) {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) return;
  if (!prismaGlobal) prismaGlobal = createPrismaClient(url);
  return prismaGlobal;
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !prismaGlobal) getPrismaClient(process.env.DATABASE_URL);

export const prisma = prismaGlobal;