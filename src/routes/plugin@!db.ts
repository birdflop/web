import { type RequestHandler } from '@qwik.dev/router';
import { drizzle } from 'drizzle-orm/d1';
import { type AppDatabase, initializeDbIfNeeded } from '~/util/db';

export const onRequest: RequestHandler = async ({ platform }) => {
  const env = platform.env as Env;
  await initializeDbIfNeeded(initD1(env));
};

function initD1(env: Env): () => Promise<AppDatabase> {
  // oxlint-disable-next-line typescript/require-await
  return async () => drizzle(env.DB);
}
