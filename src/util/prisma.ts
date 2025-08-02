import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

let prismaGlobal: PrismaClient | undefined;
export function getPrismaClient(D1HTTPParams: {
  CLOUDFLARE_D1_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
}) {
  const adapter = new PrismaD1(D1HTTPParams);
  if (!prismaGlobal) prismaGlobal = new PrismaClient({ adapter });
  return prismaGlobal;
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !prismaGlobal) getPrismaClient();

export const prisma = prismaGlobal;