export function parsePluginFilenames(value: string) {
  return [
    ...new Set(
      value
        .replace(/(\.jar)["']?\s+(?=\S)/gi, '$1\n')
        .split(/[\r\n,;\t]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    ),
  ].map((filename) => {
    const basename = filename
      .replace(/^['"]|['"]$/g, '')
      .split(/[\\/]/)
      .pop()!
      .replace(/\.jar$/i, '');
    const match = basename.match(
      /^(.*?)(?:[-_ ]v?|v(?=\d)|(?=\d+\.\d))(\d.*)$/i
    );
    return {
      filename,
      query: (match ? match[1] : basename).replace(
        /[-_ ](?:bukkit|spigot|paper)$/i,
        ''
      ),
      version: match?.[2],
    };
  });
}

function versionTokens(value: string): string[] {
  return (
    value
      .toLowerCase()
      .match(
        /(?<![\d.])\d+(?:\.\d+)+(?:[-+](?!bukkit\b|spigot\b|paper\b)[a-z0-9]+(?:[.-][a-z0-9]+)*)?(?![\d.])/g
      ) ?? []
  );
}

export function findFilenameVersion(
  filenameVersion: string | undefined,
  versions: PluginVersion[] = []
) {
  if (!filenameVersion) return undefined;
  const normalize = (value: string) =>
    value
      .trim()
      .replace(/^v(?=\d)/i, '')
      .toLowerCase();
  const exact = versions.filter(
    (version) => normalize(version.name) === normalize(filenameVersion)
  );
  if (exact.length) return exact.length === 1 ? exact[0] : undefined;
  const tokens = versionTokens(filenameVersion);
  if (tokens.length !== 1) return undefined;
  const matches = versions.filter((version) =>
    versionTokens(version.name).includes(tokens[0])
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function normalizePluginName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
import type { PluginVersion } from './ServerPlugin';
