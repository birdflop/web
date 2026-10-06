export interface MotdStyle {
  color: string; // e.g. '#FF54A1'
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
}

export interface MotdRun {
  text: string;
  style: MotdStyle;
}

export interface MotdResult {
  raw: string;
  clean: string;
  html: string;
  runs: MotdRun[][]; // Lines -> Runs
}

export interface ServerMotd {
  raw: string;
  clean: string;
  html?: string | null;
}

export interface ServerStatus {
  online: boolean;
  players: { online: number; max: number };
  version: string | null;
  motd: ServerMotd | null;
  icon: string | null;
  edition: 'java' | 'bedrock';
  host: string;
  port: number | null;
}

export interface ChatComponent {
  text?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  extra?: ChatComponent[];
  translate?: string;
  with?: (string | ChatComponent)[];
}

export interface PlayerSample {
  name: string;
  id: string;
}

export interface JavaStatusResult {
  edition: 'java';
  online: boolean;
  latency: number; // ms
  version: {
    name: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    sample?: PlayerSample[];
  };
  motd: MotdResult;
  favicon: string | null; // data:image/png;base64,...
  rawResponse?: Record<string, unknown>;
}

export interface BedrockStatusResult {
  edition: 'bedrock';
  online: boolean;
  latency: number; // ms
  version: {
    name: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
  };
  motd: MotdResult;
  gameMode?: string;
  serverId?: string;
}

export type StatusResult = JavaStatusResult | BedrockStatusResult;

export interface PingOptions {
  timeout?: number; // default 5000ms
  protocolVersion?: number; // default 767 (1.20.6+) for Java
}
