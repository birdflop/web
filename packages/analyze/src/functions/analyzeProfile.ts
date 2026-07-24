import type {
  AnalyzePlugin,
  BukkitConfig,
  Field,
  FieldOption,
  OptionData,
  PaperConfig,
  PurpurConfig,
  PufferfishConfig,
  ServerPropertiesConfig,
  SpigotConfig,
} from '../types.js';
import createField from './createField.js';
import evalField from './evalField.js';
import { analyzeJvmFlags } from './jvmFlags.js';

import config_bukkit from '../configs/bukkit.js';
import plugins_paper from '../configs/plugins/paper.js';
import plugins_purpur from '../configs/plugins/purpur.js';
import config_paper from '../configs/profile/paper.js';
import config_purpur from '../configs/purpur.js';
import config_server_properties from '../configs/server.properties.js';
import servers from '../configs/servers.js';
import config_spigot from '../configs/spigot.js';

const supportedPlatforms = ['paper', 'bukkit'];

interface SparkSampler {
  metadata: {
    platform: {
      name: string;
      minecraftVersion: string;
      brand: string;
    };
    sources: Record<string, AnalyzePlugin>;
    serverConfigurations?: Record<string, string>;
    systemStatistics: {
      java: {
        vmArgs: string;
        version: string;
      };
      cpu: {
        threads: number;
      };
    };
    platformStatistics: {
      playerCount: number;
    };
  };
}

export default async function analyzeProfile(id: string): Promise<Field[]> {
  const url_raw = `https://spark.lucko.me/${id}?raw=1`;

  let sampler: SparkSampler;
  try {
    const response_raw = await fetch(url_raw, {
      headers: { Accept: 'application/json' },
    });
    sampler = (await response_raw.json()) as SparkSampler;
  } catch (err) {
    return [
      {
        name: '❌ Processing Error',
        value: `Birdflop cannot process this spark profile. Please use an alternative spark profile. ${err instanceof Error ? err.message : String(err)}`,
      },
    ];
  }

  if (!sampler.metadata?.serverConfigurations) {
    return [
      {
        name: '❌ Processing Error',
        value:
          'Birdflop cannot process this spark profile. This is a heap summary report.',
      },
    ];
  }

  const platform = sampler.metadata.platform.name;

  let server_properties = {} as ServerPropertiesConfig,
    bukkit = {} as BukkitConfig,
    spigot = {} as SpigotConfig,
    paper = {} as PaperConfig,
    purpur = {} as PurpurConfig;

  const plugins: AnalyzePlugin[] = Object.values(sampler.metadata.sources);
  const configs = sampler.metadata.serverConfigurations;
  if (configs) {
    if (configs['server.properties'])
      server_properties = JSON.parse(
        configs['server.properties']
      ) as ServerPropertiesConfig;
    if (configs['bukkit.yml'])
      bukkit = JSON.parse(configs['bukkit.yml']) as BukkitConfig;
    if (configs['spigot.yml'])
      spigot = JSON.parse(configs['spigot.yml']) as SpigotConfig;
    if (configs['paper/']) paper = JSON.parse(configs['paper/']) as PaperConfig;
    if (configs['purpur.yml'])
      purpur = JSON.parse(configs['purpur.yml']) as PurpurConfig;
  }

  const PROFILE_CHECK = {
    servers: servers(),
    plugins: {
      paper: plugins_paper(),
      purpur: plugins_purpur(),
    },
    config: {
      'server.properties': config_server_properties(),
      bukkit: config_bukkit(),
      spigot: config_spigot(),
      paper: config_paper(),
      purpur: config_purpur(),
    },
  };

  // fetch the latest mc version
  const req = await fetch('https://api.purpurmc.org/v2/purpur');

  const json: { versions: string[] } = (await req.json()) as {
    versions: string[];
  };
  const latest = json.versions[json.versions.length - 1];

  const fields: Field[] = [];

  // ghetto version check
  const mcversion = sampler.metadata.platform.minecraftVersion;
  if (
    platform != undefined &&
    supportedPlatforms.includes(platform.toLowerCase()) == false
  ) {
    return [
      {
        name: '❌ Processing Error',
        value: `Birdflop cannot process this spark profile. It appears that the platform is not supported for analysis. Platform: ${platform}`,
      },
    ];
  }
  if (mcversion != latest) {
    fields.push({
      name: '❌ Outdated',
      value: `You are using \`${mcversion}\`. Update to \`${latest}\`.`,
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
  const brand = sampler.metadata.platform.brand;
  if (PROFILE_CHECK.servers.servers) {
    PROFILE_CHECK.servers.servers.forEach((server: FieldOption) => {
      if (brand?.includes(server.name)) fields.push(createField(server));
    });
  }

  const flags = sampler.metadata.systemStatistics.java.vmArgs;
  const jvm_version = sampler.metadata.systemStatistics.java.version;

  fields.push(
    ...analyzeJvmFlags(
      flags,
      jvm_version,
      sampler.metadata.platformStatistics.playerCount
    )
  );

  const cpu = sampler.metadata.systemStatistics.cpu.threads;
  if (cpu <= 2)
    fields.push({
      name: '❌ Threads',
      value: `You only have ${cpu} thread(s).`,
      buttons: [
        { text: 'Find a better host', url: 'https://www.birdflop.com' },
      ],
    });

  if (PROFILE_CHECK.plugins) {
    const server_names = Object.keys(PROFILE_CHECK.plugins);
    server_names.forEach((server_name) => {
      if (configs && Object.keys(configs).includes(server_name)) {
        plugins.forEach((plugin) => {
          const server_plugins =
            PROFILE_CHECK.plugins[
              server_name as keyof typeof PROFILE_CHECK.plugins
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

  if (PROFILE_CHECK.config) {
    Object.keys(PROFILE_CHECK.config)
      .map((i) => {
        return PROFILE_CHECK.config[i as keyof typeof PROFILE_CHECK.config];
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
            {} as PufferfishConfig,
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
            'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative such as [HeadsPlus](https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/) or [HeadDatabase](https://www.spigotmc.org/resources/head-database.14280/).',
          inline: true,
        });
      else if (plugin.name == 'UltimateStacker')
        fields.push({
          name: '❌ UltimateStacker',
          value:
            'Stacking plugins actually causes more lag.\nRemove UltimateStacker.',
          inline: true,
        });
      else
        fields.push({
          name: `❌ ${plugin.name}`,
          value:
            'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.',
          inline: true,
        });
    }
  });

  if (fields.length == 0) {
    return [
      { name: '✅ All good', value: 'Analyzed with no recommendations.' },
    ];
  }

  return fields;
}
