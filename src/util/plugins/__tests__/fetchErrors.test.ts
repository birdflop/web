import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { ModrinthPlugin } from '../ModrinthPlugin';
import { SpigotPlugin } from '../SpigotPlugin';

afterEach(() => vi.unstubAllGlobals());

const stubFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  );

describe('plugin fetch error handling', () => {
  it('rejects Spigot versions on a non-OK response instead of mapping the error body', async () => {
    stubFetch(429, { error: 'rate limited' });
    await expect(new SpigotPlugin({ id: 1 }).fetchVersions()).rejects.toThrow(
      /HTTP 429/
    );
  });

  it('rejects Spigot data on 404', async () => {
    stubFetch(404, { error: 'not found' });
    await expect(new SpigotPlugin({ id: 1 }).fetchData()).rejects.toThrow(
      /HTTP 404/
    );
  });

  it('rejects Modrinth versions on a non-OK response', async () => {
    stubFetch(404, { error: 'not_found' });
    await expect(
      new ModrinthPlugin({ id: 'abc' }).fetchVersions()
    ).rejects.toThrow(/HTTP 404/);
  });
});
