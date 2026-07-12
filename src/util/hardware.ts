// Heuristics for the RAM / Hardware Planner resource.
// These are deliberately conservative estimates — real usage varies with
// plugins, player behaviour and world generation, so the UI presents the
// result as a recommendation with a transparent breakdown.

export type Software = 'vanilla' | 'spigot' | 'paper' | 'purpur' | 'fabric' | 'forge' | 'proxy';
export type WorldSize = 'small' | 'medium' | 'large';

export interface HardwareInput {
  software: Software;
  players: number;
  viewDistance: number;
  simulationDistance: number;
  plugins: number;
  worldSize: WorldSize;
}

export interface HardwareResult {
  ram: number;
  ramLabel: string;
  cores: number;
  cpuAdvice: string;
  storageGb: number;
  javaAdvice: string;
  breakdown: { label: string; value: string }[];
  notes: string[];
}

export const hardwareDefaults: HardwareInput = {
  software: 'paper',
  players: 20,
  viewDistance: 10,
  simulationDistance: 8,
  plugins: 15,
  worldSize: 'medium',
};

// Common allocation sizes a host would actually offer.
const ALLOCATIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

function roundAllocation(value: number): number {
  for (const a of ALLOCATIONS) {
    if (value <= a) return a;
  }
  return Math.ceil(value / 8) * 8; // beyond the table, round to 8GB steps
}

const BASE_RAM: Record<Software, number> = {
  vanilla: 1.5,
  spigot: 2,
  paper: 2,
  purpur: 2,
  fabric: 3,
  forge: 3.5,
  proxy: 0.5,
};

const WORLD_MULT: Record<WorldSize, number> = { small: 0.9, medium: 1, large: 1.2 };

export function planHardware(input: HardwareInput): HardwareResult {
  const { software, players, viewDistance, simulationDistance, plugins, worldSize } = input;
  const modded = software === 'fabric' || software === 'forge';
  const base = BASE_RAM[software];

  // Proxies (Velocity/Waterfall) are network-bound and very light on RAM/CPU.
  if (software === 'proxy') {
    const ram = roundAllocation(0.5 + players * 0.0025);
    return {
      ram,
      ramLabel: `${ram} GB`,
      cores: players > 300 ? 4 : 2,
      cpuAdvice: 'Proxies are mostly network-bound. Any modern CPU with 2 dedicated cores is plenty; prioritise low-latency networking and high single-thread clock.',
      storageGb: 2,
      javaAdvice: 'Use Java 21 for Velocity and modern Waterfall builds.',
      breakdown: [
        { label: 'Base (proxy)', value: '0.5 GB' },
        { label: `Players (${players})`, value: `${(players * 0.0025).toFixed(2)} GB` },
      ],
      notes: [
        'A proxy does not run the world — size your backend servers separately.',
        'RAM is rarely the bottleneck for proxies; network throughput and CPU clock matter more.',
      ],
    };
  }

  const perPlayer = modded ? 0.06 : 0.04;
  const perPlugin = modded ? 0.05 : 0.035;

  // Loaded chunk memory scales roughly with the square of the distances,
  // relative to the common 10 view / 8 simulation baseline.
  const viewFactor = (viewDistance * viewDistance) / (10 * 10);
  const simFactor = (simulationDistance * simulationDistance) / (8 * 8);

  const playersRam = players * perPlayer * (0.6 + 0.4 * simFactor);
  const pluginsRam = plugins * perPlugin;
  const chunkRam = Math.max(0, viewFactor - 1) * 1.5;

  let ram = base + playersRam + pluginsRam + chunkRam;
  const worldMult = WORLD_MULT[worldSize];
  ram *= worldMult;
  ram = roundAllocation(Math.max(base, ram));

  // CPU: Minecraft's main loop is single-threaded, so clock matters most.
  // Extra cores help with chunk gen, async I/O and concurrent worlds.
  let cores = Math.max(2, Math.ceil(players / 40) + 1);
  if (modded) cores += 1;
  if (simulationDistance >= 12 || viewDistance >= 16) cores += 1;

  let cpuAdvice: string;
  if (players <= 20) {
    cpuAdvice = 'Single-thread clock is what matters. Any modern high-clock CPU (4.0 GHz+) handles this comfortably.';
  } else if (players <= 80) {
    cpuAdvice = 'Prioritise a high single-thread CPU (e.g. Ryzen 7000/9000 series at 4.5 GHz+). The main game loop cannot be spread across cores.';
  } else {
    cpuAdvice = 'You are pushing one server hard — pick the highest single-thread CPU available and consider splitting load across multiple servers behind a proxy.';
  }

  // Disk scales with the world (the dominant factor), how much terrain players
  // explore, pre-generation from higher view distances, and plugin/mod data.
  const jarAndLogs = modded ? 5 : 1.5; // modpack jars + libraries are large
  const worldBase = { small: 2, medium: 8, large: 30 }[worldSize];
  const playerTerrain = players * (modded ? 0.2 : 0.1);
  const viewPregen = Math.max(0, viewDistance - 8) * 1.2;
  const pluginData = plugins * (modded ? 0.35 : 0.12);
  const storageGb = Math.ceil(jarAndLogs + worldBase + playerTerrain + viewPregen + pluginData);

  const javaAdvice = modded
    ? 'Use the Java version your modpack targets (most 1.20.5+ packs need Java 21; many 1.18–1.20 packs use Java 17).'
    : 'Use Java 21 (required for Minecraft 1.20.5+). For 1.17–1.20.4 use Java 17.';

  const notes: string[] = [];
  if (ram >= 24) notes.push('Allocations above ~12 GB can cause longer garbage-collection pauses. Tuned GC flags (e.g. Aikar\'s) matter more here.');
  if (viewDistance >= 14) notes.push('A view distance of 14+ dramatically increases RAM and bandwidth. Consider 8–10 with a plugin like Chunky for pre-generation.');
  if (plugins > 0) {
    notes.push(modded
      ? 'These are counted as mods — heavy tech/magic mods can far exceed these averages, and a single mod can dominate usage.'
      : 'Plugin performance varies enormously — one poorly-optimised plugin can use more RAM and CPU than a dozen lightweight ones, so your real needs may differ a lot.');
  }
  notes.push('This is only a general estimate — actual usage could be higher or lower. Monitor your own server with /spark and adjust.');

  return {
    ram,
    ramLabel: ram >= 32 ? '32+ GB' : `${ram} GB`,
    cores,
    cpuAdvice,
    storageGb,
    javaAdvice,
    breakdown: [
      { label: `Base (${software})`, value: `${base.toFixed(1)} GB` },
      { label: `Players (${players})`, value: `${playersRam.toFixed(2)} GB` },
      { label: `Plugins/mods (${plugins})`, value: `${pluginsRam.toFixed(2)} GB` },
      { label: `View distance (${viewDistance})`, value: `${chunkRam.toFixed(2)} GB` },
      { label: 'World size', value: `×${worldMult}` },
    ],
    notes,
  };
}

// Birdflop's cheapest reimbursed rate, mirrored from the plans page.
export const PRICE_PER_GB = 1.48;
