import { describe, expect, it } from 'vite-plus/test';
import { validateServerInput } from '../validation';
import { toPublicServer } from '../queries';
import type { Server } from '~/util/db';

const base = {
  name: 'Test Server',
  description: 'A cool test server',
  javaHost: 'play.example.com',
};

describe('plugin visibility validation', () => {
  it('defaults to public with nothing hidden', () => {
    const result = validateServerInput(base);
    expect(result.data?.pluginsPublic).toBe(true);
    expect(result.data?.hiddenPlugins).toEqual([]);
  });

  it('keeps valid ids, dedupes, and drops non-string or oversized ids', () => {
    const result = validateServerInput({
      ...base,
      pluginsPublic: true,
      hiddenPlugins: ['a', 'a', 'b', 42, '', 'x'.repeat(101)] as string[],
    });
    expect(result.data?.pluginsPublic).toBe(true);
    expect(result.data?.hiddenPlugins).toEqual(['a', 'b']);
  });

  it('only a literal false makes plugins private', () => {
    expect(
      validateServerInput({ ...base, pluginsPublic: false }).data?.pluginsPublic
    ).toBe(false);
    const result = validateServerInput({
      ...base,
      pluginsPublic: 'false' as unknown as boolean,
    });
    expect(result.data?.pluginsPublic).toBe(true);
  });
});

describe('toPublicServer plugins', () => {
  const server = {
    id: 1,
    votifierHost: 'secret',
    votifierPort: 8192,
    votifierToken: 'secret',
    plugins: {
      coreprotect: { id: 'coreprotect', type: 'modrinth' },
      '28140': { id: 28140, type: 'spigot' },
      secret: { id: 'secret', type: 'modrinth' },
    },
    hiddenPlugins: ['secret'],
    pluginsPublic: true,
  } as unknown as Server;

  it('strips hidden plugins and the hidden list', () => {
    const pub = toPublicServer(server);
    expect(Object.keys(pub.plugins ?? {})).toEqual(['28140', 'coreprotect']);
    expect('hiddenPlugins' in pub).toBe(false);
    expect('votifierToken' in pub).toBe(false);
  });

  it('matches hidden ids against numeric plugin ids', () => {
    const pub = toPublicServer({ ...server, hiddenPlugins: ['28140'] });
    expect(Object.keys(pub.plugins ?? {})).toEqual(['coreprotect', 'secret']);
  });

  it('sends no plugins when the listing keeps them private', () => {
    expect(toPublicServer({ ...server, pluginsPublic: false }).plugins).toBe(
      null
    );
  });
});
