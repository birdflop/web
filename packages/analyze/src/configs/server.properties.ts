import type { DictOfVars } from '../types.js';
export default function getConfig() {
  return {
    'online-mode': [
      {
        expressions: [
          {
            bool: (dict_of_vars: DictOfVars) => {
              return !dict_of_vars.server_properties['online-mode'];
            },
            vars: ['server_properties'],
          },
          {
            bool: (dict_of_vars: DictOfVars) => {
              return dict_of_vars.spigot.settings.bungeecord == 'false';
            },
            vars: ['spigot'],
          },
          {
            bool: (dict_of_vars: DictOfVars) => {
              return (
                dict_of_vars.paper.settings['velocity-support'][
                  'online-mode'
                ] == 'false' ||
                dict_of_vars.paper.settings['velocity-support'].enabled ==
                  'false'
              );
            },
            vars: ['paper'],
          },
        ],
        prefix: '❌',
        value: 'Enable this in server.properties for security.',
      },
    ],
    'network-compression-threshold': [
      {
        expressions: [
          {
            bool: (dict_of_vars: DictOfVars) => {
              return (
                parseInt(
                  dict_of_vars.server_properties[
                    'network-compression-threshold'
                  ] ?? ''
                ) <= 256
              );
            },
            vars: ['server_properties'],
          },
          {
            bool: (dict_of_vars: DictOfVars) => {
              return dict_of_vars.spigot['settings']['bungeecord'] == 'false';
            },
            vars: ['spigot'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in server.properties.\nRecommended: 512.',
      },
    ],
    'simulation-distance': [
      {
        expressions: [
          {
            bool: (dict_of_vars: DictOfVars) => {
              const spigotSim =
                dict_of_vars.spigot?.['world-settings']?.['default']?.[
                  'simulation-distance'
                ];
              const serverSim = parseInt(
                dict_of_vars.server_properties?.['simulation-distance'] ?? ''
              );
              return (
                (spigotSim === 'default' && serverSim >= 9) ||
                (spigotSim !== 'default' &&
                  parseInt(String(spigotSim ?? '')) >= 9)
              );
            },
            vars: ['spigot', 'server_properties'],
          },
        ],
        prefix: '❌',
        value: 'Decrease this in server.properties.\nRecommended: 5 or lower.',
      },
    ],
  };
}
