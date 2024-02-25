export default function getConfig() {
  return {
    'max-auto-save-chunks-per-tick': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['max-auto-save-chunks-per-tick']) >= 24;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in paper.yml.\nRecommended: 6.',
      },
    ],
    'optimize-explosions': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['optimize-explosions'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'mob-spawner-tick-rate': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['mob-spawner-tick-rate']) == 1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in paper.yml.\nRecommended: 2.',
      },
    ],
    'game-mechanics.disable-chest-cat-detection': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['game-mechanics']['disable-chest-cat-detection'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml',
      },
    ],
    'container-update-tick-rate': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['container-update-tick-rate']) == 1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in paper.yml.\nRecommended: 3.',
      },
    ],
    'grass-spread-tick-rate': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['grass-spread-tick-rate']) == 1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in paper.yml.\nRecommended: 4.',
      },
    ],
    'despawn-ranges.soft': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['despawn-ranges']['soft']) >= 32;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in paper.yml.\nRecommended: 28.',
      },
    ],
    'despawn-ranges.hard': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['despawn-ranges']['hard']) >= 128;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in paper.yml.\nRecommended: 96.',
      },
    ],
    'hopper.disable-move-event': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['hopper']['disable-move-event'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml',
      },
    ],
    'non-player-arrow-despawn-rate': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['non-player-arrow-despawn-rate']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 60',
      },
    ],
    'creative-arrow-despawn-rate': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['creative-arrow-despawn-rate']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 60',
      },
    ],
    'prevent-moving-into-unloaded-chunks': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['prevent-moving-into-unloaded-chunks'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'use-faster-eigencraft-redstone': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['use-faster-eigencraft-redstone'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'fix-climbing-bypassing-cramming-rule': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['fix-climbing-bypassing-cramming-rule'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'armor-stands-do-collision-entity-lookups': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['armor-stands-do-collision-entity-lookups'] == 'true';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Disable this in paper.yml.',
      },
    ],
    'armor-stands-tick': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['armor-stands-tick'] == 'true';
            },
            vars: ['paper'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.plugins.find((plugin: Field) => plugin.name == 'PetBlocks') !== undefined;
            },
            vars: ['plugins'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.plugins.find((plugin: Field) => plugin.name == 'BlockBalls') !== undefined;
            },
            vars: ['plugins'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.plugins.find((plugin: Field) => plugin.name == 'ArmorStandTools') !== undefined;
            },
            vars: ['plugins'],
          },
        ],
        prefix: '❌',
        value: 'Disable this in paper.yml.',
      },
    ],
    'per-player-mob-spawns': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['per-player-mob-spawns'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'alt-item-despawn-rate.enabled': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['alt-item-despawn-rate']['enabled'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in paper.yml.',
      },
    ],
    'entity-per-chunk-save-limit.experience_orb': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['entity-per-chunk-save-limit']['experience_orb']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 16.',
      },
    ],
    'entity-per-chunk-save-limit.snowball': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['entity-per-chunk-save-limit']['snowball']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 16.',
      },
    ],
    'entity-per-chunk-save-limit.ender_pearl': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['entity-per-chunk-save-limit']['ender_pearl']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 16.',
      },
    ],
    'entity-per-chunk-save-limit.arrow': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.paper['world-settings']['default']['entity-per-chunk-save-limit']['arrow']) == -1;
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Set a value in paper.yml.\nRecommended: 16.',
      },
    ],
  };
}