import path from 'node:path'
import type { PrismaConfig } from 'prisma'
import { PrismaD1 } from '@prisma/adapter-d1'

// import your .env file
import 'dotenv/config'

export default {
  // @ts-ignore
  experimental: {
    adapter: true,
    studio: true,
  },
  schema: path.join('prisma', 'schema.prisma'),

  async adapter() {
    if (!process.env.CLOUDFLARE_D1_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_DATABASE_ID) {
      throw new Error('Missing required environment variables CLOUDFLARE_D1_TOKEN, CLOUDFLARE_ACCOUNT_ID, or CLOUDFLARE_DATABASE_ID');
    }
    return new PrismaD1({
      CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID,
    })
  }
} satisfies PrismaConfig