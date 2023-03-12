export default function getConfig() {
  return {
    'chunk-gc.period-in-ticks': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['chunk-gc']['period-in-ticks']) >= 600;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 400.',
      },
    ],
    'ticks-per.monster-spawns': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['ticks-per']['monster-spawns']) == 1;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in bukkit.yml.\nRecommended: 4.',
      },
    ],
    'spawn-limits.monsters': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['spawn-limits']['monsters']) >= 70;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 15.',
      },
    ],
    'spawn-limits.water-ambient': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['spawn-limits']['water-ambient']) >= 20;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 5.',
      },
    ],
    'spawn-limits.ambient': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['spawn-limits']['ambient']) >= 15;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 1.',
      },
    ],
    'spawn-limits.animals': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['spawn-limits']['animals']) >= 10;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 5.',
      },
    ],
    'spawn-limits.water-animals': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.bukkit['spawn-limits']['water-animals']) >= 15;
            },
            vars: ['bukkit'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in bukkit.yml.\nRecommended: 5.',
      },
    ],
  };
}