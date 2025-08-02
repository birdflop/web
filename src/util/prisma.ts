import { PrismaClient } from '@prisma/client/edge';

let prismaGlobal: PrismaClient | undefined;
export function getPrismaClient() {
  if (!prismaGlobal) prismaGlobal = new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
  return prismaGlobal;
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !prismaGlobal) getPrismaClient();

export const prisma = prismaGlobal;