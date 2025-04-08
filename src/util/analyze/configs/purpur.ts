export default function getConfig() {
  return {
    'settings.use-alternate-keepalive': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.purpur['settings']['use-alternate-keepalive'] == 'false';
            },
            vars: ['purpur'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.plugins.find((plugin: Field) => plugin.name == 'TCPShield') === undefined;
            },
            vars: ['plugins'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in purpur.yml.',
      },
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.purpur['settings']['use-alternate-keepalive'] == 'true';
            },
            vars: ['purpur'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.plugins.find((plugin: Field) => plugin.name == 'TCPShield') !== undefined;
            },
            vars: ['plugins'],
          },
        ],
        prefix: '❌',
        value: 'Disable this in purpur.yml. It can cause issues with TCPShield',
      },
    ],
    'settings.dont-send-useless-entity-packets': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.purpur['settings']['dont-send-useless-entity-packets'] == 'false';
            },
            vars: ['purpur'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in purpur.yml.',
      },
    ],
    'mobs.villager.brain-ticks': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.purpur['world-settings']['default']['mobs']['villager']['brain-ticks']) == 1;
            },
            vars: ['purpur'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in purpur.yml.\nRecommended: 4.',
      },
    ],
    'mobs.villager.spawn-iron-golem.radius': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.purpur['world-settings']['default']['mobs']['villager']['spawn-iron-golem']['radius']) == 0;
            },
            vars: ['purpur'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in purpur.yml.\nRecommended: 5.',
      },
    ],
    'mobs.zombie.aggressive-towards-villager-when-lagging': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.purpur['world-settings']['default']['mobs']['zombie']['aggressive-towards-villager-when-lagging'] == 'true';
            },
            vars: ['purpur'],
          },
        ],
        prefix: '❌',
        value: 'Disable this in purpur.yml.',
      },
    ],
    'gameplay-mechanics.player.teleport-if-outside-border': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.purpur['world-settings']['default']['gameplay-mechanics']['player']['teleport-if-outside-border'] == 'false';
            },
            vars: ['purpur'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in purpur.yml.',
      },
    ],
  };
}