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
  const rootRef = useSignal<HTMLDivElement>();
  const sparkRef = useSignal<HTMLCanvasElement>();
  const hourlyRef = useSignal<HTMLCanvasElement>();
  const busiest = useSignal('');
  const tzHint = useSignal('');

  const status = STATUS_META[stats.status] ?? STATUS_META.offline;
  const pot = stats.activity?.playersOverTime ?? null;
  const hasSparkline = !!pot && pot.avg.some((v) => v !== null);
  const sparklineHasGaps = !!pot && pot.avg.some((v) => v === null);
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

    // Resolve a theme color to a plain `rgb(r, g, b)` chart.js and rgba()
    // math can use. The lum tokens are nested var() references to Tailwind's
    // oklch palette, and color-string serialization for modern color spaces
    // varies by browser (Chrome keeps `oklch(...)` even through a canvas
    // fillStyle round-trip) — so never parse strings: resolve through a probe
    // element inside the panel (inherits the active theme), paint one pixel,
    // and read the actual sRGB bytes back.
    const probe = document.createElement('span');
    (rootRef.value ?? document.body).appendChild(probe);
    const cvs = document.createElement('canvas');
    cvs.width = 1;
    cvs.height = 1;
    const norm = cvs.getContext('2d', { willReadFrequently: true });
    const resolveColor = (cssValue: string, fallback: string): string => {
      if (!norm) return fallback;
      probe.style.color = cssValue;
      const computed = getComputedStyle(probe).color;
      if (!computed) return fallback;
      norm.clearRect(0, 0, 1, 1);
      try {
        norm.fillStyle = computed;
      } catch {
        return fallback;
      }
      norm.fillRect(0, 0, 1, 1);
      const d = norm.getImageData(0, 0, 1, 1).data;
      if (d[3] === 0) return fallback;
      return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
    };
    const withAlpha = (color: string, alpha: number): string => {
      const hex = color.match(/^#([0-9a-f]{6})/i)?.[1];
      if (hex) {
        const n = parseInt(hex, 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
      }
      const nums = color.match(/[\d.]+/g);
      if (!nums || nums.length < 3) return color;
      return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
    };

    const accent = resolveColor('var(--color-lum-accent)', '#3b82f6');
    const text = resolveColor('var(--color-lum-text-secondary)', '#9ca3af');
    probe.remove();

    // Ticks wear the secondary ink at full strength — alpha-composited text
    // on a dark card muddies into the background and becomes unreadable.
    const tick = text;
    const grid = withAlpha(text, 0.14);
    const fontFamily = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.family = fontFamily;
    Chart.defaults.font.size = 11;

    const tooltipStyle = {
      displayColors: false,
      backgroundColor: 'rgba(10, 12, 20, 0.92)',
      titleColor: '#fff',
      bodyColor: withAlpha('#ffffff', 0.85),
      padding: 8,
      cornerRadius: 6,
      titleFont: { size: 11 },
      bodyFont: { size: 11 },
    } as const;

    // Quiet servers flatline at 0-2 players; give the y axis a small floor so
    // the line sits low in a scaled chart instead of being glued to the axis.
    const yScale = (dataMax: number) =>
      ({
        beginAtZero: true,
        suggestedMax: Math.max(4, Math.ceil(dataMax * 1.25)),
        ticks: { color: tick, precision: 0, maxTicksLimit: 3, padding: 4 },
        grid: { color: grid, drawTicks: false },
        border: { display: false },
      }) as const;
    const xScale = (maxTicks: number) =>
      ({
        ticks: {
          color: tick,
          maxTicksLimit: maxTicks,
          maxRotation: 0,
          autoSkipPadding: 12,
        },
        grid: { display: false },
        border: { display: false },
      }) as const;

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
      const dataMax = Math.max(
        ...pot.avg.filter((v): v is number => v !== null)
      );

      const areaCtx = sparkRef.value.getContext('2d');
      let fill: CanvasGradient | string = withAlpha(accent, 0.12);
      if (areaCtx) {
        const g = areaCtx.createLinearGradient(0, 0, 0, 96);
        g.addColorStop(0, withAlpha(accent, 0.28));
        g.addColorStop(1, withAlpha(accent, 0.02));
        fill = g;
      }

      // The visible task can re-run (dev re-renders, HMR) without an unmount
      // in between — release any chart already bound to this canvas first.
      Chart.getChart(sparkRef.value)?.destroy();
      charts.push(
        new Chart(sparkRef.value, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: pot.avg,
                borderColor: accent,
                backgroundColor: fill,
                fill: true,
                borderWidth: 2,
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
                pointRadius: 0,
                pointHitRadius: 12,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: accent,
                pointHoverBorderColor: withAlpha('#ffffff', 0.9),
                pointHoverBorderWidth: 2,
                // Gaps where the server wasn't reporting — null is not zero.
                spanGaps: false,
                tension: 0.35,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            layout: { padding: { top: 4 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  label: (ctx) =>
                    ctx.parsed.y === null
                      ? 'Not reporting'
                      : `${ctx.parsed.y} avg${
                          peak[ctx.dataIndex] != null
                            ? ` · ${peak[ctx.dataIndex]} peak`
                            : ''
                        }`,
                },
              },
            },
            scales: { x: xScale(6), y: yScale(dataMax) },
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

      const values = entries.map((e) => e.value);
      const dataMax = Math.max(
        ...values.filter((v): v is number => v !== null)
      );
      // Emphasis: the busiest hour wears the full accent, the rest stay muted
      // so the shape reads at a glance without a rainbow.
      const colors = values.map((v) =>
        v !== null && v === dataMax && dataMax > 0
          ? accent
          : withAlpha(accent, 0.55)
      );

      Chart.getChart(hourlyRef.value)?.destroy();
      charts.push(
        new Chart(hourlyRef.value, {
          type: 'bar',
          data: {
            labels: entries.map((e) => e.label),
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                hoverBackgroundColor: accent,
                borderRadius: { topLeft: 3, topRight: 3 },
                borderSkipped: 'bottom',
                // Hours that reported a ~0 average still get a visible sliver,
                // so "quiet but reporting" doesn't look identical to "no data".
                minBarLength: 3,
                maxBarThickness: 18,
                categoryPercentage: 0.85,
                barPercentage: 0.9,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 4 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltipStyle,
                callbacks: {
                  label: (ctx) =>
                    ctx.parsed.y === null
                      ? 'No data'
                      : `≈ ${Number(ctx.parsed.y).toFixed(1)} players`,
                },
              },
            },
            scales: { x: xScale(8), y: yScale(dataMax) },
          },
        })
      );

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      tzHint.value = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
      if (
        stats.activity?.peakHourUtc !== null &&
        stats.activity?.peakHourUtc !== undefined
      ) {
        const d = new Date();
        d.setUTCHours(stats.activity.peakHourUtc, 0, 0, 0);
        busiest.value = `Usually busiest around ${d.toLocaleTimeString([], {
          hour: 'numeric',
        })}`;
      }
    }

    return () => charts.forEach((c) => c.destroy());
  });

  return (
    <div ref={rootRef} class="lum-card gap-4">
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

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div class="lum-bg-lum-input-bg/30 rounded-lum-1 flex flex-col gap-1 p-2.5">
          <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
            <Users size={13} /> Players online
          </span>
          <span class="text-lg leading-tight font-semibold">
            {stats.onlinePlayers !== null ? (
              <>
                {stats.onlinePlayers.toLocaleString()}
                {stats.maxPlayers !== null && (
                  <span class="text-lum-text-secondary text-sm font-normal">
                    {' '}
                    / {stats.maxPlayers.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <span class="text-lum-text-secondary text-sm">Unknown</span>
            )}
          </span>
        </div>
        <div class="lum-bg-lum-input-bg/30 rounded-lum-1 flex flex-col gap-1 p-2.5">
          <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
            <Gauge size={13} /> 7-day uptime
          </span>
          <span class="text-lg leading-tight font-semibold">
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
          <div class="lum-bg-lum-input-bg/30 rounded-lum-1 col-span-2 flex flex-col gap-1 p-2.5 sm:col-span-1">
            <span class="text-lum-text-secondary flex items-center gap-1.5 text-xs">
              <ServerIcon size={13} /> Software
            </span>
            <span
              class="truncate text-lg leading-tight font-semibold"
              title={[stats.platform, stats.mcVersion]
                .filter(Boolean)
                .join(' ')}
            >
              {stats.platform ?? ''}
              {stats.mcVersion && (
                <span class="text-lum-text-secondary text-sm font-normal">
                  {stats.platform ? ' ' : ''}
                  {stats.mcVersion}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {hasSparkline && (
        <div class="flex flex-col gap-1.5">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="text-sm font-semibold">Players — last 24 hours</h3>
            {sparklineHasGaps && (
              <span class="text-lum-text-secondary text-xs">
                gaps = not reporting
              </span>
            )}
          </div>
          <div class="h-24">
            <canvas
              ref={sparkRef}
              aria-label="Average players online over the last 24 hours"
            />
          </div>
        </div>
      )}

      {hasHourly && (
        <div class="flex flex-col gap-1.5">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="text-sm font-semibold">Typical activity by hour</h3>
            {tzHint.value && (
              <span class="text-lum-text-secondary text-xs">
                your time · {tzHint.value}
              </span>
            )}
          </div>
          <div class="h-24">
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

      <p class="text-lum-text-secondary border-lum-border/20 border-t pt-3 text-xs">
        Self-reported by the server's ServersPulse monitoring plugin · updated{' '}
        {timeAgo(asOfMs)} · does not affect ranking
      </p>
    </div>
  );
});
