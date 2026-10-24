import { describe, expect, it } from 'vite-plus/test';
import {
  findFilenameVersion,
  normalizePluginName,
  parsePluginFilenames,
} from '../bulk';

describe('parsePluginFilenames', () => {
  it('parses a pasted list, removes duplicates, and extracts versions', () => {
    expect(
      parsePluginFilenames(
        'LuckPerms-Bukkit-5.4.153.jar\r\nEssentialsX-2.21.0.jar, LuckPerms-Bukkit-5.4.153.jar; WorldEdit.jar'
      )
    ).toEqual([
      {
        filename: 'LuckPerms-Bukkit-5.4.153.jar',
        query: 'LuckPerms',
        version: '5.4.153',
      },
      {
        filename: 'EssentialsX-2.21.0.jar',
        query: 'EssentialsX',
        version: '2.21.0',
      },
      { filename: 'WorldEdit.jar', query: 'WorldEdit', version: undefined },
    ]);
  });

  it('accepts quoted paths and space separated jar filenames', () => {
    expect(
      parsePluginFilenames('"C:\\plugins\\Example-V1.2.jar" Other_3.0.JAR').map(
        ({ query, version }) => ({ query, version })
      )
    ).toEqual([
      { query: 'Example', version: '1.2' },
      { query: 'Other', version: '3.0' },
    ]);
  });

  it('ignores blank entries and preserves names with numbers', () => {
    expect(parsePluginFilenames('\n , ; \t')).toEqual([]);
    expect(parsePluginFilenames('Plugin2.jar')[0].query).toBe('Plugin2');
  });

  it('compares names without casing or punctuation differences', () => {
    expect(normalizePluginName('World-Edit')).toBe(
      normalizePluginName('WorldEdit')
    );
  });
});

describe('findFilenameVersion', () => {
  const releases = (...names: string[]) =>
    names.map((name, id) => ({ id, name, releaseDate: new Date(0) }));

  it('detects attached versions and matches decorated release titles', () => {
    const entry = parsePluginFilenames('WorldEdit7.3.10.jar')[0];
    expect(entry.query).toBe('WorldEdit');
    expect(
      findFilenameVersion(
        entry.version,
        releases('WorldEdit v7.3.10 (Bukkit)', '7.3.9')
      )?.id
    ).toBe(0);
    expect(
      findFilenameVersion('2.21.0-paper', releases('EssentialsX 2.21.0'))?.id
    ).toBe(0);
  });

  it('preserves prerelease and build qualifiers', () => {
    expect(
      findFilenameVersion(
        '1.2.3-beta.1',
        releases('Release 1.2.3', 'Release 1.2.3-beta.1')
      )?.id
    ).toBe(1);
    expect(
      findFilenameVersion('1.2.3+42', releases('1.2.3+41', 'Release 1.2.3+42'))
        ?.id
    ).toBe(1);
  });

  it('requires a unique match and never confuses version numbers', () => {
    expect(findFilenameVersion('1.21', releases('12.1'))).toBeUndefined();
    expect(
      findFilenameVersion(
        '1.2.3',
        releases('Release 1.2.3 Paper', 'Release 1.2.3 Bukkit')
      )
    ).toBeUndefined();
    expect(
      findFilenameVersion('1.2.3', releases('Release 1.2.30'))
    ).toBeUndefined();
    expect(findFilenameVersion(undefined, releases('1.2.3'))).toBeUndefined();
  });
});
