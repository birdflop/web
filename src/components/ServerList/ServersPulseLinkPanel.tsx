// Owner-facing panel (edit page) for connecting a listing to its
// ServersPulse Discover entry. Ownership is proven on the ServersPulse side:
// the owner generates a single-use link code in their dashboard (Discovery →
// Connected sites) and pastes it here; our backend redeems it. See
// src/util/serverlist/serverspulse.ts. The secret linkToken never reaches
// this component — only display fields do.
import { $, component$, useContext, useStore } from '@qwik.dev/core';
import Activity from 'lucide-icons-qwik/icons/Activity';
import AlertTriangle from 'lucide-icons-qwik/icons/AlertTriangle';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import EyeOff from 'lucide-icons-qwik/icons/EyeOff';
import Link2 from 'lucide-icons-qwik/icons/Link2';
import Unlink from 'lucide-icons-qwik/icons/Unlink';
import ExternalLink from 'lucide-icons-qwik/icons/ExternalLink';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  linkServersPulse,
  unlinkServersPulse,
} from '~/util/serverlist/actions';
import { SERVERSPULSE_SITE_URL } from '~/util/serverlist/constants';

export interface ServersPulseLinkState {
  slug: string | null;
  status: 'active' | 'unpublished' | 'revoked';
}

export default component$<{
  serverId: number;
  initial: ServersPulseLinkState | null;
}>(({ serverId, initial }) => {
  const notifications = useContext(NotificationContext);
  const state = useStore({
    input: '',
    linked: initial,
    busy: false,
  });

  const fail = $((title: string, error: string) => {
    notifications.push(
      new Notification()
        .setTitle(title)
        .setDescription(error)
        .setBgColor('lum-grad-bg-red/50')
        .setPersist(true)
        .toJSON()
    );
  });

  const handleLink = $(async () => {
    state.busy = true;
    const result = await linkServersPulse(serverId, state.input);
    state.busy = false;
    if (!result.success) return fail('Linking failed', result.error);
    state.linked = { slug: result.slug, status: result.status };
    state.input = '';
    notifications.push(
      new Notification()
        .setTitle('ServersPulse connected!')
        .setDescription(
          result.status === 'active'
            ? 'Live stats now show on your listing, refreshed every minute.'
            : 'Connected — but your listing is not published to Discover right now, so stats stay hidden until you publish it on ServersPulse.'
        )
        .setBgColor('lum-grad-bg-green/50')
        .toJSON()
    );
  });

  const handleUnlink = $(async () => {
    state.busy = true;
    const result = await unlinkServersPulse(serverId);
    state.busy = false;
    if (!result.success) return fail('Unlink failed', result.error);
    state.linked = null;
    state.input = '';
  });

  const showForm = !state.linked || state.linked.status === 'revoked';

  return (
    <div class="lum-card lum-bg-lum-input-bg/30 mt-6 flex flex-col gap-3">
      <h2 class="flex items-center gap-2 text-base font-semibold">
        <Activity size={18} /> ServersPulse Live Stats
      </h2>
      <p class="text-lum-text-secondary text-sm">
        <a
          href={SERVERSPULSE_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="text-lum-accent underline"
        >
          ServersPulse
        </a>{' '}
        is a server monitoring service. If your server is published to its
        public Discover directory, connect it here to show live players, uptime,
        and activity history on your listing. Stats are display-only and never
        affect your ranking.
      </p>

      {state.linked?.status === 'revoked' && (
        <p class="flex items-start gap-2 text-sm text-red-400">
          <AlertTriangle size={16} class="mt-0.5 shrink-0" />
          This connection was disconnected from your ServersPulse dashboard.
          Generate a new link code to reconnect, or remove the link below.
        </p>
      )}

      {state.linked?.status === 'unpublished' && (
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex items-center gap-1.5 text-sm text-yellow-400">
            <EyeOff size={15} />
            Connected, but your listing is not published to Discover — stats are
            hidden until you republish it on ServersPulse. The link resumes
            automatically.
          </span>
          <button
            class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm text-red-400 disabled:opacity-50"
            disabled={state.busy}
            onClick$={handleUnlink}
          >
            <Unlink size={14} /> Unlink
          </button>
        </div>
      )}

      {state.linked?.status === 'active' && (
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex items-center gap-1.5 text-sm">
            <CheckCircle size={15} class="text-green-400" />
            Connected to{' '}
            <span class="font-mono font-semibold">
              {state.linked.slug ?? 'your listing'}
            </span>{' '}
            — live stats show on your listing.
          </span>
          <button
            class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm text-red-400 disabled:opacity-50"
            disabled={state.busy}
            onClick$={handleUnlink}
          >
            <Unlink size={14} /> Unlink
          </button>
        </div>
      )}

      {showForm && (
        <div class="flex flex-col gap-2">
          <p class="text-sm">
            In your ServersPulse dashboard, open your server's <b>Discovery</b>{' '}
            tab → <b>Connected sites</b> → <b>Generate link code</b>, then paste
            the code here. Codes are single-use and expire after 15 minutes.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <input
              id="serverspulse-code"
              class="lum-input min-w-60 flex-1 font-mono text-sm"
              placeholder="splink_…"
              value={state.input}
              onInput$={(_, el) => (state.input = el.value)}
            />
            <button
              class="lum-btn lum-bg-lum-input-bg/60 hover:lum-bg-lum-input-bg lum-btn-p-1 flex items-center gap-2 text-sm disabled:opacity-50"
              disabled={state.busy || !state.input.trim()}
              onClick$={handleLink}
            >
              <Link2 size={14} />
              {state.busy ? 'Connecting…' : 'Connect'}
            </button>
            <a
              href={SERVERSPULSE_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm"
            >
              <ExternalLink size={14} /> Open ServersPulse
            </a>
            {state.linked?.status === 'revoked' && (
              <button
                class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm text-red-400 disabled:opacity-50"
                disabled={state.busy}
                onClick$={handleUnlink}
              >
                <Unlink size={14} /> Remove link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
