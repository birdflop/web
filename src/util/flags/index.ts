import {
  Paper as LogoPaper,
  Purpur as LogoPurpur,
  Waterfall as LogoWaterfall,
  Forge as LogoForge,
  Fabric as LogoFabric,
} from '@luminescent/icons-qwik';
import Computer from 'lucide-icons-qwik/icons/Computer';
import Terminal from 'lucide-icons-qwik/icons/Terminal';
import SiApple from 'simple-icons-qwik/icons/SiApple';
import SiLinux from 'simple-icons-qwik/icons/SiLinux';
import SiPterodactyl from 'simple-icons-qwik/icons/SiPterodactyl';
import SiSpigotmc from 'simple-icons-qwik/icons/SiSpigotmc';
import SiVelocity from 'simple-icons-qwik/icons/SiVelocity';

export const environmentOptions = {
  linux: { name: 'Linux', icon: SiLinux },
  windows: { name: 'Windows', icon: Computer },
  macos: { name: 'MacOS', icon: SiApple },
  pterodactyl: { name: 'Pterodactyl', icon: SiPterodactyl },
  command: { name: 'Command', icon: Terminal },
};

export const softwareOptionsFlags = {
  paper: { name: 'Paper', icon: LogoPaper },
  purpur: { name: 'Purpur', icon: LogoPurpur },
  velocity: { name: 'Velocity', icon: SiVelocity },
  waterfall: { name: 'Waterfall', icon: LogoWaterfall },
};

export const softwareOptions = {
  ...softwareOptionsFlags,
  spigot: { name: 'Spigot', icon: SiSpigotmc },
  forge: { name: 'Forge', icon: LogoForge },
  fabric: { name: 'Fabric', icon: LogoFabric },
};

export const flagOptions = [
  {
    translatedName: 'flags.flags.none@@None',
    value: 'none',
  },
  {
    name: "Aikar's Flags",
    value: 'aikars',
    help: 'https://docs.papermc.io/paper/aikars-flags',
  },
  {
    name: "MeowIce's Flags",
    value: 'meowice',
    help: 'https://github.com/MeowIce/meowice-flags',
  },
  {
    name: 'Benchmarked (G1GC)',
    value: 'benchmarkedG1GC',
    help: 'https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks',
  },
  {
    name: 'Benchmarked (ZGC, Java 25+)',
    value: 'benchmarkedZGC',
    help: 'https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks',
  },
  {
    name: "hilltty's Flags",
    value: 'hillttys',
    help: 'https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md',
  },
  {
    name: "Obydux's Flags",
    value: 'obyduxs',
    help: 'https://github.com/Obydux/Minecraft-GraalVM-Flags',
  },
  {
    name: "Etil's Flags",
    value: 'etils',
    help: 'https://github.com/etil2jz/etil-minecraft-flags',
  },
];
