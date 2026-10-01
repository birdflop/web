import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import { Link, useNavigate } from '@qwik.dev/router';
import Flag from 'lucide-icons-qwik/icons/Flag';
import Pencil from 'lucide-icons-qwik/icons/Pencil';
import Trash2 from 'lucide-icons-qwik/icons/Trash2';
import X from 'lucide-icons-qwik/icons/X';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import { Label } from '@luminescent/ui-qwik';
import { Notification, NotificationContext } from '~/util/Notification';
import {
  deleteServer,
  reportServer,
  setServerVerified,
} from '~/util/serverlist/actions';

interface ServerControlsProps {
  serverId: number;
  slug: string;
  canManage: boolean;
  isAdmin?: boolean;
  verified?: boolean;
}

export default component$<ServerControlsProps>(
  ({ serverId, slug, canManage, isAdmin, verified }) => {
    const notifications = useContext(NotificationContext);
    const nav = useNavigate();
    const modalRef = useSignal<HTMLDialogElement>();
    const reason = useSignal('');
    const deleting = useSignal(false);
    const confirmingDelete = useSignal(false);
    const isVerified = useSignal(verified ?? false);

    const submitReport = $(async () => {
      if (!reason.value.trim()) return;
      const result = await reportServer(serverId, reason.value, '');
      modalRef.value?.close();
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

    const toggleVerified = $(async () => {
      const next = !isVerified.value;
      const res = await setServerVerified(serverId, next);
      if (res.success) {
        isVerified.value = next;
        notifications.push(
          new Notification()
            .setTitle(next ? 'Server Verified' : 'Server Unverified')
            .setDescription(
              next
                ? 'Server is now marked as Birdflop Verified.'
                : 'Birdflop Verified badge removed.'
            )
            .setBgColor('lum-grad-bg-green/50')
            .toJSON()
        );
      } else {
        notifications.push(
          new Notification()
            .setTitle('Error')
            .setDescription(
              res.error ?? 'Failed to update verification status.'
            )
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
                class="lum-btn lum-btn-p-1 lum-bg-lum-input-bg/40 text-xs sm:text-sm"
              >
                <Pencil size={14} />
                Edit
              </Link>
              {confirmingDelete.value ? (
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-lum-text-secondary text-sm">
                    Delete this listing?
                  </span>
                  <button
                    class="lum-btn lum-bg-red/40 hover:lum-bg-red/60 lum-btn-p-1 text-xs sm:text-sm"
                    disabled={deleting.value}
                    onClick$={confirmDelete}
                  >
                    <Trash2 size={14} />{' '}
                    {deleting.value ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button
                    class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 lum-btn-p-1 text-xs sm:text-sm"
                    onClick$={() => (confirmingDelete.value = false)}
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  class="lum-btn lum-bg-red/30 hover:lum-bg-red/50 lum-btn-p-1 text-xs sm:text-sm"
                  onClick$={() => (confirmingDelete.value = true)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </>
          )}
          {isAdmin && (
            <button
              class={{
                'lum-btn lum-btn-p-1 text-xs sm:text-sm': true,
                'lum-bg-sky-500/20 hover:lum-bg-sky-500/40 text-sky-400':
                  !isVerified.value,
                'lum-bg-gray-500/20 hover:lum-bg-gray-500/40 text-gray-400':
                  isVerified.value,
              }}
              onClick$={toggleVerified}
            >
              <CheckCircle size={14} />
              {isVerified.value ? 'Unverify (Birdflop)' : 'Verify (Birdflop)'}
            </button>
          )}
          {!canManage && (
            <button
              class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 lum-btn-p-1 text-lum-text-secondary text-xs sm:text-sm"
              onClick$={() => modalRef.value?.showModal()}
            >
              <Flag size={14} />
              Report
            </button>
          )}
        </div>

        <dialog
          ref={modalRef}
          class="text-lum-text lum-card lum-grad-bg-lum-card-bg/50 open:animate-in open:fade-in open:slide-in-from-top-8 animate-out fade-out slide-in-from-top-8 m-auto hidden w-full max-w-md overflow-visible drop-shadow-2xl backdrop-blur-xl duration-300 backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col open:duration-300"
          onClick$={(e) => {
            if (e.target === modalRef.value) {
              modalRef.value?.close();
            }
          }}
        >
          <div class="flex flex-col gap-4">
            <div class="border-lum-border/10 flex items-center justify-between border-b pb-3">
              <h3 class="flex items-center gap-2 text-xl font-bold">
                <Flag size={20} />
                Report Server
              </h3>
              <button
                class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 rounded-lum-1 p-1"
                onClick$={() => modalRef.value?.close()}
              >
                <X size={18} />
              </button>
            </div>

            <Label
              for="report-reason"
              label="Reason for reporting this server"
              class="text-lum-text-secondary text-sm"
            >
              <input
                id="report-reason"
                class="lum-input w-full"
                placeholder="Reason (e.g. offensive content, fake listing)"
                maxLength={100}
                value={reason.value}
                onInput$={(e, el) => (reason.value = el.value)}
              />
            </Label>

            <div class="border-lum-border/10 flex justify-end gap-2 border-t pt-3">
              <button
                class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg/40 lum-btn-p-1 text-xs sm:text-sm"
                onClick$={() => modalRef.value?.close()}
              >
                Cancel
              </button>
              <button
                class="lum-btn lum-bg-red/40 hover:lum-bg-red/60 lum-btn-p-1 text-xs sm:text-sm"
                onClick$={submitReport}
              >
                <Flag size={14} />
                Submit report
              </button>
            </div>
          </div>
        </dialog>
      </div>
    );
  }
);
