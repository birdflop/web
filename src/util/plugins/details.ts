import { ModrinthPlugin } from './ModrinthPlugin';
import type { PluginType } from './ServerPlugin';
import { SpigotPlugin } from './SpigotPlugin';
import type { ModrinthProjectData, PluginsType } from './types';

// Only what the server page shows: title, icon and link. Stored
// plugins keep just id/type/currentVersion, so these are looked up.
export type PluginDetails = Pick<
  PluginType,
  'id' | 'type' | 'name' | 'url' | 'iconUrl'
>;

type FetchedDetails = Omit<PluginDetails, 'id' | 'type'>;

const DETAILS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const detailsCache = new Map<
  string,
  { timestamp: number; details: FetchedDetails }
>();

const cacheKey = (type: string, id: string | number) => `${type}:${id}`;

const pluginPageUrl = (plugin: PluginType) => {
  if (plugin.type === 'modrinth')
    return `https://modrinth.com/plugin/${plugin.id}`;
  if (plugin.type === 'spigot')
    return `https://www.spigotmc.org/resources/${plugin.id}`;
  return plugin.url;
};

function pickDetails(plugin: PluginType): FetchedDetails {
  return {
    name: plugin.name,
    url: pluginPageUrl(plugin),
    iconUrl: plugin.iconUrl,
  };
}

// Modrinth has a bulk endpoint, so every Modrinth plugin costs one request.
async function fetchModrinth(ids: string[]) {
  const found = new Map<string, FetchedDetails>();
  if (!ids.length) return found;
  const res = await fetch(
    `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(ids))}`
  );
  if (!res.ok) return found;
  const projects: (ModrinthProjectData & { slug?: string })[] =
    await res.json();
  for (const project of projects) {
    const details = pickDetails(
      new ModrinthPlugin({ id: project.id }).fromData(project)
    );
    // Plugins added by pasting a link are stored under the slug, not the id.
    found.set(project.id, details);
    if (project.slug) found.set(project.slug, details);
  }
  return found;
}

// Spiget has no bulk endpoint; one request per resource.
async function fetchSpigot(ids: (string | number)[]) {
  const found = new Map<string, FetchedDetails>();
  await Promise.allSettled(
    ids.map(async (id) => {
      const plugin = await new SpigotPlugin({ id }).fetchData();
      // Spiget answers a missing resource with an error body, not a throw.
      if (plugin.name) found.set(String(id), pickDetails(plugin));
    })
  );
  return found;
}

/**
 * Fills stored plugins with display data (name, icon, link).
 * Lookups that fail fall back to the stored fields, so one unreachable
 * platform never breaks the page.
 */
export async function getPluginDetails(
  plugins: PluginsType | null | undefined
): Promise<PluginDetails[]> {
  const list = Object.values(plugins ?? {});
  const now = Date.now();

  const missing = {
    modrinth: [] as string[],
    spigot: [] as (string | number)[],
  };
  for (const plugin of list) {
    if (plugin.type !== 'modrinth' && plugin.type !== 'spigot') continue;
    const cached = detailsCache.get(cacheKey(plugin.type, plugin.id));
    if (cached && now - cached.timestamp < DETAILS_CACHE_TTL_MS) continue;
    if (plugin.type === 'modrinth') missing.modrinth.push(String(plugin.id));
    else missing.spigot.push(plugin.id);
  }

  const [modrinth, spigot] = await Promise.all([
    fetchModrinth(missing.modrinth).catch(
      () => new Map<string, FetchedDetails>()
    ),
    fetchSpigot(missing.spigot),
  ]);
  for (const [id, details] of modrinth)
    detailsCache.set(cacheKey('modrinth', id), { timestamp: now, details });
  for (const [id, details] of spigot)
    detailsCache.set(cacheKey('spigot', id), { timestamp: now, details });

  return list.map((plugin) => {
    const fetched = plugin.type
      ? detailsCache.get(cacheKey(plugin.type, plugin.id))?.details
      : undefined;
    return {
      ...pickDetails(plugin),
      ...fetched,
      name: fetched?.name ?? plugin.name ?? String(plugin.id),
      id: plugin.id,
      type: plugin.type,
    };
  });
}
