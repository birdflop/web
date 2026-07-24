export type ConfigPrimitive = string;

export interface ServerPropertiesConfig {
  'online-mode': ConfigPrimitive;
  'network-compression-threshold': ConfigPrimitive;
  'simulation-distance'?: ConfigPrimitive;
  [key: ConfigPrimitive]: unknown;
}

export interface SpigotConfig {
  settings: {
    bungeecord: ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'world-settings': {
    default: {
      'entity-activation-range': {
        animals: ConfigPrimitive;
        monsters: ConfigPrimitive;
        misc: ConfigPrimitive;
        water: ConfigPrimitive;
        villagers: ConfigPrimitive;
        'tick-inactive-villagers': ConfigPrimitive;
        'wake-up-inactive': {
          'villagers-max-per-tick': ConfigPrimitive;
          'villagers-for': ConfigPrimitive;
          'flying-monsters-max-per-tick': ConfigPrimitive;
          'flying-monsters-for': ConfigPrimitive;
          'monsters-max-per-tick': ConfigPrimitive;
          'animals-max-per-tick': ConfigPrimitive;
          'animals-for': ConfigPrimitive;
          'monsters-for': ConfigPrimitive;
          [key: ConfigPrimitive]: unknown;
        };
        [key: ConfigPrimitive]: unknown;
      };
      'arrow-despawn-rate': ConfigPrimitive;
      'merge-radius': {
        item: ConfigPrimitive;
        exp: ConfigPrimitive;
        [key: ConfigPrimitive]: unknown;
      };
      'max-entity-collisions': ConfigPrimitive;
      [key: ConfigPrimitive]: unknown;
    };
    [key: ConfigPrimitive]: unknown;
  };
  [key: ConfigPrimitive]: unknown;
}

export interface PaperConfig {
  settings: {
    'velocity-support': {
      'online-mode': ConfigPrimitive;
      enabled: ConfigPrimitive;
      [key: ConfigPrimitive]: unknown;
    };
    [key: ConfigPrimitive]: unknown;
  };
  'world-defaults.yml': PaperWorldDefaults;
  'world-settings': {
    default: PaperWorldDefaults;
    [key: ConfigPrimitive]: unknown;
  };
  __________WORLDS__________: {
    __defaults__: PaperWorldDefaults;
    [key: ConfigPrimitive]: unknown;
  };
  _version?: unknown;
  [key: ConfigPrimitive]: unknown;
}

export interface PaperWorldDefaults {
  'max-auto-save-chunks-per-tick': ConfigPrimitive;
  chunks: {
    'max-auto-save-chunks-per-tick': ConfigPrimitive;
    'prevent-moving-into-unloaded-chunks': ConfigPrimitive;
    'entity-per-chunk-save-limit': {
      experience_orb: ConfigPrimitive;
      snowball: ConfigPrimitive;
      ender_pearl: ConfigPrimitive;
      arrow: ConfigPrimitive;
      [key: ConfigPrimitive]: unknown;
    };
    [key: ConfigPrimitive]: unknown;
  };
  environment: {
    'optimize-explosions': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'tick-rates': {
    'mob-spawner': ConfigPrimitive;
    'container-update': ConfigPrimitive;
    'grass-spread': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  entities: {
    behavior: {
      'disable-chest-cat-detection': ConfigPrimitive;
      [key: ConfigPrimitive]: unknown;
    };
    spawning: {
      'despawn-ranges': {
        [category: ConfigPrimitive]: {
          soft: ConfigPrimitive;
          hard: ConfigPrimitive;
          [key: ConfigPrimitive]: unknown;
        };
      };
      'non-player-arrow-despawn-rate': ConfigPrimitive;
      'creative-arrow-despawn-rate': ConfigPrimitive;
      'per-player-mob-spawns': ConfigPrimitive;
      'alt-item-despawn-rate': {
        enabled: ConfigPrimitive;
        [key: ConfigPrimitive]: unknown;
      };
      [key: ConfigPrimitive]: unknown;
    };
    'armor-stands': {
      'do-collision-entity-lookups': ConfigPrimitive;
      tick: ConfigPrimitive;
      [key: ConfigPrimitive]: unknown;
    };
    [key: ConfigPrimitive]: unknown;
  };
  hopper: {
    'disable-move-event': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  misc: {
    'redstone-implementation': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  collisions: {
    'fix-climbing-bypassing-cramming-rule': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'optimize-explosions': ConfigPrimitive;
  'mob-spawner-tick-rate': ConfigPrimitive;
  'game-mechanics': {
    'disable-chest-cat-detection': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'container-update-tick-rate': ConfigPrimitive;
  'grass-spread-tick-rate': ConfigPrimitive;
  'despawn-ranges': {
    soft: ConfigPrimitive;
    hard: ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'non-player-arrow-despawn-rate': ConfigPrimitive;
  'creative-arrow-despawn-rate': ConfigPrimitive;
  'prevent-moving-into-unloaded-chunks': ConfigPrimitive;
  'use-faster-eigencraft-redstone': ConfigPrimitive;
  'fix-climbing-bypassing-cramming-rule': ConfigPrimitive;
  'armor-stands-do-collision-entity-lookups': ConfigPrimitive;
  'armor-stands-tick': ConfigPrimitive;
  'per-player-mob-spawns': ConfigPrimitive;
  'alt-item-despawn-rate': {
    enabled: ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'entity-per-chunk-save-limit': {
    experience_orb: ConfigPrimitive;
    snowball: ConfigPrimitive;
    ender_pearl: ConfigPrimitive;
    arrow: ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'phantoms-only-attack-insomniacs': ConfigPrimitive;
  [key: ConfigPrimitive]: unknown;
}

export interface BukkitConfig {
  'chunk-gc': {
    'period-in-ticks': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'ticks-per': {
    'monster-spawns': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'spawn-limits': {
    monsters: ConfigPrimitive;
    'water-ambient': ConfigPrimitive;
    ambient: ConfigPrimitive;
    animals: ConfigPrimitive;
    'water-animals': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  [key: ConfigPrimitive]: unknown;
}

export interface PurpurConfig {
  settings: {
    'use-alternate-keepalive': ConfigPrimitive;
    'dont-send-useless-entity-packets': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  'world-settings': {
    default: {
      mobs: {
        villager: {
          'brain-ticks': ConfigPrimitive;
          'spawn-iron-golem': {
            radius: ConfigPrimitive;
            [key: ConfigPrimitive]: unknown;
          };
          [key: ConfigPrimitive]: unknown;
        };
        zombie: {
          'aggressive-towards-villager-when-lagging': ConfigPrimitive;
          [key: ConfigPrimitive]: unknown;
        };
        [key: ConfigPrimitive]: unknown;
      };
      'gameplay-mechanics': {
        player: {
          'teleport-if-outside-border': ConfigPrimitive;
          [key: ConfigPrimitive]: unknown;
        };
        [key: ConfigPrimitive]: unknown;
      };
      [key: ConfigPrimitive]: unknown;
    };
    [key: ConfigPrimitive]: unknown;
  };
  [key: ConfigPrimitive]: unknown;
}

export interface PufferfishConfig {
  projectile: {
    'max-load-per-projectile': ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  dab: {
    enabled: ConfigPrimitive;
    [key: ConfigPrimitive]: unknown;
  };
  [key: ConfigPrimitive]: unknown;
}

export interface DictOfVars {
  plugins: AnalyzePlugin[];
  server_properties: ServerPropertiesConfig;
  bukkit: BukkitConfig;
  spigot: SpigotConfig;
  paper: PaperConfig;
  pufferfish: PufferfishConfig;
  purpur: PurpurConfig;
}

export interface AnalyzePlugin {
  name: ConfigPrimitive;
  authors: ConfigPrimitive;
  [key: ConfigPrimitive]: unknown;
}

export interface Expression {
  bool: (dict_of_vars: DictOfVars) => boolean;
  vars: ConfigPrimitive[];
}

export interface OptionData {
  expressions: Expression[];
  prefix: ConfigPrimitive;
  suffix: ConfigPrimitive;
  value: ConfigPrimitive;
  name: ConfigPrimitive;
  buttons?: FieldButton[];
  inline?: boolean;
}

export interface FieldButton {
  text: ConfigPrimitive;
  url: ConfigPrimitive;
}

export interface Field {
  name: string;
  value: string;
  buttons?: { text: string; url: string }[];
  inline?: boolean;
}

export interface FieldOption extends Field {
  prefix?: string;
  suffix?: string;
}
