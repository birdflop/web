import { $, component$, useContext, useSignal } from '@qwik.dev/core';
import { Label } from '@luminescent/ui-qwik';
import ChevronUp from 'lucide-icons-qwik/icons/ChevronUp';
import User from 'lucide-icons-qwik/icons/User';
import CheckCircle2 from 'lucide-icons-qwik/icons/CheckCircle2';
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
          <h2 class="flex items-center gap-2 text-lg font-bold">
            <ChevronUp size={20} /> Vote
          </h2>
          <span class="text-lum-text-secondary text-sm">
            <span class="text-lum-accent text-lg font-extrabold">
              {votes.value.toLocaleString()}
            </span>{' '}
            votes this month
          </span>
        </div>

        {voted.value ? (
          <p class="flex items-center gap-1.5 text-green-400">
            <CheckCircle2 size={18} /> You've voted! Come back in 24 hours to
            vote again.
          </p>
        ) : (
          <>
            <Label for="mc-username" label="Minecraft username">
              <User size={16} q:slot="before-label" />
              <input
                id="mc-username"
                class="lum-input"
                value={username.value}
                onInput$={(e, el) => (username.value = el.value)}
                placeholder="Notch"
                maxLength={32}
              />
            </Label>
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
