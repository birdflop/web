import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { searchAllPluginSources } from '../ServerPlugin';
import { ModrinthPlugin } from '../ModrinthPlugin';
import { SpigotPlugin } from '../SpigotPlugin';

afterEach(() => vi.restoreAllMocks());

describe('searchAllPluginSources', () => {
  it('searches both sources and preserves their identities', async () => {
    const modrinth = vi
      .spyOn(ModrinthPlugin, 'search')
      .mockResolvedValue([new ModrinthPlugin({ id: '123', name: 'Example' })]);
    const spigot = vi
      .spyOn(SpigotPlugin, 'search')
      .mockResolvedValue([new SpigotPlugin({ id: 123, name: 'Example' })]);
    const result = await searchAllPluginSources('Example', ['paper']);
    expect(modrinth).toHaveBeenCalledWith('Example', ['paper']);
    expect(spigot).toHaveBeenCalledWith('Example');
    expect(result.plugins.map((plugin) => plugin.type)).toEqual([
      'modrinth',
      'spigot',
    ]);
    expect(result.failedSources).toEqual([]);
  });

  it('keeps successful matches when another source fails', async () => {
    vi.spyOn(ModrinthPlugin, 'search').mockRejectedValue(
      new Error('Unavailable')
    );
    vi.spyOn(SpigotPlugin, 'search').mockResolvedValue([
      new SpigotPlugin({ id: 123 }),
    ]);
    const result = await searchAllPluginSources('Example');
    expect(result.plugins).toHaveLength(1);
    expect(result.failedSources).toEqual(['modrinth']);
  });
});
