import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

type D1Params = {
  CLOUDFLARE_D1_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
}

function createPrismaClient(D1Params: D1Params) {
  return new PrismaClient({
    adapter: new PrismaD1(D1Params),
    log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
}

let prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
export function getPrismaClient(D1Params: Partial<D1Params>) {
  const CLOUDFLARE_D1_TOKEN = D1Params.CLOUDFLARE_D1_TOKEN || process.env.CLOUDFLARE_D1_TOKEN;
  const CLOUDFLARE_ACCOUNT_ID = D1Params.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_DATABASE_ID = D1Params.CLOUDFLARE_DATABASE_ID || process.env.CLOUDFLARE_DATABASE_ID;
  if (!CLOUDFLARE_D1_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID) return;

  if (!prismaGlobal) prismaGlobal = createPrismaClient({
    CLOUDFLARE_D1_TOKEN,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
  });
  return prismaGlobal;
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !prismaGlobal) getPrismaClient({
  CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
});

export const prisma = prismaGlobal;