import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import { Link, useNavigate } from '@qwik.dev/router';
import Flag from 'lucide-icons-qwik/icons/Flag';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import Trash2 from 'lucide-icons-qwik/icons/Trash2';
import { Notification, NotificationContext } from '~/util/Notification';
import { deleteServer, reportServer } from '~/util/serverlist/actions';

interface ServerControlsProps {
  serverId: number;
  slug: string;
  canManage: boolean;
}

export default component$<ServerControlsProps>(
  ({ serverId, slug, canManage }) => {
    const notifications = useContext(NotificationContext);
    const nav = useNavigate();
    const reporting = useSignal(false);
    const reason = useSignal('');
    const deleting = useSignal(false);
    const confirmingDelete = useSignal(false);

    const submitReport = $(async () => {
      if (!reason.value.trim()) return;
      const result = await reportServer(serverId, reason.value, '');
      reporting.value = false;
      reason.value = '';
      notifications.push(
        new Notification()
          .setTitle(result.success ? 'Report submitted' : 'Could not report')
          .setDescription(
            result.success
              ? 'Thanks, our moderators will review it.'
              : (result.error ?? 'Try again later.')
          )
          .setBgColor(
            result.success ? 'lum-grad-bg-green/50' : 'lum-grad-bg-red/50'
          )
          .toJSON()
      );
    });

    const confirmDelete = $(async () => {
      deleting.value = true;
      const result = await deleteServer(serverId);
      if (result.success) {
        await nav('/serverlist');
      } else {
        deleting.value = false;
        notifications.push(
          new Notification()
            .setTitle('Could not delete')
            .setDescription(result.error ?? '')
            .setBgColor('lum-grad-bg-red/50')
            .toJSON()
        );
      }
    });

    return (
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-2">
          {canManage && (
            <>
              <Link
                href={`/serverlist/${slug}/edit`}
                class="lum-btn lum-bg-lum-input-bg/40 rounded-lum-1"
              >
                <Pencil size={16} /> Edit
              </Link>
              {confirmingDelete.value ? (
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-lum-text-secondary text-sm">
                    Delete this listing?
                  </span>
                  <button
                    class="lum-btn lum-bg-red/40 hover:lum-bg-red/60 rounded-lum-1"
                    disabled={deleting.value}
                    onClick$={confirmDelete}
                  >
                    <Trash2 size={16} />{' '}
                    {deleting.value ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button
                    class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 rounded-lum-1"
                    onClick$={() => (confirmingDelete.value = false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  class="lum-btn lum-bg-red/30 hover:lum-bg-red/50 rounded-lum-1"
                  onClick$={() => (confirmingDelete.value = true)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </>
          )}
          <button
            class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 rounded-lum-1 text-lum-text-secondary"
            onClick$={() => (reporting.value = !reporting.value)}
          >
            <Flag size={16} /> Report
          </button>
        </div>

        {reporting.value && (
          <div class="lum-card gap-2">
            <span class="text-sm font-semibold">Report this server</span>
            <input
              class="lum-input"
              placeholder="Reason (e.g. offensive content, fake listing)"
              maxLength={100}
              value={reason.value}
              onInput$={(e, el) => (reason.value = el.value)}
            />
            <button
              class="lum-btn lum-bg-red/30 hover:lum-bg-red/50 self-start"
              onClick$={submitReport}
            >
              Submit report
            </button>
          </div>
        )}
      </div>
    );
  }
);
