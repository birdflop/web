import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import ChevronUp from 'lucide-icons-qwik/icons/ChevronUp';
import { Notification, NotificationContext } from '~/util/Notification';
import { voteForServer } from '~/util/serverlist/actions';
import Turnstile from './Turnstile';

interface VoteSectionProps {
  serverId: number;
  sitekey: string;
  monthlyVotes: number;
}

export default component$<VoteSectionProps>(
  ({ serverId, sitekey, monthlyVotes }) => {
    const notifications = useContext(NotificationContext);
    const username = useSignal('');
    const token = useSignal('');
    const voting = useSignal(false);
    const votes = useSignal(monthlyVotes);
    const voted = useSignal(false);

    const vote = $(async () => {
      if (!username.value.trim()) {
        notifications.push(
          new Notification()
            .setTitle('Enter your username')
            .setDescription('We need your Minecraft username to vote.')
            .setBgColor('lum-grad-bg-red/50')
            .toJSON()
        );
        return;
      }
      if (sitekey && !token.value) {
        notifications.push(
          new Notification()
            .setTitle('Complete the CAPTCHA')
            .setDescription('Please complete the verification first.')
            .setBgColor('lum-grad-bg-red/50')
            .toJSON()
        );
        return;
      }

      voting.value = true;
      try {
        const result = await voteForServer(
          serverId,
          username.value,
          token.value
        );
        if (result.success) {
          voted.value = true;
          if (typeof result.monthlyVotes === 'number')
            votes.value = result.monthlyVotes;
          notifications.push(
            new Notification()
              .setTitle('Thanks for voting!')
              .setDescription(
                result.delivered
                  ? 'Your vote was counted and sent to the server for rewards.'
                  : 'Your vote was counted.'
              )
              .setBgColor('lum-grad-bg-green/50')
              .toJSON()
          );
        } else {
          notifications.push(
            new Notification()
              .setTitle('Could not vote')
              .setDescription(result.error ?? 'Please try again.')
              .setBgColor('lum-grad-bg-red/50')
              .setPersist(true)
              .toJSON()
          );
        }
      } finally {
        voting.value = false;
      }
    });

    return (
      <div class="lum-card gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold">Vote</h2>
          <span class="text-lum-text-secondary text-sm">
            <span class="text-lum-accent text-lg font-extrabold">
              {votes.value.toLocaleString()}
            </span>{' '}
            votes this month
          </span>
        </div>

        {voted.value ? (
          <p class="text-green-400">
            You've voted! Come back in 24 hours to vote again.
          </p>
        ) : (
          <>
            <label class="flex flex-col gap-1">
              <span class="text-sm font-semibold">Minecraft username</span>
              <input
                class="lum-input"
                value={username.value}
                onInput$={(e, el) => (username.value = el.value)}
                placeholder="Notch"
                maxLength={32}
              />
            </label>
            <Turnstile sitekey={sitekey} token={token} />
            <button
              class="lum-btn lum-bg-blue hover:lum-bg-blue/80 self-start"
              disabled={voting.value}
              onClick$={vote}
            >
              <ChevronUp size={18} /> {voting.value ? 'Voting...' : 'Vote now'}
            </button>
          </>
        )}
      </div>
    );
  }
);
