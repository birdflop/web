export default function getConfig() {
  return {
    servers: [
      {
        name: 'Yatopia',
        prefix: '❌',
        value: 'Yatopia is prone to bugs and is no longer in development.\nFind a better server fork.',
        buttons: [
          {
            text: 'Paper',
            url: 'https://papermc.io',
          },
          {
            text: 'Pufferfish',
            url: 'https://ci.pufferfish.host/job/Pufferfish-1.19/',
          },
          {
            text: 'Purpur',
            url: 'https://purpurmc.org',
          },
        ],
      },
      {
        name: 'Mirai',
        prefix: '❌',
        value: 'Mirai is prone to bugs and corruption (AKA Yatopia 2.0).\nFind a better server fork.',
        buttons: [
          {
            text: 'Paper',
            url: 'https://papermc.io',
          },
          {
            text: 'Pufferfish',
            url: 'https://ci.pufferfish.host/job/Pufferfish-1.19/',
          },
          {
            text: 'Purpur',
            url: 'https://purpurmc.org',
          },
        ],
      },
    ],
  };
}