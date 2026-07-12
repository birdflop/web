import { component$, useStore } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { RangeInput, SelectMenu, LogoPaper, LogoPurpur, LogoFabric, LogoForge } from '@luminescent/ui-qwik';
import { SiSpigotmc, SiVelocity } from 'simple-icons-qwik';
import { Coffee, Cpu, Flag, HardDrive, Info, MemoryStick, Server } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { defaultDescription, generateHead } from '~/root';
import { donateLink } from '~/components/Elements/Nav';
import { hardwareDefaults, planHardware, PRICE_PER_GB, type Software, type WorldSize } from '~/util/hardware';

// Each option's label is wrapped in a component$ so Qwik can serialize the
// SelectMenu's values prop (raw icon components are not serializable).
const Vanilla = component$(() => <span class="flex items-center gap-2"><Server size={18} /> Vanilla</span>);
const Spigot = component$(() => <span class="flex items-center gap-2"><SiSpigotmc class="fill-current" size={18} /> Spigot</span>);
const Paper = component$(() => <span class="flex items-center gap-2"><LogoPaper size={18} /> Paper</span>);
const Purpur = component$(() => <span class="flex items-center gap-2"><LogoPurpur size={18} /> Purpur</span>);
const Fabric = component$(() => <span class="flex items-center gap-2"><LogoFabric size={18} /> Fabric</span>);
const Forge = component$(() => <span class="flex items-center gap-2"><LogoForge size={18} /> Forge</span>);
const Proxy = component$(() => <span class="flex items-center gap-2"><SiVelocity class="fill-current" size={18} /> Proxy (Velocity/Waterfall)</span>);

const softwareOptions = [
  { name: <Vanilla />, value: 'vanilla' },
  { name: <Spigot />, value: 'spigot' },
  { name: <Paper />, value: 'paper' },
  { name: <Purpur />, value: 'purpur' },
  { name: <Fabric />, value: 'fabric' },
  { name: <Forge />, value: 'forge' },
  { name: <Proxy />, value: 'proxy' },
];

export default component$(() => {
  const t = inlineTranslate();

  const store = useStore({ ...hardwareDefaults });
  const isProxy = store.software === 'proxy';
  const isModded = store.software === 'fabric' || store.software === 'forge';
  const result = planHardware(store);

  const estimatedCost = (result.ram * PRICE_PER_GB).toFixed(2);

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <MemoryStick size={32} />
        {t('hardware.title@@RAM & Hardware Planner')}
      </h1>
      <p class="mb-6 border-b border-lum-border/10 pb-4 text-lum-text-secondary">
        {t('hardware.description@@Estimate how much RAM and what kind of CPU your Minecraft server needs based on players, distances and plugins.')}
      </p>

      <div class="flex flex-col lg:flex-row gap-6">
        {/* Inputs */}
        <div class="flex-1 flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <SelectMenu id="software" class={{ 'w-full': true }} value={store.software}
              onChange$={(e, el) => { store.software = el.value as Software; }}
              values={softwareOptions}>
              {t('hardware.software@@Server software')}
            </SelectMenu>
            <p class="text-lum-text-secondary text-sm">
              {t('hardware.software.help@@Modded engines (Fabric/Forge) need significantly more memory than plugin-based servers.')}
            </p>
          </div>

          <div>
            <RangeInput id="players" min={1} max={100} step={1} value={hardwareDefaults.players}
              onInput$={(e, el) => { store.players = Number(el.value); }}>
              {t('hardware.players@@Concurrent players')} ({store.players})
            </RangeInput>
          </div>

          {/* Hidden (not unmounted) for proxies so slider state stays in sync. */}
          <div class={{ 'flex flex-col gap-5': true, 'hidden': isProxy }}>
            <div>
              <RangeInput id="view" min={2} max={32} step={1} value={hardwareDefaults.viewDistance}
                onInput$={(e, el) => { store.viewDistance = Number(el.value); }}>
                {t('hardware.view@@View distance')} ({store.viewDistance} {t('hardware.chunks@@chunks')})
              </RangeInput>
            </div>
            <div>
              <RangeInput id="sim" min={2} max={32} step={1} value={hardwareDefaults.simulationDistance}
                onInput$={(e, el) => { store.simulationDistance = Number(el.value); }}>
                {t('hardware.sim@@Simulation distance')} ({store.simulationDistance} {t('hardware.chunks@@chunks')})
              </RangeInput>
            </div>
            <div>
              <RangeInput id="plugins" min={0} max={100} step={1} value={hardwareDefaults.plugins}
                onInput$={(e, el) => { store.plugins = Number(el.value); }}>
                {isModded ? t('hardware.mods@@Mods') : t('hardware.plugins@@Plugins')} ({store.plugins})
              </RangeInput>
            </div>
            <div class="flex flex-col gap-1">
              <SelectMenu id="world" class={{ 'w-full': true }} value={store.worldSize}
                onChange$={(e, el) => { store.worldSize = el.value as WorldSize; }}
                values={[
                  { name: t('hardware.world.small@@Small (new / limited border)'), value: 'small' },
                  { name: t('hardware.world.medium@@Medium (established world)'), value: 'medium' },
                  { name: t('hardware.world.large@@Large (huge explored map)'), value: 'large' },
                ]}>
                {t('hardware.world@@World size')}
              </SelectMenu>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="flex-1 flex flex-col gap-4">
          <div class="lum-card lum-grad-bg-lum-card-bg/40 flex flex-col items-center text-center gap-1 py-8">
            <span class="text-lum-text-secondary flex items-center gap-2"><MemoryStick size={20} /> {t('hardware.recommended@@Recommended RAM')}</span>
            <span class="text-6xl font-extrabold">{result.ramLabel}</span>
            <span class="text-lum-text-secondary text-sm">
              {t('hardware.estimate@@Estimated for')} {store.players} {t('hardware.players.lower@@players')}
            </span>
          </div>

          <div class="lum-card lum-bg-lum-card-bg/40 flex gap-2 items-start text-sm text-lum-text-secondary">
            <Info size={18} class="shrink-0 mt-0.5" />
            <span>
              {t('hardware.disclaimer@@This is a rough estimate to give you a general idea — not a guaranteed figure. Your real needs could be noticeably higher or lower depending on your specific plugins/mods, world generation, player activity and configuration. Plugin and mod performance varies enormously: a single poorly-optimised plugin can use more RAM and CPU than a dozen well-made ones. Always test and monitor your own server (e.g. with spark) and adjust from there.')}
            </span>
          </div>

          <div class="grid sm:grid-cols-3 gap-2">
            <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col items-center text-center gap-1 py-4">
              <Cpu size={22} />
              <span class="text-2xl font-bold">{result.cores}</span>
              <span class="text-xs text-lum-text-secondary">{t('hardware.cores@@suggested cores')}</span>
            </div>
            <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col items-center text-center gap-1 py-4">
              <HardDrive size={22} />
              <span class="text-2xl font-bold">{result.storageGb} GB</span>
              <span class="text-xs text-lum-text-secondary">{t('hardware.storage@@disk (NVMe)')}</span>
            </div>
            <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col items-center text-center gap-1 py-4">
              <Coffee size={22} />
              <span class="text-2xl font-bold">{isModded ? '17/21' : '21'}</span>
              <span class="text-xs text-lum-text-secondary">{t('hardware.java@@Java version')}</span>
            </div>
          </div>

          {/* CPU + Java advice */}
          <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col gap-3 text-sm">
            <p class="flex gap-2"><Cpu size={18} class="shrink-0 mt-0.5" /> <span>{result.cpuAdvice}</span></p>
            <p class="flex gap-2"><Coffee size={18} class="shrink-0 mt-0.5" /> <span>{result.javaAdvice}</span></p>
          </div>

          {/* Breakdown */}
          <div class="lum-card lum-bg-lum-card-bg/40 flex flex-col gap-2">
            <span class="text-sm text-lum-text-secondary">{t('hardware.breakdown@@How this was estimated')}</span>
            {result.breakdown.map((b) => (
              <div key={b.label} class="flex justify-between text-sm border-b border-lum-border/10 pb-1 last:border-0">
                <span class="text-lum-text-secondary">{b.label}</span>
                <span class="font-mono">{b.value}</span>
              </div>
            ))}
            <ul class="list-disc ml-5 text-xs text-lum-text-secondary mt-2 space-y-1">
              {result.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>

          {/* CTA */}
          <div class="lum-card lum-grad-bg-blue/20 flex flex-col gap-3">
            <p class="text-sm">
              {t('hardware.cta@@A')} <strong>{result.ramLabel}</strong> {t('hardware.cta2@@server on Birdflop is roughly')}{' '}
              <strong>~${estimatedCost}/mo</strong> {t('hardware.cta3@@after reimbursements (nonprofit pricing).')}
            </p>
            <div class="flex flex-wrap gap-2">
              <Link href="/plans" class="lum-btn lum-bg-blue/50 hover:lum-bg-blue">
                <Server size={18} /> {t('hardware.viewPlans@@View hosting plans')}
              </Link>
              <Link href="/resources/flags" class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg">
                <Flag size={18} /> {t('hardware.generateFlags@@Generate startup flags')}
              </Link>
              <a href={donateLink} class="lum-btn lum-bg-transparent hover:lum-bg-lum-input-bg">
                {t('hardware.donate@@Donate')}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="h-12" />
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft RAM & Hardware Planner - Birdflop',
  description: 'Estimate how much RAM, CPU and storage your Minecraft server needs based on players, view distance and plugins. Developed by Birdflop. ' + defaultDescription,
});
