import type { EnvironmentOptions } from '~/util/flags/types/environment/EnvironmentOptions';
import type { OperatingSystemOption } from '~/util/flags/types/environment/OperatingSystemOption';
import type { AvailableConfig } from '~/util/flags/config';

export type AvailableOperatingSystem =
  | 'linux'
  | 'windows'
  | 'macos'
  | 'pterodactyl'
  | 'command';

const sharedConfig: AvailableConfig[] = [
  'fileName',
  'flags',
  'extraFlags',
  'memory',
];

const sharedScriptConfig: AvailableConfig[] = [
  'gui',
  'autoRestart',
  'variables',
];

function getMemory(memory: number, isContainer = false) {
  const binaryMemory = memory * 1024;

  if (!isContainer) {
    return binaryMemory;
  }

  return Math.round(binaryMemory * 0.85);
}

function getJava(
  config: Partial<Record<AvailableConfig | 'existingFlags' | 'calcOverhead', any>>
): string {
  let ram = config.calcOverhead
    ? Math.ceil(((11 * config.memory) / 12 - 1200) / 100) * 100
    : config.memory;
  if (ram < 512) ram = 512;

  const base = [
    'java',
    `-Xms${ram}M`,
    `-Xmx${ram}M`,
    ...config.existingFlags,
    '-jar',
    config.fileName,
  ];

  // GUI variable is supported
  if ('gui' in config && config.gui) {
    base.push('--nogui');
  }

  return base.join(' ');
}

import type { Generate } from '~/util/flags/types/generate/Generate';

interface GenerateNixResult {
  script: string[];
  flags: string[];
}

type NixScript = Generate<AvailableConfig | 'existingFlags', GenerateNixResult>; // todo: dedupe

const nixScript: NixScript = (config) => {
  const base = ['#!/usr/bin/env bash', ''];

  let fileName = config.fileName;
  let memory: number | string = getMemory(config.memory);

  if (config.variables) {
    base.push(
      `fileName="${fileName}"`,
      `memory=${memory}`,
      '',
      'declare -i memory',
      ''
    );

    fileName = '"$fileName"';
    memory = '"$memory"';
  }

  const java = getJava({
    ...config,
    fileName,
    memory,
  });

  if (config.autoRestart) {
    base.push(
      'while true; do',
      java, // todo: tab
      '',
      'echo Restarting in 5 seconds...',
      'echo Press CTRL + C to cancel.',
      'sleep 5',
      'done'
    );
  } else {
    base.push(java);
  }

  return {
    script: base,
    flags: config.existingFlags,
  };
};

export const operatingSystem: EnvironmentOptions<OperatingSystemOption> = {
  linux: {
    file: {
      name: 'Bash Script',
      mime: 'text/plain',
      extension: '.sh',
    },
    config: [...sharedConfig, ...sharedScriptConfig],
    generate: (config) => {
      const nix = nixScript(config);

      return {
        script: nix.script.join('\n'),
        flags: nix.flags,
      };
    },
  },
  windows: {
    file: {
      name: 'Batch Script',
      mime: 'text/plain',
      extension: '.bat',
    },
    config: [...sharedConfig, ...sharedScriptConfig],
    generate: (config) => {
      const base = [];

      let fileName = config.fileName;
      let memory: number | string = getMemory(config.memory);

      if (config.variables) {
        base.push(`set fileName="${fileName}"`, `set /A memory=${memory}`, '');

        fileName = '%fileName%';
        memory = '%memory%';
      }

      const java = getJava({
        ...config,
        fileName,
        memory,
      });

      if (config.autoRestart) {
        base.push(
          ':start',
          java,
          '',
          'echo Restarting in 5 seconds...',
          'echo Press CTRL + C to cancel.',
          'timeout 5',
          'goto :start'
        );
      } else {
        base.push(java);
      }

      return {
        script: base.join('\n'),
        flags: config.existingFlags,
      };
    },
  },
  macos: {
    file: {
      name: 'Command Script',
      mime: 'text/plain',
      extension: '.command',
    },
    config: [...sharedConfig, ...sharedScriptConfig],
    generate: (config) => {
      const nix = nixScript(config);

      // First line of *nix files should contain shebang
      nix.script.splice(1, 0, 'cd "`dirname $0`"');

      return {
        script: nix.script.join('\n'),
        flags: nix.flags,
      };
    },
  },
  pterodactyl: {
    file: false,
    config: [...sharedConfig, 'variables'],
    generate: (config) => {
      const base = [];

      let fileName = config.fileName;
      let memory: number | string = getMemory(config.memory, true);

      if (config.variables) {
        fileName = '{{SERVER_JARFILE}}';
        memory = '$(({{SERVER_MEMORY}}*85/100))';
      }

      const flags = [
        ...config.existingFlags,
        '-Dterminal.jline=false',
        '-Dterminal.ansi=true',
      ];

      const java = getJava({
        ...config,
        existingFlags: flags,
        fileName,
        memory,
      });

      base.push(java);

      return {
        script: base.join('\n'),
        flags,
      };
    },
  },
  command: {
    file: false,
    config: [...sharedConfig],
    generate: (config) => {
      const base = [];

      const java = getJava({
        ...config,
        memory: getMemory(config.memory),
      });

      base.push(java);

      return {
        script: base.join('\n'),
        flags: config.existingFlags,
      };
    },
  },
};

export const defaultOperatingSystem: AvailableOperatingSystem = 'linux';
