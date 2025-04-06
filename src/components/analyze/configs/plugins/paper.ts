export default function getConfig() {
  return {
    'ClearLag': {
      prefix: '❌',
      value: 'Plugins that claim to remove lag actually cause more lag.',
    },
    'LagAssist': {
      prefix: '❌',
      value: 'LagAssist should only be used for analytics and preventative measures.\nAll other features of the plugin should be disabled.',
    },
    'NoMobLag': {
      prefix: '❌',
      value: 'Plugins that claim to remove lag actually cause more lag.',
    },
    'ServerBooster': {
      prefix: '❌',
      value: 'Plugins that claim to remove lag actually cause more lag.',
    },
    'AntiLag': {
      prefix: '❌',
      value: 'Plugins that claim to remove lag actually cause more lag.',
    },
    'BookLimiter': {
      prefix: '❌',
      value: 'You don\'t need BookLimiter as Paper already fixes all crash bugs.',
    },
    'LimitPillagers': {
      prefix: '❌',
      value: 'LimitPillagers is not useful in 1.15 and above.',
    },
    'VillagerOptimiser': {
      prefix: '❌',
      value: 'VillagerOptimiser is not useful in 1.15 and above.',
    },
    'StackMob': {
      prefix: '❌',
      value: 'Stacking mobs causes more lag.',
    },
    'Stacker': {
      prefix: '❌',
      value: 'Stacking mobs causes more lag.',
    },
    'MobStacker': {
      prefix: '❌',
      value: 'Stacking mobs causes more lag.',
    },
    'WildStacker': {
      prefix: '❌',
      value: 'Stacking mobs causes more lag.',
    },
    'FastAsyncWorldEdit': {
      prefix: '❌',
      value: 'FAWE has been known to cause issues.\nConsider replacing FAWE with Worldedit.',
      buttons: [
        {
          text: 'Worldedit',
          url: 'https://enginehub.org/worldedit/#downloads',
        },
      ],
    },
    'IllegalStack': {
      prefix: '❌',
      value: 'You probably don\'t need IllegalStack as Paper already fixes all dupe and crash bugs.',
    },
    'ExploitFixer': {
      prefix: '❌',
      value: 'You probably don\'t need ExploitFixer as Paper already fixes all dupe and crash bugs.',
    },
    'EntityTrackerFixer': {
      prefix: '❌',
      value: 'You don\'t need EntityTrackerFixer as Paper already has its features.',
    },
    'Orebfuscator': {
      prefix: '❌',
      value: 'You don\'t need Orebfuscator as Paper already has its features.',
    },
    'GroupManager': {
      prefix: '❌',
      value: 'GroupManager is an outdated permission plugin.\nConsider replacing it with a better plugin.',
      buttons: [
        {
          text: 'LuckPerms',
          url: 'https://luckperms.net/download',
        },
      ],
    },
    'PermissionsEx': {
      prefix: '❌',
      value: 'PermissionsEx is an outdated permission plugin.\nConsider replacing it with a better plugin.',
      buttons: [
        {
          text: 'LuckPerms',
          url: 'https://luckperms.net/download',
        },
      ],
    },
    'bPermissions': {
      prefix: '❌',
      value: 'bPermissions is an outdated permission plugin.\nConsider replacing it with a better plugin.',
      buttons: [
        {
          text: 'LuckPerms',
          url: 'https://luckperms.net/download',
        },
      ],
    },
    'PhantomSMP': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['phantoms-only-attack-insomniacs'] == 'false';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'You probably don\'t need PhantomSMP as Paper already has its features.',
      },
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper['world-settings']['default']['phantoms-only-attack-insomniacs'] == 'true';
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'You probably don\'t need PhantomSMP as Paper already has its features.\nEnable phantoms-only-attack-insomniacs in paper.yml.',
      },
    ],
    'PacketLimiter': {
      prefix: '❌',
      value: 'You don\'t need PacketLimiter as Paper already has its features.',
    },
  };
}