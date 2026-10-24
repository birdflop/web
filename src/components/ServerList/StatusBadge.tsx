import { component$ } from '@qwik.dev/core';
import Circle from 'lucide-icons-qwik/icons/Circle';
import Users from 'lucide-icons-qwik/icons/Users';
import type { ServerStatus } from '~/util/serverlist/status';

interface StatusBadgeProps {
  status: ServerStatus | null;
  showPlayers?: boolean;
}

export default component$<StatusBadgeProps>(
  ({ status, showPlayers = true }) => {
    const online = !!status?.online;
    return (
      <div class="flex items-center gap-2 text-sm">
        <span
          class={{
            'flex items-center gap-1.5 font-semibold': true,
            'text-green-400': online,
            'text-lum-text-secondary': !online,
          }}
        >
          <Circle
            size={10}
            class={
              online
                ? 'fill-green-400 text-green-400'
                : 'fill-lum-text-secondary text-lum-text-secondary'
            }
          />
          {online ? 'Online' : 'Offline'}
        </span>
        {online && showPlayers && (
          <span class="text-lum-text-secondary flex items-center gap-1.5">
            <Users size={14} />
            {status.players.online.toLocaleString()}
            <span class="opacity-50">
              / {status.players.max.toLocaleString()}
            </span>
          </span>
        )}
      </div>
    );
  }
);
