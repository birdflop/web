import type {
  AnalyzePlugin,
  BukkitConfig,
  Field,
  FieldOption,
  OptionData,
  PaperConfig,
  PufferfishConfig,
  PurpurConfig,
  ServerPropertiesConfig,
  SpigotConfig,
} from '../types.js';
import createField from './createField.js';
import evalField from './evalField.js';
import { analyzeJvmFlags } from './jvmFlags.js';

import config_bukkit from '../configs/bukkit.js';
import plugins_paper from '../configs/plugins/paper.js';
import plugins_purpur from '../configs/plugins/purpur.js';
import config_purpur from '../configs/purpur.js';
import config_server_properties from '../configs/server.properties.js';
import servers from '../configs/servers.js';
import config_spigot from '../configs/spigot.js';
import config_paper_27 from '../configs/timings/paper-27.js';
import config_paper_28 from '../configs/timings/paper-28.js';
import config_pufferfish from '../configs/timings/pufferfish.js';

interface TimingsData {
  timingsMaster: {
    version: string;
    plugins: Record<string, AnalyzePlugin>;
    config?: Record<string, unknown>;
    system: {
      timingcost: string;
      flags: string;
      jvmversion: string;
      cpu: string;
    };
    data?: Array<{
      minuteReports: Array<{
        ticks: { timedTicks: number; playerTicks: number };
      }>;
    }>;
    idmap?: {
      handlerMap?: Record<string, { name: string }>;
    };
  };
}

export default async function analyzeTimings(id: string): Promise<Field[]> {
  const timings_json = `https://timings.aikar.co/data.php?id=${id}`;

  let request: TimingsData;
  try {
    const response_json = await fetch(timings_json, {
      headers: { Accept: 'application/json' },
    });
    request = (await response_json.json()) as TimingsData;
  } catch (err) {
    return [
      {
        name: '❌ Processing Error',
        value: `birdflop cannot process this spark profile. Please use an alternative spark profile. ${err instanceof Error ? err.message : String(err)}`,
      },
    ];
  }

  let version = request.timingsMaster.version;

  if (version.endsWith('(MC: 1.17)'))
    version = version.replace('(MC: 1.17)', '(MC: 1.17.0)');

  let server_properties = {} as ServerPropertiesConfig,
    bukkit = {} as BukkitConfig,
    spigot = {} as SpigotConfig,
    paper = {} as PaperConfig,
    pufferfish = {} as PufferfishConfig,
    purpur = {} as PurpurConfig;

  const plugins: AnalyzePlugin[] = Object.keys(
    request.timingsMaster.plugins
  ).map((i) => {
    return request.timingsMaster.plugins[i];
  });
  const configs = request.timingsMaster.config;
  if (configs) {
    if (configs['server.properties'])
      server_properties = configs[
        'server.properties'
      ] as ServerPropertiesConfig;
    if (configs['bukkit']) bukkit = configs['bukkit'] as BukkitConfig;
    if (configs['spigot']) spigot = configs['spigot'] as SpigotConfig;
    if (configs['paper'] || configs['paperspigot'])
      paper = (configs['paper'] ?? configs['paperspigot']) as PaperConfig;
    if (configs['pufferfish'])
      pufferfish = configs['pufferfish'] as PufferfishConfig;
    if (configs['purpur']) purpur = configs['purpur'] as PurpurConfig;
  }

  const TIMINGS_CHECK = {
    servers: servers(),
    plugins: {
      paper: plugins_paper(),
      purpur: plugins_purpur(),
    },
    config: {
      'server.properties': config_server_properties(),
      bukkit: config_bukkit(),
      spigot: config_spigot(),
      paper: paper._version ? config_paper_28() : config_paper_27(),
      pufferfish: config_pufferfish(),
      purpur: config_purpur(),
    },
  };

  const fields: Field[] = [];

  const timing_cost = parseInt(request.timingsMaster.system.timingcost);
  if (timing_cost > 300) {
    fields.push({
      name: '❌ Timingcost',
      value: `Your timingcost is ${timing_cost}. Your cpu is overloaded and/or slow.`,
      buttons: [
        { text: 'Find a better host', url: 'https://www.birdflop.com' },
      ],
    });
  }

  // fetch the latest mc version
  const req = await fetch('https://api.purpurmc.org/v2/purpur');
  const json: { versions: string[] } = (await req.json()) as {
    versions: string[];
  };
  const latest = json.versions[json.versions.length - 1];

  // ghetto version check
  if (version.split('(MC: ')[1].split(')')[0] != latest) {
    version = version.replace('git-', '').replace('MC: ', '');
    fields.push({
      name: '❌ Outdated',
      value: `You are using \`${version}\`. Update to \`${latest}\`.`,
      buttons: [
        { text: 'Paper', url: 'https://papermc.io' },
        {
          text: 'Pufferfish',
          url: 'https://ci.pufferfish.host/job/Pufferfish-1.19/',
        },
        { text: 'Purpur', url: 'https://purpurmc.org' },
      ],
    });
  }

  if (TIMINGS_CHECK.servers.servers) {
    TIMINGS_CHECK.servers.servers.forEach((server: FieldOption) => {
      if (version.includes(server.name)) fields.push(createField(server));
    });
  }

  const flags = request.timingsMaster.system.flags;
  const jvm_version = request.timingsMaster.system.jvmversion;

  let index = 0;
  let max_online_players = 0;
  if (request.timingsMaster.data) {
    const data = request.timingsMaster.data;
    while (index < data.length) {
      const timed_ticks = data[index].minuteReports[0].ticks.timedTicks;
      const player_ticks = data[index].minuteReports[0].ticks.playerTicks;
      const players = player_ticks / timed_ticks;
      max_online_players = Math.max(players, max_online_players);
      index = index + 1;
    }
  }

  fields.push(...analyzeJvmFlags(flags, jvm_version, max_online_players));

  const cpu = parseInt(request.timingsMaster.system.cpu);
  if (cpu <= 2)
    fields.push({
      name: '❌ Threads',
      value: `You only have ${cpu} thread(s).`,
      buttons: [
        { text: 'Find a better host', url: 'https://www.birdflop.com' },
      ],
    });

  const handlerMap = request.timingsMaster.idmap?.handlerMap;
  const handlers = handlerMap
    ? Object.keys(handlerMap).map((i) => handlerMap[i])
    : [];
  handlers.forEach((handler) => {
    let handler_name = handler.name;
    if (
      handler_name.startsWith('Command Function - ') &&
      handler_name.endsWith(':tick')
    ) {
      handler_name = handler_name
        .split('Command Function - ')[1]
        .split(':tick')[0];
      fields.push({
        name: `❌ ${handler_name}`,
        value: 'This datapack uses command functions which are laggy.',
      });
    }
  });

  if (TIMINGS_CHECK.plugins) {
    const server_names = Object.keys(TIMINGS_CHECK.plugins);
    server_names.forEach((server_name) => {
      if (configs && Object.keys(configs).includes(server_name)) {
        plugins.forEach((plugin) => {
          const server_plugins =
            TIMINGS_CHECK.plugins[
              server_name as keyof typeof TIMINGS_CHECK.plugins
            ];
          Object.keys(server_plugins).forEach((plugin_name) => {
            if (plugin.name == plugin_name) {
              const stored_plugin = server_plugins[
                plugin_name as keyof typeof server_plugins
              ] as FieldOption;
              stored_plugin.name = plugin_name;
              fields.push(createField(stored_plugin));
            }
          });
        });
      }
    });
  }
  if (TIMINGS_CHECK.config) {
    Object.keys(TIMINGS_CHECK.config)
      .map((i) => {
        return TIMINGS_CHECK.config[i as keyof typeof TIMINGS_CHECK.config];
      })
      .forEach((config) => {
        Object.keys(config).forEach((option_name) => {
          const option = config[
            option_name as keyof typeof config
          ] as OptionData[];
          evalField(
            fields,
            option,
            option_name,
            plugins,
            server_properties,
            bukkit,
            spigot,
            paper,
            pufferfish,
            purpur
          );
        });
      });
  }

  plugins.forEach((plugin) => {
    if (plugin.authors && plugin.authors.toLowerCase().includes('songoda')) {
      if (plugin.name == 'EpicHeads')
        fields.push({
          name: '❌ EpicHeads',
          value:
            'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.',
          buttons: [
            {
              text: 'HeadsPlus',
              url: 'https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/',
            },
            {
              text: 'HeadDatabase',
              url: 'https://www.spigotmc.org/resources/head-database.14280/',
            },
          ],
        });
      else if (plugin.name == 'UltimateStacker')
        fields.push({
          name: '❌ UltimateStacker',
          value:
            'Stacking plugins actually cause more lag.\nRemove UltimateStacker.',
        });
      else
        fields.push({
          name: `❌ ${plugin.name}`,
          value:
            'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.',
        });
    }
  });

  const worldsConfig = configs?.['__________WORLDS__________'] as
    | Record<string, { gamerules?: { maxEntityCramming?: string } }>
    | undefined;
  const worlds = worldsConfig
    ? Object.keys(worldsConfig).map((i) => worldsConfig[i])
    : [];
  let high_mec = false;
  worlds.forEach((world) => {
    const max_entity_cramming = parseInt(
      world.gamerules?.maxEntityCramming ?? '0'
    );
    if (max_entity_cramming >= 24) high_mec = true;
  });
  if (high_mec)
    fields.push({
      name: '❌ maxEntityCramming',
      value:
        'Decrease this by running the /gamerule command in each world.\nRecommended: 8.',
    });

  if (timing_cost > 500) {
    const suggestions = fields.length - 1;
    return [
      {
        name: '❌ Timingcost (CRITICAL)',
        value: `Your timingcost is ${timing_cost}. This value would be at most 200 on a reasonable server. Your cpu is critically overloaded and/or slow. Hiding ${suggestions} comparitively negligible suggestions until you resolve this fundamental problem.`,
        buttons: [
          { text: 'Find a better host', url: 'https://www.birdflop.com' },
        ],
      },
    ];
  }

  if (fields.length == 0) {
    return [
      { name: '✅ All good', value: 'Analyzed with no recommendations.' },
    ];
  }

  return fields;
}
