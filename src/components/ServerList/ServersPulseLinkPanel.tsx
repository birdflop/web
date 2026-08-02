// Owner-facing panel (edit page) for linking a listing to its ServersPulse
// Discover entry via reverse verification: link -> place token on the
// Discover listing -> verify. See src/util/serverlist/serverspulse.ts.
import { $, component$, useContext, useStore } from '@qwik.dev/core';
import Activity from 'lucide-icons-qwik/icons/Activity';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import Link2 from 'lucide-icons-qwik/icons/Link2';
import Unlink from 'lucide-icons-qwik/icons/Unlink';
import ExternalLink from 'lucide-icons-qwik/icons/ExternalLink';
import Output from '~/components/Elements/Output';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  linkServersPulse,
  unlinkServersPulse,
  verifyServersPulseLink,
} from '~/util/serverlist/actions';
import { SERVERSPULSE_SITE_URL } from '~/util/serverlist/constants';

export interface ServersPulseLinkState {
  slug: string;
  token: string | null;
  verified: boolean;
}

export default component$<{
  serverId: number;
  initial: ServersPulseLinkState | null;
}>(({ serverId, initial }) => {
  const notifications = useContext(NotificationContext);
  const state = useStore({
    input: initial?.slug ?? '',
    linkedSlug: initial?.slug ?? null,
    token: initial?.token ?? null,
    verified: initial?.verified ?? false,
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
    state.linkedSlug = result.slug;
    state.token = result.token;
    state.verified = false;
  });

  const handleVerify = $(async () => {
    state.busy = true;
    const result = await verifyServersPulseLink(serverId);
    state.busy = false;
    if (!result.success) return fail('Not verified yet', result.error);
    state.verified = true;
    state.token = null;
    notifications.push(
      new Notification()
        .setTitle('ServersPulse linked!')
        .setDescription(
          'Live stats now show on your listing. You can remove the token from your Discover listing.'
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
    state.linkedSlug = null;
    state.token = null;
    state.verified = false;
    state.input = '';
  });

  const pending = !!state.linkedSlug && !state.verified && !!state.token;

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
        public Discover directory, link it here to show live players, uptime,
        and activity history on your listing. Stats are display-only and never
        affect your ranking.
      </p>

      {!state.linkedSlug || (!state.verified && !state.token) ? (
        <div class="flex flex-wrap items-center gap-3">
          <input
            id="serverspulse-slug"
            class="lum-input min-w-60 flex-1 text-sm"
            placeholder="your-discover-slug or listing URL"
            value={state.input}
            onInput$={(_, el) => (state.input = el.value)}
          />
          <button
            class="lum-btn lum-bg-lum-input-bg/60 hover:lum-bg-lum-input-bg lum-btn-p-1 flex items-center gap-2 text-sm disabled:opacity-50"
            disabled={state.busy || !state.input.trim()}
            onClick$={handleLink}
          >
            <Link2 size={14} />
            {state.busy ? 'Checking…' : 'Link listing'}
          </button>
        </div>
      ) : pending ? (
        <div class="flex flex-col gap-2">
          <p class="text-sm">
            Almost there — prove you own{' '}
            <span class="font-mono font-semibold">{state.linkedSlug}</span> by
            adding this token to your Discover listing's{' '}
            <b>description or website URL</b> on ServersPulse, then click
            verify. You can remove it again once verified.
          </p>
          <Output
            compact
            value={state.token!}
            class="lum-bg-lum-input-bg/40 hover:lum-bg-lum-input-bg/60 rounded-lum-1 cursor-pointer p-1.5 px-2 font-mono text-xs"
          />
          <div class="flex flex-wrap items-center gap-3">
            <button
              class="lum-btn lum-bg-lum-input-bg/60 hover:lum-bg-lum-input-bg lum-btn-p-1 flex items-center gap-2 text-sm disabled:opacity-50"
              disabled={state.busy}
              onClick$={handleVerify}
            >
              <CheckCircle size={14} />
              {state.busy ? 'Checking…' : 'Verify link'}
            </button>
            <a
              href={SERVERSPULSE_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm"
            >
              <ExternalLink size={14} /> Open ServersPulse
            </a>
            <button
              class="lum-btn lum-bg-transparent lum-btn-p-1 flex items-center gap-1.5 text-sm text-red-400 disabled:opacity-50"
              disabled={state.busy}
              onClick$={handleUnlink}
            >
              <Unlink size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex items-center gap-1.5 text-sm">
            <CheckCircle size={15} class="text-green-400" />
            Linked to{' '}
            <span class="font-mono font-semibold">{state.linkedSlug}</span> —
            live stats show on your listing.
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
    </div>
  );
});
