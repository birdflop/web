// Public "live performance" panel for listings with a verified ServersPulse
// link. Renders the cached Discover payload: TPS-derived health, players,
// uptime, and activity history. Attributed and display-only — this data is
// self-reported by the owner's monitoring plugin and never affects ranking.
//
// Chart rules (deliberate, do not "fix"):
// - null activity points mean "not reporting", NOT zero players — they render
//   as gaps in the line (spanGaps: false), never as points at 0.
// - hourlyAverageUtc is indexed by UTC hour; it is converted to the viewer's
//   local timezone in the browser (the server can't know it), so both charts
//   are built client-side in useVisibleTask$.
import { component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import Activity from 'lucide-icons-qwik/icons/Activity';
import AlertTriangle from 'lucide-icons-qwik/icons/AlertTriangle';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import HeartPulse from 'lucide-icons-qwik/icons/HeartPulse';
import WifiOff from 'lucide-icons-qwik/icons/WifiOff';
import Users from 'lucide-icons-qwik/icons/Users';
import Gauge from 'lucide-icons-qwik/icons/Gauge';
import ServerIcon from 'lucide-icons-qwik/icons/Server';
import {
  MIN_PROFILE_COVERAGE_DAYS,
  SERVERSPULSE_SITE_URL,
} from '~/util/serverlist/constants';
import type { PublicServersPulseStats } from '~/util/serverlist/serverspulse';

const STATUS_META = {
  healthy: {
    label: 'Healthy',
    detail: 'Reporting, TPS ≥ 18',
    class: 'lum-bg-green-500/20 text-green-400',
  },
  degraded: {
    label: 'Degraded',
    detail: 'Reporting, TPS 15–18',
    class: 'lum-bg-yellow-500/20 text-yellow-400',
  },
  critical: {
    label: 'Critical',
    detail: 'Reporting, TPS < 15',
    class: 'lum-bg-red-500/20 text-red-400',
  },
  offline: {
    label: 'Not reporting',
    detail: 'No telemetry in the last 2 minutes',
    class: 'lum-bg-lum-input-bg/50 text-lum-text-secondary',
  },
} as const;

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 90 * 1000) return 'just now';
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default component$<{ stats: PublicServersPulseStats }>(({ stats }) => {
  const sparkRef = useSignal<HTMLCanvasElement>();
  const hourlyRef = useSignal<HTMLCanvasElement>();
  const busiest = useSignal('');

  const status = STATUS_META[stats.status] ?? STATUS_META.offline;
  const pot = stats.activity?.playersOverTime ?? null;
  const hasSparkline = !!pot && pot.avg.some((v) => v !== null);
  const hourly = stats.activity?.hourlyAverageUtc ?? null;
  // An hour-of-day profile from a couple days of telemetry is noise, not a
  // pattern — suppress it below a week of coverage.
  const hasHourly =
    !!hourly &&
    hourly.some((v) => v !== null) &&
    (stats.activity?.coverageDays ?? 0) >= MIN_PROFILE_COVERAGE_DAYS;
  const asOfMs = stats.lastCheckedAt
    ? Date.parse(stats.lastCheckedAt)
    : stats.fetchedAt;

  // Charts are client-only: they need the viewer's timezone and theme colors.
  // oxlint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!hasSparkline && !hasHourly) return;
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    // Resolve theme CSS variables to concrete rgb() so alpha washes can be
    // derived regardless of how the token is authored (hex/oklch/...).
    const resolveColor = (value: string): string => {
      const el = document.createElement('div');
      el.style.color = value;
      el.style.display = 'none';
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color;
      el.remove();
      return rgb || value;
    };
    const cssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const withAlpha = (rgb: string, alpha: number): string => {
      const nums = rgb.match(/[\d.]+/g);
      if (!nums || nums.length < 3) return rgb;
      return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
    };
    const accent = resolveColor(cssVar('--color-lum-accent') || '#8b5cf6');
    const text = resolveColor(cssVar('--color-lum-text-secondary') || '#999');
    const grid = withAlpha(text, 0.15);
    const tickColor = withAlpha(text, 0.8);

    const charts: { destroy(): void }[] = [];

    if (hasSparkline && sparkRef.value && pot) {
      const fromMs = Date.parse(pot.from);
      const labels = pot.avg.map((_, i) =>
        new Date(fromMs + i * pot.stepMinutes * 60 * 1000).toLocaleTimeString(
          [],
          { hour: 'numeric' }
        )
      );
      const peak = pot.peak;
      charts.push(
        new Chart(sparkRef.value, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: pot.avg,
                borderColor: accent,
                backgroundColor: withAlpha(accent, 0.1),
                fill: true,
                borderWidth: 2,
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: accent,
                // Gaps where the server wasn't reporting — null is not zero.
                spanGaps: false,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    ctx.parsed.y === null
                      ? 'No data'
                      : ` Avg: ${ctx.parsed.y} players`,
                  afterLabel: (ctx) =>
                    peak[ctx.dataIndex] !== null &&
                    peak[ctx.dataIndex] !== undefined
                      ? ` Peak: ${peak[ctx.dataIndex]}`
                      : '',
                },
              },
            },
            scales: {
              x: {
                ticks: { color: tickColor, maxTicksLimit: 6, maxRotation: 0 },
                grid: { display: false },
                border: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { color: tickColor, precision: 0, maxTicksLimit: 4 },
                grid: { color: grid },
                border: { display: false },
              },
            },
          },
        })
      );
    }

    if (hasHourly && hourlyRef.value && hourly) {
      // Convert the UTC-indexed profile to the viewer's local clock. Labels
      // come from real Date formatting so half-hour offsets stay correct.
      const entries = Array.from({ length: 24 }, (_, utcHour) => {
        const d = new Date();
        d.setUTCHours(utcHour, 0, 0, 0);
        return {
          label: d.toLocaleTimeString([], { hour: 'numeric' }),
          sortKey: d.getHours() * 60 + d.getMinutes(),
          value: hourly[utcHour] ?? null,
        };
      }).sort((a, b) => a.sortKey - b.sortKey);

      charts.push(
        new Chart(hourlyRef.value, {
          type: 'bar',
          data: {
            labels: entries.map((e) => e.label),
            datasets: [
              {
                data: entries.map((e) => e.value),
                backgroundColor: withAlpha(accent, 0.75),
                hoverBackgroundColor: accent,
                borderRadius: { topLeft: 4, topRight: 4 },
                borderSkipped: 'bottom',
                maxBarThickness: 24,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    ctx.parsed.y === null
                      ? 'No data'
                      : ` ${Number(ctx.parsed.y).toFixed(1)} players on average`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: tickColor, maxTicksLimit: 8, maxRotation: 0 },
                grid: { display: false },
                border: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { color: tickColor, precision: 0, maxTicksLimit: 4 },
                grid: { color: grid },
                border: { display: false },
              },
            },
          },
        })
      );

      if (
        stats.activity?.peakHourUtc !== null &&
        stats.activity?.peakHourUtc !== undefined
      ) {
        const d = new Date();
        d.setUTCHours(stats.activity.peakHourUtc, 0, 0, 0);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        busiest.value = `Usually busiest around ${d.toLocaleTimeString([], {
          hour: 'numeric',
        })} (${tz})`;
      }
    }

    return () => charts.forEach((c) => c.destroy());
  });

  return (
    <div class="lum-card gap-3">
      <div class="flex items-center justify-between gap-2">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Activity size={20} /> Live Performance
        </h2>
        <a
          href={SERVERSPULSE_SITE_URL}
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="text-lum-text-secondary hover:text-lum-accent text-xs"
        >
          via ServersPulse ↗
        </a>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span
          class={`rounded-lum-1 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold ${status.class}`}
          title={status.detail}
        >
          {stats.status === 'healthy' ? (
            <HeartPulse size={13} />
          ) : stats.status === 'offline' ? (
            <WifiOff size={13} />
          ) : (
            <AlertTriangle size={13} />
          )}
          {status.label}
        </span>
        {stats.ownerVerified && (
          <span
            class="lum-bg-lum-input-bg/50 rounded-lum-1 text-lum-text-secondary flex items-center gap-1.5 px-2 py-1 text-xs"
            title="This server has sent telemetry under its owner's ServersPulse account. Not a quality or safety rating."
          >
            <CheckCircle size={13} /> Telemetry confirmed
          </span>
        )}
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
            <Users size={13} /> Players online
          </span>
          <span class="text-base font-semibold">
            {stats.onlinePlayers !== null
              ? `${stats.onlinePlayers.toLocaleString()}${
                  stats.maxPlayers !== null
                    ? ` / ${stats.maxPlayers.toLocaleString()}`
                    : ''
                }`
              : 'Unknown'}
          </span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
            <Gauge size={13} /> 7-day uptime
          </span>
          <span class="text-base font-semibold">
            {stats.uptime7dPct !== null ? (
              `${stats.uptime7dPct.toFixed(2)}%`
            ) : (
              <span class="text-lum-text-secondary text-sm">
                Not enough data
              </span>
            )}
          </span>
        </div>
        {(stats.platform || stats.mcVersion) && (
          <div class="flex flex-col gap-0.5">
            <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
              <ServerIcon size={13} /> Software
            </span>
            <span class="text-base font-semibold">
              {[stats.platform, stats.mcVersion].filter(Boolean).join(' ')}
            </span>
          </div>
        )}
      </div>

      {hasSparkline && (
        <div class="flex flex-col gap-1">
          <h3 class="text-lum-text-secondary text-xs font-semibold">
            Players — last 24 hours (gaps = no telemetry)
          </h3>
          <div class="h-32">
            <canvas
              ref={sparkRef}
              aria-label="Average players online over the last 24 hours"
            />
          </div>
        </div>
      )}

      {hasHourly && (
        <div class="flex flex-col gap-1">
          <h3 class="text-lum-text-secondary text-xs font-semibold">
            Typical activity by hour — your timezone
          </h3>
          <div class="h-36">
            <canvas
              ref={hourlyRef}
              aria-label="Average players online by hour of day"
            />
          </div>
          {busiest.value && (
            <p class="text-lum-text-secondary text-xs">{busiest.value}</p>
          )}
        </div>
      )}

      <p class="text-lum-text-secondary text-xs">
        Self-reported by the server's ServersPulse monitoring plugin · updated{' '}
        {timeAgo(asOfMs)} · does not affect ranking
      </p>
    </div>
  );
});
