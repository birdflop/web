import { component$, useSignal, $ } from '@qwik.dev/core';
import { routeLoader$, useNavigate } from '@qwik.dev/router';
import { Label, SelectMenu } from '@luminescent/ui-qwik';

import Server from 'lucide-icons-qwik/icons/Server';
import Globe from 'lucide-icons-qwik/icons/Globe';
import Search from 'lucide-icons-qwik/icons/Search';
import HardDrive from 'lucide-icons-qwik/icons/HardDrive';
import Box from 'lucide-icons-qwik/icons/Box';

import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';
import { fetchStatus, type ServerStatus } from '~/util/serverlist/status';
import MotdText from '~/components/Elements/MotdText';
import { MotdPreviewCard } from '~/components/Elements/MotdPreviewCard';

export const useStatusChecker = routeLoader$(async ({ url }) => {
  const sp = url.searchParams;
  const host = sp.get('host')?.trim() || '';
  const editionParam = sp.get('edition');
  const edition: 'java' | 'bedrock' =
    editionParam === 'bedrock' ? 'bedrock' : 'java';
  const portStr = sp.get('port')?.trim();
  const port = portStr ? parseInt(portStr, 10) : null;

  if (!host) {
    return {
      searched: false,
      host: '',
      edition: 'java' as const,
      port: null,
      status: null as ServerStatus | null,
    };
  }

  const status = await fetchStatus(edition, host, port);

  return {
    searched: true,
    host,
    edition,
    port,
    status,
  };
});

export default component$(() => {
  const t = inlineTranslate();
  const data = useStatusChecker().value;
  const nav = useNavigate();

  const hostSignal = useSignal(data.host || '');
  const editionSignal = useSignal<'java' | 'bedrock'>(data.edition || 'java');
  const portSignal = useSignal(data.port ? String(data.port) : '');

  const handleSearch = $(async () => {
    if (!hostSignal.value.trim()) return;
    const url = new URL(window.location.href);
    url.searchParams.set('host', hostSignal.value.trim());
    url.searchParams.set('edition', editionSignal.value);
    if (portSignal.value.trim()) {
      url.searchParams.set('port', portSignal.value.trim());
    } else {
      url.searchParams.delete('port');
    }
    await nav(url.pathname + url.search);
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Server size={32} />
        {t('status.title@@Server Status Checker')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-6 border-b pb-4">
        {t(
          'status.description@@Ping any Java or Bedrock Minecraft server for live player counts, version info, latency, and exact 1.16+ RGB hex MOTDs.'
        )}
      </p>

      {/* Inputs */}
      <form
        preventdefault:submit
        onSubmit$={handleSearch}
        class="my-4 flex flex-col gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="flex min-w-[240px] flex-1 flex-col gap-1">
            <Label for="host" label={t('status.host.label@@Server Address')}>
              <Globe size={16} q:slot="before-label" />
              <input
                id="host"
                class="lum-input w-full font-mono"
                placeholder={
                  editionSignal.value === 'java'
                    ? 'play.lemoncloud.net'
                    : 'geo.hivebedrock.network'
                }
                value={hostSignal.value}
                onInput$={(e, el) => {
                  hostSignal.value = el.value;
                }}
              />
            </Label>
            <p class="text-lum-text-secondary text-sm">
              {t(
                'status.host.description@@The domain or IP address of the Minecraft server.'
              )}
            </p>
          </div>

          <div class="flex max-w-[200px] min-w-[140px] flex-col gap-1">
            <Label for="edition" label={t('status.edition.label@@Edition')}>
              <Box size={16} q:slot="before-label" />
              <SelectMenu
                id="edition"
                class="w-full"
                onChange$={(e, el) => {
                  editionSignal.value = el.value as 'java' | 'bedrock';
                }}
                values={[
                  { name: 'Java Edition', value: 'java' },
                  { name: 'Bedrock Edition', value: 'bedrock' },
                ]}
                value={editionSignal.value}
              />
            </Label>
            <p class="text-lum-text-secondary text-sm">
              {t('status.edition.description@@Java or Bedrock')}
            </p>
          </div>

          <div class="flex max-w-[180px] min-w-[120px] flex-col gap-1">
            <Label for="port" label={t('status.port.label@@Port')}>
              <HardDrive size={16} q:slot="before-label" />
              <input
                id="port"
                class="lum-input w-full font-mono"
                placeholder={editionSignal.value === 'java' ? '25565' : '19132'}
                value={portSignal.value}
                onInput$={(e, el) => {
                  portSignal.value = el.value;
                }}
              />
            </Label>
            <p class="text-lum-text-secondary text-sm">
              {t('status.port.description@@Optional port')}
            </p>
          </div>
          <button
            type="submit"
            class="lum-btn lum-bg-blue hover:lum-bg-blue flex items-center gap-2 px-6 py-2"
          >
            <Search size={18} />
            Check Status
          </button>
        </div>
      </form>

      {/* Results Section */}
      {data.searched && (
        <div class="my-6 flex flex-col gap-6">
          {data.status?.online ? (
            <div class="border-lum-border/10 flex flex-col gap-4 border-t pt-6">
              {/* MOTD Preview Card */}
              <MotdPreviewCard
                icon={data.status.icon || undefined}
                label={data.host}
                version={data.status.version}
                playersOnline={data.status.players.online}
                playersMax={data.status.players.max}
                class="rounded-lum-1 overflow-hidden"
              >
                {data.status.motd && (
                  <MotdText
                    text={data.status.motd.html || data.status.motd.raw}
                  />
                )}
              </MotdPreviewCard>
            </div>
          ) : (
            <div class="border-lum-border/10 border-t pt-6 text-center">
              <p class="text-lg font-bold text-red-400">
                Could not connect to server
              </p>
              <p class="text-lum-text-secondary mt-1 text-sm">
                Unable to establish ping to{' '}
                <span class="font-mono">{data.host}</span>. Please check the
                address and port.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Server Status Checker - Birdflop',
  description:
    'Ping any Java or Bedrock Minecraft server to view live online status, player counts, latency, and exact 1.16+ RGB hex MOTDs. Developed by Birdflop. ' +
    defaultDescription,
});
