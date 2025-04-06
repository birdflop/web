export default function getConfig() {
  return {
    'projectile.max-loads-per-projectile': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.pufferfish['projectile']['max-load-per-projectile']) >= 9;
            },
            vars: ['pufferfish'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in pufferfish.yml.\nRecommended: 8.',
      },
    ],
    'dab.enabled': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.pufferfish['dab']['enabled'] == 'false';
            },
            vars: ['pufferfish'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in pufferfish.yml.',
      },
    ],
  };
}