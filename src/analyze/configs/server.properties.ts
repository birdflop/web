export default function getConfig() {
  return {
    'online-mode': [
      {
        expressions: [
          {
            bool: (dict_of_vars: any) => {
              return !dict_of_vars.server_properties['online-mode'];
            },
            vars: ['server_properties'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.spigot.settings.bungeecord == 'false';
            },
            vars: ['spigot'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.paper.settings['velocity-support']['online-mode'] == 'false' || dict_of_vars.paper.settings['velocity-support'].enabled == 'false';
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
            bool: (dict_of_vars: any) => {
              return parseInt(dict_of_vars.server_properties['network-compression-threshold']) <= 256;
            },
            vars: ['server_properties'],
          },
          {
            bool: (dict_of_vars: any) => {
              return dict_of_vars.spigot['settings']['bungeecord'] == 'false';
            },
            vars: ['spigot'],
          },
        ],
        prefix: '❌',
        value: 'Increase this in server.properties.\nRecommended: 512.',
      },
    ],
  };
}